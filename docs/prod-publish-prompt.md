# Промпт: публикация фронта WOAson на https://woason.ru

Скопируй это агенту в репозитории `https://github.com/magasov/woason` (локально `C:\Users\Aushev\Desktop\woason`).

## Задача

Довести фронт до продакшена и выложить на **https://woason.ru** так, чтобы витрина выглядела и работала как сейчас локально: каталог Vay-brend с бэкенда, карточки, цены, скидки, рейтинги, отзывы, сторис, рилсы, кабинеты покупателя/продавца/админа, чат, заказы, ЮKassa, СДЭК, Дадата.

Не переписывай дизайн и не делай лендинг-заглушку. Это тот же маркетплейс, только с продовым API.

## Прод-контур (уже есть)

- Сайт: `https://woason.ru` и `https://www.woason.ru`
- API: `https://api.woason.ru`
- WebSocket: `wss://api.woason.ru/ws?token=ACCESS_JWT`
- Документация API: `https://api.woason.ru/docs`
- VPS: `2.27.201.121`, код API в `/opt/woason/api`, фронт должен жить в `/opt/woason/web`
- Docker-сеть API: `api_internal` (Caddy уже в ней)
- Caddy в `woason-api` проксирует `woason.ru` / `www.woason.ru` на контейнер `web:3000`
- CI/CD API: `https://github.com/magasov/woason-api` → SSH → `docker compose -f docker-compose.prod.yml up -d --build`
- Пока публичный DNS `.ru` не разошёлся, API временно доступен по `http://2.27.201.121` (не https)

## Как лить на https://woason.ru

Фронт — Next.js App Router с route handlers (`/api/cdek`, `/api/dadata`). **Static export / копирование `out/` в Caddy file_server нельзя.** Нужен Node-контейнер:

1. `output: "standalone"` в `next.config.ts`
2. `Dockerfile` + `docker-compose.yml`: сервис `web`, сеть `api_internal` (external)
3. На сервере: `/opt/woason/web`, файл `.env` (gitignored)
4. Сборка с build-arg `NEXT_PUBLIC_API_URL=https://api.woason.ru` — Next.js вшивает `NEXT_PUBLIC_*` на **build**, не на runtime
5. `docker compose up -d --build`
6. Caddy reload не обязателен, если блок `woason.ru` уже `reverse_proxy web:3000`

GitHub Actions в этом репо: push в `master` или `main` → тест `npm run build` → SSH на VPS → `git reset --hard` → `docker compose up -d --build`. Секреты репозитория: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` (те же, что у `woason-api`).

Не деплой на Vercel. Не коммить `.env`, ключи Дадаты/СДЭК, пароли.

## Обязательные env

Прод `.env` на сервере (не в git):

```
NEXT_PUBLIC_API_URL=https://api.woason.ru
DADATA_API_KEY=...
DADATA_SECRET_KEY=...
CDEK_API_URL=https://api.edu.cdek.ru
CDEK_ACCOUNT=...
CDEK_SECURE=...
```

Локально оставь `NEXT_PUBLIC_API_URL=http://localhost:8080` в `.env.local`.

В коде клиент ходит на API через `lib/api.ts` (`API_URL` / `WS_URL`). Проверь, что нигде не захардкожен `localhost:8080` в UI (лоадер ленты, логин-подсказки, абсолютные fetch).

## Как должно выглядеть и работать

- Главная: баннеры, рилсы, «Хорошая цена», лента «Все / Только новые / Только б/у», карточки как сейчас (магазин, розница, скидка, цена, старая цена, рейтинг, отзывы, Vay-brend)
- Каталог с продового `GET /api/v1/products`, не из моков `lib/data.ts`, если стор уже ходит в API
- Карточка товара, отзывы (чтение без логина), избранное, корзина, оформление, СДЭК/почта
- Логин/регистрация через `POST /api/v1/auth/login` и `register`
- Продовые учётки (не демо `shop@woason.ru` / `maria@woason.ru`, если их нет в продовой БД): продавец Vay-brend `77aushev@mail.ru`, админ `admin@woason.ru`
- Кабинеты seller/admin, загрузка фото через `POST /api/v1/uploads`, URL с `https://api.woason.ru/uploads/...`
- CORS на API уже пускает `https://woason.ru` и `https://www.woason.ru`
- `next/image`: разреши `ir.ozone.ru` и `api.woason.ru` (товары с Ozon-CDN, аватары/баннеры с API)
- Не оставляй «Загружаем каталог с localhost:8080»

## CI/CD который нужно иметь в `magasov/woason`

Файл `.github/workflows/ci.yml`:

- `on: push` веток `master` и `main`, `pull_request`, `workflow_dispatch`
- job `test`: Node 22, `npm ci`, `NEXT_PUBLIC_API_URL=https://api.woason.ru npm run build`
- job `deploy` только не на PR и только с `master`/`main`: `appleboy/ssh-action`, клон/pull в `/opt/woason/web`, не затирать `.env`, `docker compose up -d --build`

Секреты GitHub Actions: `SSH_HOST=2.27.201.121`, `SSH_USER=root`, `SSH_PRIVATE_KEY` = деплой-ключ (тот же, что в `woason-api`).

После пуша проверь Actions и что `https://woason.ru` открывает витрину, а `https://woason.ru` ходит в `https://api.woason.ru/api/v1/products` (в Network не должно быть localhost).

## Правила

- Коммитишь ты сам, без `Co-authored-by: Cursor`
- Не пушь, пока Magasov не сказал
- Не клади секреты в репозиторий
- Не ломай локальный `npm run dev` → localhost:8080
