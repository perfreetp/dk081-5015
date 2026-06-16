import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { CleanStep } from '@/types';

interface CleanStepCardProps {
  step: CleanStep;
  completed?: boolean;
  photos?: string[];
  editable?: boolean;
  onToggle?: (completed: boolean) => void;
  onPhotosChange?: (photos: string[]) => void;
}

const CleanStepCard: React.FC<CleanStepCardProps> = ({
  step,
  completed = false,
  photos = [],
  editable = true,
  onToggle,
  onPhotosChange
}) => {
  const [expanded, setExpanded] = useState(completed);

  const handleToggle = () => {
    if (!editable) return;
    const newCompleted = !completed;
    onToggle?.(newCompleted);
    if (newCompleted && step.hasPhoto) {
      setExpanded(true);
    }
  };

  const handleAddPhoto = () => {
    if (!editable) return;
    Taro.chooseImage({
      count: 3 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = [...photos, ...res.tempFilePaths];
        onPhotosChange?.(newPhotos);
        console.log('[CleanStepCard] Photo added:', res.tempFilePaths);
      },
      fail: (err) => {
        console.error('[CleanStepCard] Photo selection failed:', err);
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    if (!editable) return;
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange?.(newPhotos);
  };

  return (
    <View
      className={classnames(styles.card, completed && styles.completed)}
      onClick={() => step.hasPhoto && setExpanded(!expanded)}
    >
      <View className={styles.header}>
        <View
          className={classnames(styles.checkbox, completed && styles.checked)}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {completed && '✓'}
        </View>
        <View className={styles.content}>
          <View className={styles.title}>
            {step.title}
            {step.required && (
              <Text className={styles.requiredBadge}>必选</Text>
            )}
          </View>
          <Text className={styles.description}>{step.description}</Text>
        </View>
      </View>

      {step.hasPhoto && expanded && (
        <View className={styles.photoSection}>
          <Text className={styles.photoLabel}>
            {editable ? '上传照片（清洗前后对比）' : '照片记录'}
          </Text>
          <View className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image
                  className={styles.photo}
                  src={photo}
                  mode='aspectFill'
                  onError={(e) => {
                    console.error('[CleanStepCard] Image load error:', e.detail);
                  }}
                />
                {editable && (
                  <View
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                  >
                    ×
                  </View>
                )}
              </View>
            ))}
            {editable && photos.length < 3 && (
              <View
                className={classnames(styles.photoItem, styles.addPhoto)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddPhoto();
                }}
              >
                <Text className={styles.addIcon}>+</Text>
                <Text>添加照片</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default CleanStepCard;
