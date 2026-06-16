import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
  Textarea
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import useStore from '@/store';
import { Product, Review, TransferRecord } from '@/types';
import ProductCard from '@/components/ProductCard';
import CheckList from '@/components/CheckList';

type StepType = 'checkin' | 'checklist' | 'transfer' | 'review' | 'done';

const InspectPage: React.FC = () => {
  const {
    currentUser,
    products,
    conversations,
    addTransferRecord,
    addReview,
    updateProduct,
    updateConversation
  } = useStore();

  const [currentStep, setCurrentStep] = useState<StepType>('checkin');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkListAnswers, setCheckListAnswers] = useState<Record<string, boolean>>({});
  const [descriptionScore, setDescriptionScore] = useState(0);
  const [hygieneScore, setHygieneScore] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [location, setLocation] = useState({
    name: '瑞幸咖啡(望京SOHO店)',
    address: '北京市朝阳区望京街10号望京SOHO T1座1层112'
  });

  const pendingConversation = useMemo(() => {
    return conversations.find(c =>
      (c.buyerId === currentUser.id || c.sellerId === currentUser.id) &&
      c.inspectScheduled
    ) || conversations[0];
  }, [conversations, currentUser.id]);

  const product = useMemo<Product | undefined>(() => {
    if (!pendingConversation) return products[0];
    return products.find(p => p.id === pendingConversation.productId) || products[0];
  }, [pendingConversation, products]);

  const isBuyer = useMemo(() => {
    if (!pendingConversation) return true;
    return pendingConversation.buyerId === currentUser.id;
  }, [pendingConversation, currentUser.id]);

  useEffect(() => {
    if (product?.qaList) {
      const initialAnswers: Record<string, boolean> = {};
      product.qaList.forEach((_qa, index) => {
        initialAnswers[`qa_${index}`] = false;
      });
      setCheckListAnswers(initialAnswers);
    }
  }, [product]);

  const transferSteps = [
    { key: 'checkin', label: '当面打卡' },
    { key: 'checklist', label: '验货确认' },
    { key: 'transfer', label: '履历过户' },
    { key: 'review', label: '双方评价' },
    { key: 'done', label: '交易完成' }
  ];

  const currentStepIndex = useMemo(() => {
    return transferSteps.findIndex(s => s.key === currentStep);
  }, [currentStep]);

  const allChecked = useMemo(() => {
    const answers = Object.values(checkListAnswers);
    return answers.length > 0 && answers.every(v => v);
  }, [checkListAnswers]);

  const checkedCount = useMemo(() => {
    return Object.values(checkListAnswers).filter(v => v).length;
  }, [checkListAnswers]);

  const totalCount = useMemo(() => {
    return Object.keys(checkListAnswers).length;
  }, [checkListAnswers]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'checkin':
        return isCheckedIn;
      case 'checklist':
        return allChecked;
      case 'transfer':
        return true;
      case 'review':
        return descriptionScore > 0 && hygieneScore > 0;
      default:
        return true;
    }
  }, [currentStep, isCheckedIn, allChecked, descriptionScore, hygieneScore]);

  const handleCheckIn = () => {
    console.log('[InspectPage] Handle check-in');
    Taro.showLoading({ title: '定位中...', mask: true });

    setTimeout(() => {
      Taro.hideLoading();
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setIsCheckedIn(true);
      setCheckInTime(timeStr);

      if (pendingConversation) {
        updateConversation(pendingConversation.id, {
          inspectTime: now.toISOString(),
          inspectLocation: location.name
        });
      }

      Taro.showToast({
        title: '打卡成功',
        icon: 'success'
      });
    }, 1500);
  };

  const handleAnswerChange = (qaId: string, value: boolean) => {
    console.log('[InspectPage] Answer change:', qaId, value);
    setCheckListAnswers(prev => ({
      ...prev,
      [qaId]: value
    }));
  };

  const handleNextStep = () => {
    console.log('[InspectPage] Next step from:', currentStep);
    const steps: StepType[] = ['checkin', 'checklist', 'transfer', 'review', 'done'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      if (currentStep === 'transfer') {
        handleTransfer();
      } else if (currentStep === 'review') {
        handleSubmitReview();
      } else {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    console.log('[InspectPage] Prev step from:', currentStep);
    const steps: StepType[] = ['checkin', 'checklist', 'transfer', 'review', 'done'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleTransfer = () => {
    console.log('[InspectPage] Transfer product');
    if (!product || !pendingConversation) return;

    Taro.showLoading({ title: '履历过户中...', mask: true });

    const transferRecord: TransferRecord = {
      id: `trans_${Date.now()}`,
      fromUserId: pendingConversation.sellerId,
      fromUser: pendingConversation.sellerName,
      toUserId: pendingConversation.buyerId,
      toUser: pendingConversation.buyerName,
      date: new Date().toISOString().split('T')[0],
      price: product.price,
      location: product.location,
      checkInLocation: location.name
    };

    setTimeout(() => {
      addTransferRecord(product.id, transferRecord);

      updateProduct(product.id, {
        status: 'sold',
        currentHolderId: pendingConversation.buyerId,
        currentHolderName: pendingConversation.buyerName
      });

      updateConversation(pendingConversation.id, {
        lastMessage: '✓ 交易完成，履历已过户',
        lastMessageTime: new Date().toISOString()
      });

      Taro.hideLoading();

      const steps: StepType[] = ['checkin', 'checklist', 'transfer', 'review', 'done'];
      const currentIndex = steps.indexOf(currentStep);
      setCurrentStep(steps[currentIndex + 1]);

      Taro.showToast({
        title: '过户成功',
        icon: 'success'
      });
    }, 2000);
  };

  const handleSubmitReview = () => {
    console.log('[InspectPage] Submit review:', {
      descriptionScore,
      hygieneScore,
      comment: reviewComment
    });

    if (!product) return;

    const review: Review = {
      id: `review_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      descriptionScore,
      hygieneScore,
      comment: reviewComment,
      createdAt: new Date().toISOString()
    };

    Taro.showLoading({ title: '提交评价...', mask: true });

    setTimeout(() => {
      addReview(product.id, review);
      Taro.hideLoading();
      setShowSuccessModal(true);

      const steps: StepType[] = ['checkin', 'checklist', 'transfer', 'review', 'done'];
      const currentIndex = steps.indexOf(currentStep);
      setCurrentStep(steps[currentIndex + 1]);
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    Taro.switchTab({ url: '/pages/resume/index' });
  };

  const handleChangeLocation = () => {
    Taro.showActionSheet({
      itemList: ['瑞幸咖啡(望京SOHO店)', '星巴克(三里屯店)', '麦当劳(朝阳门店)'],
      success: (res) => {
        const locations = [
          { name: '瑞幸咖啡(望京SOHO店)', address: '北京市朝阳区望京街10号望京SOHO T1座1层112' },
          { name: '星巴克(三里屯店)', address: '北京市朝阳区三里屯路19号三里屯太古里南区1层' },
          { name: '麦当劳(朝阳门店)', address: '北京市东城区朝阳门北大街8号富华大厦1层' }
        ];
        setLocation(locations[res.tapIndex]);
        Taro.showToast({
          title: '已更换地点',
          icon: 'success'
        });
      }
    });
  };

  const renderStars = (score: number, onChange: (s: number) => void) => {
    return (
      <View className={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <Text
            key={star}
            className={classnames(
              styles.star,
              star <= score && styles.starActive
            )}
            onClick={() => onChange(star)}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  if (!product) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 80, textAlign: 'center' }}>
          <Text style={{ fontSize: 32, color: '#999' }}>暂无待验货的商品</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>同城当面验货</Text>
        <Text className={styles.headerSubtitle}>确认商品状态，完成履历安全过户</Text>
      </View>

      <View className={styles.productCard}>
        <ProductCard product={product} onClick={() => {}} />
      </View>

      <View className={styles.section}>
        <View className={styles.transferCard}>
          <View className={styles.transferHeader}>
            <Text className={styles.transferIcon}>🔄</Text>
            <Text className={styles.transferTitle}>交易流程</Text>
          </View>
          <View className={styles.transferSteps}>
            {transferSteps.map((step, index) => (
              <View key={step.key} className={styles.transferStep}>
                {index < transferSteps.length - 1 && (
                  <View
                    className={classnames(
                      styles.stepLine,
                      index < currentStepIndex && styles.stepLineActive
                    )}
                  />
                )}
                <View
                  className={classnames(
                    styles.stepCircle,
                    index < currentStepIndex && styles.stepDone,
                    index === currentStepIndex && styles.stepActive
                  )}
                >
                  {index < currentStepIndex ? '✓' : index + 1}
                </View>
                <Text className={styles.stepLabel}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        style={{ height: 'calc(100vh - 620rpx)' }}
      >
        {currentStep === 'checkin' && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📍</Text>
              验货地点
            </Text>
            <View className={styles.locationCard}>
              <View className={styles.locationInfo}>
                <Text className={styles.locationIcon}>🏪</Text>
                <View className={styles.locationDetail}>
                  <Text className={styles.locationName}>{location.name}</Text>
                  <Text className={styles.locationAddress}>{location.address}</Text>
                </View>
              </View>
              <Button className={styles.changeBtn} onClick={handleChangeLocation}>
                更换地点
              </Button>
            </View>

            <View style={{ height: 32 }} />

            <View
              className={classnames(
                styles.checkinCard,
                isCheckedIn && styles.checkedIn
              )}
            >
              <View className={styles.checkinInfo}>
                <Text className={styles.checkinTitle}>
                  {isCheckedIn ? '✓ 已完成当面打卡' : '当面验货打卡'}
                </Text>
                <Text className={styles.checkinDesc}>
                  {isCheckedIn
                    ? `打卡时间：${checkInTime}，请开始验货`
                    : '到达约定地点后，点击打卡确认交易双方在场'}
                </Text>
              </View>
              {!isCheckedIn && (
                <Button className={styles.checkinBtn} onClick={handleCheckIn}>
                  立即打卡
                </Button>
              )}
            </View>

            <View style={{ height: 32 }} />

            <View className={styles.locationCard}>
              <Text style={{ fontSize: 28, fontWeight: 500, color: '#333', marginBottom: 16 }}>
                温馨提示
              </Text>
              <Text style={{ fontSize: 24, color: '#666', lineHeight: 1.8 }}>
                1. 请选择公共场所进行交易，确保人身安全{'\n'}
                2. 仔细核对商品成色、功能是否与描述一致{'\n'}
                3. 确认无误后再进行履历过户操作{'\n'}
                4. 交易完成后，请双方互相评价
              </Text>
            </View>
          </View>
        )}

        {currentStep === 'checklist' && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>✅</Text>
              卫生细节确认
            </Text>

            <View style={{
              background: 'rgba(255, 107, 154, 0.08)',
              padding: '24rpx 32rpx',
              borderRadius: 16,
              marginBottom: 24
            }}>
              <Text style={{ fontSize: 26, color: '#FF6B9A' }}>
                已确认 {checkedCount} / {totalCount} 项
                {allChecked ? ' ✓ 全部确认完成' : ''}
              </Text>
            </View>

            {product?.qaList && product.qaList.length > 0 ? (
              <CheckList
                qaList={product.qaList}
                answers={checkListAnswers}
                onAnswerChange={handleAnswerChange}
                editable={true}
              />
            ) : (
              <View style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 16 }}>
                <Text style={{ fontSize: 28, color: '#999' }}>暂无卫生确认项</Text>
              </View>
            )}

            {!allChecked && (
              <View style={{
                marginTop: 24,
                padding: 24,
                background: '#FFF5F5',
                borderRadius: 16,
                border: '2rpx solid #FFE0E0'
              }}>
                <Text style={{ fontSize: 24, color: '#FF6B6B' }}>
                  ⚠️ 请逐项确认所有卫生细节后，才能进入下一步
                </Text>
              </View>
            )}
          </View>
        )}

        {currentStep === 'transfer' && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📤</Text>
              履历一键过户
            </Text>
            <View className={styles.locationCard}>
              <View className={styles.locationInfo}>
                <Text className={styles.locationIcon}>📋</Text>
                <View className={styles.locationDetail}>
                  <Text className={styles.locationName}>消毒履历将过户给买家</Text>
                  <Text className={styles.locationAddress}>
                    过户后，买家将成为该商品的现任持有者，可查看完整的消毒历史、转手记录，并继续添加新的消毒记录。
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 24, padding: 24, background: '#F5FFFA', borderRadius: 16, border: '2rpx solid #D4F5E8' }}>
                <Text style={{ fontSize: 26, color: '#52C4A5', fontWeight: 500, marginBottom: 12 }}>
                  过户信息确认
                </Text>
                <View style={{ fontSize: 24, color: '#666', lineHeight: 2 }}>
                  <Text>商品名称：{product.title}{'\n'}</Text>
                  <Text>卖家：{pendingConversation?.sellerName || product.sellerName}{'\n'}</Text>
                  <Text>买家：{pendingConversation?.buyerName || '买家'}{'\n'}</Text>
                  <Text>交易价格：¥{product.price}{'\n'}</Text>
                  <Text>验货地点：{location.name}</Text>
                </View>
              </View>

              <View style={{ marginTop: 24, padding: 24, background: 'rgba(255, 107, 154, 0.08)', borderRadius: 16 }}>
                <Text style={{ fontSize: 26, color: '#FF6B9A', fontWeight: 500 }}>
                  ⚠️ 过户确认
                </Text>
                <Text style={{ fontSize: 24, color: '#666', marginTop: 8, lineHeight: 1.6 }}>
                  请确认已完成当面验货，商品状态与描述一致。过户后，该商品的履历所有权将转移给买家，此操作不可撤销。
                </Text>
              </View>
            </View>
          </View>
        )}

        {currentStep === 'review' && (
          <View className={styles.reviewSection}>
            <Text className={styles.reviewTitle}>
              <Text className={styles.sectionIcon}>⭐</Text>
              交易评价
            </Text>
            <View className={styles.reviewCard}>
              <View className={styles.reviewItem}>
                <Text className={styles.reviewLabel}>描述一致度</Text>
                {renderStars(descriptionScore, setDescriptionScore)}
                <Text style={{ fontSize: 24, color: '#999', marginTop: 8 }}>
                  {descriptionScore === 0 ? '请点击星星评分' :
                    descriptionScore <= 2 ? '不太一致' :
                      descriptionScore <= 3 ? '基本一致' :
                        descriptionScore <= 4 ? '比较一致' : '完全一致'}
                </Text>
              </View>
              <View className={styles.reviewItem}>
                <Text className={styles.reviewLabel}>卫生可信度</Text>
                {renderStars(hygieneScore, setHygieneScore)}
                <Text style={{ fontSize: 24, color: '#999', marginTop: 8 }}>
                  {hygieneScore === 0 ? '请点击星星评分' :
                    hygieneScore <= 2 ? '卫生较差' :
                      hygieneScore <= 3 ? '卫生一般' :
                        hygieneScore <= 4 ? '卫生良好' : '非常干净'}
                </Text>
              </View>
              <View className={styles.reviewItem}>
                <Text className={styles.reviewLabel}>评价内容（选填）</Text>
                <Textarea
                  className={styles.reviewInput}
                  placeholder='分享您的交易体验和卫生评价...'
                  value={reviewComment}
                  onInput={(e) => setReviewComment(e.detail.value)}
                  maxlength={200}
                />
              </View>
            </View>
          </View>
        )}

        {currentStep === 'done' && (
          <View style={{ padding: '60rpx 32rpx', textAlign: 'center' }}>
            <Text style={{ fontSize: 120, marginBottom: 32 }}>🎉</Text>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
              交易完成！
            </Text>
            <Text style={{ fontSize: 28, color: '#666', lineHeight: 1.8 }}>
              商品消毒履历已成功过户{'\n'}
              感谢您的信任，让二手母婴交易更安全
            </Text>
            <Button
              style={{
                marginTop: 48,
                width: '80%',
                height: 88,
                background: 'linear-gradient(135deg, #FF6B9A 0%, #FF8FB1 100%)',
                color: '#fff',
                borderRadius: 44,
                fontSize: 30,
                fontWeight: 500
              }}
              onClick={handleCloseSuccess}
            >
              返回履历页
            </Button>
          </View>
        )}
      </ScrollView>

      {currentStep !== 'done' && (
        <View className={styles.bottomBar}>
          {currentStep !== 'checkin' && (
            <Button
              className={classnames(styles.btn, styles.btnSecondary)}
              onClick={handlePrevStep}
            >
              上一步
            </Button>
          )}
          <Button
            className={classnames(styles.btn, styles.btnPrimary)}
            disabled={!canProceed}
            onClick={handleNextStep}
          >
            {currentStep === 'checkin' && '开始验货'}
            {currentStep === 'checklist' && `确认无误 (${checkedCount}/${totalCount})`}
            {currentStep === 'transfer' && '确认过户'}
            {currentStep === 'review' && '提交评价'}
          </Button>
        </View>
      )}

      {showSuccessModal && (
        <View className={styles.successModal} onClick={handleCloseSuccess}>
          <View className={styles.successContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.successIcon}>🎉</Text>
            <Text className={styles.successTitle}>交易完成！</Text>
            <Text className={styles.successDesc}>
              商品消毒履历已成功过户给买家。{'\n'}
              感谢您的信任，让二手母婴交易更安全、更透明。
            </Text>
            <Button className={styles.successBtn} onClick={handleCloseSuccess}>
              返回履历页
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default InspectPage;
