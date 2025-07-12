import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.8,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  quickStats: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  mainActions: {
    padding: 20,
    paddingTop: 10,
  },
  primaryCard: {
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
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY_LIGHT + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  cardArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontWeight: "bold",
  },
  secondaryCards: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.SECONDARY + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryCardIconText: {
    fontSize: 20,
  },
  secondaryCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
  },
  secondaryCardDescription: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 16,
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