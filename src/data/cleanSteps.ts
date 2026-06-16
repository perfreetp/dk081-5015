import { CleanStep } from '@/types';

export const cleanStepsMap: Record<string, CleanStep[]> = {
  stroller: [
    {
      id: 'stroller-1',
      categoryId: 'stroller',
      title: '表面灰尘清理',
      description: '使用吸尘器或软毛刷清除车身、车轮、座椅缝隙中的灰尘和碎屑',
      required: true,
      hasPhoto: true
    },
    {
      id: 'stroller-2',
      categoryId: 'stroller',
      title: '可拆卸部件清洗',
      description: '将座椅布套、安全带、遮阳篷等可拆卸部件取下，使用婴儿专用洗衣液浸泡清洗',
      required: true,
      hasPhoto: true
    },
    {
      id: 'stroller-3',
      categoryId: 'stroller',
      title: '车架擦拭消毒',
      description: '使用婴儿安全消毒液擦拭车架、扶手、餐盘等硬质表面，作用10分钟后用清水擦净',
      required: true,
      hasPhoto: true
    },
    {
      id: 'stroller-4',
      categoryId: 'stroller',
      title: '轮子清洁润滑',
      description: '清除轮子上缠绕的头发和杂物，用湿布擦拭干净，轴承处可适当润滑',
      required: false,
      hasPhoto: false
    },
    {
      id: 'stroller-5',
      categoryId: 'stroller',
      title: '阳光晾晒',
      description: '将清洗后的布套和部件在阳光下晾晒至少2小时，自然消毒',
      required: false,
      hasPhoto: true
    }
  ],
  highchair: [
    {
      id: 'highchair-1',
      categoryId: 'highchair',
      title: '食物残渣清除',
      description: '清除餐盘、座椅缝隙中的食物残渣，可用软刷清除顽固污渍',
      required: true,
      hasPhoto: true
    },
    {
      id: 'highchair-2',
      categoryId: 'highchair',
      title: '餐盘深度清洗',
      description: '取下餐盘，用婴儿餐具清洁剂和热水彻底清洗，注意缝隙处',
      required: true,
      hasPhoto: true
    },
    {
      id: 'highchair-3',
      categoryId: 'highchair',
      title: '煮沸/蒸汽消毒',
      description: '将可耐高温的部件放入沸水或蒸汽消毒锅中消毒10-15分钟',
      required: true,
      hasPhoto: true
    },
    {
      id: 'highchair-4',
      categoryId: 'highchair',
      title: '安全带清洗',
      description: '取下安全带，用婴儿洗衣液浸泡手洗，冲洗干净',
      required: true,
      hasPhoto: true
    },
    {
      id: 'highchair-5',
      categoryId: 'highchair',
      title: '晾干组装',
      description: '所有部件晾干后重新组装，检查各部件是否完好',
      required: false,
      hasPhoto: true
    }
  ],
  breastpump: [
    {
      id: 'breastpump-1',
      categoryId: 'breastpump',
      title: '部件拆解',
      description: '将吸奶器完全拆解，分离主机、导管、吸乳护罩、阀门、奶瓶等部件',
      required: true,
      hasPhoto: true
    },
    {
      id: 'breastpump-2',
      categoryId: 'breastpump',
      title: '配件清洗',
      description: '使用专用奶瓶清洁剂清洗所有接触乳汁的配件，注意阀门和缝隙处',
      required: true,
      hasPhoto: true
    },
    {
      id: 'breastpump-3',
      categoryId: 'breastpump',
      title: '蒸汽消毒',
      description: '将清洗后的配件放入蒸汽消毒器或沸水中消毒10分钟',
      required: true,
      hasPhoto: true
    },
    {
      id: 'breastpump-4',
      categoryId: 'breastpump',
      title: '主机表面清洁',
      description: '用干净湿布擦拭主机表面和按键，注意不要让水进入主机内部',
      required: true,
      hasPhoto: true
    },
    {
      id: 'breastpump-5',
      categoryId: 'breastpump',
      title: '干燥收纳',
      description: '消毒后的配件自然风干，建议使用防尘袋密封包装',
      required: false,
      hasPhoto: true
    }
  ],
  bottle: [
    {
      id: 'bottle-1',
      categoryId: 'bottle',
      title: '奶瓶拆解',
      description: '将奶瓶拆解为瓶身、奶嘴、瓶盖、密封圈等部件',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bottle-2',
      categoryId: 'bottle',
      title: '清洁剂清洗',
      description: '使用奶瓶专用清洁剂和专用刷清洗每个部件，特别注意奶嘴和螺纹处',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bottle-3',
      categoryId: 'bottle',
      title: '蒸汽/煮沸消毒',
      description: '将所有部件放入蒸汽消毒器或沸水中消毒5-10分钟',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bottle-4',
      categoryId: 'bottle',
      title: '沥干冷却',
      description: '消毒后用干净镊子取出，放在干净的沥水架上自然晾干',
      required: false,
      hasPhoto: true
    }
  ],
  clothes: [
    {
      id: 'clothes-1',
      categoryId: 'clothes',
      title: '分类清洗',
      description: '按颜色深浅分类，使用婴儿专用洗衣液单独清洗',
      required: true,
      hasPhoto: true
    },
    {
      id: 'clothes-2',
      categoryId: 'clothes',
      title: '重点污渍处理',
      description: '领口、袖口、食物污渍等重点部位预先处理',
      required: true,
      hasPhoto: true
    },
    {
      id: 'clothes-3',
      categoryId: 'clothes',
      title: '充分漂洗',
      description: '多次漂洗确保无洗衣液残留，至少漂洗3次',
      required: true,
      hasPhoto: false
    },
    {
      id: 'clothes-4',
      categoryId: 'clothes',
      title: '阳光暴晒',
      description: '阳光下充分晾晒，最好反面晾晒2小时以上',
      required: true,
      hasPhoto: true
    },
    {
      id: 'clothes-5',
      categoryId: 'clothes',
      title: '熨烫消毒',
      description: '可选择熨烫衣物，高温进一步消毒',
      required: false,
      hasPhoto: true
    }
  ],
  toy: [
    {
      id: 'toy-1',
      categoryId: 'toy',
      title: '表面除尘',
      description: '清除玩具表面的灰尘，可用干布擦拭或吸尘器吸尘',
      required: true,
      hasPhoto: true
    },
    {
      id: 'toy-2',
      categoryId: 'toy',
      title: '材质适配清洗',
      description: '根据玩具材质选择合适的清洗方式：塑料可用清洁剂水洗，布艺可水洗，电子可用湿巾擦拭',
      required: true,
      hasPhoto: true
    },
    {
      id: 'toy-3',
      categoryId: 'toy',
      title: '消毒液擦拭',
      description: '使用婴儿安全消毒液擦拭，作用10分钟',
      required: true,
      hasPhoto: true
    },
    {
      id: 'toy-4',
      categoryId: 'toy',
      title: '清水冲洗',
      description: '用清水冲洗掉消毒剂残留',
      required: true,
      hasPhoto: true
    },
    {
      id: 'toy-5',
      categoryId: 'toy',
      title: '充分晾干',
      description: '阴凉通风处充分晾干',
      required: false,
      hasPhoto: true
    }
  ],
  feeding: [
    {
      id: 'feeding-1',
      categoryId: 'feeding',
      title: '食物残渣清除',
      description: '清除工具表面和缝隙中的食物残渣',
      required: true,
      hasPhoto: true
    },
    {
      id: 'feeding-2',
      categoryId: 'feeding',
      title: '清洁剂刷洗',
      description: '使用婴儿餐具清洁剂和专用刷仔细刷洗',
      required: true,
      hasPhoto: true
    },
    {
      id: 'feeding-3',
      categoryId: 'feeding',
      title: '煮沸/蒸汽消毒',
      description: '耐高温的餐具放入沸水煮10分钟或蒸汽消毒',
      required: true,
      hasPhoto: true
    },
    {
      id: 'feeding-4',
      categoryId: 'feeding',
      title: '沥干存放',
      description: '消毒后沥干，存放在干净的密封容器中',
      required: false,
      hasPhoto: true
    }
  ],
  bath: [
    {
      id: 'bath-1',
      categoryId: 'bath',
      title: '表面清洗',
      description: '使用沐浴产品清洗浴盆、浴架等表面',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bath-2',
      categoryId: 'bath',
      title: '水垢清除',
      description: '清除水垢和污渍，可用柠檬酸浸泡',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bath-3',
      categoryId: 'bath',
      title: '消毒液浸泡',
      description: '使用婴儿安全消毒液浸泡30分钟',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bath-4',
      categoryId: 'bath',
      title: '冲洗晾干',
      description: '充分冲洗后晾干',
      required: false,
      hasPhoto: true
    }
  ],
  bed: [
    {
      id: 'bed-1',
      categoryId: 'bed',
      title: '床品拆除',
      description: '拆除床单、床围、床垫套等可拆洗部件',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bed-2',
      categoryId: 'bed',
      title: '床品清洗',
      description: '使用婴儿洗衣液清洗所有可拆洗床品',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bed-3',
      categoryId: 'bed',
      title: '床架擦拭',
      description: '用湿布擦拭床架、护栏等硬质表面',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bed-4',
      categoryId: 'bed',
      title: '暴晒消毒',
      description: '床品和床垫在阳光下暴晒4小时以上',
      required: true,
      hasPhoto: true
    },
    {
      id: 'bed-5',
      categoryId: 'bed',
      title: '组装检查',
      description: '组装并检查牢固性',
      required: false,
      hasPhoto: true
    }
  ],
  safety: [
    {
      id: 'safety-1',
      categoryId: 'safety',
      title: '表面除尘',
      description: '清除座椅表面、安全带、缝隙中的灰尘和碎屑',
      required: true,
      hasPhoto: true
    },
    {
      id: 'safety-2',
      categoryId: 'safety',
      title: '布套清洗',
      description: '拆下布套，用婴儿洗衣液手洗或轻柔模式机洗',
      required: true,
      hasPhoto: true
    },
    {
      id: 'safety-3',
      categoryId: 'safety',
      title: '塑料部件擦拭',
      description: '用湿布擦拭塑料部件和安全带',
      required: true,
      hasPhoto: true
    },
    {
      id: 'safety-4',
      categoryId: 'safety',
      title: '晾干组装',
      description: '自然晾干后重新组装，检查各部件是否完好牢固',
      required: false,
      hasPhoto: true
    }
  ],
  book: [
    {
      id: 'book-1',
      categoryId: 'book',
      title: '表面除尘',
      description: '用干布擦拭书页和封面',
      required: true,
      hasPhoto: true
    },
    {
      id: 'book-2',
      categoryId: 'book',
      title: '书页消毒',
      description: '使用消毒湿巾擦拭每一页',
      required: true,
      hasPhoto: true
    },
    {
      id: 'book-3',
      categoryId: 'book',
      title: '边角检查',
      description: '检查边角是否有破损，进行修复',
      required: false,
      hasPhoto: true
    }
  ],
  other: [
    {
      id: 'other-1',
      categoryId: 'other',
      title: '表面清洁',
      description: '清除表面灰尘和污渍',
      required: true,
      hasPhoto: true
    },
    {
      id: 'other-2',
      categoryId: 'other',
      title: '消毒处理',
      description: '使用适合的消毒方式进行消毒',
      required: true,
      hasPhoto: true
    },
    {
      id: 'other-3',
      categoryId: 'other',
      title: '清水冲洗',
      description: '冲洗掉消毒剂残留',
      required: true,
      hasPhoto: true
    },
    {
      id: 'other-4',
      categoryId: 'other',
      title: '晾干',
      description: '充分晾干',
      required: false,
      hasPhoto: true
    }
  ]
};

