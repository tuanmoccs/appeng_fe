"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native"
import { COLORS } from "../constants/colors"
import { getTests } from "../services/testService"
import type { Test } from "../services/testService"

const TestScreen = ({ navigation }: any) => {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTests()
      setTests(data)
    } catch (err: any) {
      console.error("Error fetching tests:", err)
      setError(err.message || "Không thể tải danh sách test")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchTests()
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const handleTestPress = (test: Test) => {
    if (!test.is_active) {
      Alert.alert("Test không khả dụng", "Test này hiện tại không thể thực hiện.")
      return
    }

    navigation.navigate("TestDetail", { testId: test.id })
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "placement":
        return "Đánh giá trình độ"
      case "achievement":
        return "Kiểm tra thành tích"
      case "practice":
        return "Luyện tập"
      default:
        return "Test"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "placement":
        return COLORS.PRIMARY
      case "achievement":
        return COLORS.SUCCESS
      case "practice":
        return COLORS.WARNING
      default:
        return COLORS.GRAY
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải danh sách test...</Text>
      </View>
    )
  }

  if (error && tests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTests}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bài kiểm tra</Text>
        <Text style={styles.headerSubtitle}>Kiểm tra kết quả học tập thông qua những bài kiểm tra thú vị</Text>
      </View>

      {tests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có test nào</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTests}>
            <Text style={styles.retryButtonText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.testCard, !item.is_active && styles.inactiveCard]}
              onPress={() => handleTestPress(item)}
              disabled={!item.is_active}
            >
              <View style={styles.testHeader}>
                <View style={styles.testTitleContainer}>
                  <Text style={[styles.testTitle, !item.is_active && styles.inactiveText]}>{item.title}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + "20" }]}>
                    <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>{getTypeText(item.type)}</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.testDescription, !item.is_active && styles.inactiveText]}>{item.description}</Text>

              <View style={styles.testMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>📝 Số câu hỏi:</Text>
                  <Text style={styles.metaValue}>{item.total_questions}</Text>
                </View>

                {item.time_limit && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>⏱️ Thời gian:</Text>
                    <Text style={styles.metaValue}>{item.time_limit} phút</Text>
                  </View>
                )}

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>🎯 Điểm đạt:</Text>
                  <Text style={styles.metaValue}>{item.passing_score}%</Text>
                </View>
              </View>

              <View style={styles.testFooter}>
                <Text style={[styles.statusText, { color: item.is_active ? COLORS.SUCCESS : COLORS.ERROR }]}>
                  {item.is_active ? "✅ Có thể thực hiện" : "❌ Không khả dụng"}
                </Text>

                {item.is_active && (
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>Bắt đầu →</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  testCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  testHeader: {
    marginBottom: 12,
  },
  testTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  testDescription: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
    lineHeight: 22,
  },
  testMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
    minWidth: 100,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  testFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  inactiveText: {
    color: COLORS.TEXT_TERTIARY,
  },
})

export default TestScreen
