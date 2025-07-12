import { COLORS } from "../constants/colors"
import { StyleSheet } from "react-native"
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
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  testCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  testHeader: {
    marginBottom: 12,
  },
  testTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  testDescription: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
    lineHeight: 22,
  },
  testMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
    minWidth: 100,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  testFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  inactiveText: {
    color: COLORS.TEXT_TERTIARY,
  },
  latestResultContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  latestResultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  resultInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultItem: {
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  resultScore: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultDate: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    textAlign: "center",
    fontStyle: "italic",
  },
})