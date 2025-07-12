import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ViewStyle,
  TextStyle,
  Keyboard,
  Dimensions,
} from "react-native"
import { COLORS } from "../constants/colors"
import openaiService from "../services/openaiService"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatBotProps {
  testData: any
  currentQuestionId?: number
  isVisible: boolean
  onClose: () => void
}

const ChatBot: React.FC<ChatBotProps> = ({ testData, currentQuestionId, isVisible, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const slideAnim = useRef(new Animated.Value(300)).current
  const textInputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (isVisible) {
      // Hiển thị chatbot
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()

      // Thêm tin nhắn chào mừng
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Xin chào! Tôi là AI assistant của bạn cho bài test "${testData.title}". Tôi có thể giúp bạn:\n\n• Giải thích ngữ pháp và từ vựng\n• Hướng dẫn cách làm bài\n• Phân tích câu hỏi\n• Đưa ra gợi ý học tập\n\nBạn có câu hỏi gì không?`,
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }
    } else {
      // Ẩn chatbot
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isVisible])

  useEffect(() => {
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  useEffect(() => {
    // Auto scroll to bottom when new message is added
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    // Blur input để ẩn keyboard sau khi gửi
    textInputRef.current?.blur()

    try {
      let response: string

      // Kiểm tra xem có phải câu hỏi về câu hỏi cụ thể không
      if (
        currentQuestionId &&
        (inputText.toLowerCase().includes("câu này") ||
          inputText.toLowerCase().includes("câu hỏi này") ||
          inputText.toLowerCase().includes("giải thích"))
      ) {
        response = await openaiService.analyzeQuestion(testData, currentQuestionId, inputText)
      } else {
        response = await openaiService.answerGeneralQuestion(testData, inputText)
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitEditing = () => {
    sendMessage()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[styles.messageContainer, message.role === "user" ? styles.userMessage : styles.assistantMessage]}
    >
      <Text
        style={[styles.messageText, message.role === "user" ? styles.userMessageText : styles.assistantMessageText]}
      >
        {message.content}
      </Text>
      <Text
        style={[styles.messageTime, message.role === "user" ? styles.userMessageTime : styles.assistantMessageTime]}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  )

  if (!isVisible) return null

  const screenHeight = Dimensions.get('window').height
  const chatContainerHeight = screenHeight * 0.7 - keyboardHeight

  return (
    <KeyboardAvoidingView 
      style={styles.overlay} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <Animated.View 
        style={[
          styles.chatContainer, 
          { 
            transform: [{ translateY: slideAnim }],
            height: chatContainerHeight,
            marginBottom: keyboardHeight 
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>🤖 AI Assistant</Text>
            <Text style={styles.headerSubtitle}>English Test Helper</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}

          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi AI về bài test..."
            placeholderTextColor={COLORS.TEXT_TERTIARY}
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  } as ViewStyle,
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  } as ViewStyle,
  chatContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.PRIMARY + "10",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  } as ViewStyle,
  headerLeft: {
    flex: 1,
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  } as TextStyle,
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  } as TextStyle,
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.GRAY + "30",
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  closeButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "bold",
  } as TextStyle,
  messagesContainer: {
    flex: 1,
  } as ViewStyle,
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  } as ViewStyle,
  messageContainer: {
    marginBottom: 12,
    maxWidth: "80%",
  } as ViewStyle,
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  } as ViewStyle,
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.GRAY + "20",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
  } as ViewStyle,
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  } as TextStyle,
  userMessageText: {
    color: COLORS.WHITE,
  } as TextStyle,
  assistantMessageText: {
    color: COLORS.TEXT_PRIMARY,
  } as TextStyle,
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  } as TextStyle,
  userMessageTime: {
    color: COLORS.WHITE + "80",
    textAlign: "right",
  } as TextStyle,
  assistantMessageTime: {
    color: COLORS.TEXT_TERTIARY,
  } as TextStyle,
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: "italic",
  } as TextStyle,
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  } as ViewStyle,
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: COLORS.TEXT_PRIMARY,
  } as TextStyle,
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  sendButtonDisabled: {
    backgroundColor: COLORS.GRAY,
  } as ViewStyle,
  sendButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  } as TextStyle,
})

export default ChatBot