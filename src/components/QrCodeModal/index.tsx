import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Product } from '@/types';
import { generateQRCode, generateQRCodeDataURL } from '@/utils/qrcode';

interface QrCodeModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ visible, product, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrText, setQrText] = useState('');

  useEffect(() => {
    if (visible && product) {
      generateQR();
    } else {
      setQrDataUrl('');
      setQrText('');
    }
  }, [visible, product]);

  const generateQR = () => {
    if (!product) return;

    const resumeData = {
      type: 'baby_resume',
      version: '1.0',
      productId: product.id,
      title: product.title,
      category: product.categoryName,
      price: product.price,
      condition: product.conditionText,
      useMonths: product.useMonths,
      disinfectionCount: product.disinfectionRecords.length,
      transferCount: product.transferRecords.length,
      reviewCount: product.reviews.length,
      avgHygieneScore: product.reviews.length > 0
        ? (product.reviews.reduce((s, r) => s + r.hygieneScore, 0) / product.reviews.length
        : 5,
      avgDescriptionScore: product.reviews.length > 0
        ? (product.reviews.reduce((s, r) => s + r.descriptionScore, 0) / product.reviews.length)
        : 5,
      isHighRisk: product.isHighRisk,
      seller: product.sellerName,
      publishDate: product.publishDate,
      timestamp: Date.now()
    };

    const qrData = JSON.stringify(resumeData);
    setQrText(qrData);

    console.log('[QrCodeModal] Generating QR data length:', qrData.length);

    try {
      const dataUrl = generateQRCodeDataURL(qrData, 300);
      setQrDataUrl(dataUrl);
      console.log('[QrCodeModal] QR generated successfully, size:', dataUrl.length);
    } catch (err) {
      console.error('[QrCodeModal] QR generation error:', err);
      Taro.showToast({
        title: '二维码生成失败',
        icon: 'none'
      });
    }
  };

  const handleShare = async () => {
    console.log('[QrCodeModal] Share QR code');

    if (process.env.TARO_ENV === 'h5') {
      try {
        if (navigator.clipboard && qrText) {
          await navigator.clipboard.writeText(qrText);
          Taro.showModal({
            title: '已复制履历信息',
            content: '履历数据已复制到剪贴板，可粘贴分享给好友查看消毒履历',
            showCancel: false
          });
          return;
        }
      } catch (e) {
        console.warn('[QrCodeModal] Clipboard copy failed:', e);
      }
      Taro.showToast({
        title: '长按二维码可保存图片分享',
        icon: 'none',
        duration: 2000
      });
    } else {
      Taro.showToast({
        title: '分享功能开发中',
        icon: 'none'
      });
    }
  };

  const handleSave = () => {
    console.log('[QrCodeModal] Save QR code to album');

    if (process.env.TARO_ENV === 'h5' && qrDataUrl) {
      try {
        const link = document.createElement('a');
        link.download = `${product?.title || '消毒履历二维码'}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Taro.showToast({
          title: '二维码已下载',
          icon: 'success'
        });
      } catch (e) {
        console.error('[QrCodeModal] Save failed:', e);
        Taro.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    } else {
      Taro.showToast({
        title: '长按图片保存',
        icon: 'none'
      });
    }
  };

  if (!visible || !product) return null;

  const avgDescriptionScore = product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.descriptionScore, 0) / product.reviews.length).toFixed(1)
    : '5.0';

  const avgHygieneScore = product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.hygieneScore, 0) / product.reviews.length).toFixed(1)
    : '5.0';

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <View className={styles.closeBtn} onClick={onClose}>×</View>

        <View className={styles.header}>
          <Text className={styles.title}>消毒履历二维码</Text>
          <Text className={styles.subtitle}>扫码查看完整消毒记录</Text>
        </View>

        <View className={styles.productInfo}>
          <Text className={styles.productName}>{product.title}</Text>
          <View className={styles.hygieneInfo}>
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{avgDescriptionScore}</Text>
              <Text className={styles.infoLabel}>描述一致度</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{avgHygieneScore}</Text>
              <Text className={styles.infoLabel}>卫生可信度</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{product.disinfectionRecords.length}</Text>
              <Text className={styles.infoLabel}>消毒次数</Text>
            </View>
          </View>
        </View>

        <View className={styles.qrContainer}>
          {qrDataUrl ? (
            <Image
              className={styles.qrImage}
              src={qrDataUrl}
              mode='aspectFit'
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <View className={styles.qrLoading}>
              <Text style={{ fontSize: 48 }}>⏳</Text>
              <Text style={{ fontSize: 24, color: '#999', marginTop: 16 }}>
                二维码生成中...
              </Text>
            </View>
          )}
        </View>

        <View className={styles.tip}>
          <Text className={styles.tipText}>
          💡 该二维码包含商品完整的消毒履历，交易完成后可一键过户给下一任买家
          </Text>
        </View>

        <View className={styles.actions}>
          <Button
            className={classnames(styles.btn, styles.btnSecondary)}
            onClick={handleSave}
          >
            保存图片
          </Button>
          <Button
            className={classnames(styles.btn, styles.btnPrimary)}
            onClick={handleShare}
          >
            转发给好友
          </Button>
        </View>
      </View>
    </View>
  );
};

export default QrCodeModal;
