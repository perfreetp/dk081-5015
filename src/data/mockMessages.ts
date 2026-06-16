import { Conversation, Message } from '@/types';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    productId: 'prod-001',
    productTitle: '好孩子婴儿推车C400 轻便折叠高景观',
    productImage: 'https://picsum.photos/id/225/200/200',
    otherUserId: 'user-002',
    otherUserName: '宝宝妈妈小王',
    otherUserAvatar: 'https://picsum.photos/id/64/100/100',
    lastMessage: '好的，那我们周末见哦！',
    lastTime: '2026-06-15 14:30',
    unreadCount: 2,
    hygieneCheckDone: true
  },
  {
    id: 'conv-002',
    productId: 'prod-002',
    productTitle: 'babycare宝宝餐椅 多功能可折叠',
    productImage: 'https://picsum.photos/id/230/200/200',
    otherUserId: 'user-003',
    otherUserName: '乐乐妈',
    otherUserAvatar: 'https://picsum.photos/id/91/100/100',
    lastMessage: '请问餐椅还在吗？',
    lastTime: '2026-06-15 10:20',
    unreadCount: 1,
    hygieneCheckDone: false
  },
  {
    id: 'conv-003',
    productId: 'prod-004',
    productTitle: '全棉时代婴儿连体衣 66码 5件打包',
    productImage: 'https://picsum.photos/id/103/200/200',
    otherUserId: 'user-005',
    otherUserName: '小米妈',
    otherUserAvatar: 'https://picsum.photos/id/338/100/100',
    lastMessage: '衣服已经清洗消毒过了，请放心~',
    lastTime: '2026-06-14 18:45',
    unreadCount: 0,
    hygieneCheckDone: true
  }
];

export const mockMessages: Record<string, Message[]> = {
  'conv-001': [
    {
      id: 'msg-001',
      conversationId: 'conv-001',
      senderId: 'user-current',
      senderName: '我',
      senderAvatar: 'https://picsum.photos/id/1027/100/100',
      content: '您好，请问婴儿车还在吗？',
      type: 'text',
      timestamp: '2026-06-14 10:00'
    },
    {
      id: 'msg-002',
      conversationId: 'conv-001',
      senderId: 'user-002',
      senderName: '宝宝妈妈小王',
      senderAvatar: 'https://picsum.photos/id/64/100/100',
      content: '在的呢~车子保养得很好，已经完成全面消毒了',
      type: 'text',
      timestamp: '2026-06-14 10:05'
    },
    {
      id: 'msg-003',
      conversationId: 'conv-001',
      senderId: 'user-002',
      senderName: '宝宝妈妈小王',
      senderAvatar: 'https://picsum.photos/id/64/100/100',
      content: '',
      type: 'qa',
      timestamp: '2026-06-14 10:05',
      qaData: {
        question: '是否所有清洁步骤都已完成？',
        answer: '是的，已完成所有必要步骤并拍照记录',
        isHygiene: true
      }
    },
    {
      id: 'msg-004',
      conversationId: 'conv-001',
      senderId: 'user-002',
      senderName: '宝宝妈妈小王',
      senderAvatar: 'https://picsum.photos/id/64/100/100',
      content: '',
      type: 'qa',
      timestamp: '2026-06-14 10:05',
      qaData: {
        question: '最近一次消毒是什么时候？',
        answer: '2026年6月10日，使用蒸汽消毒',
        isHygiene: true
      }
    },
    {
      id: 'msg-005',
      conversationId: 'conv-001',
      senderId: 'user-current',
      senderName: '我',
      senderAvatar: 'https://picsum.photos/id/1027/100/100',
      content: '看起来很干净，放心多了。价格能再优惠一点吗？',
      type: 'text',
      timestamp: '2026-06-14 10:10'
    },
    {
      id: 'msg-006',
      conversationId: 'conv-001',
      senderId: 'user-002',
      senderName: '宝宝妈妈小王',
      senderAvatar: 'https://picsum.photos/id/64/100/100',
      content: '已经很实惠了呢，我还送雨罩和蚊帐。如果您自提的话可以550元',
      type: 'text',
      timestamp: '2026-06-14 10:15'
    },
    {
      id: 'msg-007',
      conversationId: 'conv-001',
      senderId: 'user-current',
      senderName: '我',
      senderAvatar: 'https://picsum.photos/id/1027/100/100',
      content: '好的，那我们约在朝阳区的地铁站见面验货吧',
      type: 'text',
      timestamp: '2026-06-15 14:20'
    },
    {
      id: 'msg-008',
      conversationId: 'conv-001',
      senderId: 'user-002',
      senderName: '宝宝妈妈小王',
      senderAvatar: 'https://picsum.photos/id/64/100/100',
      content: '好的，那我们周末见哦！',
      type: 'text',
      timestamp: '2026-06-15 14:30'
    }
  ],
  'conv-002': [
    {
      id: 'msg-011',
      conversationId: 'conv-002',
      senderId: 'user-current',
      senderName: '我',
      senderAvatar: 'https://picsum.photos/id/1027/100/100',
      content: '您好，请问餐椅还在吗？',
      type: 'text',
      timestamp: '2026-06-15 10:20'
    }
  ],
  'conv-003': [
    {
      id: 'msg-021',
      conversationId: 'conv-003',
      senderId: 'user-current',
      senderName: '我',
      senderAvatar: 'https://picsum.photos/id/1027/100/100',
      content: '您好，请问这些衣服都是什么码的？',
      type: 'text',
      timestamp: '2026-06-14 18:30'
    },
    {
      id: 'msg-022',
      conversationId: 'conv-003',
      senderId: 'user-005',
      senderName: '小米妈',
      senderAvatar: 'https://picsum.photos/id/338/100/100',
      content: '都是66码的，适合3-6个月宝宝穿',
      type: 'text',
      timestamp: '2026-06-14 18:35'
    },
    {
      id: 'msg-023',
      conversationId: 'conv-003',
      senderId: 'user-005',
      senderName: '小米妈',
      senderAvatar: 'https://picsum.photos/id/338/100/100',
      content: '衣服已经清洗消毒过了，请放心~',
      type: 'text',
      timestamp: '2026-06-14 18:45'
    }
  ]
};

export const getConversations = (): Conversation[] => {
  return mockConversations;
};

export const getMessagesByConversation = (conversationId: string): Message[] => {
  return mockMessages[conversationId] || [];
};
