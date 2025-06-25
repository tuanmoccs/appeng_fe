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
import { getListeningTests, getUserListeningResults } from "../services/listeningtestService"
import type { ListeningTest, UserListeningResult } from "../services/listeningtestService"

const ListeningScreen = ({ navigation }: any) => {
  const [tests, setTests] = useState<ListeningTest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [latestResults, setLatestResults] = useState<{ [testId: number]: UserListeningResult }>({})

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const testsData = await getListeningTests()
      setTests(testsData)

      // Fetch latest results for each test
      await fetchLatestResults(testsData)
    } catch (error: any) {
      Alert.alert("Lỗi", error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestResults = async (testsData: ListeningTest[]) => {
    try {
      const results: { [testId: number]: UserListeningResult } = {}

      // Fetch results for each test
      for (const test of testsData) {
        try {
          const userResults = await getUserListeningResults(test.id)
          if (userResults && userResults.length > 0) {
            // Get the latest result (first one since they're ordered by created_at desc)
            results[test.id] = userResults[0]
          }
        } catch (error) {
          // Skip if no results found for this test
          console.log(`No results found for test ${test.id}`)
        }
      }

      setLatestResults(results)
    } catch (error) {
      console.error("Error fetching latest results:", error)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) {
      return COLORS.SUCCESS
    } else if (score >= passingScore * 0.7) {
      return COLORS.WARNING
    } else {
      return COLORS.ERROR
    }
  }

  const renderTestItem = ({ item }: { item: ListeningTest }) => {
    const latestResult = latestResults[item.id]

    return (
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
          {/* <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Câu hỏi:</Text>
            <Text style={styles.infoValue}>{item.total_questions}</Text>
          </View> */}
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

        {/* Latest Result Section */}
        {latestResult && (
          <View style={styles.latestResultContainer}>
            <Text style={styles.latestResultTitle}>Kết quả gần nhất:</Text>
            <View style={styles.resultInfo}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Điểm:</Text>
                <Text style={[styles.resultScore, { color: getScoreColor(latestResult.score, item.passing_score) }]}>
                  {latestResult.score}%
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Đúng:</Text>
                <Text style={styles.resultValue}>
                  {latestResult.correct_answers}/{latestResult.total_questions}
                </Text>
              </View>
              {/* <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Trạng thái:</Text>
                <Text style={[styles.resultStatus, { color: latestResult.passed ? COLORS.SUCCESS : COLORS.ERROR }]}>
                  {latestResult.passed ? "Đạt" : "Chưa đạt"}
                </Text>
              </View> */}
            </View>
            <Text style={styles.resultDate}>{formatDate(latestResult.created_at)}</Text>
          </View>
        )}

        <View style={styles.testFooter}>
          <Text style={styles.startButton}>{latestResult ? "Làm lại →" : "Bắt đầu →"}</Text>
        </View>
      </TouchableOpacity>
    )
  }

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
  latestResultContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  latestResultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  resultInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultItem: {
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  resultScore: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultDate: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    textAlign: "center",
    fontStyle: "italic",
  },
})

export default ListeningScreen
