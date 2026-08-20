# Промпт для бэкенда WOAson — отзывы

Скопируй это агенту бэкенда как ТЗ. Фронт уже заточен под эти ручки.

## Главное правило

**Читать отзывы может кто угодно, без авторизации.**  
**Писать отзыв может только покупатель, у которого этот товар в заказе со статусом `delivered`.**

Не закрывай GET авторизацией. Не отдавай 401/403 на список отзывов. Не прячь `reviews` у товара для гостя.

Ограничение «купил и получил» действует только на `POST`.

## Модель

```
Review {
  id: string
  productId: string
  orderId: string
  userId: string
  author: string              // публичное имя покупателя
  rating: number              // целое 1–5
  text: string                // 8–2000 символов
  date: string                // ISO или dd.mm.yyyy — фронт показывает как есть
  photos?: string[]           // 0–4 URL
  productTitle?: string       // для кабинетов
  productImage?: string
  sellerReply?: string
  sellerReplyAt?: string      // ISO
}

Product: rating (среднее, 1 знак), reviewsCount, reviews[]
```

После create/delete пересчитай у товара `reviewsCount` и `rating`.

Загрузка фото: `POST /api/v1/uploads`, `kind=review`, до 4 файлов, до 10 МБ, image/*.

Ошибки: `{ "error": "строка" }`. Списки: `{ "items": T[], "total": number }`.  
Auth: `Authorization: Bearer <accessToken>`.

---

## Публичное API — без токена

### `GET /api/v1/products/:id`

Отдай товар **вместе с** `reviews`, `rating`, `reviewsCount`. Гость должен увидеть те же отзывы, что и покупатель. Не фильтруй отзывы по user.

### `GET /api/v1/products/:id/reviews?limit=50&offset=0&sort=new|high|low`

Публичный список. Auth не нужен. Если токен передали — всё равно отдай полный публичный список, не «только свои».

`sort`: `new` по дате убыв., `high`/`low` по rating.

`200 { items, total }`

`404` товар не найден.

---

## Написать отзыв — только после доставки

### `POST /api/v1/products/:id/reviews`

Auth обязателен.

Тело:

```json
{ "orderId": "…", "rating": 5, "text": "…", "photos": ["https://…"] }
```

Сервер обязан проверить сам, фронту не верить:

1. Пользователь залогинен.
2. Заказ `orderId` существует.
3. `order.buyerId === currentUser.id`.
4. В `order.items` есть этот `productId`.
5. `order.status === "delivered"` — не `placed`, `paid`, `awaiting_shipment`, `label_printed`, `in_transit`, `cancelled`, `refunded`.
6. Нет другого отзыва этой пары `userId + productId`.
7. Текущий пользователь не владелец товара (`product.sellerId`).

Ответы:

- `201` объект Review (с `productId`, `author`, `rating`, `text`, `date`, `photos`)
- `401` нет токена
- `403` «оставить отзыв можно только после получения заказа» / «нельзя оценить свой товар»
- `409` «вы уже оставили отзыв на этот товар»
- `404` нет товара или заказа
- `400` rating не 1–5 или text короткий

После успеха обнови `product.rating` и `product.reviewsCount`.

---

## Кабинет покупателя (auth)

### `GET /api/v1/cabinet/reviews?limit=100`

Мои написанные отзывы, с `productId`, `productTitle`, `productImage`.

### `GET /api/v1/cabinet/reviews/pending`

Позиции из заказов `delivered`, на которые ещё нет отзыва:

```json
{ "orderId", "productId", "title", "price", "image", "deliveredAt" }
```

### `GET /api/v1/cabinet/orders`

Покупки текущего пользователя (`buyerId`). Если роль seller — всё равно отдавай **его покупки**, не продажи магазина.

---

## Кабинет продавца (auth, role=seller)

### `GET /api/v1/seller/reviews?limit=100`

Отзывы на товары магазина. Это чтение своих отзывов как продавца, не публичный список.

### `POST /api/v1/seller/reviews/:reviewId/reply`

Тело: `{ "text": "…" }` (2–1000).  
Только если товар отзыва принадлежит этому продавцу.

`200` Review с `sellerReply`, `sellerReplyAt`.  
`403` чужой отзыв.

Продажи отдельно: `GET /api/v1/seller/orders` — не путать с cabinet/orders.

---

## Что нельзя

- Нельзя требовать логин, чтобы **смотреть** отзывы.
- Нельзя отдавать пустой `reviews` гостю, если отзывы есть.
- Нельзя принять POST до статуса `delivered`.
- Нельзя больше одного отзыва на товар от одного пользователя.
- Продавец не оценивает свой товар, только отвечает.

## Как проверить

1. Без токена `GET /products/:id` и `GET /products/:id/reviews` — отзывы видны.
2. Гость `POST /reviews` → 401.
3. Залогинен, заказ не delivered → POST 403. Список GET по-прежнему полный.
4. Статус `delivered` → POST 201, рейтинг товара вырос, GET без токена показывает новый отзыв.
5. Повторный POST → 409.
6. Продавец reply → ответ виден в публичном GET.
