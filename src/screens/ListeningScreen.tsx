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
import type { ListeningTest, UserListeningResult } from "../types/listeningtest"
import { styles } from "../styles/ListeningScreen.styles"
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
export default ListeningScreen
