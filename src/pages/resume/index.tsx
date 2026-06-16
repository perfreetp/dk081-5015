import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Input,
  Button,
  PullDownRefresh
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockProducts } from '@/data/mockProducts';
import { Product } from '@/types';
import ResumeCard from '@/components/ResumeCard';
import ProductCard from '@/components/ProductCard';
import QrCodeModal from '@/components/QrCodeModal';

type TabType = 'all' | 'selling' | 'sold';

const ResumePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchText, setSearchText] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    if (activeTab === 'selling') {
      result = result.filter(p => p.status === 'published');
    } else if (activeTab === 'sold') {
      result = result.filter(p => p.status === 'sold');
    }

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.categoryName.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [activeTab, searchText]);

  const stats = useMemo(() => {
    const total = mockProducts.length;
    const selling = mockProducts.filter(p => p.status === 'published').length;
    const sold = mockProducts.filter(p => p.status === 'sold').length;
    const hygieneScore = mockProducts.length > 0
      ? (mockProducts.reduce((sum, p) => {
        if (p.reviews.length === 0) return sum + 5;
        return sum + p.reviews.reduce((s, r) => s + r.hygieneScore, 0) / p.reviews.length;
      }, 0) / mockProducts.length).toFixed(1)
      : '5.0';

    return { total, selling, sold, hygieneScore };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    console.log('[ResumePage] Pull to refresh');
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleShowQR = (product: Product) => {
    setSelectedProduct(product);
    setShowQRModal(true);
    console.log('[ResumePage] Show QR for product:', product.id);
  };

  const handleGoPublish = () => {
    Taro.switchTab({ url: '/pages/publish/index' });
  };

  const handleProductClick = (product: Product) => {
    console.log('[ResumePage] Product clicked:', product.id);
    Taro.showToast({
      title: '查看商品详情',
      icon: 'none'
    });
  };

  const tabs: { key: TabType; name: string }[] = [
    { key: 'all', name: '全部' },
    { key: 'selling', name: '售卖中' },
    { key: 'sold', name: '已卖出' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>我的消毒履历</Text>
        <Text className={styles.headerSubtitle}>每一次清洁都有记录，每一笔交易都可信任</Text>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>发布商品</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.selling}</Text>
            <Text className={styles.statLabel}>售卖中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.sold}</Text>
            <Text className={styles.statLabel}>已成交</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.hygieneScore}</Text>
            <Text className={styles.statLabel}>卫生评分</Text>
          </View>
        </View>
      </View>

      <PullDownRefresh
        refreshing={refreshing}
        onRefresh={handleRefresh}
        threshold={50}
      >
        <ScrollView
          className={styles.content}
          scrollY
          enhanced
          showScrollbar={false}
        >
          <View className={styles.tabBar}>
            {tabs.map(tab => (
              <View
                key={tab.key}
                className={classnames(
                  styles.tabItem,
                  activeTab === tab.key && styles.tabActive
                )}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.name}
              </View>
            ))}
          </View>

          <View className={styles.searchBar}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder='搜索商品名称或品类'
              value={searchText}
              onInput={(e) => setSearchText(e.detail.value)}
            />
          </View>

          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <View key={product.id}>
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
                <ResumeCard
                  product={product}
                  onShowQR={() => handleShowQR(product)}
                />
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📦</Text>
              <Text className={styles.emptyText}>
                {searchText ? '没有找到相关商品' : '暂无消毒履历，快去发布第一件商品吧'}
              </Text>
              {!searchText && (
                <Button className={styles.emptyBtn} onClick={handleGoPublish}>
                  立即发布
                </Button>
              )}
            </View>
          )}
        </ScrollView>
      </PullDownRefresh>

      <QrCodeModal
        visible={showQRModal}
        product={selectedProduct}
        onClose={() => setShowQRModal(false)}
      />
    </View>
  );
};

export default ResumePage;
