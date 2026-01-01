import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { ElementEntry } from './types';

/** Elementデータのマップ（ID -> ElementEntry） */
let elementMap: Map<number, ElementEntry> | null = null;

/**
 * CSVファイルからElementデータを読み込む
 * @param extensionPath 拡張機能のルートパス
 */
export function loadElementData(extensionPath: string): Map<number, ElementEntry> {
  const csvPath = path.join(extensionPath, 'data', 'elements.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  const map = new Map<number, ElementEntry>();

  for (const record of records) {
    const id = parseInt(record['id'], 10);
    if (isNaN(id)) {
      continue;
    }

    const entry: Record<string, string | number> = { id };
    for (const [key, value] of Object.entries(record)) {
      if (key !== 'id') {
        entry[key] = value;
      }
    }

    map.set(id, entry as ElementEntry);
  }

  elementMap = map;
  return map;
}

/**
 * IDからElementを取得する
 * @param id Element ID
 */
export function getElement(id: number): ElementEntry | undefined {
  return elementMap?.get(id);
}

/**
 * Elementデータが読み込み済みかどうか
 */
export function isLoaded(): boolean {
  return elementMap !== null;
}

/**
 * 読み込み済みのElementデータを取得
 */
export function getElementMap(): Map<number, ElementEntry> | null {
  return elementMap;
}
