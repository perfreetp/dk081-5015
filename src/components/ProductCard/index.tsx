import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const hasTransferHistory = product.transferRecords && product.transferRecords.length > 0;
  const hasHygieneRecord = product.disinfectionRecords && product.disinfectionRecords.length > 0;

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={product.coverImage}
          mode='aspectFill'
          lazyLoad
          onError={(e) => {
            console.error('[ProductCard] Image load error:', e.detail);
          }}
        />
        {product.isHighRisk && (
          <View className={styles.highRiskTag}>⚠️ 高敏</View>
        )}
      </View>
      <View className={styles.info}>
        <View>
          <Text className={styles.title}>{product.title}</Text>
          <View className={styles.tags}>
            <View className={classnames(styles.tag, styles.tagCondition)}>
              {product.conditionText}
            </View>
            {hasHygieneRecord && (
              <View className={classnames(styles.tag, styles.tagHygiene)}>
                ✅ 已消毒
              </View>
            )}
            {hasTransferHistory && (
              <View className={classnames(styles.tag, styles.tagTransfer)}>
                第{product.transferRecords.length + 1}手
              </View>
            )}
          </View>
        </View>
        <View className={styles.bottom}>
          <View className={styles.price}>
            <Text className={styles.symbol}>¥</Text>
            {product.price}
            <Text className={styles.originalPrice}>¥{product.originalPrice}</Text>
          </View>
          <View className={styles.location}>📍 {product.location}</View>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
