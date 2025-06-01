import api from "./api";
import { ENDPOINTS } from "../constants/apiEndpoints";

export interface UpdateProfileData {
  name? :string,
  avatar? : string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface UserStats {
  total_lessons_completed: number
  total_quizzes_completed: number
  total_words_learned: number
  current_streak: number
  total_points: number
  learning_days: number
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
    console.log("Update profile failed:", error)
    throw error
  }
}

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const response = await api.put(ENDPOINTS.CHANGE_PASSWORD)
    return response.data
  } catch (error) {
    console.log("changpassword failed:", error)
    throw error
  }
}

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await api.get(ENDPOINTS.USER_STATS)
    return response.data.stats
  } catch (error) {
    console.error("Get user stats error:", error)
    throw error
  }
}

export const getUserAchievements = async (): Promise<Achievement[]> => {
  try {
    const response = await api.get(ENDPOINTS.USER_ACHIEVEMENTS)
    return response.data.achievements
  } catch (error) {
    console.error("Get user achievements error:", error)
    throw error
  }
}
