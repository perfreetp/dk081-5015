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
  materials: string[];
  operator: string;
  beforePhotos: string[];
  afterPhotos: string[];
  video?: string;
  completedSteps: string[];
}

export interface TransferRecord {
  id: string;
  fromUser: string;
  toUser: string;
  date: string;
  price: number;
  location?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  descriptionScore: number;
  hygieneScore: number;
  comment: string;
  date: string;
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
  qaList?: QAItem[];
}

export interface QAItem {
  question: string;
  answer: string;
  isHygiene: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'qa' | 'system';
  timestamp: string;
  qaData?: QAItem;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  hygieneCheckDone: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  location: string;
  creditScore: number;
  hygieneScore: number;
  publishCount: number;
  buyCount: number;
}
