import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  passedText: {
    color: COLORS.SUCCESS,
  },
  failedText: {
    color: COLORS.ERROR,
  },
  resultDetails: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  questionReview: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  correctText: {
    color: COLORS.SUCCESS,
    fontWeight: '500',
  },
  incorrectText: {
    color: COLORS.ERROR,
    fontWeight: '500',
  },
});