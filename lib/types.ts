export type SellerKind = "shop" | "private";
export type SellerTradeType = "dropship" | "retail" | "wholesale";
export type Condition = "new" | "used";
export type DeliveryMethod = "cdek" | "pochta" | "pickup";
export type OrderStatus =
  | "placed"
  | "awaiting_payment"
  | "paid"
  | "awaiting_shipment"
  | "label_printed"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";
export type UserRole = "buyer" | "seller" | "admin";

export type Category = {
  slug: string;
  name: string;
  icon: string;
  group: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  orderId?: string;
  userId?: string;
  photos?: string[];
  sellerReply?: string;
  sellerReplyAt?: string;
};

export type PendingReview = {
  orderId: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  deliveredAt: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  sellerKind: SellerKind;
  condition: Condition;
  category: string;
  image: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  city: string;
  weightKg: number;
  inStock: number;
  delivery: DeliveryMethod[];
  tags: string[];
  tradeType?: SellerTradeType;
};

export type ReelComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type Reel = {
  id: string;
  productId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  caption: string;
  likes: number;
  comments: ReelComment[];
  durationSec: number;
  gradient: string[];
  liked?: boolean;
};

export type SellerProfile = {
  id: string;
  shopName: string;
  description: string;
  logo: string;
  city: string;
  delivery: DeliveryMethod[];
  banner?: string;
  phone?: string;
  kind?: SellerKind;
};

export type ShopStory = {
  id: string;
  sellerId: string;
  image: string;
  caption: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  sellerId: string;
  buyerId: string;
  fromId: string;
  text: string;
  createdAt: string;
  read: boolean;
};

export type ChatThread = {
  id: string;
  sellerId: string;
  buyerId: string;
  peerId: string;
  peerName: string;
  lastText: string;
  lastAt: string;
  unread: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  seller?: SellerProfile;
};

export type CartItem = {
  productId: string;
  qty: number;
  product?: Product;
};

export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image: string;
};

export type Order = {
  id: string;
  createdAt: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  city: string;
  address: string;
  delivery: DeliveryMethod;
  deliveryPrice: number;
  eta: string;
  trackNumber?: string;
  status: OrderStatus;
  total: number;
};

export type ConditionFilter = "all" | Condition;
