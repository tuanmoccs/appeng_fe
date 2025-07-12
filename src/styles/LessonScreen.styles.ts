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
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressSection: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginRight: 12,
  },
  progressLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.GRAY,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  lessonsSection: {
    padding: 20,
    paddingTop: 10,
  },
  lessonCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedCard: {
    opacity: 0.6,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: COLORS.SUCCESS + "30",
  },
  lessonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  lessonNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lessonNumberText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
  lessonInfo: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  lessonDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  duration: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
  },
  progress: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: "500",
  },
  contentInfo: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
  },
  lessonProgressBar: {
    height: 4,
    backgroundColor: COLORS.GRAY,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  lessonProgressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
  lockedText: {
    color: COLORS.TEXT_TERTIARY,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontWeight: "bold",
  },
  tipsSection: {
    padding: 20,
    paddingTop: 10,
  },
  tipCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
})
