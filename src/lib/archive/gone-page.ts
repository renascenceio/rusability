type Section = "articles" | "news";

/**
 * Self-contained, on-brand HTML for removed (410 Gone) article/news links.
 *
 * Returned directly from middleware (which runs on the edge and can't render
 * React), so all styling is inline. It mirrors the Rusability design system:
 * warm neutral background, Lora serif headings, Plus Jakarta Sans body, brand
 * blue #4d5aff.
 */
export function goneHtml(section: Section): string {
  const primary =
    section === "news"
      ? { href: "/news", label: "Смотреть новости" }
      : { href: "/articles", label: "Читать статьи" };
  const secondary =
    section === "news"
      ? { href: "/articles", label: "Все статьи" }
      : { href: "/news", label: "Все новости" };

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Материал недоступен — Rusability</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg: #f7f5f2; --ink: #1a1612; --muted: rgba(26,22,18,0.62);
    --card: #ffffff; --border: rgba(0,0,0,0.08); --blue: #4d5aff;
    --surface-2: #f0ede8;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg); color: var(--ink);
    font-family: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
    line-height: 1.7; -webkit-font-smoothing: antialiased;
    min-height: 100dvh; display: flex; flex-direction: column;
  }
  .wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.25rem; }
  .card {
    width: 100%; max-width: 560px; background: var(--card);
    border: 1px solid var(--border); border-radius: 24px;
    padding: 2.75rem 2.25rem; text-align: center;
    box-shadow: 0 1px 3px rgba(26,20,16,0.06), 0 16px 40px -20px rgba(26,20,16,0.2);
  }
  .brand { font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 1.75rem; }
  .brand .ru { color: var(--blue); }
  .badge {
    display: inline-block; font-size: 0.72rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted);
    background: var(--surface-2); border-radius: 40px; padding: 0.35rem 0.85rem; margin-bottom: 1.1rem;
  }
  h1 {
    font-family: "Lora", Georgia, serif; font-weight: 600;
    font-size: 1.75rem; line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 1rem;
    text-wrap: balance;
  }
  p { color: var(--muted); font-size: 0.98rem; margin: 0 0 1rem; text-wrap: pretty; }
  .actions { display: flex; flex-wrap: wrap; gap: 0.7rem; justify-content: center; margin-top: 1.75rem; }
  a.btn {
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 0.92rem; font-weight: 600; text-decoration: none;
    border-radius: 40px; padding: 0.75rem 1.4rem; transition: opacity 0.15s, background 0.15s;
  }
  a.primary { background: var(--blue); color: #fff; }
  a.primary:hover { opacity: 0.9; }
  a.secondary { background: var(--surface-2); color: var(--ink); }
  a.secondary:hover { background: #e4ddd2; }
  a.home { color: var(--muted); text-decoration: none; font-size: 0.85rem; display: inline-block; margin-top: 1.5rem; }
  a.home:hover { color: var(--ink); }
</style>
</head>
<body>
  <div class="wrap">
    <main class="card">
      <div class="brand">Rusability<span class="ru">.ru</span></div>
      <span class="badge">Материал перемещён в архив</span>
      <h1>Эта страница больше недоступна</h1>
      <p>Мы полностью обновили Rusability — переосмыслили платформу, чтобы сделать её быстрее, чище и полезнее, и привели её в соответствие с рекомендациями Роскомнадзора.</p>
      <p>В новой версии прежние материалы, к сожалению, не сохранились. Приносим извинения, если вы искали конкретную публикацию — зато вас ждёт обновлённый Rusability с новыми статьями, авторами и подходом.</p>
      <div class="actions">
        <a class="btn primary" href="${primary.href}">${primary.label}</a>
        <a class="btn secondary" href="${secondary.href}">${secondary.label}</a>
      </div>
      <a class="home" href="/">← Вернуться на главную</a>
    </main>
  </div>
</body>
</html>`;
}
