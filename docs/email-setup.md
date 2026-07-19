# Почта в админке (Resend inbound + reply)

Rusability принимает письма и отвечает на них прямо в `/admin/inbox`.
Движок — [Resend](https://resend.com): один провайдер и для приёма, и для
отправки. Бесплатного тарифа (100 писем/день, 3000/мес) достаточно для старта.

## 1. Переменные окружения (Project → Vars)

| Переменная | Назначение | Пример |
| --- | --- | --- |
| `RESEND_API_KEY` | Ключ API Resend (приём + отправка) | `re_xxx` |
| `MAIL_FROM_ADDRESS` | Адрес, с которого уходят ответы | `Rusability <hello@rusability.ru>` |
| `RESEND_WEBHOOK_SECRET` | Секрет подписи вебхука (из панели Resend) | `whsec_xxx` |

Без `RESEND_API_KEY` интерфейс работает, но письма не принимаются и не
отправляются (в админке показывается предупреждение).

## 2. Домен и DNS (у регистратора rusability.ru)

1. В Resend → **Domains** добавьте `rusability.ru`.
2. **Отправка** — добавьте показанные записи **SPF**, **DKIM** и (желательно)
   **DMARC**. Без них ответы будут попадать в спам.
3. **Приём** — добавьте **MX-запись** из вкладки приёма домена. Если у домена
   уже есть почта, используйте отдельный поддомен (например
   `mail.rusability.ru` или `hello.rusability.ru`), чтобы не сломать
   существующий ящик. У MX-записи Resend должен быть наименьший приоритет.
4. Дождитесь статуса **Verified** по всем записям.

## 3. Вебхук приёма

1. Resend → **Webhooks** → создайте вебхук на адрес
   `https://<ваш-домен>/api/email/inbound`.
2. Событие — **`email.received`**.
3. Скопируйте **Signing secret** в `RESEND_WEBHOOK_SECRET`.

Теперь любое письмо на подключённый адрес попадёт во «Почту» в админке. Ответы
отправляются с `MAIL_FROM_ADDRESS` и корректно склеиваются в цепочку у
получателя (заголовки `In-Reply-To` / `References`).

## Как это устроено в коде

- Таблицы: `mail_threads`, `mail_messages` (`src/lib/db/schema.ts`).
- Приём: `src/app/api/email/inbound/route.ts` — проверяет подпись Svix,
  дозагружает тело письма и вложения через Received Emails API, вложения
  кладёт в Blob.
- Отправка: `src/app/admin/inbox/actions.ts` → `sendReply`.
- UI: `src/app/admin/inbox/page.tsx` + `src/components/admin/InboxWorkspace.tsx`.
- Хранилище/логика цепочек: `src/lib/mail/store.ts`.
