// src/components/WordCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";

interface WordCardProps {
  word: string;
  translation: string;
  pronunciation?: string;
  imageUrl?: string;
  onPress?: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ 
  word, 
  translation, 
  pronunciation, 
  imageUrl, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={onPress ? 0.7 : 1}
    >
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.word}>{word}</Text>

        {pronunciation && (
          <Text style={styles.pronunciation}>/{pronunciation}/</Text>
        )}

        <Text style={styles.translation}>{translation}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 150,
  },
  contentContainer: {
    padding: 16,
  },
  word: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 14,
    fontStyle: "italic",
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 8,
  },
  translation: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default WordCard;