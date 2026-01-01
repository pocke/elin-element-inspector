import * as vscode from "vscode";
import { getElement } from "./elementData";
import { formatElementForHover } from "./formatter";
import { isHoverEnabled, getFormat } from "./config";

/**
 * 数値リテラルにホバーした時にElement情報を表示するプロバイダー
 */
export class ElementHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    if (!isHoverEnabled()) {
      return null;
    }

    // カーソル位置の単語を取得
    const wordRange = document.getWordRangeAtPosition(position, /\b\d+\b/);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);
    const id = parseInt(word, 10);
    if (isNaN(id)) {
      return null;
    }

    // Element情報を取得
    const element = getElement(id);
    if (!element) {
      return null;
    }

    // Markdown形式でホバー内容を生成
    const format = getFormat();
    const markdown = new vscode.MarkdownString(
      formatElementForHover(element, format)
    );
    markdown.isTrusted = true;

    return new vscode.Hover(markdown, wordRange);
  }
}
