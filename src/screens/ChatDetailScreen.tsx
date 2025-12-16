"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native"
import { useRoute, type RouteProp } from "@react-navigation/native"
import { chatService } from "../services/chatService"
import type { Message, Admin } from "../types/chat"

type ChatDetailRouteProp = RouteProp<{ ChatDetail: { conversationId: number; admin: Admin } }, "ChatDetail">

export default function ChatDetailScreen() {
  const route = useRoute<ChatDetailRouteProp>()
  const { conversationId, admin } = route.params

  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadMessages()

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [conversationId])

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages(conversationId)
      setMessages(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load messages:", error)
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return

    setSending(true)
    try {
      const newMessage = await chatService.sendMessage(conversationId, messageText.trim())
      setMessages([...messages, newMessage])
      setMessageText("")

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.is_mine ? styles.myMessageContainer : styles.theirMessageContainer]}>
      {!item.is_mine && <Image source={{ uri: item.sender.avatar }} style={styles.messageAvatar} />}
      <View style={styles.messageContent}>
        {!item.is_mine && <Text style={styles.senderName}>{item.sender.name}</Text>}
        <View style={[styles.messageBubble, item.is_mine ? styles.myMessage : styles.theirMessage]}>
          <Text style={item.is_mine ? styles.myMessageText : styles.theirMessageText}>{item.message}</Text>
        </View>
        <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: admin.avatar }} style={styles.headerAvatar} />
          {admin.is_online && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{admin.name}</Text>
          <Text style={styles.headerStatus}>{admin.is_online ? "Online" : "Offline"}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>{sending ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerStatus: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  theirMessageContainer: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: "#0084ff",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: "#e4e6eb",
    borderBottomLeftRadius: 4,
  },
  myMessageText: {
    color: "#fff",
    fontSize: 15,
  },
  theirMessageText: {
    color: "#050505",
    fontSize: 15,
  },
  messageTime: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 4,
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#adb5bd",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#adb5bd",
  },
})
