import { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    title: '好孩子婴儿推车C400 轻便折叠高景观',
    categoryId: 'stroller',
    categoryName: '婴儿车',
    description: '宝宝大了用不上了，平时爱惜使用，8成新。已按照标准流程完成全面清洁消毒，可放心使用。赠送原装雨罩和蚊帐。',
    price: 580,
    originalPrice: 1299,
    condition: 'good',
    conditionText: '成色良好',
    useMonths: 12,
    recallRisk: false,
    isHighRisk: false,
    coverImage: 'https://picsum.photos/id/225/600/600',
    images: [
      'https://picsum.photos/id/225/600/600',
      'https://picsum.photos/id/230/600/600',
      'https://picsum.photos/id/250/600/600'
    ],
    disinfectionRecords: [
      {
        id: 'dis-001',
        date: '2026-06-10',
        method: 'steam',
        materials: ['babyDetergent', 'disinfectant'],
        operator: '妈妈',
        beforePhotos: ['https://picsum.photos/id/225/300/300'],
        afterPhotos: ['https://picsum.photos/id/230/300/300'],
        completedSteps: ['stroller-1', 'stroller-2', 'stroller-3', 'stroller-5']
      }
    ],
    transferRecords: [
      {
        id: 'trans-001',
        fromUser: '新手妈妈小李',
        toUser: '宝宝妈妈小王',
        date: '2025-06-15',
        price: 800,
        location: '北京市朝阳区'
      }
    ],
    reviews: [
      {
        id: 'rev-001',
        userId: 'user-002',
        userName: '宝宝妈妈小王',
        descriptionScore: 5,
        hygieneScore: 5,
        comment: '卖家非常用心，清洁消毒做得很彻底，收到的车车很干净，宝宝坐上很放心！',
        date: '2025-07-20'
      }
    ],
    sellerId: 'user-002',
    sellerName: '宝宝妈妈小王',
    sellerAvatar: 'https://picsum.photos/id/64/100/100',
    location: '北京市朝阳区',
    publishDate: '2026-06-12',
    status: 'published',
    qaList: [
      { question: '是否所有清洁步骤都已完成？', answer: '是的，已完成所有必要步骤并拍照记录', isHygiene: true },
      { question: '最近一次消毒是什么时候？', answer: '2026年6月10日，使用蒸汽消毒', isHygiene: true },
      { question: '是否进行过召回自查？', answer: '已自查，该型号无召回记录', isHygiene: true }
    ]
  },
  {
    id: 'prod-002',
    title: 'babycare宝宝餐椅 多功能可折叠',
    categoryId: 'highchair',
    categoryName: '餐椅',
    description: '宝宝现在不坐餐椅了，功能完好，配件齐全。餐盘可拆卸，已完成彻底清洁和消毒。',
    price: 280,
    originalPrice: 599,
    condition: 'likeNew',
    conditionText: '几乎全新',
    useMonths: 8,
    recallRisk: false,
    isHighRisk: false,
    coverImage: 'https://picsum.photos/id/230/600/600',
    images: [
      'https://picsum.photos/id/230/600/600',
      'https://picsum.photos/id/250/600/600'
    ],
    disinfectionRecords: [
      {
        id: 'dis-002',
        date: '2026-06-08',
        method: 'boil',
        materials: ['bottleCleaner', 'disinfectant'],
        operator: '妈妈',
        beforePhotos: ['https://picsum.photos/id/230/300/300'],
        afterPhotos: ['https://picsum.photos/id/250/300/300'],
        completedSteps: ['highchair-1', 'highchair-2', 'highchair-3', 'highchair-4', 'highchair-5']
      }
    ],
    transferRecords: [],
    reviews: [],
    sellerId: 'user-003',
    sellerName: '乐乐妈',
    sellerAvatar: 'https://picsum.photos/id/91/100/100',
    location: '北京市海淀区',
    publishDate: '2026-06-11',
    status: 'published'
  },
  {
    id: 'prod-003',
    title: '美德乐丝韵电动吸奶器 单边',
    categoryId: 'breastpump',
    categoryName: '吸奶器',
    description: '【高敏物品提醒】吸奶器主机转让，建议买家自行购买全新配件。主机功能完好，已完成表面清洁消毒。',
    price: 350,
    originalPrice: 899,
    condition: 'good',
    conditionText: '成色良好',
    useMonths: 6,
    recallRisk: false,
    isHighRisk: true,
    coverImage: 'https://picsum.photos/id/225/600/600',
    images: [
      'https://picsum.photos/id/225/600/600',
      'https://picsum.photos/id/220/600/600'
    ],
    disinfectionRecords: [
      {
        id: 'dis-003',
        date: '2026-06-05',
        method: 'wipe',
        materials: ['disinfectant', 'wipes'],
        operator: '妈妈',
        beforePhotos: ['https://picsum.photos/id/225/300/300'],
        afterPhotos: ['https://picsum.photos/id/220/300/300'],
        completedSteps: ['breastpump-1', 'breastpump-4', 'breastpump-5']
      }
    ],
    transferRecords: [],
    reviews: [],
    sellerId: 'user-004',
    sellerName: '琪琪妈',
    sellerAvatar: 'https://picsum.photos/id/177/100/100',
    location: '北京市西城区',
    publishDate: '2026-06-09',
    status: 'published'
  },
  {
    id: 'prod-004',
    title: '全棉时代婴儿连体衣 66码 5件打包',
    categoryId: 'clothes',
    categoryName: '婴儿服饰',
    description: '宝宝穿不下了，都是全棉时代和英氏的，质量很好。已用婴儿洗衣液清洗，阳光下暴晒消毒。',
    price: 120,
    originalPrice: 400,
    condition: 'good',
    conditionText: '成色良好',
    useMonths: 3,
    recallRisk: false,
    isHighRisk: false,
    coverImage: 'https://picsum.photos/id/103/600/600',
    images: [
      'https://picsum.photos/id/103/600/600',
      'https://picsum.photos/id/119/600/600',
      'https://picsum.photos/id/220/600/600'
    ],
    disinfectionRecords: [
      {
        id: 'dis-004',
        date: '2026-06-12',
        method: 'sun',
        materials: ['babyDetergent', 'softener'],
        operator: '妈妈',
        beforePhotos: ['https://picsum.photos/id/103/300/300'],
        afterPhotos: ['https://picsum.photos/id/119/300/300'],
        completedSteps: ['clothes-1', 'clothes-2', 'clothes-3', 'clothes-4']
      }
    ],
    transferRecords: [],
    reviews: [],
    sellerId: 'user-005',
    sellerName: '小米妈',
    sellerAvatar: 'https://picsum.photos/id/338/100/100',
    location: '北京市丰台区',
    publishDate: '2026-06-13',
    status: 'published'
  },
  {
    id: 'prod-005',
    title: '费雪早教玩具套装 0-1岁',
    categoryId: 'toy',
    categoryName: '玩具',
    description: '费雪大品牌，质量有保障。宝宝大了不玩了，已完成表面清洁和消毒。',
    price: 150,
    originalPrice: 358,
    condition: 'good',
    conditionText: '成色良好',
    useMonths: 10,
    recallRisk: false,
    isHighRisk: false,
    coverImage: 'https://picsum.photos/id/237/600/600',
    images: [
      'https://picsum.photos/id/237/600/600',
      'https://picsum.photos/id/718/600/600'
    ],
    disinfectionRecords: [
      {
        id: 'dis-005',
        date: '2026-06-07',
        method: 'wipe',
        materials: ['disinfectant', 'wipes'],
        operator: '妈妈',
        beforePhotos: ['https://picsum.photos/id/237/300/300'],
        afterPhotos: ['https://picsum.photos/id/718/300/300'],
        completedSteps: ['toy-1', 'toy-2', 'toy-3', 'toy-4']
      }
    ],
    transferRecords: [],
    reviews: [],
    sellerId: 'user-006',
    sellerName: '豆豆妈',
    sellerAvatar: 'https://picsum.photos/id/1027/100/100',
    location: '北京市通州区',
    publishDate: '2026-06-10',
    status: 'published'
  },
  {
    id: 'prod-006',
    title: '贝亲玻璃奶瓶 240ml 3个',
    categoryId: 'bottle',
    categoryName: '奶瓶/奶嘴',
    description: '【高敏物品提醒】仅转让瓶身，奶嘴建议自行购买全新。瓶身已完成煮沸消毒，很干净。',
    price: 60,
    originalPrice: 204,
    condition: 'likeNew',
    conditionText: '几乎全新',
    useMonths: 4,
    recallRisk: false,
    isHighRisk: true,
    coverImage: 'https://picsum.photos/id/225/600/600',
    images: [
      'https://picsum.photos/id/225/600/600'
    ],
    disinfectionRecords: [
      {
        id: 'dis-006',
        date: '2026-06-11',
        method: 'boil',
        materials: ['bottleCleaner'],
        operator: '妈妈',
        beforePhotos: ['https://picsum.photos/id/225/300/300'],
        afterPhotos: ['https://picsum.photos/id/230/300/300'],
        completedSteps: ['bottle-1', 'bottle-2', 'bottle-3', 'bottle-4']
      }
    ],
    transferRecords: [],
    reviews: [],
    sellerId: 'user-007',
    sellerName: '果果妈',
    sellerAvatar: 'https://picsum.photos/id/64/100/100',
    location: '北京市朝阳区',
    publishDate: '2026-06-14',
    status: 'published'
  }
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getUserProducts = (userId: string): Product[] => {
  return mockProducts.filter(p => p.sellerId === userId);
};
