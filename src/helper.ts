import { format } from 'date-fns';
import { TraceEvent } from './types';

function wrap0x(x: string): string {
  return `0x${x}`;
}

export function toHex(input: string | number): string {
  if (typeof input === 'string') {
    if (input.startsWith('0x')) return input;
    return wrap0x(input);
  }
  return wrap0x(input.toString(16));
}

export function shortHex(input: string | number): string {
  return toHex(input).slice(0, 10);
}

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i: number) {
  const c = (i & 0x00ffffff).toString(16).toUpperCase();
  return '00000'.substring(0, 6 - c.length) + c;
}

export function anyStrToColor(str: string): string {
  return '#' + intToRGB(hashCode(str));
}

export function readJSONLog(file: File): Promise<TraceEvent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const events = reader.result as string;
      resolve(JSON.parse(events));
    };
    reader.readAsText(file);
  });
}

export function formatDate(date: Date | number, pattern?: string) {
  pattern = pattern ?? 'yyyy-MM-dd HH:mm:ss:SSS';
  return format(date, pattern);
}
