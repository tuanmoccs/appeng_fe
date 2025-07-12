"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native"
import { COLORS } from "../constants/colors.ts"
import { styles } from "../styles/TestScreen.styles"
import { getTests, getUserTestResults} from "../services/testService"
import type { Test, UserTestResult } from "../types/test"

const TestScreen = ({ navigation }: any) => {
  const [tests, setTests] = useState<Test[]>([]) // Danh sách các bài test
  const [loading, setLoading] = useState(true)  
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestResults, setLatestResults] = useState<{ [testId: number]: UserTestResult }>({}) // Kết quả gần nhất của từng test

  const fetchLatestResults = async (testsData: Test[]) => {
    try {
      const results: { [testId: number]: UserTestResult } = {}

      // Lấy kết quả cho mỗi bài kiểm tra
      for (const test of testsData) {
        try {
          const userResults = await getUserTestResults(test.id)
          if (userResults && userResults.length > 0) {
            // Lấy kết quả mới nhất
            results[test.id] = userResults[0]
          }
        } catch (error) {
          // Bỏ qua nếu không tìm thấy kết quả cho bài kiểm tra này
          console.log(`No results found for test ${test.id}`)
        }
      }

      setLatestResults(results)
    } catch (error) {
      console.error("Error fetching latest results:", error)
    }
  }

  const fetchTests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTests()
      setTests(data)

      // Lấy kết quả mới nhất cho mỗi bài kiểm tra
      await fetchLatestResults(data)
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
    fetchTests() // Tự động load dữ liệu khi vào màn hình
  }, [])

  const handleTestPress = (test: Test) => {
    if (!test.is_active) {
      Alert.alert("Test không khả dụng", "Test này hiện tại không thể thực hiện.")
      return
    }

    navigation.navigate("TestDetail", { testId: test.id }) // Chuyển đến màn hình làm test
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
                  <Text style={styles.metaLabel}>🎯 Điểm cần đạt: </Text>
                  <Text style={styles.metaValue}>{item.passing_score} %</Text>
                </View>
              </View>

              {/* Latest Result Section */}
              {latestResults[item.id] && (
                <View style={styles.latestResultContainer}>
                  <Text style={styles.latestResultTitle}>Kết quả gần nhất:</Text>
                  <View style={styles.resultInfo}>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Điểm:</Text>
                      <Text
                        style={[
                          styles.resultScore,
                          { color: getScoreColor(latestResults[item.id].score, item.passing_score) },
                        ]}
                      >
                        {latestResults[item.id].score}%
                      </Text>
                    </View>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Đúng:</Text>
                      <Text style={styles.resultValue}>
                        {latestResults[item.id].correct_answers}/{latestResults[item.id].total_questions}
                      </Text>
                    </View>
                    {/* <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Trạng thái:</Text>
                      <Text
                        style={[
                          styles.resultStatus,
                          { color: latestResults[item.id].passed ? COLORS.SUCCESS : COLORS.ERROR },
                        ]}
                      >
                        {latestResults[item.id].passed ? "Đạt" : "Chưa đạt"}
                      </Text>
                    </View> */}
                  </View>
                  <Text style={styles.resultDate}>{formatDate(latestResults[item.id].created_at)}</Text>
                </View>
              )}

              <View style={styles.testFooter}>
                <Text style={[styles.statusText, { color: item.is_active ? COLORS.SUCCESS : COLORS.ERROR }]}>
                  {item.is_active ? "✅ Có thể thực hiện" : "❌ Không khả dụng"}
                </Text>

                {item.is_active && (
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>{latestResults[item.id] ? "Làm lại →" : "Bắt đầu →"}</Text>
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

export default TestScreen
