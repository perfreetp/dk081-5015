import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Input,
  Textarea,
  Button,
  Picker,
  Slider,
  Image
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { categories, getCategoryById } from '@/data/categories';
import {
  getCleanStepsByCategory,
  disinfectionMethods,
  disinfectionMaterials,
  conditions,
  hygieneQuestions
} from '@/data/cleanSteps';
import { getTodayDate } from '@/utils/date';
import CleanStepCard from '@/components/CleanStepCard';
import { CleanStep, QAItem } from '@/types';

const PublishPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string>('');

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [stepPhotos, setStepPhotos] = useState<Record<string, string[]>>({});

  const [disinfectionDate, setDisinfectionDate] = useState(getTodayDate());
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [operator, setOperator] = useState('妈妈');

  const [title, setTitle] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [useMonths, setUseMonths] = useState(6);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [recallChecked, setRecallChecked] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  const cleanSteps = useMemo<CleanStep[]>(() => {
    return selectedCategory ? getCleanStepsByCategory(selectedCategory) : [];
  }, [selectedCategory]);

  const category = useMemo(() => {
    return selectedCategory ? getCategoryById(selectedCategory) : null;
  }, [selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    const cat = getCategoryById(categoryId);
    if (cat?.isHighRisk) {
      setPendingCategory(categoryId);
      setShowHighRiskModal(true);
    } else {
      setSelectedCategory(categoryId);
    }
    console.log('[PublishPage] Category selected:', categoryId);
  };

  const handleHighRiskConfirm = () => {
    setSelectedCategory(pendingCategory);
    setShowHighRiskModal(false);
    console.log('[PublishPage] High risk category confirmed:', pendingCategory);
  };

  const handleHighRiskCancel = () => {
    setPendingCategory('');
    setShowHighRiskModal(false);
  };

  const handleStepToggle = (stepId: string, completed: boolean) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: completed
    }));
  };

  const handleStepPhotosChange = (stepId: string, photos: string[]) => {
    setStepPhotos(prev => ({
      ...prev,
      [stepId]: photos
    }));
  };

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(m => m !== materialId)
        : [...prev, materialId]
    );
  };

  const handleChoosePhoto = (type: 'before' | 'after') => {
    Taro.chooseImage({
      count: 3 - (type === 'before' ? beforePhotos.length : afterPhotos.length),
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (type === 'before') {
          setBeforePhotos(prev => [...prev, ...res.tempFilePaths]);
        } else {
          setAfterPhotos(prev => [...prev, ...res.tempFilePaths]);
        }
        console.log('[PublishPage] Photo chosen:', type, res.tempFilePaths);
      },
      fail: (err) => {
        console.error('[PublishPage] Photo selection failed:', err);
      }
    });
  };

  const handleRemovePhoto = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      setBeforePhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const requiredSteps = cleanSteps.filter(s => s.required);
    const incompleteRequired = requiredSteps.filter(s => !completedSteps[s.id]);

    if (!selectedCategory) {
      Taro.showToast({ title: '请选择商品品类', icon: 'none' });
      return;
    }
    if (incompleteRequired.length > 0) {
      Taro.showToast({ title: '请完成所有必选清洁步骤', icon: 'none' });
      return;
    }
    if (!selectedMethod) {
      Taro.showToast({ title: '请选择消毒方式', icon: 'none' });
      return;
    }
    if (!selectedCondition) {
      Taro.showToast({ title: '请选择商品成色', icon: 'none' });
      return;
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入商品标题', icon: 'none' });
      return;
    }
    if (!price || Number(price) <= 0) {
      Taro.showToast({ title: '请输入合理的价格', icon: 'none' });
      return;
    }
    if (!recallChecked) {
      Taro.showToast({ title: '请完成召回风险自查', icon: 'none' });
      return;
    }

    const qaList: QAItem[] = hygieneQuestions.map((q, i) => ({
      question: q,
      answer: i === 0 ? (incompleteRequired.length === 0 ? '所有必选步骤已完成' : '部分步骤未完成')
        : i === 1 ? disinfectionDate
        : i === 2 ? (beforePhotos.length > 0 || afterPhotos.length > 0 ? '已上传清洗前后照片' : '暂无照片')
        : i === 3 ? selectedMaterials.map(m => disinfectionMaterials.find(d => d.id === m)?.name).filter(Boolean).join('、')
        : i === 4 ? '无需要更换的配件'
        : '已自查，无召回风险',
      isHygiene: true
    }));

    console.log('[PublishPage] Submit product:', {
      category,
      completedSteps,
      disinfectionDate,
      selectedMethod,
      selectedMaterials,
      title,
      price,
      qaList
    });

    Taro.showLoading({ title: '发布中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/resume/index' });
      }, 2000);
    }, 1500);
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = cleanSteps.length;
  const canSubmit = selectedCategory && completedCount >= cleanSteps.filter(s => s.required).length;

  return (
    <View className={styles.page}>
      <ScrollView
        className={styles.scrollContainer}
        scrollY
        enhanced
        showScrollbar={false}
      >
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📦</Text>
            选择商品品类
          </View>
          <View className={styles.categoryGrid}>
            {categories.map(cat => (
              <View
                key={cat.id}
                className={classnames(
                  styles.categoryItem,
                  selectedCategory === cat.id && styles.categorySelected
                )}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <Text className={styles.categoryIcon}>{cat.icon}</Text>
                <Text className={styles.categoryName}>{cat.name}</Text>
                {cat.isHighRisk && (
                  <Text className={styles.highRiskBadge}>⚠️</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {category?.isHighRisk && (
          <View className={styles.section}>
            <View className={classnames(styles.checkItem, styles.checkItemChecked)}>
              <View className={classnames(styles.checkbox, styles.checkboxChecked)}>⚠️</View>
              <View className={styles.checkText} style={{ color: '#FF7D00' }}>
                {category.highRiskTip}
              </View>
            </View>
          </View>
        )}

        {selectedCategory && (
          <>
            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📷</Text>
                商品照片
              </View>
              <View className={styles.formCard}>
                <View className={styles.formItem}>
                  <View className={styles.formLabel}>
                    清洗前照片
                    <Text className={styles.required}>*</Text>
                  </View>
                  <View className={styles.photoUploadArea}>
                    {beforePhotos.map((photo, i) => (
                      <View key={i} className={styles.photoItem}>
                        <Image
                          className={styles.photoImage}
                          src={photo}
                          mode='aspectFill'
                          onError={(e) => console.error('[PublishPage] Before photo error:', e.detail)}
                        />
                        <View
                          className={styles.photoRemove}
                          onClick={() => handleRemovePhoto('before', i)}
                        >
                          ×
                        </View>
                      </View>
                    ))}
                    {beforePhotos.length < 3 && (
                      <View
                        className={classnames(styles.photoItem, styles.photoAdd)}
                        onClick={() => handleChoosePhoto('before')}
                      >
                        <Text className={styles.photoAddIcon}>+</Text>
                        <Text>添加照片</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className={styles.formItem}>
                  <View className={styles.formLabel}>
                    清洗后照片
                    <Text className={styles.required}>*</Text>
                  </View>
                  <View className={styles.photoUploadArea}>
                    {afterPhotos.map((photo, i) => (
                      <View key={i} className={styles.photoItem}>
                        <Image
                          className={styles.photoImage}
                          src={photo}
                          mode='aspectFill'
                          onError={(e) => console.error('[PublishPage] After photo error:', e.detail)}
                        />
                        <View
                          className={styles.photoRemove}
                          onClick={() => handleRemovePhoto('after', i)}
                        >
                          ×
                        </View>
                      </View>
                    ))}
                    {afterPhotos.length < 3 && (
                      <View
                        className={classnames(styles.photoItem, styles.photoAdd)}
                        onClick={() => handleChoosePhoto('after')}
                      >
                        <Text className={styles.photoAddIcon}>+</Text>
                        <Text>添加照片</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🧼</Text>
                标准清洁步骤
                <Text style={{ fontSize: '24rpx', color: '#86909C', marginLeft: '8rpx', fontWeight: 'normal' }}>
                  ({completedCount}/{totalSteps} 已完成)
                </Text>
              </View>
              {cleanSteps.map(step => (
                <CleanStepCard
                  key={step.id}
                  step={step}
                  completed={completedSteps[step.id] || false}
                  photos={stepPhotos[step.id] || []}
                  editable
                  onToggle={(completed) => handleStepToggle(step.id, completed)}
                  onPhotosChange={(photos) => handleStepPhotosChange(step.id, photos)}
                />
              ))}
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📝</Text>
                消毒记录
              </View>
              <View className={styles.formCard}>
                <View className={styles.formItem}>
                  <View className={styles.formLabel}>
                    消毒日期
                    <Text className={styles.required}>*</Text>
                  </View>
                  <Picker
                    mode='date'
                    value={disinfectionDate}
                    onChange={(e) => setDisinfectionDate(e.detail.value)}
                  >
                    <View className={styles.formInput} style={{ display: 'flex', alignItems: 'center' }}>
                      {disinfectionDate || '请选择日期'}
                    </View>
                  </Picker>
                </View>

                <View className={styles.formItem}>
                  <View className={styles.formLabel}>
                    消毒方式
                    <Text className={styles.required}>*</Text>
                  </View>
                  <View className={styles.methodGrid}>
                    {disinfectionMethods.map(method => (
                      <View
                        key={method.id}
                        className={classnames(
                          styles.methodItem,
                          selectedMethod === method.id && styles.methodSelected
                        )}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <Text className={styles.methodIcon}>{method.icon}</Text>
                        <Text className={styles.methodName}>{method.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.formItem}>
                  <View className={styles.formLabel}>使用耗材（可多选）</View>
                  <View className={styles.materialsGrid}>
                    {disinfectionMaterials.map(mat => (
                      <View
                        key={mat.id}
                        className={classnames(
                          styles.materialItem,
                          selectedMaterials.includes(mat.id) && styles.materialSelected
                        )}
                        onClick={() => handleMaterialToggle(mat.id)}
                      >
                        {mat.name}
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.formItem}>
                  <View className={styles.formLabel}>执行人</View>
                  <View className={styles.optionGrid}>
                    {['妈妈', '爸爸', '其他'].map(name => (
                      <View
                        key={name}
                        className={classnames(
                          styles.optionItem,
                          operator === name && styles.optionSelected
                        )}
                        onClick={() => setOperator(name)}
                      >
                        {name}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>ℹ️</Text>
                商品信息
              </View>
              <View className={styles.formCard}>
                <View className={styles.formItem}>
                  <View className={styles.formLabel}>
                    商品标题
                    <Text className={styles.required}>*</Text>
                  </View>
                  <Input
                    className={styles.formInput}
                    placeholder='请输入商品标题，如：好孩子婴儿推车'
                    value={title}
                    onInput={(e) => setTitle(e.detail.value)}
                    maxlength={50}
                  />
                </View>

                <View className={styles.formItem}>
                  <View className={styles.formLabel}>
                    商品成色
                    <Text className={styles.required}>*</Text>
                  </View>
                  <View className={styles.optionGrid}>
                    {conditions.map(cond => (
                      <View
                        key={cond.id}
                        className={classnames(
                          styles.optionItem,
                          selectedCondition === cond.id && styles.optionSelected
                        )}
                        onClick={() => setSelectedCondition(cond.id)}
                      >
                        {cond.name}
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.formItem}>
                  <View className={styles.formLabel}>
                    使用时长（月）
                    <Text className={styles.required}>*</Text>
                  </View>
                  <View className={styles.sliderContainer}>
                    <View className={styles.sliderValue}>{useMonths} 个月</View>
                    <Slider
                      min={0}
                      max={36}
                      step={1}
                      value={useMonths}
                      onChange={(e) => setUseMonths(e.detail.value)}
                      activeColor='#FF6B9A'
                      backgroundColor='#FFE0E9'
                      blockSize={24}
                      blockColor='#FF6B9A'
                      showValue={false}
                    />
                  </View>
                </View>

                <View className={styles.formRow}>
                  <View className={styles.formCol}>
                    <View className={styles.formLabel}>
                      售价
                      <Text className={styles.required}>*</Text>
                    </View>
                    <View className={styles.priceInput}>
                      <Text className={styles.priceSymbol}>¥</Text>
                      <Input
                        className={styles.priceInputInner}
                        type='digit'
                        placeholder='0.00'
                        value={price}
                        onInput={(e) => setPrice(e.detail.value)}
                      />
                    </View>
                  </View>
                  <View className={styles.formCol}>
                    <View className={styles.formLabel}>原价</View>
                    <View className={styles.priceInput}>
                      <Text className={styles.priceSymbol}>¥</Text>
                      <Input
                        className={styles.priceInputInner}
                        type='digit'
                        placeholder='0.00'
                        value={originalPrice}
                        onInput={(e) => setOriginalPrice(e.detail.value)}
                      />
                    </View>
                  </View>
                </View>

                <View className={styles.formItem} style={{ marginTop: '32rpx' }}>
                  <View className={styles.formLabel}>商品描述</View>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder='请描述商品使用情况、配件完整性、转让原因等...'
                    value={description}
                    onInput={(e) => setDescription(e.detail.value)}
                    maxlength={500}
                  />
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🔍</Text>
                召回风险自查
              </View>
              <View
                className={classnames(
                  styles.checkItem,
                  recallChecked && styles.checkItemChecked
                )}
                onClick={() => setRecallChecked(!recallChecked)}
              >
                <View
                  className={classnames(
                    styles.checkbox,
                    recallChecked && styles.checkboxChecked
                  )}
                >
                  {recallChecked && '✓'}
                </View>
                <View className={styles.checkText}>
                  我已确认该商品{category?.name || ''}无产品质量召回记录，不存在安全隐患
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.progressInfo}>
          <Text className={styles.progressText}>
            已完成 {completedCount + (selectedCategory ? 1 : 0) + (selectedMethod ? 1 : 0) + (selectedCondition ? 1 : 0) + (title ? 1 : 0) + (price ? 1 : 0) + (recallChecked ? 1 : 0)}/
            {cleanSteps.length + 7} 步
          </Text>
          <Text className={styles.progressSub}>完善信息，提高成交率</Text>
        </View>
        <Button
          className={styles.publishBtn}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          立即发布
        </Button>
      </View>

      {showHighRiskModal && (
        <View className={styles.highRiskModal} onClick={handleHighRiskCancel}>
          <View className={styles.highRiskContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.highRiskTitle}>
              <Text className={styles.highRiskIcon}>⚠️</Text>
              高敏物品提醒
            </View>
            <View className={styles.highRiskTip}>
              {getCategoryById(pendingCategory)?.highRiskTip}
            </View>
            <View className={styles.highRiskActions}>
              <Button
                className={classnames(styles.btn, styles.btnCancel)}
                onClick={handleHighRiskCancel}
              >
                我再想想
              </Button>
              <Button
                className={classnames(styles.btn, styles.btnConfirm)}
                onClick={handleHighRiskConfirm}
              >
                我已知晓，继续发布
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PublishPage;
