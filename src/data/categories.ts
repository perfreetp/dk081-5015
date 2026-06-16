import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'stroller',
    name: '婴儿车',
    icon: '👶',
    isHighRisk: false
  },
  {
    id: 'highchair',
    name: '餐椅',
    icon: '🍼',
    isHighRisk: false
  },
  {
    id: 'breastpump',
    name: '吸奶器',
    icon: '🤱',
    isHighRisk: true,
    highRiskTip: '吸奶器属于直接接触人体的高敏物品，建议仅转让主机部分，配件建议全新购买'
  },
  {
    id: 'bottle',
    name: '奶瓶/奶嘴',
    icon: '🍼',
    isHighRisk: true,
    highRiskTip: '奶嘴为直接入口的消耗品，不建议二手转让；奶瓶瓶身可消毒后转让'
  },
  {
    id: 'clothes',
    name: '婴儿服饰',
    icon: '👕',
    isHighRisk: false
  },
  {
    id: 'toy',
    name: '玩具',
    icon: '🧸',
    isHighRisk: false
  },
  {
    id: 'feeding',
    name: '辅食工具',
    icon: '🥣',
    isHighRisk: true,
    highRiskTip: '辅食工具为直接入口物品，建议仅转让未使用或可彻底消毒的品类'
  },
  {
    id: 'bath',
    name: '洗浴用品',
    icon: '🛁',
    isHighRisk: false
  },
  {
    id: 'bed',
    name: '婴儿床/寝具',
    icon: '🛏️',
    isHighRisk: false
  },
  {
    id: 'safety',
    name: '安全座椅',
    icon: '🚗',
    isHighRisk: false
  },
  {
    id: 'book',
    name: '绘本/教育',
    icon: '📚',
    isHighRisk: false
  },
  {
    id: 'other',
    name: '其他',
    icon: '📦',
    isHighRisk: false
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(c => c.id === id);
};
