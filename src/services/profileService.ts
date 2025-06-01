import api from "./api"
import { ENDPOINTS } from "../constants/apiEndpoints"

export interface UpdateProfileData {
  name?: string
  avatar?: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface UserStats {
  words_learned: number
  lessons_completed: number
  quizzes_completed: number
  streak_days: number
  last_activity_at: string | null
  // Computed fields for display
  total_lessons_completed: number
  total_quizzes_completed: number
  total_words_learned: number
  current_streak: number
  total_points?: number
  learning_days?: number
}

export interface Achievement {
  id: number
  achievement_type: string
  title: string
  description: string
  achieved_at: string
}

export const updateProfile = async (data: UpdateProfileData) => {
  try {
    const response = await api.put(ENDPOINTS.UPDATE_PROFILE, data)
    return response.data
  } catch (error) {
    console.error("Update profile failed:", error)
    throw error
  }
}

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const response = await api.post(ENDPOINTS.CHANGE_PASSWORD, data)
    return response.data
  } catch (error) {
    console.error("Change password failed:", error)
    throw error
  }
}

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await api.get(ENDPOINTS.USER_STATS)
    const stats = response.data.stats

    // Map backend fields to frontend expected fields
    return {
      words_learned: stats.words_learned || 0,
      lessons_completed: stats.lessons_completed || 0,
      quizzes_completed: stats.quizzes_completed || 0,
      streak_days: stats.streak_days || 0,
      last_activity_at: stats.last_activity_at,
      // Computed fields for compatibility
      total_lessons_completed: stats.lessons_completed || 0,
      total_quizzes_completed: stats.quizzes_completed || 0,
      total_words_learned: stats.words_learned || 0,
      current_streak: stats.streak_days || 0,
      total_points: 0, // Backend doesn't have this yet
      learning_days: stats.streak_days || 0,
    }
  } catch (error) {
    console.error("Get user stats error:", error)
    throw error
  }
}

export const getUserAchievements = async (): Promise<Achievement[]> => {
  try {
    const response = await api.get(ENDPOINTS.USER_ACHIEVEMENTS)
    return response.data.achievements || []
  } catch (error) {
    console.error("Get user achievements error:", error)
    throw error
  }
}
