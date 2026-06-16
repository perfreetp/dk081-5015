import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { QAItem } from '@/types';

interface CheckListProps {
  qaList: QAItem[];
  answers: Record<string, boolean>;
  onAnswerChange: (qaId: string, value: boolean) => void;
  editable?: boolean;
}

const CheckList: React.FC<CheckListProps> = ({
  qaList,
  answers,
  onAnswerChange,
  editable = true
}) => {
  const handleToggle = (index: number) => {
    if (!editable) return;
    const qaId = `qa_${index}`;
    onAnswerChange(qaId, !answers[qaId]);
  };

  return (
    <View className={styles.checklist}>
      <View className={styles.items}>
        {qaList.map((qa, index) => {
          const qaId = `qa_${index}`;
          const checked = !!answers[qaId];
          return (
            <View
              key={index}
              className={classnames(styles.item, checked && styles.checked)}
            >
              <View
                className={classnames(
                  styles.checkbox,
                  checked && styles.checkedCheckbox
                )}
                onClick={() => handleToggle(index)}
              >
                {checked && '✓'}
              </View>
              <View className={styles.content}>
                <Text className={styles.question}>
                  {index + 1}. {qa.question}
                </Text>
                <Text className={styles.answer}>
                  {qa.answer}
                </Text>
                {qa.isHygiene && (
                  <View className={styles.hygieneTag}>
                    🧼 卫生相关
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default CheckList;
