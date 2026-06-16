import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Product } from '@/types';
import { generateQRCodeDataURL, generateQRCodeSVGDataURL } from '@/utils/qrcode';

interface QrCodeModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ visible, product, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const avgDescriptionScore = useMemo(() => {
    if (!product || product.reviews.length === 0) return 5.0;
    return product.reviews.reduce((sum, r) => sum + r.descriptionScore, 0) / product.reviews.length;
  }, [product]);

  const avgHygieneScore = useMemo(() => {
    if (!product || product.reviews.length === 0) return 5.0;
    return product.reviews.reduce((sum, r) => sum + r.hygieneScore, 0) / product.reviews.length;
  }, [product]);

  const qrContent = useMemo(() => {
    if (!product) return '';

    const holderName = product.currentHolderName || product.sellerName;
    const disinfectionCount = product.disinfectionRecords.length;
    const transferCount = product.transferRecords.length;
    const reviewCount = product.reviews.length;
    const hygieneScore = avgHygieneScore.toFixed(1);
    const descriptionScore = avgDescriptionScore.toFixed(1);

    const content = `BR|${product.id}|${product.title.substring(0, 20)}|${product.categoryName}|${holderName}|${disinfectionCount}|${transferCount}|${reviewCount}|${hygieneScore}|${descriptionScore}|${product.price}|${product.status}`;
    
    console.log('[QrCodeModal] QR content:', content, 'length:', content.length);
    return content;
  }, [product, avgHygieneScore, avgDescriptionScore]);

  const qrSummaryText = useMemo(() => {
    if (!product) return '';
    const holderName = product.currentHolderName || product.sellerName;
    return `商品:${product.title.substring(0, 15)} | 消毒:${product.disinfectionRecords.length}次 | 转手:${product.transferRecords.length}次 | 持有人:${holderName}`;
  }, [product]);

  useEffect(() => {
    if (visible && product && qrContent) {
      generateQR();
    } else {
      setQrDataUrl('');
      setQrError(false);
    }
  }, [visible, product, qrContent]);

  const generateQR = async () => {
    if (!qrContent) return;

    setIsGenerating(true);
    setQrError(false);

    try {
      console.log('[QrCodeModal] Generating QR for:', qrContent);
      
      let dataUrl = '';
      
      try {
        dataUrl = generateQRCodeDataURL(qrContent, 300);
      } catch (e1) {
        console.warn('[QrCodeModal] Canvas method failed, trying SVG:', e1);
        try {
          dataUrl = generateQRCodeSVGDataURL(qrContent, 300);
        } catch (e2) {
          console.error('[QrCodeModal] SVG method also failed:', e2);
          throw e2;
        }
      }

      if (dataUrl) {
        setQrDataUrl(dataUrl);
        console.log('[QrCodeModal] QR generated successfully, dataUrl length:', dataUrl.length);
      } else {
        throw new Error('Empty dataUrl');
      }
    } catch (err) {
      console.error('[QrCodeModal] QR generation error:', err);
      setQrError(true);
      Taro.showToast({
        title: '二维码生成中...',
        icon: 'loading',
        duration: 1000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setQrError(false);
    generateQR();
  };

  const handleShare = async () => {
    console.log('[QrCodeModal] Share QR code');

    if (!product) return;

    const shareText = `【消毒履历】${product.title}\n消毒${product.disinfectionRecords.length}次 · 转手${product.transferRecords.length}次\n持有人: ${product.currentHolderName || product.sellerName}\n卫生评分: ${avgHygieneScore.toFixed(1)}★\n${qrContent}`;

    if (process.env.TARO_ENV === 'weapp') {
      try {
        Taro.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        });
        Taro.showToast({
          title: '请点击右上角分享',
          icon: 'none',
          duration: 2000
        });
      } catch (e) {
        console.warn('[QrCodeModal] WeChat share menu failed:', e);
        copyToClipboard(shareText);
      }
    } else if (process.env.TARO_ENV === 'h5') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `${product.title} - 消毒履历`,
            text: shareText,
            url: window.location.href
          });
          return;
        }
      } catch (e) {
        console.warn('[QrCodeModal] Web Share API failed:', e);
      }
      copyToClipboard(shareText);
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showModal({
          title: '已复制履历信息',
          content: '消毒履历摘要已复制到剪贴板，可粘贴分享给好友查看。扫码内容包含：商品名称、消毒次数、转手次数、持有人、评分等关键信息。',
          showCancel: false,
          confirmText: '知道了'
        });
      },
      fail: (err) => {
        console.error('[QrCodeModal] Copy failed:', err);
        Taro.showToast({
          title: '长按二维码可保存分享',
          icon: 'none',
          duration: 2000
        });
      }
    });
  };

  const handleSave = async () => {
    console.log('[QrCodeModal] Save QR code to album');

    if (!qrDataUrl) {
      Taro.showToast({ title: '二维码生成中，请稍候', icon: 'none' });
      return;
    }

    if (process.env.TARO_ENV === 'weapp') {
      try {
        Taro.showLoading({ title: '保存中...', mask: true });
        
        if (qrDataUrl.startsWith('data:image/svg+xml')) {
          Taro.hideLoading();
          Taro.showModal({
            title: '提示',
            content: '小程序端暂不支持直接保存SVG格式二维码，请长按图片手动保存，或使用转发功能分享履历信息',
            showCancel: false
          });
          return;
        }

        const fs = Taro.getFileSystemManager();
        const filePath = `${Taro.env.USER_DATA_PATH}/qr_${Date.now()}.png`;
        
        const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
        
        fs.writeFile({
          filePath,
          data: base64Data,
          encoding: 'base64',
          success: () => {
            Taro.saveImageToPhotosAlbum({
              filePath,
              success: () => {
                Taro.hideLoading();
                Taro.showToast({ title: '保存成功', icon: 'success' });
              },
              fail: (err) => {
                Taro.hideLoading();
                console.error('[QrCodeModal] Save to album failed:', err);
                if (err.errMsg && err.errMsg.includes('auth deny')) {
                  Taro.showModal({
                    title: '需要相册权限',
                    content: '请在设置中开启相册权限后重试',
                    confirmText: '去设置',
                    success: (res) => {
                      if (res.confirm) {
                        Taro.openSetting();
                      }
                    }
                  });
                } else {
                  Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
                }
              }
            });
          },
          fail: (err) => {
            Taro.hideLoading();
            console.error('[QrCodeModal] Write file failed:', err);
            Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
          }
        });
      } catch (e) {
        Taro.hideLoading();
        console.error('[QrCodeModal] Save error:', e);
        Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
      }
    } else if (process.env.TARO_ENV === 'h5') {
      try {
        if (qrDataUrl.startsWith('data:image/svg+xml')) {
          Taro.showModal({
            title: '提示',
            content: 'SVG格式二维码请右键选择"另存为"保存图片，或使用PNG格式二维码',
            showCancel: false
          });
          return;
        }

        const link = document.createElement('a');
        link.download = `${product?.title || '消毒履历二维码'}_${Date.now()}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Taro.showToast({
          title: '二维码已下载',
          icon: 'success'
        });
      } catch (e) {
        console.error('[QrCodeModal] H5 save failed:', e);
        Taro.showToast({
          title: '保存失败，请右键长按保存',
          icon: 'none'
        });
      }
    } else {
      Taro.showToast({
        title: '请长按图片保存',
        icon: 'none'
      });
    }
  };

  if (!visible || !product) return null;

  const displayAvgDescription = avgDescriptionScore.toFixed(1);
  const displayAvgHygiene = avgHygieneScore.toFixed(1);

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
              <Text className={styles.infoValue}>{displayAvgDescription}</Text>
              <Text className={styles.infoLabel}>描述一致度</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{displayAvgHygiene}</Text>
              <Text className={styles.infoLabel}>卫生可信度</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{product.disinfectionRecords.length}</Text>
              <Text className={styles.infoLabel}>消毒次数</Text>
            </View>
          </View>
        </View>

        <View className={styles.qrContainer}>
          {isGenerating && (
            <View className={styles.qrLoading}>
              <Text style={{ fontSize: 48 }}>⏳</Text>
              <Text style={{ fontSize: 24, color: '#999', marginTop: 16 }}>
                二维码生成中...
              </Text>
            </View>
          )}
          
          {!isGenerating && qrDataUrl && !qrError && (
            <Image
              className={styles.qrImage}
              src={qrDataUrl}
              mode='aspectFit'
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error('[QrCodeModal] Image load error:', e.detail);
                setQrError(true);
              }}
            />
          )}

          {!isGenerating && qrError && (
            <View className={styles.qrLoading}>
              <Text style={{ fontSize: 48 }}>🔄</Text>
              <Text style={{ fontSize: 24, color: '#999', marginTop: 16 }}>
                二维码生成失败
              </Text>
              <Button
                className={styles.retryBtn}
                onClick={handleRetry}
              >
                点击重试
              </Button>
            </View>
          )}
        </View>

        <View className={styles.qrSummary}>
          <Text className={styles.qrSummaryText}>
            💡 扫码内容：{qrSummaryText}
          </Text>
        </View>

        <View className={styles.tip}>
          <Text className={styles.tipText}>
            🔒 该二维码包含商品关键信息，交易完成后可一键过户给下一任买家
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
