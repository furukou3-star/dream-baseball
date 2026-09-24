// Resend API key is provided via Cloudflare secret. Redeploy after secret configuration.\nexport async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const form = await request.formData();

    // Honeypot: bots fill this hidden field; humans never should.
    if (String(form.get("_honey") || "").trim()) {
      return Response.redirect(new URL("/contact-thanks.html", request.url), 303);
    }

    const name = String(form.get("お名前") || "").trim();
    const team = String(form.get("チーム名") || "").trim();
    const email = String(form.get("email") || "").trim();
    const type = String(form.get("お問い合わせ種別") || "").trim();
    const date = String(form.get("希望日") || "").trim();
    const time = String(form.get("希望時間") || "").trim();
    const place = String(form.get("希望場所") || "").trim();
    const message = String(form.get("お問い合わせ内容") || "").trim();

    if (!name || !email || !type || !message) {
      return new Response("必須項目を入力してください。", { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response("メールアドレスを確認してください。", { status: 400 });
    }
    if (name.length > 100 || team.length > 150 || email.length > 254 || type.length > 50 ||
        date.length > 30 || time.length > 50 || place.length > 200 || message.length > 5000) {
      return new Response("入力内容が長すぎます。", { status: 400 });
    }
    if (!env.RESEND_API_KEY) {
      return new Response("メール送信設定が未完了です。", { status: 500 });
    }

    const esc = (s) => s.replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));

    const rows = [
      ["お問い合わせ種別", type],
      ["お名前", name],
      ["チーム名", team || "—"],
      ["メールアドレス", email],
      ["希望日", date || "—"],
      ["希望時間", time || "—"],
      ["希望場所", place || "—"],
      ["お問い合わせ内容", message]
    ];

    const body = rows.map(([k,v]) =>
      `<tr><th style="text-align:left;vertical-align:top;padding:10px;border:1px solid #ddd;background:#f5f6f8">${esc(k)}</th><td style="padding:10px;border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`
    ).join("");

    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Dream Sprite <onboarding@resend.dev>",
        to: ["furu.kou3@gmail.com"],
        reply_to: email,
        subject: `【ドリームスプライト】${type}：${name}さん`,
        html: `<h2>ホームページからお問い合わせが届きました</h2><table style="border-collapse:collapse;width:100%;max-width:720px">${body}</table><p style="color:#667085">このメールに返信すると、入力されたメールアドレス宛に返信できます。</p>`
      })
    });

    if (!sent.ok) {
      const detail = await sent.text();
      console.error("Resend error:", sent.status, detail);
      return new Response("メール送信に失敗しました。時間をおいてもう一度お試しください。", { status: 502 });
    }

    return Response.redirect(new URL("/contact-thanks.html", request.url), 303);
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response("送信中にエラーが発生しました。", { status: 500 });
  }
}
