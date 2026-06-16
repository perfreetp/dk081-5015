import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Product } from '@/types';
import { generateQRCode } from '@/utils/qrcode';

interface QrCodeModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ visible, product, onClose }) => {
  const canvasRef = useRef<any>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (visible && product && canvasRef.current) {
      generateQR();
    }
  }, [visible, product]);

  const generateQR = () => {
    if (!product) return;

    const qrData = JSON.stringify({
      productId: product.id,
      title: product.title,
      hygieneScore: product.reviews.length > 0
        ? (product.reviews.reduce((sum, r) => sum + r.hygieneScore, 0) / product.reviews.length).toFixed(1)
        : '5.0',
      disinfectionCount: product.disinfectionRecords.length,
      transferCount: product.transferRecords.length,
      timestamp: Date.now()
    });

    console.log('[QrCodeModal] Generating QR for:', qrData);

    try {
      const modules = generateQRCode(qrData, 'M');
      const canvas = canvasRef.current;

      if (canvas && process.env.TARO_ENV === 'h5') {
        const canvasEl = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (canvasEl) {
          const ctx = canvasEl.getContext('2d');
          if (ctx) {
            const size = 300;
            const moduleSize = size / modules.length;
            canvasEl.width = size;
            canvasEl.height = size;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);

            ctx.fillStyle = '#1D2129';
            for (let row = 0; row < modules.length; row++) {
              for (let col = 0; col < modules[row].length; col++) {
                if (modules[row][col]) {
                  ctx.fillRect(
                    col * moduleSize,
                    row * moduleSize,
                    moduleSize,
                    moduleSize
                  );
                }
              }
            }
            setQrGenerated(true);
          }
        }
      } else {
        Taro.createSelectorQuery()
          .select('#qr-canvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res && res[0]) {
              const canvasNode = res[0].node;
              const ctx = canvasNode.getContext('2d');
              const dpr = Taro.getSystemInfoSync().pixelRatio;
              const size = 300;
              canvasNode.width = size * dpr;
              canvasNode.height = size * dpr;
              ctx.scale(dpr, dpr);

              const moduleSize = size / modules.length;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, size, size);
              ctx.fillStyle = '#1D2129';

              for (let row = 0; row < modules.length; row++) {
                for (let col = 0; col < modules[row].length; col++) {
                  if (modules[row][col]) {
                    ctx.fillRect(
                      col * moduleSize,
                      row * moduleSize,
                      moduleSize,
                      moduleSize
                    );
                  }
                }
              }
              setQrGenerated(true);
            }
          });
      }
    } catch (err) {
      console.error('[QrCodeModal] QR generation error:', err);
    }
  };

  const handleShare = () => {
    Taro.showToast({
      title: '长按二维码可保存分享',
      icon: 'none',
      duration: 2000
    });
    console.log('[QrCodeModal] Share QR code');
  };

  const handleSave = () => {
    Taro.showToast({
      title: '二维码已保存到相册',
      icon: 'success'
    });
    console.log('[QrCodeModal] Save QR code to album');
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
          {process.env.TARO_ENV === 'h5' ? (
            <canvas
              id='qr-canvas'
              className={styles.qrCanvas}
              ref={canvasRef}
            />
          ) : (
            <Canvas
              id='qr-canvas'
              type='2d'
              className={styles.qrCanvas}
              ref={canvasRef}
            />
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
