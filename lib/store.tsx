"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, ApiError, ListResponse, readAuth, writeAuth, WS_URL } from "./api";
import { categories, products as seedProducts, reels as seedReels, shops as seedShops, stories as seedStories } from "./data";
import { detectCityByIp } from "./dadata";
import { showBrowserNotification } from "./notify";
import { applyReviewStats } from "./reviews";
import type {
  CartItem,
  ChatMessage,
  ChatThread,
  DeliveryMethod,
  Order,
  PendingReview,
  Product,
  Reel,
  Review,
  SellerProfile,
  ShopStory,
  User,
} from "./types";

const CITY_KEY = "woason-city";
const ADDRESS_KEY = "woason-address";

type AuthRes = { accessToken: string; refreshToken: string; user: User };

export type IncomingNotice = {
  id: string;
  peerId: string;
  peerName: string;
  text: string;
};

type StoreValue = {
  ready: boolean;
  user: User | null;
  catalog: Product[];
  reels: Reel[];
  stories: ShopStory[];
  cart: CartItem[];
  favorites: string[];
  favoriteProducts: Product[];
  orders: Order[];
  myReviews: Review[];
  pendingReviews: PendingReview[];
  sellerReviews: Review[];
  messages: ChatMessage[];
  threads: ChatThread[];
  shops: Record<string, SellerProfile>;
  reelLikes: string[];
  city: string;
  address: string;
  unreadCount: number;
  incomingNotice: IncomingNotice | null;
  setActiveChatPeer: (peerId: string | null) => void;
  dismissIncomingNotice: () => void;
  login: (email: string, password: string) => Promise<string | null>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: User["role"];
    shopName?: string;
    shopDescription?: string;
    delivery?: DeliveryMethod[];
    city?: string;
  }) => Promise<string | null>;
  logout: () => Promise<void>;
  setCity: (city: string) => void;
  setAddress: (address: string) => void;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  addProduct: (input: {
    title: string;
    description: string;
    price: number;
    oldPrice?: number;
    sellerKind: Product["sellerKind"];
    condition: Product["condition"];
    category: string;
    image: string;
    images: string[];
    city: string;
    weightKg: number;
    inStock: number;
    delivery: DeliveryMethod[];
    tags: string[];
    tradeType?: Product["tradeType"];
  }) => Promise<Product | null>;
  placeOrder: (input: { address: string; delivery: DeliveryMethod }) => Promise<{
    order: Order;
    confirmationUrl?: string;
  } | string>;
  shipOrder: (orderId: string, method: DeliveryMethod) => Promise<void>;
  advanceOrder: (orderId: string) => Promise<void>;
  toggleReelLike: (reelId: string) => Promise<void>;
  addReelComment: (reelId: string, text: string) => Promise<void>;
  addReview: (input: {
    productId: string;
    orderId: string;
    rating: number;
    text: string;
    photos?: string[];
  }) => Promise<string | null>;
  replyToReview: (reviewId: string, productId: string, text: string) => Promise<string | null>;
  loadProductReviews: (id: string, sort?: "new" | "high" | "low") => Promise<void>;
  loadMyReviews: () => Promise<void>;
  loadPendingReviews: () => Promise<void>;
  loadSellerReviews: () => Promise<void>;
  findProduct: (id: string) => Product | undefined;
  findShop: (id: string) => SellerProfile | undefined;
  loadShop: (id: string) => Promise<void>;
  loadProduct: (id: string) => Promise<void>;
  loadChat: (peerId: string) => Promise<void>;
  loadOrder: (id: string) => Promise<void>;
  updateShop: (patch: Partial<SellerProfile>) => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone" | "avatar">>) => Promise<void>;
  addStory: (input: { image: string; caption: string }) => Promise<ShopStory | null>;
  addReel: (input: { productId: string; title: string; caption: string }) => Promise<Reel | null>;
  sendMessage: (peerId: string, text: string) => Promise<void>;
  markThreadRead: (peerId: string) => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);

function errMsg(e: unknown, fallback: string) {
  if (e instanceof ApiError) return e.message;
  return fallback;
}

