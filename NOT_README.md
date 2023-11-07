## 現状
- chrome://bookmark を オーバーライドする
    - 開発中はnewtabのほうがデバックしやすい？
- プロンプトとなる要素に文字列を表示するlog()
    - 非同期処理できてない
    - 命名なんか微妙...
- 「あったらいいな♪」な、コマンド
    - ls
        - ls風にリンクを一覧表示する際、\<a>で出力
        - 再帰的に表示するオプション or treeコマンド(インデントのみで表現)
        - アイコンを表示すればわかりやすい...が見通しがつかない
    - cd
    - open
    - add
    - mv
        - 名前の変更は...
            - linuxみたいに兼ねる
            - renameコマンドなど別にする
        - url更新はオプション or 別コマンド
    - rm
    - his (history)
    - clip
        - クリップボードにリンクをコピー
    - タブ操作するコマンド (vim風でもいいよ)
        - close (x)
        - left (gT)
        - right (gt)
    - clear

## 検討事項
- 補完はサイドバーとかに表示するだけか（さぼる）、tabでできるようにするか（がちる）
- ブックマークの情報（検索時）
    - 配列として全て取り出しておく場合
        - 検索は高速、柔軟（たぶん
        - ブックマーク変化でイベント -> 配列更新
    - 毎回apiの場合
        - コールバックのネスト地獄説
- 元のchrome://bookmarkをなんらかの形で残したい
    - popで切り替え（優勢）
    - option pageで切り替え <- 拡張機能offでいいじゃんw
    - ウィンドウが最大なら横半分に残す(この場合overrideじゃないけど,技術的に可能かもわからん)