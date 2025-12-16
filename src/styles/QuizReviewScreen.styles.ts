// src/styles/QuizReviewScreen.styles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // HEADER SECTION
  resultHeader: {
    backgroundColor: COLORS.INFO,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  percentageValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  passedBadge: {
    backgroundColor: COLORS.SUCCESS || '#4CAF50',
  },
  failedBadge: {
    backgroundColor: COLORS.ERROR || '#F44336',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.TEXT_SECONDARY,
    opacity: 0.3,
  },
  
  // QUESTIONS SECTION
  questionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  correctCard: {
    borderColor: COLORS.SUCCESS || '#4CAF50',
  },
  incorrectCard: {
    borderColor: COLORS.ERROR || '#F44336',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questionNumber: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  questionNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  questionStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 16,
    lineHeight: 24,
  },
  
  // OPTIONS
  optionsContainer: {
    marginBottom: 12,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionDefault: {
    backgroundColor: COLORS.LIGHT_GRAY || '#f5f5f5',
    borderColor: COLORS.BORDER || '#e0e0e0',
  },
  optionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.SUCCESS || '#4CAF50',
  },
  optionIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: COLORS.ERROR || '#F44336',
  },
  optionTextDefault: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  optionTextCorrect: {
    fontSize: 14,
    color: COLORS.SUCCESS || '#4CAF50',
    fontWeight: '600',
  },
  optionTextIncorrect: {
    fontSize: 14,
    color: COLORS.ERROR || '#F44336',
    fontWeight: '600',
  },
  
  // ANSWER INFO
  answerInfo: {
    backgroundColor: COLORS.LIGHT_GRAY || '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  answerInfoText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  correctText: {
    color: COLORS.SUCCESS || '#4CAF50',
    fontWeight: '600',
  },
  incorrectText: {
    color: COLORS.ERROR || '#F44336',
    fontWeight: '600',
  },
  
  // BUTTONS
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});