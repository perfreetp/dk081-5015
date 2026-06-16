import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockProducts } from '@/data/mockProducts';
import { mockConversations } from '@/data/mockMessages';

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
  bgType?: 'primary' | 'secondary' | 'warn';
}

const MinePage: React.FC = () => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const stats = useMemo(() => {
    const myProducts = mockProducts.filter(p => p.sellerId === 'user_001');
    const soldCount = myProducts.filter(p => p.status === 'sold').length;
    const sellingCount = myProducts.filter(p => p.status === 'published').length;
    const pendingCount = mockConversations.filter(c => c.buyerId === 'user_001' && !c.qaConfirmed).length;

    const totalReviews = myProducts.reduce((acc, p) => acc + p.reviews.length, 0);
    const avgHygiene = totalReviews > 0
      ? (myProducts.reduce((acc, p) => {
        if (p.reviews.length === 0) return acc + 5;
        return acc + p.reviews.reduce((sum, r) => sum + r.hygieneScore, 0) / p.reviews.length;
      }, 0) / myProducts.length).toFixed(1)
      : '5.0';

    const avgDescription = totalReviews > 0
      ? (myProducts.reduce((acc, p) => {
        if (p.reviews.length === 0) return acc + 5;
        return acc + p.reviews.reduce((sum, r) => sum + r.descriptionScore, 0) / p.reviews.length;
      }, 0) / myProducts.length).toFixed(1)
      : '5.0';

    return {
      published: myProducts.length,
      sold: soldCount,
      selling: sellingCount,
      pending: pendingCount,
      avgHygiene,
      avgDescription,
      totalReviews
    };
  }, []);

  const handleMenuClick = (action: string) => {
    console.log('[MinePage] Menu clicked:', action);

    switch (action) {
      case 'publish':
        Taro.switchTab({ url: '/pages/publish/index' });
        break;
      case 'resume':
        Taro.switchTab({ url: '/pages/resume/index' });
        break;
      case 'inspect':
        Taro.switchTab({ url: '/pages/inspect/index' });
        break;
      case 'chat':
        Taro.switchTab({ url: '/pages/chat/index' });
        break;
      case 'categories':
        setShowCategoryModal(true);
        break;
      case 'recall':
        Taro.showToast({
          title: '国家召回信息查询',
          icon: 'none'
        });
        break;
      case 'feedback':
        Taro.showToast({
          title: '意见反馈',
          icon: 'none'
        });
        break;
      case 'about':
        Taro.showModal({
          title: '关于母婴安心转',
          content: '版本 1.0.0\n\n让二手母婴交易不只看便宜，还能看得见清洁过程。',
          showCancel: false
        });
        break;
      default:
        Taro.showToast({
          title: action,
          icon: 'none'
        });
    }
  };

  const menuItems1: MenuItem[] = [
    {
      icon: '📝',
      title: '我发布的商品',
      subtitle: `${stats.published}件商品`,
      onClick: () => handleMenuClick('resume')
    },
    {
      icon: '💰',
      title: '交易记录',
      subtitle: `卖出${stats.sold}件 · 在售${stats.selling}件`,
      onClick: () => handleMenuClick('resume')
    },
    {
      icon: '⏳',
      title: '待确认交易',
      subtitle: `${stats.pending}笔待确认卫生细节`,
      badge: stats.pending > 0 ? stats.pending.toString() : undefined,
      onClick: () => handleMenuClick('chat')
    },
    {
      icon: '📍',
      title: '验货预约',
      subtitle: '查看和管理验货安排',
      onClick: () => handleMenuClick('inspect')
    }
  ];

  const menuItems2: MenuItem[] = [
    {
      icon: '⚠️',
      title: '高风险品类提示',
      subtitle: '查看不建议转手的物品清单',
      bgType: 'warn',
      onClick: () => handleMenuClick('categories')
    },
    {
      icon: '🔍',
      title: '召回信息查询',
      subtitle: '对接国家市场监督管理总局数据',
      bgType: 'secondary',
      onClick: () => handleMenuClick('recall')
    },
    {
      icon: '📖',
      title: '清洁消毒指南',
      subtitle: '专业母婴用品消毒教程',
      bgType: 'secondary',
      onClick: () => handleMenuClick('guide')
    }
  ];

  const menuItems3: MenuItem[] = [
    {
      icon: '💬',
      title: '意见反馈',
      onClick: () => handleMenuClick('feedback')
    },
    {
      icon: 'ℹ️',
      title: '关于我们',
      onClick: () => handleMenuClick('about')
    }
  ];

  const renderMenuItem = (item: MenuItem, index: number) => (
    <View key={index} className={styles.menuItem} onClick={item.onClick}>
      <View
        className={classnames(
          styles.menuIcon,
          item.bgType === 'secondary' && styles.menuSecondaryBg,
          item.bgType === 'warn' && styles.menuWarnBg
        )}
      >
        {item.icon}
      </View>
      <View className={styles.menuContent}>
        <Text className={styles.menuTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text className={styles.menuSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.badge && (
        <View className={styles.menuBadge}>{item.badge}</View>
      )}
      <Text className={styles.menuArrow}>›</Text>
    </View>
  );

  const safetyTips = [
    {
      icon: '1',
      title: '高敏物品谨慎转手',
      desc: '奶嘴、咬胶、辅食工具等直接入口的物品，建议购买全新产品。'
    },
    {
      icon: '2',
      title: '消毒记录务必真实',
      desc: '每一次消毒都是对宝宝的承诺，请如实填写消毒方式和时间。'
    },
    {
      icon: '3',
      title: '当面验货确认状态',
      desc: '建议选择公共场所当面交易，仔细核对商品成色和功能。'
    }
  ];

  const highRiskCategories = [
    { icon: '🍼', title: '奶嘴/安抚奶嘴', desc: '直接入口，建议全新购买' },
    { icon: '🥣', title: '辅食工具', desc: '研磨碗、辅食勺等存在残留风险' },
    { icon: '🦷', title: '牙胶/咬胶', desc: '易磨损，可能藏有细菌' },
    { icon: '🤱', title: '吸奶器配件', desc: '喇叭罩、导管等建议更换' },
    { icon: '🍼', title: '塑料奶瓶', desc: '长期使用可能有划痕和BPA析出' },
    { icon: '🧴', title: '哺乳枕/定型枕', desc: '易滋生螨虫，建议更换枕套' }
  ];

  return (
    <View className={styles.page}>
      <ScrollView scrollY enhanced showScrollbar={false}>
        <View className={styles.header}>
          <View className={styles.userInfo}>
            <View className={styles.avatar}>
              <Text>👩</Text>
            </View>
            <View className={styles.userDetail}>
              <Text className={styles.userName}>新手妈妈小李</Text>
              <Text className={styles.userIntro}>宝宝8个月 · 注重卫生的处女座妈妈</Text>
              <View className={styles.trustBadge}>
                <Text className={styles.badgeIcon}>✅</Text>
                <Text>卫生达人认证</Text>
              </View>
            </View>
          </View>

          <View className={styles.statsRow}>
            <View className={styles.statsItem}>
              <Text className={styles.statsValue}>{stats.published}</Text>
              <Text className={styles.statsLabel}>发布商品</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsValue}>{stats.sold}</Text>
              <Text className={styles.statsLabel}>成功交易</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsValue}>{stats.totalReviews}</Text>
              <Text className={styles.statsLabel}>收到评价</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsValue}>{stats.avgHygiene}</Text>
              <Text className={styles.statsLabel}>卫生评分</Text>
            </View>
          </View>
        </View>

        <View className={styles.cardSection}>
          <View className={styles.infoCard}>
            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>卫生可信度</Text>
                <Text className={classnames(styles.infoValue, styles.infoValueHighlight)}>
                  {stats.avgHygiene} 分
                </Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>描述一致度</Text>
                <Text className={classnames(styles.infoValue, styles.infoValueHighlight)}>
                  {stats.avgDescription} 分
                </Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>加入时间</Text>
                <Text className={styles.infoValue}>2024年1月</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>信用等级</Text>
                <Text className={styles.infoValue}>优秀</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.scoreCard}>
          <View className={styles.scoreHeader}>
            <Text className={styles.scoreTitle}>
              <Text>🌟</Text> 信用评分
            </Text>
            <Text className={styles.scoreValue}>95</Text>
          </View>
          <View className={styles.scoreBar}>
            <View className={styles.scoreBarItem}>
              <View className={styles.scoreBarFill} style={{ width: '95%' }} />
            </View>
          </View>
          <View className={styles.scoreDetails}>
            <Text>卫生记录完整度</Text>
            <Text className={styles.scoreDetailValue}>98%</Text>
          </View>
          <View className={styles.scoreDetails} style={{ marginTop: '8rpx' }}>
            <Text>买家好评率</Text>
            <Text className={styles.scoreDetailValue}>100%</Text>
          </View>
        </View>

        <View className={styles.riskCard}>
          <Text className={styles.riskTitle}>
            <Text className={styles.riskIcon}>⚠️</Text>
            安全提醒
          </Text>
          <Text className={styles.riskContent}>
            根据《儿童用品召回管理规定》，二手母婴用品交易请注意安全。
            <Text className={styles.riskLink} onClick={() => handleMenuClick('categories')}>
              查看高风险品类 ›
            </Text>
          </Text>
        </View>

        <View className={styles.menuSection}>
          <View className={styles.menuGroup}>
            {menuItems1.map((item, index) => renderMenuItem(item, index))}
          </View>
        </View>

        <View className={styles.tipsSection}>
          <Text className={styles.tipsTitle}>
            <Text className={styles.tipsIcon}>💡</Text>
            安全交易小贴士
          </Text>
          <View className={styles.tipsCard}>
            {safetyTips.map((tip, index) => (
              <View key={index} className={styles.tipItem}>
                <View className={styles.tipIcon}>{tip.icon}</View>
                <View className={styles.tipContent}>
                  <Text className={styles.tipTitleText}>{tip.title}</Text>
                  <Text className={styles.tipDesc}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.menuSection}>
          <View className={styles.menuGroup}>
            {menuItems2.map((item, index) => renderMenuItem(item, index))}
          </View>
        </View>

        <View className={styles.menuSection}>
          <View className={styles.menuGroup}>
            {menuItems3.map((item, index) => renderMenuItem(item, index))}
          </View>
        </View>

        <View className={styles.footer}>
          <Text className={styles.footerText}>
            让二手母婴交易更安全
            <Text className={styles.footerLink} onClick={() => handleMenuClick('about')}>
              关于母婴安心转
            </Text>
          </Text>
        </View>
      </ScrollView>

      {showCategoryModal && (
        <View
          className={styles.modalOverlay}
          onClick={() => setShowCategoryModal(false)}
        >
          <View
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>⚠️ 高风险品类提示</Text>
            </View>
            <View className={styles.modalBody}>
              {highRiskCategories.map((cat, index) => (
                <View key={index} className={styles.modalItem}>
                  <Text className={styles.modalItemIcon}>{cat.icon}</Text>
                  <View className={styles.modalItemContent}>
                    <Text className={styles.modalItemTitle}>{cat.title}</Text>
                    <Text className={styles.modalItemDesc}>{cat.desc}</Text>
                  </View>
                </View>
              ))}
              <View style={{
                marginTop: '24rpx',
                padding: '24rpx',
                background: 'rgba(255, 107, 107, 0.08)',
                borderRadius: '16rpx'
              }}>
                <Text style={{
                  fontSize: '26rpx',
                  color: '#FF6B6B',
                  fontWeight: 500,
                  marginBottom: '8rpx'
                }}>
                  💡 温馨提示
                </Text>
                <Text style={{
                  fontSize: '24rpx',
                  color: '#666',
                  lineHeight: 1.6
                }}>
                  以上品类因直接接触婴儿口腔或皮肤，存在较高卫生风险，强烈建议购买全新产品。
                  如确需转手，请务必做好彻底消毒并明确告知买家。
                </Text>
              </View>
            </View>
            <View className={styles.modalFooter}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowCategoryModal(false)}
              >
                我知道了
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default MinePage;
