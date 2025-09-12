// screens/VoiceChatScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { Message, ChatState } from '../types/voicechat';
import { OPENAI_API_KEY } from "../constants/config";

const VoiceChatScreen: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Replace with your actual OpenAI API key
  const API_KEY = OPENAI_API_KEY;

  const {
    state,
    conversation,
    recognizedText,
    isInitialized,
    isListening,
    isLoading,
    isSpeaking,
    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
  } = useVoiceChat({ openAIApiKey: API_KEY });

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation]);

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusText = (): string => {
     if (!isInitialized) return '🔄 Initializing services...';
    switch (state) {
      case ChatState.LISTENING:
        return '🎤 Listening...';
      case ChatState.PROCESSING:
        return '🤖 AI is thinking...';
      case ChatState.SPEAKING:
        return '🔊 AI is speaking...';
      default:
        return 'Ready to chat!';
    }
  };

  const renderMessage = (message: Message, index: number) => (
    <View
      key={`${index}-${message.timestamp.getTime()}`}
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageRole,
          { color: message.role === 'user' ? '#ffffff' : '#666666' },
        ]}
      >
        {message.role === 'user' ? 'You' : 'AI Assistant'}
      </Text>
      <Text
        style={[
          styles.messageText,
          { color: message.role === 'user' ? '#ffffff' : '#333333' },
        ]}
      >
        {message.content}
      </Text>
      <Text
        style={[
          styles.messageTime,
          { color: message.role === 'user' ? '#ffffff99' : '#999999' },
        ]}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Voice Chat with AI</Text>

      {/* Conversation History */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.conversationContainer}
        showsVerticalScrollIndicator={false}
      >
        {conversation.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Start your conversation by tapping the microphone below!
            </Text>
          </View>
        ) : (
          conversation.map(renderMessage)
        )}
      </ScrollView>

      {/* Current Recognition */}
      {recognizedText ? (
        <View style={styles.recognitionContainer}>
          <Text style={styles.recognitionLabel}>🎤 You said:</Text>
          <Text style={styles.recognitionText}>{recognizedText}</Text>
        </View>
      ) : null}

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        ) : (
          <Text
            style={[
              state === ChatState.IDLE ? styles.statusTextIdle : styles.statusText,
            ]}
          >
            {getStatusText()}
          </Text>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.clearButton]}
          onPress={clearConversation}
          disabled={conversation.length === 0}
        >
          <Text style={styles.controlButtonText}>🗑️</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening && styles.micButtonActive,
              (isLoading || !isInitialized) && styles.micButtonDisabled,
            ]}
            onPress={isListening ? stopListening : startListening}
            disabled={isLoading || !isInitialized}
            activeOpacity={0.8}
          >
            <Text style={styles.micButtonText}>
               {!isInitialized ? '⏳' : (isListening ? '⏹️' : '🎤')} {/* <- Thêm này */}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.speakButton,
            !isSpeaking && styles.speakButtonDisabled,
          ]}
          onPress={stopSpeaking}
          disabled={!isSpeaking}
        >
          <Text style={styles.controlButtonText}>🔇</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        Tap the microphone and speak in English
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  conversationContainer: {
    flex: 1,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
    maxWidth: '85%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    backgroundColor: '#4A90E2',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderColor: '#e1e8ed',
    borderWidth: 1,
  },
  messageRole: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    textAlign: 'right',
  },
  recognitionContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  recognitionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  recognitionText: {
    fontSize: 16,
    color: '#856404',
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'center',
    minHeight: 30,
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 8,
  },
  statusTextIdle: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  micButtonActive: {
    backgroundColor: '#e74c3c',
  },
  micButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  micButtonText: {
    fontSize: 32,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clearButton: {
    backgroundColor: '#95a5a6',
  },
  speakButton: {
    backgroundColor: '#e74c3c',
  },
  speakButtonDisabled: {
    backgroundColor: '#ecf0f1',
  },
  controlButtonText: {
    fontSize: 20,
  },
  instructions: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 10,
  },
});

export default VoiceChatScreen;
