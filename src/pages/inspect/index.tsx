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
import { mockProducts } from '@/data/mockProducts';
import { mockConversations } from '@/data/mockMessages';
import { Product, Review } from '@/types';
import ProductCard from '@/components/ProductCard';
import CheckList from '@/components/CheckList';

type StepType = 'checkin' | 'checklist' | 'transfer' | 'review' | 'done';

const InspectPage: React.FC = () => {
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

  const pendingConversation = mockConversations.find(c => c.productId === 'prod_002');
  const product = mockProducts.find(p => p.id === pendingConversation?.productId) || mockProducts[1];

  useEffect(() => {
    if (product?.qaList) {
      const initialAnswers: Record<string, boolean> = {};
      product.qaList.forEach((qa, index) => {
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
    Taro.showLoading({ title: '定位中...' });
    setTimeout(() => {
      Taro.hideLoading();
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setIsCheckedIn(true);
      setCheckInTime(timeStr);
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
        Taro.showLoading({ title: '履历过户中...' });
        setTimeout(() => {
          Taro.hideLoading();
          setCurrentStep(steps[currentIndex + 1]);
        }, 2000);
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

  const handleSubmitReview = () => {
    console.log('[InspectPage] Submit review:', {
      descriptionScore,
      hygieneScore,
      comment: reviewComment
    });
    
    const review: Review = {
      id: `review_${Date.now()}`,
      userId: 'user_001',
      userName: '买家小王',
      descriptionScore,
      hygieneScore,
      comment: reviewComment,
      createdAt: new Date().toISOString()
    };

    console.log('[InspectPage] Review data:', review);

    Taro.showLoading({ title: '提交评价...' });
    setTimeout(() => {
      Taro.hideLoading();
      setShowSuccessModal(true);
      setCurrentStep('done');
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    Taro.switchTab({ url: '/pages/resume/index' });
  };

  const handleChangeLocation = () => {
    Taro.showToast({
      title: '选择验货地点',
      icon: 'none'
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

            <View style={{ height: '32rpx' }} />

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
          </View>
        )}

        {currentStep === 'checklist' && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>✅</Text>
              卫生细节确认
            </Text>
            <CheckList
              qaList={product.qaList || []}
              answers={checkListAnswers}
              onAnswerChange={handleAnswerChange}
              editable={true}
            />
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
              <View style={{ marginTop: '24rpx', padding: '24rpx', background: 'rgba(255, 107, 154, 0.08)', borderRadius: '16rpx' }}>
                <Text style={{ fontSize: '26rpx', color: '#FF6B9A', fontWeight: 500 }}>
                  ⚠️ 过户确认
                </Text>
                <Text style={{ fontSize: '24rpx', color: '#666', marginTop: '8rpx', lineHeight: 1.6 }}>
                  请确认已完成当面验货，商品状态与描述一致。过户后，该商品的履历所有权将转移给买家。
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
              </View>
              <View className={styles.reviewItem}>
                <Text className={styles.reviewLabel}>卫生可信度</Text>
                {renderStars(hygieneScore, setHygieneScore)}
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
            {currentStep === 'checklist' && '确认无误'}
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
              完成
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default InspectPage;
