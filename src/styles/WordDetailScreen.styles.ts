import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  wordContainer: {
    marginBottom: 20,
  },
  word: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 16,
    fontStyle: "italic",
    color: COLORS.TEXT_TERTIARY,
  },
  translationContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
  },
  translationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  translation: {
    fontSize: 20,
    color: COLORS.TEXT_PRIMARY,
  },
  exampleContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
  },
  exampleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  example: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontStyle: "italic",
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    width: "100%",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    marginBottom: 16,
    textAlign: "center",
  },
});