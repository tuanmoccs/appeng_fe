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
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
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
  lessonTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    flex: 1,
    marginRight: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.GRAY,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  word: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  showMeaningButton: {
    backgroundColor: COLORS.PRIMARY + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  showMeaningButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  meaningContainer: {
    backgroundColor: COLORS.PRIMARY_LIGHT + "10",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  meaning: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.PRIMARY,
    textAlign: "center",
  },
  exampleContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: 16,
    borderRadius: 12,
  },
  exampleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  example: {
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 26,
    fontStyle: "italic",
  },
  navigationContainer: {
    flexDirection: "row",
    gap: 12,
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
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: "center",
    marginBottom: 20,
  },
})