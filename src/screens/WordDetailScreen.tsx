// src/screens/WordDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/colors";
import Button from "../components/Button";
import { getWordById } from "../services/wordService";
import { Word } from "../types/lesson";
import { styles } from "../styles/WordDetailScreen.styles";
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

export default WordDetailScreen;