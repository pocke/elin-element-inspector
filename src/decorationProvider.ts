import * as vscode from "vscode";
import { getElement } from "./elementData";
import { formatElement } from "./formatter";
import { getAllTargets, getFormat, isInlineDecorationEnabled } from "./config";
import { findMatches } from "./matcher";

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
   * エディタの装飾を更新する
   */
  public updateDecorations(editor: vscode.TextEditor): void {
    if (!isInlineDecorationEnabled()) {
      editor.setDecorations(this.decorationType, []);
      return;
    }

    const targets = getAllTargets();
    const text = editor.document.getText();
    const matches = findMatches(text, targets);
    const format = getFormat();

    const decorations: vscode.DecorationOptions[] = [];

    for (const match of matches) {
      const element = getElement(match.numericValue);
      if (!element) {
        continue;
      }

      const formattedText = formatElement(element, format);
      const startPos = editor.document.positionAt(match.startOffset);
      const endPos = editor.document.positionAt(match.endOffset);

      decorations.push({
        range: new vscode.Range(startPos, endPos),
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
