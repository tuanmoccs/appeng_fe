// src/screens/WordDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/colors";
import Button from "../components/Button";
import { getWordById } from "../services/wordService";
import { Word } from "../types/lesson";

const WordDetailScreen = ({ route, navigation }: any) => {
  const { wordId } = route.params;
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWordById(wordId);
        setWord(data);
      } catch (err) {
        console.error("Error fetching word details:", err);
        setError("Failed to load word details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWordDetails();
  }, [wordId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error || !word) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Word not found"}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} type="primary" style={styles.button} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {word.image_url && <Image source={{ uri: word.image_url }} style={styles.image} resizeMode="cover" />}

      <View style={styles.wordContainer}>
        <Text style={styles.word}>{word.word}</Text>
        {word.pronunciation && <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>}
      </View>

      <View style={styles.translationContainer}>
        <Text style={styles.translationLabel}>Translation:</Text>
        <Text style={styles.translation}>{word.translation}</Text>
      </View>

      {word.example_sentence && (
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleLabel}>Example:</Text>
          <Text style={styles.example}>{word.example_sentence}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Back to Words" onPress={() => navigation.goBack()} type="outline" style={styles.button} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

export default WordDetailScreen;