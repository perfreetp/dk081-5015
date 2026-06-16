import { Conversation, Message } from '@/types';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    productId: 'prod-002',
    productTitle: 'babycare宝宝餐椅 多功能可折叠',
    productImage: 'https://picsum.photos/id/230/200/200',
    productPrice: 280,
    buyerId: 'user_002',
    buyerName: '买家小王',
    sellerId: 'user_001',
    sellerName: '新手妈妈小李',
    otherUserId: 'user_002',
    otherUserName: '买家小王',
    otherUserAvatar: 'https://picsum.photos/id/64/100/100',
    lastMessage: '好的，那我们周末见哦！',
    lastMessageTime: '2026-06-15T14:30:00.000Z',
    unreadCount: 2,
    qaConfirmed: true,
    priceProposed: false,
    inspectScheduled: true,
    inspectTime: '2026-06-18T10:00:00.000Z',
    inspectLocation: '瑞幸咖啡(望京SOHO店)'
  },
  {
    id: 'conv-002',
    productId: 'prod-003',
    productTitle: '美德乐丝韵电动吸奶器 单边',
    productImage: 'https://picsum.photos/id/225/200/200',
    productPrice: 350,
    buyerId: 'user_003',
    buyerName: '琪琪妈',
    sellerId: 'user_001',
    sellerName: '新手妈妈小李',
    otherUserId: 'user_003',
    otherUserName: '琪琪妈',
    otherUserAvatar: 'https://picsum.photos/id/177/100/100',
    lastMessage: '请问吸奶器还在吗？',
    lastMessageTime: '2026-06-15T10:20:00.000Z',
    unreadCount: 1,
    qaConfirmed: false,
    priceProposed: false,
    inspectScheduled: false
  },
  {
    id: 'conv-003',
    productId: 'prod-004',
    productTitle: '全棉时代婴儿连体衣 66码 5件打包',
    productImage: 'https://picsum.photos/id/103/200/200',
    productPrice: 120,
    buyerId: 'user_004',
    buyerName: '小米妈',
    sellerId: 'user_001',
    sellerName: '新手妈妈小李',
    otherUserId: 'user_004',
    otherUserName: '小米妈',
    otherUserAvatar: 'https://picsum.photos/id/338/100/100',
    lastMessage: '衣服已经清洗消毒过了，请放心~',
    lastMessageTime: '2026-06-14T18:45:00.000Z',
    unreadCount: 0,
    qaConfirmed: true,
    priceProposed: true,
    inspectScheduled: false
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    senderId: 'user_002',
    senderName: '买家小王',
    senderAvatar: 'https://picsum.photos/id/64/100/100',
    content: '您好，请问餐椅还在吗？',
    type: 'text',
    timestamp: '2026-06-14T10:00:00.000Z',
    status: 'read'
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    senderId: 'user_001',
    senderName: '新手妈妈小李',
    senderAvatar: '',
    content: '在的呢~餐椅保养得很好，已经完成全面消毒了',
    type: 'text',
    timestamp: '2026-06-14T10:05:00.000Z',
    status: 'read'
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    senderId: 'user_001',
    senderName: '新手妈妈小李',
    senderAvatar: '',
    content: '',
    type: 'qa',
    timestamp: '2026-06-14T10:05:00.000Z',
    status: 'read',
    qaData: {
      question: '餐盘是否可拆卸清洗？',
      answer: '是的，餐盘可单独拆卸，已彻底清洗消毒',
      isHygiene: true
    }
  },
  {
    id: 'msg-004',
    conversationId: 'conv-001',
    senderId: 'user_001',
    senderName: '新手妈妈小李',
    senderAvatar: '',
    content: '',
    type: 'qa',
    timestamp: '2026-06-14T10:05:00.000Z',
    status: 'read',
    qaData: {
      question: '最近一次消毒是什么时候？',
      answer: '2026年6月8日，煮沸消毒',
      isHygiene: true
    }
  },
  {
    id: 'msg-005',
    conversationId: 'conv-001',
    senderId: 'user_002',
    senderName: '买家小王',
    senderAvatar: 'https://picsum.photos/id/64/100/100',
    content: '看起来很干净，放心多了。价格能再优惠一点吗？',
    type: 'text',
    timestamp: '2026-06-14T10:10:00.000Z',
    status: 'read'
  },
  {
    id: 'msg-006',
    conversationId: 'conv-001',
    senderId: 'user_001',
    senderName: '新手妈妈小李',
    senderAvatar: '',
    content: '已经很实惠了呢，配件齐全。如果您自提的话可以250元',
    type: 'text',
    timestamp: '2026-06-14T10:15:00.000Z',
    status: 'read'
  },
  {
    id: 'msg-007',
    conversationId: 'conv-001',
    senderId: 'user_002',
    senderName: '买家小王',
    senderAvatar: 'https://picsum.photos/id/64/100/100',
    content: '好的，那我们约在望京SOHO见面验货吧',
    type: 'text',
    timestamp: '2026-06-15T14:20:00.000Z',
    status: 'read'
  },
  {
    id: 'msg-008',
    conversationId: 'conv-001',
    senderId: 'user_001',
    senderName: '新手妈妈小李',
    senderAvatar: '',
    content: '好的，那我们周末见哦！',
    type: 'text',
    timestamp: '2026-06-15T14:30:00.000Z',
    status: 'sent'
  },
  {
    id: 'msg-011',
    conversationId: 'conv-002',
    senderId: 'user_003',
    senderName: '琪琪妈',
    senderAvatar: 'https://picsum.photos/id/177/100/100',
    content: '请问吸奶器还在吗？',
    type: 'text',
    timestamp: '2026-06-15T10:20:00.000Z',
    status: 'sent'
  },
  {
    id: 'msg-021',
    conversationId: 'conv-003',
    senderId: 'user_004',
    senderName: '小米妈',
    senderAvatar: 'https://picsum.photos/id/338/100/100',
    content: '您好，请问这些衣服都是什么码的？',
    type: 'text',
    timestamp: '2026-06-14T18:30:00.000Z',
    status: 'read'
  },
  {
    id: 'msg-022',
    conversationId: 'conv-003',
    senderId: 'user_001',
    senderName: '新手妈妈小李',
    senderAvatar: '',
    content: '都是66码的，适合3-6个月宝宝穿',
    type: 'text',
    timestamp: '2026-06-14T18:35:00.000Z',
    status: 'read'
  },
  {
    id: 'msg-023',
    conversationId: 'conv-003',
    senderId: 'user_001',
    senderName: '新手妈妈小李',
    senderAvatar: '',
    content: '衣服已经清洗消毒过了，请放心~',
    type: 'text',
    timestamp: '2026-06-14T18:45:00.000Z',
    status: 'read'
  }
];

export const getConversations = (): Conversation[] => {
  return mockConversations;
};

export const getMessagesByConversation = (conversationId: string): Message[] => {
  return mockMessages.filter(m => m.conversationId === conversationId);
};