export const getCleanStepsByCategory = (categoryId: string): CleanStep[] => {
  return cleanStepsMap[categoryId] || cleanStepsMap.other;
};

export const disinfectionMethods = [
  { id: 'steam', name: '蒸汽消毒', icon: '♨️' },
  { id: 'boil', name: '煮沸消毒', icon: '🫖' },
  { id: 'uv', name: '紫外线消毒', icon: '☀️' },
  { id: 'wipe', name: '消毒液擦拭', icon: '🧴' },
  { id: 'sun', name: '阳光暴晒', icon: '🌞' },
  { id: 'wash', name: '清洁剂清洗', icon: '🧼' }
];

export const disinfectionMaterials = [
  { id: 'babyDetergent', name: '婴儿专用洗衣液' },
  { id: 'bottleCleaner', name: '奶瓶清洁剂' },
  { id: 'disinfectant', name: '婴儿消毒液' },
  { id: 'wipes', name: '消毒湿巾' },
  { id: 'citricAcid', name: '柠檬酸' },
  { id: 'softener', name: '婴儿柔顺剂' }
];

export const conditions = [
  { id: 'new', name: '全新', description: '未拆封或仅拆封未使用' },
  { id: 'likeNew', name: '几乎全新', description: '使用次数极少，外观无磨损' },
  { id: 'good', name: '成色良好', description: '有轻微使用痕迹，功能完好' },
  { id: 'fair', name: '一般', description: '有明显使用痕迹，功能正常' }
];

export const hygieneQuestions = [
  '是否所有清洁步骤是否都已完成？',
  '最近一次消毒是什么时候？',
  '是否有消毒过程的照片或视频？',
  '使用了哪些消毒耗材？',
  '是否有配件需要更换？',
  '是否进行过召回自查？'
];
