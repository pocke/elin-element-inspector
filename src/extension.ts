import * as vscode from 'vscode';
import { loadElementData } from './elementData';
import { ElementHoverProvider } from './hoverProvider';
import { ElementDecorationProvider } from './decorationProvider';

let decorationProvider: ElementDecorationProvider | null = null;

export function activate(context: vscode.ExtensionContext) {
  console.log('Elin Element Inspector is now active!');

  // Element データを読み込む
  try {
    loadElementData(context.extensionPath);
    console.log('Element data loaded successfully');
  } catch (error) {
    console.error('Failed to load element data:', error);
    vscode.window.showErrorMessage(
      `Elin Element Inspector: Failed to load element data - ${error}`
    );
    return;
  }

  // HoverProvider を登録
  const hoverProvider = new ElementHoverProvider();
  const hoverDisposable = vscode.languages.registerHoverProvider(
    { language: 'csharp' },
    hoverProvider
  );
  context.subscriptions.push(hoverDisposable);

  // DecorationProvider を作成
  decorationProvider = new ElementDecorationProvider();
  context.subscriptions.push({
    dispose: () => decorationProvider?.dispose(),
  });

  // 現在のアクティブエディタを装飾
  if (vscode.window.activeTextEditor) {
    decorationProvider.updateDecorations(vscode.window.activeTextEditor);
  }

  // アクティブエディタ変更時に装飾を更新
  const activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        decorationProvider?.updateDecorations(editor);
      }
    }
  );
  context.subscriptions.push(activeEditorDisposable);

  // ドキュメント変更時に装飾を更新（debounce付き）
  let updateTimeout: ReturnType<typeof setTimeout> | null = null;
  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        // debounce: 300ms後に更新
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(() => {
          decorationProvider?.updateDecorations(editor);
        }, 300);
      }
    }
  );
  context.subscriptions.push(documentChangeDisposable);

  // 設定変更時に装飾をリフレッシュ
  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration('elinElementInspector')) {
        decorationProvider?.refresh();
      }
    }
  );
  context.subscriptions.push(configChangeDisposable);
}

export function deactivate() {
  decorationProvider = null;
}
