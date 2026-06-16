export interface Category {
  id: string;
  name: string;
  icon: string;
  isHighRisk: boolean;
  highRiskTip?: string;
}

export interface CleanStep {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  required: boolean;
  hasPhoto: boolean;
}

export interface DisinfectionRecord {
  id: string;
  date: string;
  method: string;
  methodText?: string;
  materials: string[];
  operator: string;
  beforePhotos: string[];
  afterPhotos: string[];
  video?: string;
  completedSteps: string[];
}

export interface TransferRecord {
  id: string;
  fromUserId: string;
  fromUser: string;
  toUserId: string;
  toUser: string;
  date: string;
  price: number;
  location?: string;
  checkInLocation?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  descriptionScore: number;
  hygieneScore: number;
  comment: string;
  createdAt: string;
}

export interface QAItem {
  question: string;
  answer: string;
  isHygiene: boolean;
}

export interface Product {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  originalPrice: number;
  condition: 'new' | 'likeNew' | 'good' | 'fair';
  conditionText: string;
  useMonths: number;
  recallRisk: boolean;
  recallInfo?: string;
  isHighRisk: boolean;
  coverImage: string;
  images: string[];
  disinfectionRecords: DisinfectionRecord[];
  transferRecords: TransferRecord[];
  reviews: Review[];
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  location: string;
  publishDate: string;
  status: 'published' | 'reserved' | 'sold';
  qaList: QAItem[];
  currentHolderId?: string;
  currentHolderName?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'qa' | 'system' | 'price';
  timestamp: string;
  status?: 'sending' | 'sent' | 'read';
  qaData?: QAItem;
  priceData?: {
    fromPrice: number;
    toPrice: number;
    direction: 'buyer_offer' | 'seller_counter';
  };
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  qaConfirmed: boolean;
  priceProposed: boolean;
  inspectScheduled: boolean;
  inspectTime?: string;
  inspectLocation?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  intro?: string;
  trustLevel?: 'normal' | 'good' | 'expert';
  joinDate?: string;
  phone?: string;
  location?: string;
  creditScore?: number;
  hygieneScore?: number;
  publishCount?: number;
  buyCount?: number;
}