function mergeById<T extends { id: string }>(list: T[], extra: T[]) {
  const map = new Map(list.map((x) => [x.id, x]));
  for (const x of extra) map.set(x.id, x);
  return [...map.values()];
}

function otherPeer(m: ChatMessage, myId: string) {
  return m.sellerId === myId ? m.buyerId : m.sellerId;
}

function playIncomingSound() {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio("/sounds/message.mp3");
    audio.volume = 0.85;
    void audio.play().catch(() => undefined);
  } catch {
    /* autoplay blocked until a user gesture */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [stories, setStories] = useState<ShopStory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [sellerReviews, setSellerReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [shops, setShops] = useState<Record<string, SellerProfile>>({});
  const [city, setCityState] = useState("");
  const [address, setAddressState] = useState("");
  const [incomingNotice, setIncomingNotice] = useState<IncomingNotice | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const activeChatPeerRef = useRef<string | null>(null);
  const userRef = useRef(user);
  const threadsRef = useRef(threads);
  const shopsRef = useRef(shops);
  userRef.current = user;
  threadsRef.current = threads;
  shopsRef.current = shops;

  const setActiveChatPeer = useCallback((peerId: string | null) => {
    activeChatPeerRef.current = peerId;
    if (peerId) {
      setIncomingNotice((n) => (n?.peerId === peerId ? null : n));
    }
  }, []);

  const dismissIncomingNotice = useCallback(() => {
    setIncomingNotice(null);
  }, []);

  const favorites = useMemo(() => favoriteProducts.map((p) => p.id), [favoriteProducts]);
  const reelLikes = useMemo(() => reels.filter((r) => r.liked).map((r) => r.id), [reels]);
  const unreadCount = useMemo(() => threads.reduce((s, t) => s + (t.unread || 0), 0), [threads]);

  const applyAuth = useCallback((data: AuthRes) => {
    writeAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setUser(data.user);
  }, []);

  const loadPublic = useCallback(async () => {
    const allowed = new Set(categories.map((c) => c.slug));
    const onlyGoods = (list: Product[]) => list.filter((p) => allowed.has(p.category));
    const seedShopMap = Object.fromEntries(seedShops.map((s) => [s.id, s]));
    try {
      const [products, reelList] = await Promise.all([
        api<ListResponse<Product>>("/api/v1/products?limit=100&sort=new", { auth: Boolean(readAuth()) }),
        api<ListResponse<Reel>>("/api/v1/reels?limit=50", { auth: Boolean(readAuth()) }),
      ]);
      const goods = onlyGoods(products.items || []);
      setCatalog(goods);
      setReels(reelList.items?.length ? reelList.items : seedReels);
      setShops((prev) => ({ ...seedShopMap, ...prev }));
      setStories((prev) => (prev.length ? prev : seedStories));
    } catch {
      setCatalog(seedProducts);
      setReels(seedReels);
      setShops((prev) => ({ ...seedShopMap, ...prev }));
      setStories(seedStories);
    }
  }, []);

  const loadPrivate = useCallback(async () => {
    if (!readAuth()) {
      setCart([]);
      setFavoriteProducts([]);
      setOrders([]);
      setMyReviews([]);
      setPendingReviews([]);
      setSellerReviews([]);
      setThreads([]);
      return;
    }
    try {
      const me = await api<User>("/api/v1/me", { auth: true });
      setUser(me);
      const [cartRes, favRes, chatRes] = await Promise.all([
        api<{ items: CartItem[] }>("/api/v1/cart", { auth: true }),
        api<ListResponse<Product>>("/api/v1/favorites", { auth: true }),
        api<ListResponse<ChatThread>>("/api/v1/chats", { auth: true }),
      ]);
      setCart(cartRes.items || []);
      setFavoriteProducts(favRes.items || []);
      setThreads(chatRes.items || []);
      const extra: Promise<unknown>[] = [
        api<ListResponse<Order>>("/api/v1/cabinet/orders?limit=100", { auth: true })
          .then((mine) => {
            setOrders((prev) => mergeById(prev, mine.items || []));
          })
          .catch(() => undefined),
        api<ListResponse<Review>>("/api/v1/cabinet/reviews?limit=100", { auth: true })
          .then((res) => setMyReviews(res.items || []))
          .catch(() => undefined),
        api<ListResponse<PendingReview>>("/api/v1/cabinet/reviews/pending", { auth: true })
          .then((res) => setPendingReviews(res.items || []))
          .catch(() => undefined),
      ];
      if (me.role === "seller") {
        extra.push(
          api<ListResponse<Order>>("/api/v1/seller/orders?limit=100", { auth: true })
            .then((sellerOrders) => {
              setOrders((prev) => mergeById(prev, sellerOrders.items || []));
            })
            .catch(() => undefined),
        );
        extra.push(
          api<ListResponse<Review>>("/api/v1/seller/reviews?limit=100", { auth: true })
            .then((res) => setSellerReviews(res.items || []))
            .catch(() => undefined),
        );
        if (me.seller) setShops((s) => ({ ...s, [me.seller!.id]: me.seller! }));
      }
      await Promise.all(extra);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        writeAuth(null);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const unlock = () => {
      const a = new Audio("/sounds/message.mp3");
      a.volume = 0;
      void a
        .play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
        })
        .catch(() => undefined);
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    const savedCity = localStorage.getItem(CITY_KEY);
    const savedAddress = localStorage.getItem(ADDRESS_KEY);
    if (savedAddress) setAddressState(savedAddress);
    if (savedCity) {
      setCityState(savedCity);
    } else {
      void detectCityByIp()
        .then((name) => {
          if (localStorage.getItem(CITY_KEY)) return;
          const cityName = name || "Москва";
          setCityState(cityName);
          localStorage.setItem(CITY_KEY, cityName);
        })
        .catch(() => {
          if (localStorage.getItem(CITY_KEY)) return;
          setCityState("Москва");
        });
    }
    const boot = async () => {
      try {
        await loadPublic();
        if (readAuth()) await loadPrivate();
      } catch {
        /* бэк может быть выключен */
      } finally {
        setReady(true);
      }
    };
    void boot();
  }, [loadPublic, loadPrivate]);

  useEffect(() => {
    const auth = readAuth();
    if (!user || !auth?.accessToken) {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }
    const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(auth.accessToken)}`);
    wsRef.current = socket;
    socket.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as {
          type: string;
          peerId?: string;
          orderId?: string;
          payload?: ChatMessage | Order;
        };
        if (msg.type === "chat.message" && msg.payload) {
          const m = msg.payload as ChatMessage;
          const me = userRef.current;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          if (!me) return;
          const peerId = otherPeer(m, me.id);
          const isOwn = m.fromId === me.id;
          const inThisChat = activeChatPeerRef.current === peerId;
          const peerName =
            threadsRef.current.find((t) => t.peerId === peerId)?.peerName ||
            shopsRef.current[peerId]?.shopName ||
            "Собеседник";
          setThreads((prev) => {
            const idx = prev.findIndex((t) => t.peerId === peerId);
            const currentUnread = idx >= 0 ? prev[idx].unread : 0;
            const unread = isOwn ? currentUnread : inThisChat ? 0 : currentUnread + 1;
            const row: ChatThread = {
              id: idx >= 0 ? prev[idx].id : m.id,
              sellerId: m.sellerId,
              buyerId: m.buyerId,
              peerId,
              peerName: idx >= 0 ? prev[idx].peerName : peerName,
              lastText: m.text,
              lastAt: m.createdAt,
              unread,
            };
            if (idx >= 0) {
              const next = [...prev];
              next.splice(idx, 1);
              return [row, ...next];
            }
            return [row, ...prev];
          });
          const watching = inThisChat && typeof document !== "undefined" && !document.hidden;
          if (!isOwn && !watching) {
            playIncomingSound();
            setIncomingNotice({ id: m.id, peerId, peerName, text: m.text });
            showBrowserNotification({
              title: peerName,
              body: m.text,
              url: `/chat/${peerId}`,
              tag: `chat-${peerId}`,
            });
          }
          if (!isOwn && inThisChat && watching) {
            void api(`/api/v1/chats/${peerId}/read`, { method: "POST", auth: true }).catch(() => undefined);
          }
        }
        if ((msg.type === "order.updated" || msg.type === "payment.succeeded") && msg.payload) {
          const o = msg.payload as Order;
          setOrders((prev) => {
            const i = prev.findIndex((x) => x.id === o.id);
            if (i < 0) return [o, ...prev];
            const next = [...prev];
            next[i] = o;
            return next;
          });
        }
      } catch {
        /* ignore */
      }
    };
    return () => {
      socket.close();
      if (wsRef.current === socket) wsRef.current = null;
    };
  }, [user]);

  const findProduct = useCallback(
    (id: string) => catalog.find((p) => p.id === id) || cart.find((c) => c.productId === id)?.product,
    [catalog, cart],
  );
  const findShop = useCallback((id: string) => shops[id] || (user?.seller?.id === id ? user.seller : undefined), [shops, user]);

  const loadProductReviews = useCallback(async (id: string, sort: "new" | "high" | "low" = "new") => {
    const list = await api<ListResponse<Review>>(
      `/api/v1/products/${id}/reviews?limit=50&offset=0&sort=${sort}`,
    );
    const items = list.items || [];
    setCatalog((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, reviews: items, reviewsCount: list.total ?? x.reviewsCount } : x,
      ),
    );
  }, []);

  const loadProduct = useCallback(async (id: string) => {
    const p = await api<Product>(`/api/v1/products/${id}`);
    setCatalog((prev) => mergeById(prev, [p]));
  }, []);

  const loadMyReviews = useCallback(async () => {
    if (!readAuth()) {
      setMyReviews([]);
      return;
    }
    const res = await api<ListResponse<Review>>("/api/v1/cabinet/reviews?limit=100", { auth: true });
    setMyReviews(res.items || []);
  }, []);

  const loadPendingReviews = useCallback(async () => {
    if (!readAuth()) {
      setPendingReviews([]);
      return;
    }
    const res = await api<ListResponse<PendingReview>>("/api/v1/cabinet/reviews/pending", { auth: true });
    setPendingReviews(res.items || []);
  }, []);

  const loadSellerReviews = useCallback(async () => {
    if (!readAuth()) {
      setSellerReviews([]);
      return;
    }
    const res = await api<ListResponse<Review>>("/api/v1/seller/reviews?limit=100", { auth: true });
    setSellerReviews(res.items || []);
  }, []);

  const loadShop = useCallback(async (id: string) => {
    const [shop, goods, shopReels, shopStories] = await Promise.all([
      api<SellerProfile>(`/api/v1/shops/${id}`, { auth: Boolean(readAuth()) }),
      api<ListResponse<Product>>(`/api/v1/shops/${id}/products?limit=100`, { auth: Boolean(readAuth()) }),
      api<ListResponse<Reel>>(`/api/v1/shops/${id}/reels?limit=50`, { auth: Boolean(readAuth()) }),
      api<ListResponse<ShopStory>>(`/api/v1/shops/${id}/stories`, { auth: Boolean(readAuth()) }),
    ]);
    setShops((s) => ({ ...s, [id]: shop }));
    setCatalog((prev) => mergeById(prev, goods.items || []));
    setReels((prev) => mergeById(prev, shopReels.items || []));
    setStories((prev) => {
      const rest = prev.filter((x) => x.sellerId !== id);
      return [...(shopStories.items || []), ...rest];
    });
  }, []);

  const loadChat = useCallback(async (peerId: string) => {
    const [list, msgs] = await Promise.all([
      api<ListResponse<ChatThread>>("/api/v1/chats", { auth: true }),
      api<ListResponse<ChatMessage>>(`/api/v1/chats/${peerId}/messages`, { auth: true }),
    ]);
    setThreads(list.items || []);
    setMessages((prev) => {
      const others = prev.filter((m) => m.sellerId !== peerId && m.buyerId !== peerId);
      return [...others, ...(msgs.items || [])];
    });
    try {
      const shop = await api<SellerProfile>(`/api/v1/shops/${peerId}`, { auth: true });
      setShops((s) => ({ ...s, [peerId]: shop }));
    } catch {
      /* peer может быть покупателем */
    }
    const sock = wsRef.current;
    if (sock && sock.readyState === WebSocket.OPEN) {
      sock.send(JSON.stringify({ type: "subscribe", channel: "chat", peerId }));
    }
  }, []);

  const loadOrder = useCallback(async (id: string) => {
    const o = await api<Order>(`/api/v1/orders/${id}`, { auth: true });
    setOrders((prev) => {
      const i = prev.findIndex((x) => x.id === o.id);
      if (i < 0) return [o, ...prev];
      const next = [...prev];
      next[i] = o;
      return next;
    });
    const sock = wsRef.current;
    if (sock && sock.readyState === WebSocket.OPEN) {
      sock.send(JSON.stringify({ type: "subscribe", channel: "orders", orderId: id }));
    }
  }, []);

  const markThreadRead = useCallback(async (peerId: string) => {
    await api(`/api/v1/chats/${peerId}/read`, { method: "POST", auth: true });
    setThreads((prev) => {
      if (!prev.some((t) => t.peerId === peerId && t.unread > 0)) return prev;
      return prev.map((t) => (t.peerId === peerId ? { ...t, unread: 0 } : t));
    });
  }, []);

  const sendMessage = useCallback(async (peerId: string, text: string) => {
    const sock = wsRef.current;
    if (sock && sock.readyState === WebSocket.OPEN) {
      sock.send(JSON.stringify({ type: "chat.send", peerId, text }));
      return;
    }
    const msg = await api<ChatMessage>(`/api/v1/chats/${peerId}/messages`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ text }),
    });
    setMessages((prev) => [...prev, msg]);
  }, []);

  const value = useMemo<StoreValue>(() => {
    return {
      ready,
      user,
      catalog,
      reels,
      stories,
      cart,
      favorites,
      favoriteProducts,
      orders,
      myReviews,
      pendingReviews,
      sellerReviews,
      messages,
      threads,
      shops,
      reelLikes,
      city,
      address,
      unreadCount,
      incomingNotice,
      setActiveChatPeer,
      dismissIncomingNotice,
      findProduct,
      findShop,
      setCity: (next) => {
        setCityState(next);
        localStorage.setItem(CITY_KEY, next);
      },
      setAddress: (next) => {
        setAddressState(next);
        localStorage.setItem(ADDRESS_KEY, next);
      },
      login: async (email, password) => {
        try {
          const data = await api<AuthRes>("/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          applyAuth(data);
          await loadPublic();
          await loadPrivate();
          return null;
        } catch (e) {
          return errMsg(e, "не удалось войти");
        }
      },
      register: async (input) => {
        try {
          const data = await api<AuthRes>("/api/v1/auth/register", {
            method: "POST",
            body: JSON.stringify(input),
          });
          applyAuth(data);
          await loadPublic();
          await loadPrivate();
          return null;
        } catch (e) {
          return errMsg(e, "не удалось зарегистрироваться");
        }
      },
      logout: async () => {
        const auth = readAuth();
        try {
          await api("/api/v1/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refreshToken: auth?.refreshToken || "" }),
          });
        } catch {
          /* ignore */
        }
        writeAuth(null);
        setUser(null);
        setCart([]);
        setFavoriteProducts([]);
        setOrders([]);
        setMyReviews([]);
        setPendingReviews([]);
        setSellerReviews([]);
        setThreads([]);
        setMessages([]);
      },
      addToCart: async (productId, qty = 1) => {
        const res = await api<{ items: CartItem[] }>("/api/v1/cart", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ productId, qty }),
        });
        setCart(res.items || []);
      },
      setQty: async (productId, qty) => {
        const res = await api<{ items: CartItem[] }>(`/api/v1/cart/${productId}`, {
          method: "PATCH",
          auth: true,
          body: JSON.stringify({ qty }),
        });
        setCart(res.items || []);
      },
      toggleFavorite: async (productId) => {
        const liked = favoriteProducts.some((p) => p.id === productId);
        const res = liked
          ? await api<ListResponse<Product>>(`/api/v1/favorites/${productId}`, { method: "DELETE", auth: true })
          : await api<ListResponse<Product>>("/api/v1/favorites", {
              method: "POST",
              auth: true,
              body: JSON.stringify({ productId }),
            });
        setFavoriteProducts(res.items || []);
      },
      addProduct: async (input) => {
        try {
          const product = await api<Product>("/api/v1/seller/products", {
            method: "POST",
            auth: true,
            body: JSON.stringify({
              title: input.title,
              description: input.description,
              price: input.price,
              oldPrice: input.oldPrice,
              category: input.category,
              condition: input.condition,
              image: input.image,
              images: input.images,
              city: input.city,
              weightKg: input.weightKg,
              inStock: input.inStock,
              delivery: input.delivery,
              tags: input.tags,
              tradeType: input.tradeType,
            }),
          });
          setCatalog((prev) => [product, ...prev]);
          return product;
        } catch {
          const shop = user?.seller;
          if (!shop) return null;
          const product: Product = {
            id: `local-${Date.now()}`,
            title: input.title,
            description: input.description,
            price: input.price,
            oldPrice: input.oldPrice,
            rating: 0,
            reviewsCount: 0,
            reviews: [],
            sellerKind: input.sellerKind,
            condition: input.condition,
            category: input.category,
            image: input.image,
            images: input.images,
            sellerId: shop.id,
            sellerName: shop.shopName,
            city: input.city,
            weightKg: input.weightKg,
            inStock: input.inStock,
            delivery: input.delivery,
            tags: input.tags,
            tradeType: input.tradeType,
          };
          setCatalog((prev) => [product, ...prev]);
          return product;
        }
      },
      placeOrder: async ({ address, delivery }) => {
        try {
          const res = await api<{ order: Order; confirmationUrl?: string; confirmationURL?: string }>(
            "/api/v1/checkout",
            {
              method: "POST",
              auth: true,
              body: JSON.stringify({ address, delivery, city }),
            },
          );
          setCart([]);
          if (res.order) setOrders((prev) => [res.order, ...prev.filter((o) => o.id !== res.order.id)]);
          return { order: res.order, confirmationUrl: res.confirmationUrl || res.confirmationURL };
        } catch (e) {
          return errMsg(e, "не удалось оформить заказ");
        }
      },
      shipOrder: async (orderId, method) => {
        const o = await api<Order>(`/api/v1/seller/orders/${orderId}/label`, {
          method: "POST",
          auth: true,
          body: JSON.stringify({ method }),
        });
        setOrders((prev) => prev.map((x) => (x.id === o.id ? o : x)));
      },
      advanceOrder: async (orderId) => {
        const current = orders.find((o) => o.id === orderId);
        const next =
          current?.status === "in_transit"
            ? "delivered"
            : current?.status === "delivered"
              ? "delivered"
              : "in_transit";
        const o = await api<Order>(`/api/v1/seller/orders/${orderId}/status`, {
          method: "POST",
          auth: true,
          body: JSON.stringify({ status: next }),
        });
        setOrders((prev) => prev.map((x) => (x.id === o.id ? o : x)));
      },
      toggleReelLike: async (reelId) => {
        const reel = await api<Reel>(`/api/v1/reels/${reelId}/like`, { method: "POST", auth: true });
        setReels((prev) => prev.map((r) => (r.id === reel.id ? reel : r)));
      },
      addReelComment: async (reelId, text) => {
        const reel = await api<Reel>(`/api/v1/reels/${reelId}/comments`, {
          method: "POST",
          auth: true,
          body: JSON.stringify({ text }),
        });
        setReels((prev) => prev.map((r) => (r.id === reel.id ? reel : r)));
      },
      addReview: async ({ productId, orderId, rating, text, photos }) => {
        try {
          const review = await api<Review>(`/api/v1/products/${productId}/reviews`, {
            method: "POST",
            auth: true,
            body: JSON.stringify({ orderId, rating, text, photos }),
          });
          const product = catalog.find((p) => p.id === productId);
          const withMeta: Review = {
            ...review,
            productId: review.productId || productId,
            productTitle: review.productTitle || product?.title,
            productImage: review.productImage || product?.image,
            userId: review.userId || user?.id,
          };
          setCatalog((prev) =>
            prev.map((p) => (p.id === productId ? applyReviewStats(p, withMeta) : p)),
          );
          setMyReviews((prev) => mergeById(prev, [withMeta]));
          setPendingReviews((prev) => prev.filter((row) => row.productId !== productId));
          void loadProduct(productId).catch(() => undefined);
          void loadMyReviews().catch(() => undefined);
          void loadPendingReviews().catch(() => undefined);
          return null;
        } catch (e) {
          return errMsg(e, "не удалось оставить отзыв");
        }
      },
      replyToReview: async (reviewId, productId, text) => {
        try {
          const review = await api<Review>(`/api/v1/seller/reviews/${reviewId}/reply`, {
            method: "POST",
            auth: true,
            body: JSON.stringify({ text }),
          });
          const patch = (r: Review) =>
            r.id === reviewId
              ? {
                  ...r,
                  ...review,
                  sellerReply: review.sellerReply || text,
                  sellerReplyAt: review.sellerReplyAt || new Date().toISOString(),
                }
              : r;
          setCatalog((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, reviews: (p.reviews || []).map(patch) } : p)),
          );
          setSellerReviews((prev) => prev.map(patch));
          setMyReviews((prev) => prev.map(patch));
          return null;
        } catch (e) {
          return errMsg(e, "не удалось ответить");
        }
      },
      loadProduct,
      loadProductReviews,
      loadMyReviews,
      loadPendingReviews,
      loadSellerReviews,
      loadShop,
      loadChat,
      loadOrder,
      sendMessage,
      markThreadRead,
      updateShop: async (patch) => {
        try {
          const shop = await api<SellerProfile>("/api/v1/seller/shop", {
            method: "PATCH",
            auth: true,
            body: JSON.stringify(patch),
          });
          setUser((u) => (u ? { ...u, seller: shop } : u));
          setShops((s) => ({ ...s, [shop.id]: shop }));
        } catch {
          const shop = user?.seller;
          if (!shop) return;
          const next = { ...shop, ...patch };
          setUser((u) => (u ? { ...u, seller: next } : u));
          setShops((s) => ({ ...s, [next.id]: next }));
        }
      },
      updateProfile: async (patch) => {
        try {
          const me = await api<User>("/api/v1/me", {
            method: "PATCH",
            auth: true,
            body: JSON.stringify(patch),
          });
          setUser((u) => (u ? { ...u, ...me } : me));
        } catch {
          setUser((u) => (u ? { ...u, ...patch } : u));
        }
      },
      addStory: async ({ image, caption }) => {
        try {
          const story = await api<ShopStory>("/api/v1/seller/stories", {
            method: "POST",
            auth: true,
            body: JSON.stringify({ image, caption }),
          });
          setStories((prev) => [story, ...prev]);
          return story;
        } catch {
          const shop = user?.seller;
          if (!shop || !image) return null;
          const story: ShopStory = {
            id: `local-story-${Date.now()}`,
            sellerId: shop.id,
            image,
            caption,
            createdAt: new Date().toISOString(),
          };
          setStories((prev) => [story, ...prev]);
          return story;
        }
      },
      addReel: async ({ productId, title, caption }) => {
        try {
          const reel = await api<Reel>("/api/v1/seller/reels", {
            method: "POST",
            auth: true,
            body: JSON.stringify({ productId, title, caption }),
          });
          setReels((prev) => [reel, ...prev]);
          return reel;
        } catch {
          return null;
        }
      },
    };
  }, [
    ready,
    user,
    catalog,
    reels,
    stories,
    cart,
    favorites,
    favoriteProducts,
    orders,
    myReviews,
    pendingReviews,
    sellerReviews,
    messages,
    threads,
    shops,
    reelLikes,
    city,
    address,
    unreadCount,
    incomingNotice,
    setActiveChatPeer,
    dismissIncomingNotice,
    findProduct,
    findShop,
    loadProduct,
    loadProductReviews,
    loadMyReviews,
    loadPendingReviews,
    loadSellerReviews,
    loadShop,
    loadChat,
    loadOrder,
    sendMessage,
    markThreadRead,
    applyAuth,
    loadPublic,
    loadPrivate,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
