import * as vscode from "vscode";
import { EEIConfig, FunctionTarget } from "./types";

/** デフォルトの対象関数 */
const DEFAULT_TARGETS: FunctionTarget[] = [
  { function: "Evalue", argIndex: 1 },
  { function: "HasElement", argIndex: 1 },
  { function: "ModExp", argIndex: 1 },
];

/** デフォルトの表示フォーマット */
const DEFAULT_FORMAT = "$name_JP";

/**
 * 拡張機能の設定を取得する
 */
export function getConfig(): EEIConfig {
  const config = vscode.workspace.getConfiguration("elinElementInspector");

  return {
    format: config.get<string>("format", DEFAULT_FORMAT),
    additionalTargets: config.get<FunctionTarget[]>("additionalTargets", []),
    enableInlineDecoration: config.get<boolean>("enableInlineDecoration", true),
    enableHover: config.get<boolean>("enableHover", true),
  };
}

/**
 * デフォルト + ユーザー追加の全対象関数を取得する
 */
export function getAllTargets(): FunctionTarget[] {
  const config = getConfig();
  return [...DEFAULT_TARGETS, ...config.additionalTargets];
}

/**
 * 表示フォーマットを取得する
 */
export function getFormat(): string {
  return getConfig().format;
}

/**
 * InlineDecorationが有効かどうか
 */
export function isInlineDecorationEnabled(): boolean {
  return getConfig().enableInlineDecoration;
}

/**
 * Hoverが有効かどうか
 */
export function isHoverEnabled(): boolean {
  return getConfig().enableHover;
}

/**
 * デフォルトの対象関数を取得する
 */
export function getDefaultTargets(): FunctionTarget[] {
  return [...DEFAULT_TARGETS];
}
