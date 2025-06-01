// "use client"

// // src/screens/LessonDetailScreen.tsx
// import { useState, useEffect } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Dimensions,
// } from "react-native"
// import { COLORS } from "../constants/colors"
// import Button from "../components/Button"
// import { getLessonById, updateLessonProgress, completeLesson } from "../services/lessonService"
// import type { Lesson, LessonItem } from "../services/lessonService"

// const { width } = Dimensions.get("window")

// const LessonDetailScreen = ({ route, navigation }: any) => {
//   const { lessonId } = route.params
//   const [lesson, setLesson] = useState<Lesson | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [currentSection, setCurrentSection] = useState(0)
//   const [currentItem, setCurrentItem] = useState(0)
//   const [showMeaning, setShowMeaning] = useState(false)
//   const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

//   useEffect(() => {
//     fetchLesson()
//   }, [lessonId])

//   const fetchLesson = async () => {
//     try {
//       setLoading(true)
//       const lessonData = await getLessonById(lessonId)
//       setLesson(lessonData)
//       setCurrentSection(lessonData.current_section || 0)
//       setCurrentItem(lessonData.current_item || 0)
//     } catch (error: any) {
//       Alert.alert("Lỗi", "Không thể tải bài học")
//       navigation.goBack()
//     } finally {
//       setLoading(false)
//     }
//   }

//   const calculateProgress = () => {
//     if (!lesson?.content?.sections) return 0

//     let totalItems = 0
//     let completedCount = 0

//     lesson.content.sections.forEach((section, sectionIndex) => {
//       section.items.forEach((item, itemIndex) => {
//         totalItems++
//         const itemKey = `${sectionIndex}-${itemIndex}`
//         if (
//           completedItems.has(itemKey) ||
//           sectionIndex < currentSection ||
//           (sectionIndex === currentSection && itemIndex < currentItem)
//         ) {
//           completedCount++
//         }
//       })
//     })

//     return totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
//   }

//   const updateProgress = async () => {
//     if (!lesson) return

//     const progress = calculateProgress()
//     try {
//       await updateLessonProgress(lesson.id, progress, currentSection, currentItem)
//     } catch (error) {
//       console.error("Error updating progress:", error)
//     }
//   }

//   const handleNextItem = () => {
//     if (!lesson?.content?.sections) return

//     const currentSectionData = lesson.content.sections[currentSection]
//     const itemKey = `${currentSection}-${currentItem}`

//     // Mark current item as completed
//     setCompletedItems((prev) => new Set([...prev, itemKey]))

//     if (currentItem < currentSectionData.items.length - 1) {
//       // Next item in current section
//       setCurrentItem(currentItem + 1)
//     } else if (currentSection < lesson.content.sections.length - 1) {
//       // Next section
//       setCurrentSection(currentSection + 1)
//       setCurrentItem(0)
//     } else {
//       // Lesson completed
//       handleCompleteLesson()
//       return
//     }

//     setShowMeaning(false)
//     updateProgress()
//   }

//   const handlePreviousItem = () => {
//     if (currentItem > 0) {
//       setCurrentItem(currentItem - 1)
//     } else if (currentSection > 0) {
//       setCurrentSection(currentSection - 1)
//       const prevSectionData = lesson?.content?.sections[currentSection - 1]
//       if (prevSectionData) {
//         setCurrentItem(prevSectionData.items.length - 1)
//       }
//     }
//     setShowMeaning(false)
//     updateProgress()
//   }

//   const handleCompleteLesson = async () => {
//     if (!lesson) return

//     try {
//       const result = await completeLesson(lesson.id)

//       Alert.alert("🎉 Chúc mừng!", "Bạn đã hoàn thành bài học!", [
//         {
//           text: "Tiếp tục",
//           onPress: () => navigation.goBack(),
//         },
//       ])

//       // Show achievements if any
//       if (result.achievements && result.achievements.length > 0) {
//         setTimeout(() => {
//           result.achievements.forEach((achievement: any) => {
//             Alert.alert("🏆 Thành tích mới!", `${achievement.title}\n${achievement.description}`)
//           })
//         }, 1000)
//       }
//     } catch (error: any) {
//       Alert.alert("Lỗi", "Không thể hoàn thành bài học")
//     }
//   }

//   const getCurrentItem = (): LessonItem | null => {
//     if (!lesson?.content?.sections) return null
//     const section = lesson.content.sections[currentSection]
//     return section?.items[currentItem] || null
//   }

//   const getLevelColor = (level: string) => {
//     switch (level) {
//       case "beginner":
//         return COLORS.SUCCESS
//       case "intermediate":
//         return COLORS.WARNING
//       case "advanced":
//         return COLORS.ERROR
//       default:
//         return COLORS.PRIMARY
//     }
//   }

//   const getLevelText = (level: string) => {
//     switch (level) {
//       case "beginner":
//         return "Cơ bản"
//       case "intermediate":
//         return "Trung cấp"
//       case "advanced":
//         return "Nâng cao"
//       default:
//         return "Cơ bản"
//     }
//   }

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color={COLORS.PRIMARY} />
//       </View>
//     )
//   }

//   if (!lesson) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>Không tìm thấy bài học</Text>
//         <Button title="Quay lại" onPress={() => navigation.goBack()} />
//       </View>
//     )
//   }

//   const currentItemData = getCurrentItem()
//   const progress = calculateProgress()
//   const totalSections = lesson.content?.sections.length || 0
//   const totalItems = lesson.content?.sections.reduce((sum, section) => sum + section.items.length, 0) || 0
//   const currentItemNumber =
//     (lesson.content?.sections?.slice(0, currentSection).reduce(
//         (sum, section) => sum + (section.items?.length ?? 0),
//         0
//     ) ?? 0) + currentItem + 1;


