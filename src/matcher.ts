import { FunctionTarget } from "./types";

export interface TextMatch {
  numericValue: number;
  startOffset: number;
  endOffset: number;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 指定された位置の引数内容を抽出する
 */
function extractArgument(
  text: string,
  startOffset: number,
  argIndex: number
): { content: string; offset: number } | null {
  let depth = 1;
  let currentArg = 1;
  let argStart = startOffset;

  for (let i = startOffset; i < text.length && depth > 0; i++) {
    const char = text[i];

    if (char === "(" || char === "[" || char === "{") {
      depth++;
    } else if (char === ")" || char === "]" || char === "}") {
      depth--;
      if (depth === 0 && currentArg === argIndex) {
        return { content: text.substring(argStart, i), offset: argStart };
      }
    } else if (char === "," && depth === 1) {
      if (currentArg === argIndex) {
        return { content: text.substring(argStart, i), offset: argStart };
      }
      currentArg++;
      argStart = i + 1;
    }
  }

  return null;
}

/**
 * テキスト内から指定された関数パターンにマッチする数値リテラルを検索する
 */
export function findMatches(text: string, targets: FunctionTarget[]): TextMatch[] {
  const results: TextMatch[] = [];

  for (const target of targets) {
    const funcPattern = new RegExp(
      `${escapeRegex(target.function)}\\s*(?:<[^>]*>)?\\s*\\(`,
      "g"
    );

    let match;
    while ((match = funcPattern.exec(text)) !== null) {
      const argStart = match.index + match[0].length;

      const argContent = extractArgument(text, argStart, target.argIndex);
      if (!argContent) {
        continue;
      }

      const numPattern = /\b(\d+)\b/g;
      let numMatch;
      while ((numMatch = numPattern.exec(argContent.content)) !== null) {
        const absoluteOffset = argContent.offset + numMatch.index;
        const numericValue = parseInt(numMatch[1], 10);

        const isDuplicate = results.some(
          (r) =>
            r.numericValue === numericValue && r.startOffset === absoluteOffset
        );

        if (!isDuplicate) {
          results.push({
            numericValue,
            startOffset: absoluteOffset,
            endOffset: absoluteOffset + numMatch[1].length,
          });
        }
      }
    }
  }

  return results;
}
