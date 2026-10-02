# Dream Sprite Website

ドリームスプライト（DSP）公式サイトのソースです。

## 公開

このリポジトリの `main` ブランチは Cloudflare Pages と連携済みです。
`main` への更新後、Cloudflare Pages が自動でデプロイします。

現在 GitHub のチェックから、少なくとも次の Pages プロジェクトへの自動デプロイが確認できます。

- `dream-sprite`
- `dream-baseball`

公開サイトとして使用しているのは `dream-sprite.pages.dev` です。

## 更新

主なページ:

- `index.html` — トップページ
- `results.html` — 日程・試合結果

画像などの静的ファイルも同じリポジトリで管理します。


## お問い合わせフォーム

お問い合わせフォームは Cloudflare Pages Functions と Resend を使用しています。

送信経路:

- `contact.html` のフォーム → `/api/contact`
- `functions/api/contact.js` が `env.RESEND_API_KEY` を使用
- Resend API（`https://api.resend.com/emails`）経由で代表者メールへ送信

重要:

- Resend は現在の問い合わせ機能の必須依存です。
- Resend アカウント、API キー、Cloudflare 側の `RESEND_API_KEY` を削除すると、サイト表示は継続しますが問い合わせメール送信は停止します。
- Resend を廃止する場合は、先に `functions/api/contact.js` の送信先サービスを置き換えて動作確認してから削除してください。
