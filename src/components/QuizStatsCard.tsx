// src/components/QuizStatsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import type { UserLatestResult } from '../types/quiz';

interface QuizStatsCardProps {
  latestResult: UserLatestResult;
}

const QuizStatsCard: React.FC<QuizStatsCardProps> = ({ latestResult }) => {
  const percentage = (latestResult.score / latestResult.total_questions) * 100;
  const isPassed = percentage >= 70;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📊</Text>
        <Text style={styles.headerTitle}>Latest Result</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{latestResult.score}</Text>
            <Text style={styles.totalText}>/ {latestResult.total_questions}</Text>
          </View>
          
          <View style={styles.detailsSection}>
            <View style={[
              styles.statusBadge,
              isPassed ? styles.passedBadge : styles.failedBadge
            ]}>
              <Text style={styles.statusText}>
                {isPassed ? '✓ Passed' : '✗ Failed'}
              </Text>
            </View>
            
            <Text style={[
              styles.percentageText,
              isPassed ? styles.passedPercentage : styles.failedPercentage
            ]}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.dateLabel}>Completed:</Text>
          <Text style={styles.dateValue}>
            {formatDate(latestResult.completed_at)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.LIGHT_GRAY || '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  content: {
    gap: 12,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  detailsSection: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passedBadge: {
    backgroundColor: COLORS.SUCCESS || '#4CAF50',
  },
  failedBadge: {
    backgroundColor: COLORS.ERROR || '#F44336',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  passedPercentage: {
    color: COLORS.SUCCESS || '#4CAF50',
  },
  failedPercentage: {
    color: COLORS.ERROR || '#F44336',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER || '#e0e0e0',
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
});

export default QuizStatsCard;