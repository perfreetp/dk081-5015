import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Product } from '@/types';
import { getDaysAgo } from '@/utils/date';
import { disinfectionMethods, disinfectionMaterials } from '@/data/cleanSteps';

interface ResumeCardProps {
  product: Product;
  onShowQR?: () => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ product, onShowQR }) => {
  const getMethodName = (methodId: string) => {
    const method = disinfectionMethods.find(m => m.id === methodId);
    return method ? `${method.icon} ${method.name}` : methodId;
  };

  const getMaterialName = (materialId: string) => {
    const material = disinfectionMaterials.find(m => m.id === materialId);
    return material ? material.name : materialId;
  };

  const avgDescriptionScore = product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.descriptionScore, 0) / product.reviews.length).toFixed(1)
    : '暂无';

  const avgHygieneScore = product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.hygieneScore, 0) / product.reviews.length).toFixed(1)
    : '暂无';

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.title}>消毒履历卡</Text>
        <View className={styles.healthBadge}>
          ✅ 卫生认证
        </View>
      </View>

      <View className={styles.productInfo}>
        <View className={styles.productImage}>
          <Image
            className={styles.image}
            src={product.coverImage}
            mode='aspectFill'
            onError={(e) => {
              console.error('[ResumeCard] Image load error:', e.detail);
            }}
          />
        </View>
        <View className={styles.productDetail}>
          <Text className={styles.productName}>{product.title}</Text>
          <View className={styles.tags}>
            <View className={classnames(styles.tag, styles.tagCondition)}>
              {product.conditionText}
            </View>
            <View className={classnames(styles.tag, styles.tagMonths)}>
              使用{product.useMonths}个月
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🧼</Text>
          消毒记录
        </View>
        {product.disinfectionRecords.map((record, index) => (
          <View key={record.id} className={styles.recordItem}>
            <View className={styles.recordHeader}>
              <Text className={styles.recordDate}>
                {getDaysAgo(record.date)} · {record.operator}
              </Text>
              <Text className={styles.recordMethod}>
                {getMethodName(record.method)}
              </Text>
            </View>
            <View className={styles.recordMaterials}>
              {record.materials.map((mat, i) => (
                <Text key={i} className={styles.materialTag}>
                  {getMaterialName(mat)}
                </Text>
              ))}
            </View>
            <View className={styles.photoPreview}>
              {record.beforePhotos.slice(0, 2).map((photo, i) => (
                <View key={`before-${i}`} className={styles.photoItem}>
                  <Image
                    className={styles.photo}
                    src={photo}
                    mode='aspectFill'
                    onError={(e) => {
                      console.error('[ResumeCard] Before photo error:', e.detail);
                    }}
                  />
                </View>
              ))}
              {record.afterPhotos.slice(0, 2).map((photo, i) => (
                <View key={`after-${i}`} className={styles.photoItem}>
                  <Image
                    className={styles.photo}
                    src={photo}
                    mode='aspectFill'
                    onError={(e) => {
                      console.error('[ResumeCard] After photo error:', e.detail);
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>👤</Text>
          当前持有人
        </View>
        <View className={styles.holderInfo}>
          <View className={styles.holderAvatar}>
            <Text style={{ fontSize: 32 }}>👶</Text>
          </View>
          <View className={styles.holderDetail}>
            <Text className={styles.holderName}>
              {product.currentHolderName || product.sellerName}
            </Text>
            <Text className={styles.holderLabel}>
              {product.status === 'sold' ? '已购买 · 现任持有者' : '发布者 · 在售中'}
            </Text>
          </View>
          {product.status === 'sold' && (
            <View className={styles.holderBadge}>
              ✓ 已过户
            </View>
          )}
        </View>
      </View>

      {product.transferRecords.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🔄</Text>
            转手记录（第{product.transferRecords.length + 1}手）
          </View>
          <View className={styles.transferHistory}>
            <View className={styles.transferItem}>
              <View className={styles.transferInfo}>
                <Text className={styles.transferUser}>
                  初次发布 → {product.sellerName}
                </Text>
                <Text className={styles.transferDate}>
                  {product.publishDate}
                </Text>
              </View>
              <Text className={styles.transferPrice}>
                ¥{product.originalPrice} · 全新
              </Text>
            </View>
            {product.transferRecords.map((record, index) => (
              <View key={record.id} className={styles.transferItem}>
                <View className={styles.transferInfo}>
                  <Text className={styles.transferUser}>
                    {record.fromUser} → {record.toUser}
                  </Text>
                  <Text className={styles.transferDate}>
                    {record.date}
                    {record.checkInLocation && ` · ${record.checkInLocation}`}
                  </Text>
                </View>
                <Text className={styles.transferPrice}>
                  ¥{record.price}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {product.reviews.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⭐</Text>
            买家评价（{product.reviews.length}条）
          </View>
          <View className={styles.reviewList}>
            {product.reviews.map(review => (
              <View key={review.id} className={styles.reviewItem}>
                <View className={styles.reviewHeader}>
                  <Text className={styles.reviewerName}>{review.userName}</Text>
                  <View className={styles.reviewStars}>
                    <Text className={styles.starText}>描述 {review.descriptionScore}★</Text>
                    <Text className={styles.starText}>卫生 {review.hygieneScore}★</Text>
                  </View>
                </View>
                {review.comment && (
                  <Text className={styles.reviewComment}>{review.comment}</Text>
                )}
                <Text className={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.scores}>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreValue}>{avgDescriptionScore}</Text>
            <Text className={styles.scoreLabel}>描述一致度</Text>
          </View>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreValue}>{avgHygieneScore}</Text>
            <Text className={styles.scoreLabel}>卫生可信度</Text>
          </View>
        </View>
        <Button className={styles.qrBtn} onClick={onShowQR}>
          查看二维码
        </Button>
      </View>
    </View>
  );
};

export default ResumeCard;
