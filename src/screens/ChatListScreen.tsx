"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { chatService } from "../services/chatService"
import type { Conversation, Admin } from "../types/chat"

export default function ChatListScreen() {
  const navigation = useNavigation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAdmins, setShowAdmins] = useState(false)

  useEffect(() => {
    loadData()

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadConversations(), loadAdmins()])
    setLoading(false)
  }

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations()
      setConversations(data)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const loadAdmins = async () => {
    try {
      const data = await chatService.getAdmins()
      setAdmins(data)
    } catch (error) {
      console.error("Failed to load admins:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const startChat = async (admin: Admin) => {
    try {
      const { conversation_id } = await chatService.startConversation(admin.id)
      navigation.navigate("ChatDetail", { conversationId: conversation_id, admin })
      setShowAdmins(false)
    } catch (error) {
      console.error("Failed to start conversation:", error)
    }
  }

  const openConversation = (conversation: Conversation) => {
    navigation.navigate("ChatDetail", {
      conversationId: conversation.id,
      admin: conversation.admin,
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => openConversation(item)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.admin.avatar }} style={styles.avatar} />
        {item.admin.is_online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.adminName}>{item.admin.name}</Text>
          {item.last_message && <Text style={styles.timeText}>{formatTime(item.last_message.created_at)}</Text>}
        </View>
        {item.last_message ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message.is_mine ? "You: " : ""}
            {item.last_message.message}
          </Text>
        ) : (
          <Text style={styles.noMessages}>No messages yet</Text>
        )}
      </View>
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  const renderAdmin = ({ item }: { item: Admin }) => (
    <TouchableOpacity style={styles.adminItem} onPress={() => startChat(item)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.is_online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.adminInfo}>
        <Text style={styles.adminName}>{item.name}</Text>
        <Text style={styles.adminStatus}>{item.is_online ? "Online" : "Offline"}</Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton} onPress={() => setShowAdmins(!showAdmins)}>
          <Text style={styles.newChatButtonText}>{showAdmins ? "Show Chats" : "New Chat"}</Text>
        </TouchableOpacity>
      </View>

      {showAdmins ? (
        <FlatList
          data={admins}
          renderItem={renderAdmin}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No admins available</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Tap "New Chat" to start chatting with an admin</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  newChatButton: {
    backgroundColor: "#0084ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newChatButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    alignItems: "center",
  },
  adminItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  adminName: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 12,
    color: "#6c757d",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6c757d",
  },
  noMessages: {
    fontSize: 14,
    color: "#adb5bd",
    fontStyle: "italic",
  },
  unreadBadge: {
    backgroundColor: "#dc3545",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  adminInfo: {
    flex: 1,
  },
  adminStatus: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#6c757d",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#adb5bd",
  },
})
