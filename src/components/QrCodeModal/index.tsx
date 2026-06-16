import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  const [errorMsg, setErrorMsg] = useState('');
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

    const holderName = (product.currentHolderName || product.sellerName || '').substring(0, 16);
    const title = (product.title || '').substring(0, 20);
    const category = (product.categoryName || '').substring(0, 10);
    const disinfectionCount = product.disinfectionRecords.length;
    const transferCount = product.transferRecords.length;
    const reviewCount = product.reviews.length;
    const hygieneScore = avgHygieneScore.toFixed(1);
    const descriptionScore = avgDescriptionScore.toFixed(1);
    const price = product.price || 0;
    const status = product.status || 'published';
    const productId = (product.id || '').substring(0, 16);

    const content = `BR|1.0|${productId}|${title}|${category}|${holderName}|${disinfectionCount}|${transferCount}|${reviewCount}|${hygieneScore}|${descriptionScore}|${price}|${status}`;

    console.log('[QrCodeModal] QR content (length=' + content.length + '):', content);
    return content;
  }, [product, avgHygieneScore, avgDescriptionScore]);

  const decodedSummary = useMemo(() => {
    if (!product) return '';
    const holderName = product.currentHolderName || product.sellerName || '';
    return `商品:${product.title.substring(0, 12)} | 持有人:${holderName.substring(0, 8)} | 消毒${product.disinfectionRecords.length}次 | 转手${product.transferRecords.length}次 | 评分${avgHygieneScore.toFixed(1)}★`;
  }, [product, avgHygieneScore]);

  const shareText = useMemo(() => {
    if (!product) return '';
    const holderName = product.currentHolderName || product.sellerName || '';
    return `【消毒履历】${product.title}\n品类: ${product.categoryName}\n当前持有人: ${holderName}\n消毒记录: ${product.disinfectionRecords.length}次\n转手次数: ${product.transferRecords.length}次\n卫生评分: ${avgHygieneScore.toFixed(1)}★\n描述一致: ${avgDescriptionScore.toFixed(1)}★\n价格: ¥${product.price}\n---\n扫码内容:\n${qrContent}`;
  }, [product, avgHygieneScore, avgDescriptionScore, qrContent]);

  const generateQR = useCallback(async () => {
    if (!qrContent) return;

    setIsGenerating(true);
    setQrError(false);
    setErrorMsg('');

    try {
      console.log('[QrCodeModal] Start generating QR, content length:', qrContent.length);

      let dataUrl = '';
      let method = '';

      try {
        method = 'SVG';
        console.log('[QrCodeModal] Trying SVG method first...');
        dataUrl = generateQRCodeSVGDataURL(qrContent, 300);
        console.log('[QrCodeModal] SVG method success, dataUrl length:', dataUrl.length);
      } catch (e1) {
        console.warn('[QrCodeModal] SVG method failed, trying Canvas:', e1);
        try {
          method = 'Canvas';
          dataUrl = generateQRCodeDataURL(qrContent, 300);
          console.log('[QrCodeModal] Canvas method success, dataUrl length:', dataUrl.length);
        } catch (e2) {
          console.error('[QrCodeModal] Canvas method also failed:', e2);
          throw new Error('二维码生成失败：SVG和Canvas方法都不可用');
        }
      }

      if (!dataUrl || dataUrl.length < 100) {
        throw new Error('生成的数据为空或格式不正确');
      }

      setQrDataUrl(dataUrl);
      console.log(`[QrCodeModal] QR generated via ${method}, ready to display`);

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err: any) {
      console.error('[QrCodeModal] QR generation error:', err);
      setQrError(true);
      setErrorMsg(err.message || '未知错误');
    } finally {
      setIsGenerating(false);
    }
  }, [qrContent]);

  useEffect(() => {
    if (visible && product && qrContent) {
      setQrDataUrl('');
      const timer = setTimeout(() => {
        generateQR();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQrDataUrl('');
      setQrError(false);
      setErrorMsg('');
    }
  }, [visible, product, qrContent, generateQR]);

  const handleRetry = () => {
    setQrError(false);
    setErrorMsg('');
    generateQR();
  };

  const handleCopySummary = () => {
    Taro.setClipboardData({
      data: shareText,
      success: () => {
        Taro.showModal({
          title: '已复制履历摘要',
          content: '消毒履历摘要已复制到剪贴板，包含商品名称、持有人、消毒次数、转手次数、评分等关键信息，可粘贴发送给好友。',
          showCancel: false,
          confirmText: '好的'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '复制失败，请重试',
          icon: 'none'
        });
      }
    });
  };

  const handleShare = async () => {
    console.log('[QrCodeModal] Share QR code');

    if (!product) return;

    if (process.env.TARO_ENV === 'weapp') {
      try {
        Taro.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline'] as any[]
        });
        Taro.showModal({
          title: '分享给好友',
          content: '请点击右上角「...」按钮，选择「发送给朋友」或「分享到朋友圈」，即可将商品消毒履历分享给好友。也可复制履历摘要直接发送。',
          showCancel: true,
          confirmText: '复制摘要',
          cancelText: '知道了',
          success: (res) => {
            if (res.confirm) {
              handleCopySummary();
            }
          }
        });
      } catch (e) {
        console.warn('[QrCodeModal] WeChat share menu failed:', e);
        handleCopySummary();
      }
    } else if (process.env.TARO_ENV === 'h5') {
      try {
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
          await (navigator as any).share({
            title: `${product.title} - 消毒履历`,
            text: shareText,
            url: typeof window !== 'undefined' ? window.location.href : ''
          });
          return;
        }
      } catch (e) {
        console.warn('[QrCodeModal] Web Share API failed:', e);
      }
      handleCopySummary();
    } else {
      handleCopySummary();
    }
  };

  const handleSave = async () => {
    console.log('[QrCodeModal] Save QR code to album');

    if (!qrDataUrl) {
      Taro.showActionSheet({
        itemList: ['重新生成二维码', '复制履历摘要'],
        success: (res) => {
          if (res.tapIndex === 0) {
            handleRetry();
          } else if (res.tapIndex === 1) {
            handleCopySummary();
          }
        }
      });
      return;
    }

    if (process.env.TARO_ENV === 'weapp') {
      try {
        Taro.showLoading({ title: '保存中...', mask: true });

        if (qrDataUrl.startsWith('data:image/svg+xml')) {
          Taro.hideLoading();
          Taro.showModal({
            title: '提示',
            content: '小程序端当前使用SVG格式二维码。请长按二维码图片手动保存，或点击「复制履历摘要」直接分享关键信息。',
            showCancel: true,
            confirmText: '复制摘要',
            cancelText: '知道了',
            success: (res) => {
              if (res.confirm) {
                handleCopySummary();
              }
            }
          });
          return;
        }

        const fs = Taro.getFileSystemManager();
        const filePath = `${Taro.env.USER_DATA_PATH}/qr_resume_${Date.now()}.png`;
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
                Taro.showToast({ title: '已保存到相册', icon: 'success' });
              },
              fail: (err: any) => {
                Taro.hideLoading();
                console.error('[QrCodeModal] Save to album failed:', err);
                if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize'))) {
                  Taro.showModal({
                    title: '需要相册权限',
                    content: '保存图片到相册需要开启相册权限。可以去设置中开启，或复制履历摘要直接分享。',
                    showCancel: true,
                    confirmText: '去设置',
                    cancelText: '复制摘要',
                    success: (res) => {
                      if (res.confirm) {
                        Taro.openSetting();
                      } else {
                        handleCopySummary();
                      }
                    }
                  });
                } else {
                  Taro.showActionSheet({
                    itemList: ['重试保存', '复制履历摘要'],
                    success: (res2) => {
                      if (res2.tapIndex === 0) {
                        handleSave();
                      } else if (res2.tapIndex === 1) {
                        handleCopySummary();
                      }
                    }
                  });
                }
              }
            });
          },
          fail: (err) => {
            Taro.hideLoading();
            console.error('[QrCodeModal] Write file failed:', err);
            Taro.showActionSheet({
              itemList: ['重试保存', '复制履历摘要'],
              success: (res) => {
                if (res.tapIndex === 0) {
                  handleSave();
                } else if (res.tapIndex === 1) {
                  handleCopySummary();
                }
              }
            });
          }
        });
      } catch (e) {
        Taro.hideLoading();
        console.error('[QrCodeModal] Save error:', e);
        handleCopySummary();
      }
    } else if (process.env.TARO_ENV === 'h5') {
      try {
        if (qrDataUrl.startsWith('data:image/svg+xml')) {
          Taro.showModal({
            title: '保存二维码',
            content: 'SVG格式二维码请右键点击图片，选择「图片另存为...」保存。也可复制履历摘要直接分享。',
            showCancel: true,
            confirmText: '复制摘要',
            cancelText: '知道了',
            success: (res) => {
              if (res.confirm) {
                handleCopySummary();
              }
            }
          });
          return;
        }

        if (typeof document !== 'undefined') {
          const link = document.createElement('a');
          link.download = `${product?.title?.substring(0, 10) || '消毒履历'}_二维码_${Date.now()}.png`;
          link.href = qrDataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          Taro.showToast({
            title: '二维码已下载',
            icon: 'success'
          });
        }
      } catch (e) {
        console.error('[QrCodeModal] H5 save failed:', e);
        handleCopySummary();
      }
    } else {
      Taro.showActionSheet({
        itemList: ['复制履历摘要'],
        success: (res) => {
          if (res.tapIndex === 0) {
            handleCopySummary();
          }
        }
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
              <Text style={{ fontSize: 20, color: '#bbb', marginTop: 8 }}>
                正在编码 {qrContent.length} 字节数据
              </Text>
            </View>
          )}

          {!isGenerating && qrDataUrl && !qrError && (
            <View>
              <Image
                className={styles.qrImage}
                src={qrDataUrl}
                mode='aspectFit'
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  console.error('[QrCodeModal] Image load error:', e.detail);
                  setQrError(true);
                  setErrorMsg('图片加载失败，请重试');
                }}
                showMenuByLongpress
              />
              <Text style={{ fontSize: 20, color: '#999', textAlign: 'center', marginTop: 8, display: 'block' }}>
                长按二维码可保存图片
              </Text>
            </View>
          )}

          {!isGenerating && qrError && (
            <View className={styles.qrLoading}>
              <Text style={{ fontSize: 48 }}>⚠️</Text>
              <Text style={{ fontSize: 24, color: '#999', marginTop: 16 }}>
                二维码生成失败
              </Text>
              {errorMsg && (
                <Text style={{ fontSize: 20, color: '#ff6b6b', marginTop: 8, padding: '0 16px', textAlign: 'center' }}>
                  {errorMsg.length > 40 ? errorMsg.substring(0, 40) + '...' : errorMsg}
                </Text>
              )}
              <View style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                <Button
                  className={styles.retryBtn}
                  onClick={handleRetry}
                >
                  重新生成
                </Button>
                <Button
                  className={classnames(styles.retryBtn, styles.btnSecondary)}
                  onClick={handleCopySummary}
                  style={{ background: '#52c4a5' }}
                >
                  复制摘要
                </Button>
              </View>
            </View>
          )}
        </View>

        <View className={styles.qrSummary}>
          <Text className={styles.qrSummaryText}>
            💡 扫码内容摘要：{decodedSummary}
          </Text>
        </View>

        <View className={styles.tip}>
          <Text className={styles.tipText}>
            🔒 该二维码已包含商品关键信息，交易完成后履历可一键过户给下一任买家
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
