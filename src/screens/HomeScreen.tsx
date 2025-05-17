// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import Button from "../components/Button";

const HomeScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Language Learning App</Text>
        <Text style={styles.subtitle}>Expand your vocabulary today!</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Learn New Words</Text>
          <Text style={styles.cardDescription}>
            Browse through our vocabulary list and learn new words with translations and examples.
          </Text>
          <Button title="View Words" onPress={() => navigation.navigate("WordsTab")} style={styles.button} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Take Lessons</Text>
          <Text style={styles.cardDescription}>
            Follow structured lessons to improve your language skills step by step.
          </Text>
          <Button title="Go to Lessons" onPress={() => navigation.navigate("LessonsTab")} style={styles.button} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Your Knowledge</Text>
          <Text style={styles.cardDescription}>Challenge yourself with quizzes to reinforce what you've learned.</Text>
          <Button title="Try Quizzes" onPress={() => navigation.navigate("QuizzesTab")} style={styles.button} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  cardContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  button: {
    alignSelf: "flex-start",
  },
});

export default HomeScreen;