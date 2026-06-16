import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  isSelf: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSelf,
  showAvatar = true,
  showName = false
}) => {

  if (message.type === 'system') {
    return (
      <View className={styles.systemMessage}>
        <View className={styles.systemContent}>
          {message.content}
        </View>
      </View>
    );
  }

  if (message.type === 'qa' && message.qaData) {
    return (
      <View className={classnames(styles.bubble, isSelf ? styles.self : styles.other)}>
        {!isSelf && showAvatar && (
          <View className={styles.avatar}>
            <Image
              className={styles.avatarImage}
              src={message.senderAvatar}
              mode='aspectFill'
              onError={(e) => {
                console.error('[ChatBubble] Avatar load error:', e.detail);
              }}
            />
          </View>
        )}
        <View className={styles.qaContent}>
          <View className={styles.qaQuestion}>
            <Text className={styles.qaIcon}>❓</Text>
            {message.qaData.question}
          </View>
          <View className={styles.qaAnswer}>
            ✅ {message.qaData.answer}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={classnames(styles.bubble, isSelf ? styles.self : styles.other)}>
      {!isSelf && showAvatar && (
        <View className={styles.avatar}>
          <Image
            className={styles.avatarImage}
            src={message.senderAvatar}
            mode='aspectFill'
            onError={(e) => {
              console.error('[ChatBubble] Avatar load error:', e.detail);
            }}
          />
        </View>
      )}
      <View className={styles.content}>
        {showName && !isSelf && (
          <Text className={styles.userName}>{message.senderName}</Text>
        )}
        <View className={styles.messageContent}>
          {message.content}
        </View>
        <Text className={styles.timestamp}>{message.timestamp}</Text>
      </View>
      {isSelf && showAvatar && (
        <View className={styles.avatar}>
          <Image
            className={styles.avatarImage}
            src={message.senderAvatar}
            mode='aspectFill'
            onError={(e) => {
              console.error('[ChatBubble] Avatar load error:', e.detail);
            }}
          />
        </View>
      )}
    </View>
  );
};

export default ChatBubble;
