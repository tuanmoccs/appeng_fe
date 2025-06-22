"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native"
import { COLORS } from "../constants/colors"
import { getListeningTests } from "../services/listeningtestService"
import type { ListeningTest } from "../services/listeningtestService"

const ListeningScreen = ({ navigation }: any) => {
  const [tests, setTests] = useState<ListeningTest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const testsData = await getListeningTests()
      setTests(testsData)
    } catch (error: any) {
      Alert.alert("Lỗi", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTests()
    setRefreshing(false)
  }

  const handleTestPress = (test: ListeningTest) => {
    navigation.navigate("ListeningDetail", { testId: test.id })
  }

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case "placement":
        return "Kiểm tra trình độ"
      case "achievement":
        return "Kiểm tra thành tích"
      case "practice":
        return "Luyện tập"
      default:
        return "Listening Test"
    }
  }

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case "placement":
        return COLORS.WARNING
      case "achievement":
        return COLORS.SUCCESS
      case "practice":
        return COLORS.PRIMARY
      default:
        return COLORS.GRAY
    }
  }

  const renderTestItem = ({ item }: { item: ListeningTest }) => (
    <TouchableOpacity style={styles.testCard} onPress={() => handleTestPress(item)} activeOpacity={0.7}>
      <View style={styles.testHeader}>
        <Text style={styles.testTitle}>{item.title}</Text>
        <View style={[styles.testTypeBadge, { backgroundColor: getTestTypeColor(item.type) + "20" }]}>
          <Text style={[styles.testTypeText, { color: getTestTypeColor(item.type) }]}>
            {getTestTypeLabel(item.type)}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.testDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.testInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Câu hỏi:</Text>
          <Text style={styles.infoValue}>{item.total_questions}</Text>
        </View>
        {item.time_limit && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoValue}>{item.time_limit} phút</Text>
          </View>
        )}
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Điểm đạt:</Text>
          <Text style={styles.infoValue}>{item.passing_score}%</Text>
        </View>
      </View>

      <View style={styles.testFooter}>
        <Text style={styles.startButton}>Bắt đầu →</Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải listening tests...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Listening Tests</Text>
        <Text style={styles.headerSubtitle}>Luyện tập kỹ năng nghe tiếng Anh</Text>
      </View>

      {tests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có listening test nào</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchTests}>
            <Text style={styles.refreshButtonText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tests}
          renderItem={renderTestItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE + "CC",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  testCard: {
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
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  testTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  testDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  testInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  testFooter: {
    alignItems: "flex-end",
  },
  startButton: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ListeningScreen
