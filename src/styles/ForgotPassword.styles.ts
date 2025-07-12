import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
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
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    marginTop: 16,
  },
  backButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  backButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  successText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
})