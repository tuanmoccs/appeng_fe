"use client"

// src/screens/ProfileScreen.tsx
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { COLORS } from "../constants/colors"
import Button from "../components/Button"
import StatCard from "../components/StatCard"
import AchievementCard from "../components/AchievementCard"
import { logout } from "../store/slices/authSlice"
import { updateProfile, changePassword, getUserStats, getUserAchievements } from "../services/profileService"
import type { RootState, AppDispatch } from "../store/store"
import type { UserStats, Achievement, ChangePasswordData } from "../services/profileService"

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)

  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  // Edit profile modal
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editName, setEditName] = useState(user?.name || "")
  const [editLoading, setEditLoading] = useState(false)

  // Change password modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [statsData, achievementsData] = await Promise.all([getUserStats(), getUserAchievements()])
      setStats(statsData)
      setAchievements(achievementsData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setEditLoading(true)
      await updateProfile({ name: editName })
      Alert.alert("Thành công", "Cập nhật thông tin thành công")
      setEditModalVisible(false)
      // Refresh user data
      // You might want to update the user in Redux store here
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể cập nhật thông tin")
    } finally {
      setEditLoading(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.new_password_confirmation) {
        Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp")
        return
      }

      setPasswordLoading(true)
      await changePassword(passwordData)
      Alert.alert("Thành công", "Đổi mật khẩu thành công")
      setPasswordModalVisible(false)
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      })
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể đổi mật khẩu")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: () => dispatch(logout()) },
    ])
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={user?.avatar ? { uri: user.avatar } : require("../assets/images/th.jpg")}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Text style={styles.editAvatarText}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setEditModalVisible(true)}>
            <Text style={styles.actionButtonText}>✏️ Sửa thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setPasswordModalVisible(true)}>
            <Text style={styles.actionButtonText}>🔒 Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Thống kê học tập</Text>
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <StatCard
                  title="Bài học hoàn thành"
                  value={stats.total_lessons_completed}
                  icon="📚"
                  color={COLORS.PRIMARY}
                />
              </View>
              <View style={styles.statItem}>
                <StatCard title="Quiz đã làm" value={stats.total_quizzes_completed} icon="✏️" color={COLORS.SECONDARY} />
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <StatCard title="Từ vựng đã học" value={stats.total_words_learned} icon="📝" color={COLORS.SUCCESS} />
              </View>
              <View style={styles.statItem}>
                <StatCard
                  title="Streak hiện tại"
                  value={`${stats.current_streak} ngày`}
                  icon="🔥"
                  color={COLORS.WARNING}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Thành tích</Text>
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              achievedAt={achievement.achieved_at}
              type={achievement.achievement_type}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có thành tích nào</Text>
            <Text style={styles.emptySubtext}>Hãy hoàn thành các bài học để nhận thành tích!</Text>
          </View>
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <Button title="Đăng xuất" onPress={handleLogout} type="outline" style={styles.logoutButton} />
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa thông tin</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tên</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập tên của bạn"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                value={passwordData.current_password}
                onChangeText={(text) => setPasswordData({ ...passwordData, current_password: text })}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={passwordData.new_password}
                onChangeText={(text) => setPasswordData({ ...passwordData, new_password: text })}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={passwordData.new_password_confirmation}
                onChangeText={(text) => setPasswordData({ ...passwordData, new_password_confirmation: text })}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator size="small" color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
  },
  profileHeader: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 20,
  },
  profileActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: COLORS.WHITE + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.WHITE + "40",
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsGrid: {
    gap: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
    textAlign: "center",
  },
  logoutButton: {
    borderColor: COLORS.ERROR,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  cancelButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ProfileScreen
