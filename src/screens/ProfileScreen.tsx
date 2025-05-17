// src/screens/ProfileScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello from ProfileScreen!</Text>
      <Text style={styles.subtitle}>Here you would display user profile information.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
});

export default ProfileScreen;