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
import useStore from '@/store';
import { Conversation, Message, QAItem } from '@/types';
import ChatBubble from '@/components/ChatBubble';

const ChatPage: React.FC = () => {
  const {
    currentUser,
    products,
    conversations,
    updateConversation,
    addMessage,
    getMessagesByConversation
  } = useStore();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [qaConfirmed, setQaConfirmed] = useState(false);
  const [showPriceNegotiation, setShowPriceNegotiation] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<any>(null);

  const userConversations = useMemo(() => {
    return conversations.filter(c =>
      c.buyerId === currentUser.id || c.sellerId === currentUser.id
    ).sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [conversations, currentUser.id]);

  const currentProduct = useMemo(() => {
    if (!selectedConversation) return null;
    return products.find(p => p.id === selectedConversation.productId);
  }, [selectedConversation, products]);

  const isBuyer = useMemo(() => {
    if (!selectedConversation) return false;
    return selectedConversation.buyerId === currentUser.id;
  }, [selectedConversation, currentUser.id]);

  useEffect(() => {
    if (selectedConversation) {
      const msgs = getMessagesByConversation(selectedConversation.id);
      setChatMessages(msgs.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ));
      setQaConfirmed(selectedConversation.qaConfirmed);
      setShowPriceNegotiation(selectedConversation.priceProposed && isBuyer === false);
    }
  }, [selectedConversation, getMessagesByConversation, isBuyer]);

  useEffect(() => {
    if (messagesEndRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
      }, 200);
    }
  }, [chatMessages.length, qaConfirmed, showPriceNegotiation]);

  const handleConversationClick = (conversation: Conversation) => {
    console.log('[ChatPage] Open conversation:', conversation.id);
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    console.log('[ChatPage] Back to conversation list');
    setSelectedConversation(null);
    setChatMessages([]);
    setInputText('');
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedConversation || !qaConfirmed) return;

    console.log('[ChatPage] Send message:', inputText);

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      type: 'text',
      content: inputText,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    addMessage(newMessage);
    setChatMessages(prev => [...prev, newMessage]);

    updateConversation(selectedConversation.id, {
      lastMessage: inputText,
      lastMessageTime: new Date().toISOString()
    });

    setInputText('');

    if (chatMessages.length <= 3 && qaConfirmed) {
      setTimeout(() => {
        const reply: Message = {
          id: `msg_${Date.now() + 1}`,
          conversationId: selectedConversation.id,
          senderId: isBuyer ? selectedConversation.sellerId : selectedConversation.buyerId,
          senderName: isBuyer ? selectedConversation.sellerName : selectedConversation.buyerName,
          type: 'text',
          content: isBuyer
            ? '好的，商品已经按照标准流程消毒完成，您可以放心购买~'
            : '好的，请问什么时候方便当面验货呢？',
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        addMessage(reply);
        setChatMessages(prev => [...prev, reply]);
        updateConversation(selectedConversation.id, {
          lastMessage: reply.content,
          lastMessageTime: reply.timestamp
        });
      }, 1500);
    }
  };

  const handleConfirmQA = () => {
    if (!selectedConversation) return;

    console.log('[ChatPage] QA confirmed');
    setQaConfirmed(true);

    updateConversation(selectedConversation.id, {
      qaConfirmed: true
    });

    const systemMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'system',
      type: 'system',
      content: '✓ 卫生细节已确认，现在可以开始议价和聊天啦~',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    addMessage(systemMsg);
    setChatMessages(prev => [...prev, systemMsg]);

    Taro.showToast({
      title: '已确认卫生细节',
      icon: 'success'
    });
  };

  const handleQuickTool = (type: string) => {
    console.log('[ChatPage] Quick tool:', type);

    if (type === '预约验货' && selectedConversation && qaConfirmed) {
      Taro.showModal({
        title: '预约验货',
        content: '是否跳转到验货页面安排当面交易？',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/inspect/index' });
          }
        }
      });
    } else {
      Taro.showToast({
        title: `打开${type}`,
        icon: 'none'
      });
    }
  };

  const handleAcceptPrice = () => {
    if (!selectedConversation) return;

    console.log('[ChatPage] Accept price');
    setShowPriceNegotiation(false);

    const systemMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'system',
      type: 'system',
      content: '✓ 价格已确认！请前往「验货」页完成当面交易~',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    addMessage(systemMsg);
    setChatMessages(prev => [...prev, systemMsg]);

    updateConversation(selectedConversation.id, {
      priceProposed: false,
      inspectScheduled: true
    });

    Taro.showToast({
      title: '价格已确认',
      icon: 'success'
    });
  };

  const handleDeclinePrice = () => {
    if (!selectedConversation) return;

    console.log('[ChatPage] Decline price');
    setShowPriceNegotiation(false);

    const reply: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      type: 'text',
      content: '价格我再考虑一下~',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    addMessage(reply);
    setChatMessages(prev => [...prev, reply]);

    Taro.showToast({
      title: '请继续协商',
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
      {userConversations.length > 0 ? (
        userConversations.map(conversation => {
          return (
            <View
              key={conversation.id}
              className={styles.conversationItem}
              onClick={() => handleConversationClick(conversation)}
            >
              <View className={styles.avatar}>
                <Text>{conversation.otherUserName.charAt(0)}</Text>
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
                {!conversation.qaConfirmed && (
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        fontSize: 22,
                        color: '#FF6B9A',
                        background: 'rgba(255,107,154,0.1)',
                        padding: '4rpx 16rpx',
                        borderRadius: 20
                      }}
                    >
                      🔒 待确认卫生细节
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <View className={styles.emptyList}>
          <Text className={styles.emptyIcon}>💬</Text>
          <Text className={styles.emptyText}>暂无消息</Text>
          <Text style={{ fontSize: 24, color: '#999', marginTop: 16 }}>
            去「履历」页选择商品开始聊天吧~
          </Text>
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

              <Text style={{ fontSize: 24, color: '#666', marginBottom: 16 }}>
                为了保障交易安全，请先确认以下卫生信息。确认后将解锁聊天和议价功能。
              </Text>

              {currentProduct.qaList?.map((qa: QAItem, index: number) => (
                <View key={index} className={styles.qaItem}>
                  <Text className={styles.qaQuestion}>Q{index + 1}: {qa.question}</Text>
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
                    style={{ width: '100%', marginTop: 24 }}
                    onClick={handleConfirmQA}
                  >
                    我已确认，开始聊天
                  </Button>
                </>
              )}
            </View>
          )}

          {qaConfirmed && showPriceNegotiation && currentProduct && (
            <View className={styles.priceSection}>
              <Text className={styles.priceTitle}>
                💰 {isBuyer ? '卖家' : '买家'}议价：¥{currentProduct.price} → ¥{Math.round(currentProduct.price * 0.85)}
              </Text>
              <Text style={{ fontSize: 24, color: '#666', textAlign: 'center', marginBottom: 16 }}>
                {isBuyer ? '卖家接受这个价格吗？' : '您接受这个价格吗？'}
              </Text>
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

          {chatMessages.map(message => (
            <ChatBubble
              key={message.id}
              message={message}
              isSelf={message.senderId === currentUser.id}
              showAvatar
              showName={message.type !== 'system' && message.senderId !== currentUser.id}
            />
          ))}

          <View ref={messagesEndRef} />
        </View>
      </ScrollView>

      <View className={styles.inputArea}>
        <View style={{ flex: 1 }}>
          {qaConfirmed && (
            <View className={styles.inputToolbar}>
              <Button
                className={styles.toolBtn}
                onClick={() => handleQuickTool('图片')}
              >
                📷 图片
              </Button>
              <Button
                className={styles.toolBtn}
                onClick={() => handleQuickTool('位置')}
              >
                📍 位置
              </Button>
              <Button
                className={styles.toolBtn}
                onClick={() => handleQuickTool('预约验货')}
              >
                ✅ 预约验货
              </Button>
            </View>
          )}
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              placeholder={qaConfirmed ? '输入消息...' : '请先确认卫生细节再聊天哦~'}
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              onConfirm={handleSend}
              disabled={!qaConfirmed}
              confirmType='send'
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
