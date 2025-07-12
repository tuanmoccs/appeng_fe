import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.WHITE,
    flex: 1,
    marginRight: 12,
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  timerWarning: {
    color: COLORS.WARNING,
  },
  progressContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.GRAY,
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  questionContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  navButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  prevButton: {
    backgroundColor: COLORS.GRAY,
  },
  nextButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  submitButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY + "50",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  disabledButtonText: {
    color: COLORS.TEXT_TERTIARY,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
  scoreContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  resultStats: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  resultActions: {
    gap: 12,
  },
  chatBotButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  chatBotButtonText : {
    fontSize: 20,
  }
})