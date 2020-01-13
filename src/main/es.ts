import Axios, { AxiosResponse } from 'axios';
import _ from 'lodash';
import camelcaseKeys from 'camelcase-keys';
import { BaseEvent } from '../types';
import { EventType } from '../constants';

type HitsSource<T> = { _source: { message: T } }[];

interface ESHitsResponse<T> {
  hits: {
    hits: HitsSource<T>;
  };
}

export const axios = Axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
});

export function search(
  body: object,
  index: string = 'muta_metrics',
): Promise<AxiosResponse> {
  return axios.post(`/${index}/_search`, body);
}

export function hits<T>(body: object, index: string): Promise<T[]> {
  return search(body, index).then(res => res.data.hits.hits);
}

/**
 * get message from es response
 */
export async function hitsMessages<T>(
  body: object,
  index: string,
): Promise<T[]> {
  const resHits: HitsSource<T> = await hits(body, index);
  return resHits.map(hit => hit._source.message);
}

export function hitsToEvents<T extends BaseEvent>(res: AxiosResponse): T[] {
  return _.map<any, T>(
    res.data.hits.hits,
    hit =>
      (camelcaseKeys(hit._source.message, {
        deep: true,
      }) as any) as T,
  );
}

export function rowsToTraceEvent<T extends BaseEvent>(res: AxiosResponse): T[] {
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
