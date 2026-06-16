import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Input,
  Button,
  Image
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockConversations, mockMessages } from '@/data/mockMessages';
import { mockProducts } from '@/data/mockProducts';
import { Conversation, Message, Product } from '@/types';
import ChatBubble from '@/components/ChatBubble';

const ChatPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [qaConfirmed, setQaConfirmed] = useState(false);
  const [showPriceNegotiation, setShowPriceNegotiation] = useState(false);
  const messagesEndRef = useRef<any>(null);

  const currentProduct = useMemo(() => {
    if (!selectedConversation) return null;
    return mockProducts.find(p => p.id === selectedConversation.productId);
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      const convoMessages = mockMessages.filter(m => m.conversationId === selectedConversation.id);
      setMessages(convoMessages);
      setQaConfirmed(selectedConversation.qaConfirmed || false);
      setShowPriceNegotiation(selectedConversation.priceProposed || false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  const handleConversationClick = (conversation: Conversation) => {
    console.log('[ChatPage] Open conversation:', conversation.id);
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    console.log('[ChatPage] Back to conversation list');
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedConversation) return;

    console.log('[ChatPage] Send message:', inputText);

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'user_001',
      type: 'text',
      content: inputText,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const handleConfirmQA = () => {
    console.log('[ChatPage] QA confirmed');
    setQaConfirmed(true);
    Taro.showToast({
      title: '已确认卫生细节',
      icon: 'success'
    });

    const systemMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation!.id,
      senderId: 'system',
      type: 'system',
      content: '买家已确认卫生细节，现在可以开始议价啦~',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const handleQuickTool = (type: string) => {
    console.log('[ChatPage] Quick tool:', type);
    Taro.showToast({
      title: `打开${type}`,
      icon: 'none'
    });
  };

  const handleAcceptPrice = () => {
    console.log('[ChatPage] Accept price');
    setShowPriceNegotiation(false);
    Taro.showToast({
      title: '价格已确认，可安排验货',
      icon: 'success'
    });

    const systemMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation!.id,
      senderId: 'system',
      type: 'system',
      content: '价格已确认！请前往「验货」页完成当面交易~',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const handleDeclinePrice = () => {
    console.log('[ChatPage] Decline price');
    setShowPriceNegotiation(false);
    Taro.showToast({
      title: '请继续协商价格',
      icon: 'none'
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderConversationList = () => (
    <ScrollView className={styles.conversationList} scrollY enhanced showScrollbar={false}>
      {mockConversations.length > 0 ? (
        mockConversations.map(conversation => {
          const product = mockProducts.find(p => p.id === conversation.productId);
          return (
            <View
              key={conversation.id}
              className={styles.conversationItem}
              onClick={() => handleConversationClick(conversation)}
            >
              <View className={styles.avatar}>
                <Text>
                  {conversation.otherUserName.charAt(0)}
                </Text>
              </View>
              <View className={styles.conversationContent}>
                <View className={styles.conversationHeader}>
                  <Text className={styles.conversationName}>
                    {conversation.otherUserName}
                  </Text>
                  <Text className={styles.conversationTime}>
                    {formatTime(conversation.lastMessageTime)}
                  </Text>
                </View>
                <View className={styles.conversationPreview}>
                  <Text className={styles.previewText}>
                    {conversation.lastMessage}
                  </Text>
                  {conversation.unreadCount > 0 && (
                    <View className={styles.badge}>
                      {conversation.unreadCount}
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <View className={styles.emptyList}>
          <Text className={styles.emptyIcon}>💬</Text>
          <Text className={styles.emptyText}>暂无消息</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderChatView = () => (
    <View className={styles.chatContainer}>
      <View className={styles.productBar}>
        <Button className={styles.backBtn} onClick={handleBack}>
          ‹
        </Button>
        {currentProduct && (
          <>
            <Image
              className={styles.productThumb}
              src={currentProduct.images[0]}
              mode='aspectFill'
            />
            <View className={styles.productInfo}>
              <Text className={styles.productTitle}>{currentProduct.title}</Text>
              <Text className={styles.productPrice}>¥{currentProduct.price}</Text>
            </View>
          </>
        )}
      </View>

      {!qaConfirmed && (
        <View className={styles.bargainBanner}>
          <Text>🔒</Text>
          <Text className={styles.bargainBannerText}>请先确认卫生细节，再讨论价格</Text>
        </View>
      )}

      <ScrollView
        className={styles.messagesList}
        scrollY
        enhanced
        showScrollbar={false}
      >
        <View className={styles.messagesContent}>
          <View className={styles.dateDivider}>
            <Text className={styles.dateText}>今天</Text>
          </View>

          {!qaConfirmed && currentProduct && (
            <View
              className={classnames(
                styles.qaSection,
                qaConfirmed && styles.qaConfirmed
              )}
            >
              <Text
                className={classnames(
                  styles.qaTitle,
                  qaConfirmed && styles.qaConfirmedTitle
                )}
              >
                <Text className={styles.qaIcon}>📋</Text>
                {qaConfirmed ? '✓ 卫生细节已确认' : '卫生细节预确认'}
              </Text>
              {currentProduct.qaList?.slice(0, 3).map((qa, index) => (
                <View key={index} className={styles.qaItem}>
                  <Text className={styles.qaQuestion}>Q: {qa.question}</Text>
                  <Text className={styles.qaAnswer}>A: {qa.answer}</Text>
                </View>
              ))}
              {!qaConfirmed && (
                <>
                  <View className={styles.qaNote}>
                    <Text>
                      请仔细确认以上卫生信息。
                      <Text className={styles.qaNoteHighlight}> 确认后将解锁议价功能。</Text>
                    </Text>
                  </View>
                  <Button
                    className={classnames(styles.sendBtn)}
                    style={{ width: '100%', marginTop: '24rpx' }}
                    onClick={handleConfirmQA}
                  >
                    我已确认，开始议价
                  </Button>
                </>
              )}
            </View>
          )}

          {showPriceNegotiation && qaConfirmed && (
            <View className={styles.priceSection}>
              <Text className={styles.priceTitle}>💰 买家议价：¥{currentProduct?.price} → ¥{Math.round((currentProduct?.price || 0) * 0.85)}</Text>
              <View className={styles.priceActions}>
                <Button
                  className={classnames(styles.priceBtn, styles.priceDecline)}
                  onClick={handleDeclinePrice}
                >
                  再商量
                </Button>
                <Button
                  className={classnames(styles.priceBtn, styles.priceAccept)}
                  onClick={handleAcceptPrice}
                >
                  接受价格
                </Button>
              </View>
            </View>
          )}

          {messages.map(message => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <View ref={messagesEndRef} />
        </View>
      </ScrollView>

      <View className={styles.inputArea}>
        <View style={{ flex: 1 }}>
          <View className={styles.inputToolbar}>
            <Button
              className={classnames(styles.toolBtn)}
              onClick={() => handleQuickTool('图片')}
            >
              📷 图片
            </Button>
            <Button
              className={classnames(styles.toolBtn)}
              onClick={() => handleQuickTool('位置')}
            >
              📍 位置
            </Button>
            <Button
              className={classnames(styles.toolBtn)}
              onClick={() => handleQuickTool('验货')}
            >
              ✅ 预约验货
            </Button>
          </View>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              placeholder={qaConfirmed ? '输入消息...' : '先确认卫生细节再聊天哦~'}
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              onConfirm={handleSend}
              disabled={!qaConfirmed}
            />
          </View>
        </View>
        <Button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!inputText.trim() || !qaConfirmed}
        >
          发送
        </Button>
      </View>
    </View>
  );

  return (
    <View className={styles.page}>
      {selectedConversation ? renderChatView() : renderConversationList()}
    </View>
  );
};

export default ChatPage;