//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Text style={styles.backButtonText}>← Quay lại</Text>
//         </TouchableOpacity>
//         <View style={styles.headerInfo}>
//           <Text style={styles.lessonTitle}>{lesson.title}</Text>
//           <View style={[styles.levelBadge, { backgroundColor: getLevelColor(lesson.level) + "20" }]}>
//             <Text style={[styles.levelText, { color: getLevelColor(lesson.level) }]}>{getLevelText(lesson.level)}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Progress Bar */}
//       <View style={styles.progressContainer}>
//         <View style={styles.progressInfo}>
//           <Text style={styles.progressText}>
//             {currentItemNumber}/{totalItems} • {progress}%
//           </Text>
//           <Text style={styles.sectionText}>
//             Phần {currentSection + 1}/{totalSections}: {lesson.content?.sections[currentSection]?.title}
//           </Text>
//         </View>
//         <View style={styles.progressBar}>
//           <View style={[styles.progressFill, { width: `${progress}%` }]} />
//         </View>
//       </View>

//       {/* Content */}
//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         {currentItemData && (
//           <View style={styles.itemCard}>
//             <View style={styles.wordContainer}>
//               <Text style={styles.word}>{currentItemData.word}</Text>
//               <TouchableOpacity style={styles.showMeaningButton} onPress={() => setShowMeaning(!showMeaning)}>
//                 <Text style={styles.showMeaningButtonText}>{showMeaning ? "Ẩn nghĩa" : "Hiện nghĩa"}</Text>
//               </TouchableOpacity>
//             </View>

//             {showMeaning && (
//               <View style={styles.meaningContainer}>
//                 <Text style={styles.meaning}>{currentItemData.meaning}</Text>
//               </View>
//             )}

//             <View style={styles.exampleContainer}>
//               <Text style={styles.exampleLabel}>Ví dụ:</Text>
//               <Text style={styles.example}>{currentItemData.example}</Text>
//             </View>
//           </View>
//         )}

//         {/* Navigation Buttons */}
//         <View style={styles.navigationContainer}>
//           <TouchableOpacity
//             style={[
//               styles.navButton,
//               styles.prevButton,
//               currentSection === 0 && currentItem === 0 && styles.disabledButton,
//             ]}
//             onPress={handlePreviousItem}
//             disabled={currentSection === 0 && currentItem === 0}
//           >
//             <Text
//               style={[styles.navButtonText, currentSection === 0 && currentItem === 0 && styles.disabledButtonText]}
//             >
//               ← Trước
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNextItem}>
//             <Text style={styles.navButtonText}>
//               {currentSection === totalSections - 1 &&
//               currentItem === (lesson.content?.sections[currentSection]?.items.length || 1) - 1
//                 ? "Hoàn thành"
//                 : "Tiếp theo →"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.BACKGROUND,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: COLORS.BACKGROUND,
//     padding: 20,
//   },
//   header: {
//     backgroundColor: COLORS.PRIMARY,
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//   },
//   backButton: {
//     marginBottom: 16,
//   },
//   backButtonText: {
//     color: COLORS.WHITE,
//     fontSize: 16,
//   },
//   headerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   lessonTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: COLORS.WHITE,
//     flex: 1,
//     marginRight: 12,
//   },
//   levelBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   levelText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   progressContainer: {
//     backgroundColor: COLORS.WHITE,
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.BORDER,
//   },
//   progressInfo: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   progressText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.PRIMARY,
//   },
//   sectionText: {
//     fontSize: 14,
//     color: COLORS.TEXT_SECONDARY,
//   },
//   progressBar: {
//     height: 8,
//     backgroundColor: COLORS.GRAY,
//     borderRadius: 4,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: COLORS.PRIMARY,
//     borderRadius: 4,
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   itemCard: {
//     backgroundColor: COLORS.WHITE,
//     borderRadius: 16,
//     padding: 24,
//     marginBottom: 24,
//     shadowColor: COLORS.BLACK,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   wordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   word: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: COLORS.TEXT_PRIMARY,
//     flex: 1,
//   },
//   showMeaningButton: {
//     backgroundColor: COLORS.PRIMARY + "20",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   showMeaningButtonText: {
//     color: COLORS.PRIMARY,
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   meaningContainer: {
//     backgroundColor: COLORS.PRIMARY_LIGHT + "10",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   meaning: {
//     fontSize: 24,
//     fontWeight: "600",
//     color: COLORS.PRIMARY,
//     textAlign: "center",
//   },
//   exampleContainer: {
//     backgroundColor: COLORS.CARD_BACKGROUND,
//     padding: 16,
//     borderRadius: 12,
//   },
//   exampleLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.TEXT_SECONDARY,
//     marginBottom: 8,
//   },
//   example: {
//     fontSize: 18,
//     color: COLORS.TEXT_PRIMARY,
//     lineHeight: 26,
//     fontStyle: "italic",
//   },
//   navigationContainer: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   navButton: {
//     flex: 1,
//     height: 50,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   prevButton: {
//     backgroundColor: COLORS.GRAY,
//   },
//   nextButton: {
//     backgroundColor: COLORS.PRIMARY,
//   },
//   disabledButton: {
//     backgroundColor: COLORS.GRAY + "50",
//   },
//   navButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.WHITE,
//   },
//   disabledButtonText: {
//     color: COLORS.TEXT_TERTIARY,
//   },
//   errorText: {
//     fontSize: 16,
//     color: COLORS.ERROR,
//     textAlign: "center",
//     marginBottom: 20,
//   },
// })

// export default LessonDetailScreen
