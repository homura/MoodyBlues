import axios, { AxiosResponse } from 'axios';
import _ from 'lodash';
import camelcaseKeys from 'camelcase-keys';
import { NodeClient } from '../client';
import {
  BaseEvent,
  KeyframeEvent,
  ProposeEvent,
  TraceEvent,
  VoteEvent,
} from '../types';
import { roundCountEachEpoch } from '../core/event';
import { EventType } from '../constants';

const $ = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
});

function hitsToEvents<T extends BaseEvent>(res: AxiosResponse): T[] {
  return _.map<any, T>(
    res.data.hits.hits,
    hit =>
      (camelcaseKeys(hit._source.message, {
        deep: true,
      }) as any) as T,
  );
}

function rowsToTraceEvent<T extends BaseEvent>(res: AxiosResponse): T[] {
  const { columns, rows }: { columns: any[]; rows: any[] } = res.data;
  const result: T[] = [];

  for (const row of rows) {
    const event: BaseEvent = {
      eventName: '',
      eventType: EventType.Keyframe,
      timestamp: 0,
      tag: {},
    };
    for (let i = 0; i < columns.length; i++) {
      const value = row[i];
      if (value === null) continue;

      const key: string = columns[i].name;
      if (key === 'message.event_name') {
        event.eventName = value;
      } else if (key === 'message.event_type') {
        event.eventType = value;
      } else if (key === 'message.timestamp') {
        event.timestamp = value;
      } else if (key.startsWith('message.tag')) {
        let tagKey = key.substring(12);
        if (tagKey === 'epoch_id') tagKey = 'epochId';
        else if (tagKey === 'round_id') tagKey = 'roundId';
        else if (tagKey === 'step_name') tagKey = 'stepName';
        _.set(event.tag as object, tagKey, value);
      }
    }
    result.push(event as T);
  }
  return result;
}

function sql(body: object): Promise<AxiosResponse> {
  return $.post('/_sql', body);
}

function search(body: object): Promise<AxiosResponse> {
  return $.post('/muta_metrics/_search', body);
}

export async function listLogs(): Promise<string[]> {
  const res = await sql({
    query: 'SELECT log_path from muta_metrics',
  });
  return _.uniq<string>(_.flatten(res.data.rows));
}

interface ESClientConfig {
  logPath: string;
}

const SQL_SELECT_EVENT = `SELECT message.event_name, 
             message.event_type, 
             message.timestamp, 
             message.tag.* 
      FROM   muta_metrics `;

export async function fetchKeyframes(
  logPath: string,
  options?: { start: number; end: number },
): Promise<KeyframeEvent[]> {
  const { start, end } = options || { start: 0, end: 1000 };
  const res = await search({
    size: 9999,
    _source: ['message'],
    sort: ['message.timestamp'],
    query: {
      bool: {
        must: [
          {
            match: {
              'message.event_type': { query: 'keyframe', operator: 'AND' },
            },
          },

          { match: { log_path: { query: logPath, operator: 'AND' } } },
          {
            bool: {
              should: [
                { exists: { field: 'message.tag.epoch_id' } },
                { exists: { field: 'message.tag.round_id' } },
              ],
            },
          },
        ],
        must_not: {
          exists: {
            field: 'message.tag.step_name',
          },
        },
      },
    },
  });
  return hitsToEvents<KeyframeEvent>(res);
}

export class ESNodeClient implements NodeClient {
  private config: ESClientConfig;

  constructor(config: ESClientConfig) {
    this.config = config;
  }

  async eventsByEpoch(epochId: number): Promise<TraceEvent[]> {
    const [resStart, resEnd] = await Promise.all<AxiosResponse, AxiosResponse>([
      sql({
        query: `select message.timestamp from muta_metrics WHERE log_path='${this.config.logPath}' AND message.tag.epoch_id = ${epochId} ORDER BY message.timestamp limit 1`,
      }),
      sql({
        query: `select message.timestamp from muta_metrics WHERE log_path='${this.config.logPath}' AND message.tag.epoch_id > ${epochId} ORDER BY message.timestamp limit 1`,
      }),
    ]);

    const start = resStart.data.rows[0][0];
    const end = resEnd.data.rows[0][0];

    const logPath = this.config.logPath;
    const res = await search({
      query: {
        bool: {
          must: [
            { match: { log_path: { query: logPath, operator: 'AND' } } },
            { range: { 'message.timestamp': { gte: start, lte: end } } },
          ],
        },
      },
    });

    return Promise.resolve(hitsToEvents(res));
  }

  async proposeEventsBeforeEndsOfRound(
    epochId: number,
    roundId: number,
  ): Promise<ProposeEvent[]> {
    roundId = roundId === -1 ? 9999 : roundId;

    const res = await sql({
      query: `
      ${SQL_SELECT_EVENT}
      WHERE log_path='${this.config.logPath}'
        AND message.event_type = 'propose'
        AND message.tag.epoch_id = ${epochId}
        AND message.tag.round_id <= ${roundId}
      `,
    });

    return rowsToTraceEvent(res);
  }

  async roundCountByEpoch(
    start?: number,
    end?: number,
  ): Promise<Map<number, number>> {
    const keyframes = await fetchKeyframes(this.config.logPath, {
      start: start ?? 0,
      end: end ?? 1000,
    });
    return roundCountEachEpoch(keyframes);
  }

  async voteEventsBeforeEndsOfRound(
    epochId: number,
    roundId: number,
  ): Promise<VoteEvent[]> {
    if (roundId === -1) roundId = 9999;

    const res = await sql({
      query: `
      ${SQL_SELECT_EVENT}
      WHERE log_path='${this.config.logPath}'
        AND message.event_type = 'vote'
        AND message.tag.epoch_id = ${epochId}
        AND message.tag.round_id <= ${roundId}
      `,
    });

    return rowsToTraceEvent(res);
  }

  async epochRange(): Promise<[number, number]> {
    const logPath = this.config.logPath;
    const res = await search({
      query: {
        bool: {
          must: [
            {
              match: {
                'message.event_type': {
                  query: 'keyframe',
                  operator: 'AND',
                },
              },
            },
            { match: { log_path: { query: logPath, operator: 'AND' } } },
          ],
        },
      },
      aggs: {
        max: { max: { field: 'message.tag.epoch_id' } },
        min: { min: { field: 'message.tag.round_id' } },
      },
    });
    const aggs = res.data.aggregations;
    return Promise.resolve([aggs.min.value, aggs.max.value]);
  }
}
