import * as vscode from "vscode";
import { getElement } from "./elementData";
import { formatElement } from "./formatter";
import { getAllTargets, getFormat, isInlineDecorationEnabled } from "./config";
import { FunctionTarget } from "./types";

interface MatchResult {
  numericValue: number;
  range: vscode.Range;
}

/**
 * InlineDecorationを管理するプロバイダー
 */
export class ElementDecorationProvider {
  private decorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        color: new vscode.ThemeColor("editorCodeLens.foreground"),
        fontStyle: "italic",
        margin: "0 0 0 0.5em",
      },
    });
  }

  /**
   * 正規表現の特殊文字をエスケープする
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * 指定された位置の引数内容を抽出する
   * @param text ドキュメント全体のテキスト
   * @param startOffset 開き括弧の直後のオフセット
   * @param argIndex 対象の引数位置 (1-based)
   * @returns 引数の内容とオフセット、または null
   */
  private extractArgument(
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
          // 最後の引数
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
   * オフセットからRangeに変換する
   */
  private offsetToRange(
    document: vscode.TextDocument,
    offset: number,
    length: number
  ): vscode.Range {
    const startPos = document.positionAt(offset);
    const endPos = document.positionAt(offset + length);
    return new vscode.Range(startPos, endPos);
  }

  /**
   * ドキュメント内のマッチを検索する
   */
  private findMatches(
    document: vscode.TextDocument,
    targets: FunctionTarget[]
  ): MatchResult[] {
    const text = document.getText();
    const results: MatchResult[] = [];

    for (const target of targets) {
      // 関数呼び出しの開始を見つける正規表現
      // オプショナルなレシーバ付き: (?:\w+\.)?FunctionName\s*\(
      const funcPattern = new RegExp(
        `(?:\\w+\\.)?${this.escapeRegex(target.function)}\\s*\\(`,
        "g"
      );

      let match;
      while ((match = funcPattern.exec(text)) !== null) {
        // 開き括弧の直後の位置
        const argStart = match.index + match[0].length;

        // 対象引数を抽出
        const argContent = this.extractArgument(
          text,
          argStart,
          target.argIndex
        );
        if (!argContent) {
          continue;
        }

        // 引数内の全数値リテラルを検索
        // 変数名に続く数字（例: num123）を除外するため、単語境界を使用
        const numPattern = /\b(\d+)\b/g;
        let numMatch;
        while ((numMatch = numPattern.exec(argContent.content)) !== null) {
          const absoluteOffset = argContent.offset + numMatch.index;
          const numericValue = parseInt(numMatch[1], 10);

          // 重複を避けるためチェック
          const isDuplicate = results.some(
            (r) =>
              r.numericValue === numericValue &&
              r.range.start.isEqual(document.positionAt(absoluteOffset))
          );

          if (!isDuplicate) {
            results.push({
              numericValue,
              range: this.offsetToRange(
                document,
                absoluteOffset,
                numMatch[1].length
              ),
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * エディタの装飾を更新する
   */
  public updateDecorations(editor: vscode.TextEditor): void {
    if (!isInlineDecorationEnabled()) {
      editor.setDecorations(this.decorationType, []);
      return;
    }

    const targets = getAllTargets();
    const matches = this.findMatches(editor.document, targets);
    const format = getFormat();

    const decorations: vscode.DecorationOptions[] = [];

    for (const match of matches) {
      const element = getElement(match.numericValue);
      if (!element) {
        continue;
      }

      const formattedText = formatElement(element, format);

      decorations.push({
        range: match.range,
        renderOptions: {
          after: {
            contentText: `${formattedText}`,
          },
        },
      });
    }

    editor.setDecorations(this.decorationType, decorations);
  }

  /**
   * 全アクティブエディタの装飾をリフレッシュする
   */
  public refresh(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      this.updateDecorations(editor);
    }
  }

  /**
   * リソースを解放する
   */
  public dispose(): void {
    this.decorationType.dispose();
  }
}
