// src/screens/WordListScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { COLORS } from "../constants/colors";
import WordCard from "../components/WordCard";
import Button from "../components/Button";
import { getWords } from "../services/wordService";
import { Word } from "../types/lesson";
import { styles } from "../styles/WordListScreen.styles";
const WordListScreen = ({ navigation }: any) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWords();
      setWords(data);
    } catch (err) {
      console.error("Error fetching words:", err);
      setError("Failed to load words. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWords();
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleWordPress = (word: Word) => {
    navigation.navigate("WordDetail", { wordId: word.id });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={fetchWords} type="primary" style={styles.button} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vocabulary List</Text>

      {words.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No words found</Text>
          <Button title="Refresh" onPress={fetchWords} type="primary" style={styles.button} />
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <WordCard
              word={item.word}
              translation={item.translation}
              pronunciation={item.pronunciation}
              imageUrl={item.image_url}
              onPress={() => handleWordPress(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />}
        />
      )}
    </View>
  );
};

export default WordListScreen;