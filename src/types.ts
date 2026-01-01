/**
 * ElementデータのCSVから読み込んだエントリ
 */
export interface ElementEntry {
  id: number;
  alias: string;
  name_JP: string;
  name: string;
  /** CSVの他のカラムも動的に参照可能 */
  [key: string]: string | number;
}

/**
 * 関数と引数位置の組み合わせ
 * InlineDecorationで対象とする関数呼び出しを指定する
 */
export interface FunctionTarget {
  /** 関数名 (例: "Evalue") */
  function: string;
  /** 引数位置 (1から始まる) */
  argIndex: number;
}

/**
 * 拡張機能の設定
 */
export interface EEIConfig {
  /** 表示フォーマット (例: "$alias/$name_JP") */
  format: string;
  /** ユーザーが追加した対象関数 */
  additionalTargets: FunctionTarget[];
  /** InlineDecorationを有効にするか */
  enableInlineDecoration: boolean;
  /** Hoverを有効にするか */
  enableHover: boolean;
}
