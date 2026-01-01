import { ElementEntry } from "./types";

/**
 * Element情報をフォーマット文字列に基づいて整形する
 *
 * @param element Elementエントリ
 * @param format フォーマット文字列 (例: "$alias/$name_JP")
 * @returns 整形された文字列 (例: "life/生命力")
 */
export function formatElement(element: ElementEntry, format: string): string {
  // $で始まる部分を対応するカラムの値に置換
  return format.replace(/\$(\w+)/g, (_, columnName: string) => {
    const value = element[columnName];
    if (value === undefined) {
      return `$${columnName}`; // 存在しないカラムはそのまま
    }
    return String(value);
  });
}

/** Hoverテーブルから除外する列 */
const EXCLUDED_COLUMNS = [
  "detail",
  "textPhase",
  "textExtra",
  "textInc",
  "textDec",
  "textAlt",
  "levelBonus",
];

/**
 * 列が除外対象かどうかを判定する
 * 指定された列名と、それに _JP がついた列名も除外対象とする
 */
function isExcludedColumn(key: string): boolean {
  return EXCLUDED_COLUMNS.some((col) => key === col || key === `${col}_JP`);
}

/**
 * Hover用の詳細情報をMarkdown形式で生成する
 *
 * @param element Elementエントリ
 * @param format フォーマット文字列（ヘッダーに使用）
 * @returns Markdown形式の詳細情報
 */
export function formatElementForHover(
  element: ElementEntry,
  format: string
): string {
  const header = formatElement(element, format);
  const lines: string[] = [
    `## **${header}**`,
    "",
    `| Property | Value |`,
    `|----------|-------|`,
  ];

  for (const [key, value] of Object.entries(element)) {
    // 除外対象の列はスキップ
    if (isExcludedColumn(key)) {
      continue;
    }
    // 値が存在しない（空文字列、undefined、null）場合はスキップ
    if (value === undefined || value === null || value === "") {
      continue;
    }
    // Markdownのテーブル内でパイプ文字をエスケープ
    const escapedValue = String(value).replace(/\|/g, "\\|");
    lines.push(`| ${key} | ${escapedValue} |`);
  }

  return lines.join("\n");
}
