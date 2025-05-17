// src/components/Button.tsx
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  style?: object;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  type = "primary", 
  disabled = false, 
  style = {} 
}) => {
  // Determine button style based on type
  const getButtonStyle = () => {
    switch (type) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  // Determine text style based on type
  const getTextStyle = () => {
    switch (type) {
      case "primary":
      case "secondary":
        return styles.buttonTextLight;
      case "outline":
        return styles.buttonTextDark;
      default:
        return styles.buttonTextLight;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, getTextStyle(), disabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY,
    borderColor: COLORS.GRAY,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextLight: {
    color: COLORS.WHITE,
  },
  buttonTextDark: {
    color: COLORS.PRIMARY,
  },
  disabledText: {
    color: COLORS.TEXT_TERTIARY,
  },
});

export default Button;