あなたは熟練のフルスタックエンジニアです。
Next.js(App Router) + TypeScript のReactアプリに、漢字パーツを配置するパズルのMVPを実装してください。
要件は「Step1」のみで、まず動くものを最短で作ってください。

# 目的（Step1）
- 左側に「パーツパレット」
- 右側に「キャンバス（Konva Stage）」
- パレットのパーツをクリックすると、キャンバスにそのパーツが1つ追加される
- キャンバス上のパーツはドラッグして移動できる
- クリックで選択状態にできる（選択中は枠線などで分かるように）
- 「削除」ボタンで選択中のパーツを削除できる
- 「リセット」ボタンでキャンバスを空にできる
- お題として「休」を画面上部に表示（まだ判定は不要、提出ボタンはダミーでも可）

# 技術スタック
- Next.js App Router
- React + TypeScript
- react-konva / konva を使う
- スタイリングは最小でOK（簡単なCSSまたはTailwindどちらでも良い）

# パーツ（Step1は2つだけ）
- 「亻」(person) と 「木」(tree)
- 画像は public/parts/person.png と public/parts/tree.png を参照する実装にする
  - もし画像が存在しない場合でも動作確認できるように、画像が読み込めない時はテキスト表示（例：「亻」「木」）で代替表示する
- パレットにはこの2つを表示する

# データ構造（目安）
Part:
- id: string ("person" | "tree")
- label: string ("亻" | "木")
- imageSrc: string ("/parts/person.png" など)

PlacedPart:
- instanceId: string (uuidなど一意)
- partId: string
- x: number
- y: number
- scale: number (Step1は固定1でもOK)
- rotation: number (Step1は固定0でもOK)
- zIndex: number (Step1は追加順でOK)

React state:
- placedParts: PlacedPart[]
- selectedInstanceId: string | null

# UI仕様
- app/game/page.tsx を新規作成し、このページでゲームが動くようにする
- レイアウトは2カラム（左パレット、右キャンバス）
- Headerに「漢字パズル（お題：休）」を表示
- Footerまたは右上にボタン:
  - 「削除」(選択中が無ければdisabled)
  - 「リセット」
  - 「提出」(クリックしてもまだ何もしない or alert表示でOK)

# Konva実装要件
- Stageのサイズは初期で width=600 height=500 程度（レスポンシブは後回し）
- placedParts を map して Konva.Image (推奨) もしくは Konva.Text で描画する
- ドラッグ移動後は state の x,y を更新する（onDragEndで反映）
- クリックで選択状態（selectedInstanceIdを更新）
- 選択中のパーツは分かるように stroke などを付ける
  - Imageだとstrokeが難しい場合、Rectを背面に描くなどで良い

# 画像読み込み
- Konva.Imageを使う場合、useImageフック（react-konvaの推奨パターン）で読み込む
- 画像が読み込めない時はKonva.Textでラベルを表示するfallbackを必ず入れる

# ファイル構成（提案）
- app/game/page.tsx
- components/Palette.tsx
- components/CanvasStage.tsx
- components/PlacedPartNode.tsx
- data/parts.ts

ただし簡略化して2〜3ファイルでも良い。まず動けばOK。

# 完了条件（Step1）
- パレットからクリックで複数パーツを追加できる
- 追加したパーツをドラッグして移動できる
- クリックで選択でき、削除ボタンで消せる
- リセットで全消去できる
- エラーなく起動できる

# 出力
- 変更/追加した全ファイルのコードを提示してください
- 依存ライブラリの追加が必要なら、npm installコマンドも併記してください
