import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
  },
  profileHeader: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 20,
  },
  profileActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: COLORS.WHITE + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.WHITE + "40",
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsGrid: {
    gap: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
    textAlign: "center",
  },
  logoutButton: {
    borderColor: COLORS.ERROR,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  cancelButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
})