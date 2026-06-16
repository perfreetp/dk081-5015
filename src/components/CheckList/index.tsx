import React, { useState } from 'react';
import { View, Text, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { QAItem } from '@/types';

interface CheckListItem {
  id: string;
  question: string;
  isHygiene: boolean;
  answer?: string;
  required?: boolean;
}

interface CheckListProps {
  title: string;
  items: CheckListItem[];
  editable?: boolean;
  showWarning?: boolean;
  warningText?: string;
  onSubmit?: (answers: QAItem[]) => void;
  submitText?: string;
}

const CheckList: React.FC<CheckListProps> = ({
  title,
  items,
  editable = true,
  showWarning = false,
  warningText = '',
  onSubmit,
  submitText = '确认卫生细节'
}) => {
  const [answers, setAnswers] = useState<Record<string, { checked: boolean; answer: string }>>(
    items.reduce((acc, item) => {
      acc[item.id] = {
        checked: !!item.answer,
        answer: item.answer || ''
      };
      return acc;
    }, {} as Record<string, { checked: boolean; answer: string }>)
  );

  const handleToggle = (id: string) => {
    if (!editable) return;
    setAnswers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        checked: !prev[id].checked
      }
    }));
  };

  const handleAnswerChange = (id: string, value: string) => {
    if (!editable) return;
    setAnswers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        answer: value,
        checked: !!value
      }
    }));
  };

  const handleSubmit = () => {
    const unansweredRequired = items.filter(
      item => item.required && !answers[item.id]?.checked
    );

    if (unansweredRequired.length > 0) {
      Taro.showToast({
        title: '请完成所有必填项',
        icon: 'none'
      });
      return;
    }

    const qaList: QAItem[] = items
      .filter(item => answers[item.id]?.checked)
      .map(item => ({
        question: item.question,
        answer: answers[item.id].answer || '已确认',
        isHygiene: item.isHygiene
      }));

    console.log('[CheckList] Submit answers:', qaList);
    onSubmit?.(qaList);
  };

  const completedCount = Object.values(answers).filter(a => a.checked).length;
  const totalCount = items.length;
  const canSubmit = completedCount > 0;

  return (
    <View className={styles.checklist}>
      {showWarning && warningText && (
        <View className={styles.warningTip}>
          <Text className={styles.warningIcon}>⚠️</Text>
          <Text className={styles.warningText}>{warningText}</Text>
        </View>
      )}

      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.progress}>
          {completedCount}/{totalCount} 已确认
        </Text>
      </View>

      <View className={styles.items}>
        {items.map(item => (
          <View
            key={item.id}
            className={classnames(styles.item, answers[item.id]?.checked && styles.checked)}
          >
            <View
              className={classnames(
                styles.checkbox,
                answers[item.id]?.checked && styles.checkedCheckbox
              )}
              onClick={() => handleToggle(item.id)}
            >
              {answers[item.id]?.checked && '✓'}
            </View>
            <View className={styles.content}>
              <Text className={styles.question}>
                {item.question}
                {item.required && <Text style={{ color: '#F53F3F' }}> *</Text>}
              </Text>
              {editable ? (
                <Textarea
                  className={styles.answerInput}
                  placeholder='请输入详细说明...'
                  value={answers[item.id]?.answer}
                  onInput={(e) => handleAnswerChange(item.id, e.detail.value)}
                  maxlength={200}
                />
              ) : (
                item.answer && (
                  <Text className={styles.answer}>{item.answer}</Text>
                )
              )}
            </View>
          </View>
        ))}
      </View>

      {editable && (
        <View className={styles.footer}>
          <Button
            className={styles.submitBtn}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitText}
          </Button>
          <Text className={styles.hint}>
            💡 先确认卫生细节，再开始聊价格，让交易更放心
          </Text>
        </View>
      )}
    </View>
  );
};

export default CheckList;
