import api from "./api"
import { ENDPOINTS } from "../constants/apiEndpoints"

export interface LessonItem {
  word: string
  meaning: string
  example: string
}

export interface LessonSection {
  title: string
  items: LessonItem[]
}

export interface LessonContent {
  sections: LessonSection[]
  duration?: number
}

export interface Lesson {
  id: number
  title: string
  description: string
  content?: LessonContent
  level: "beginner" | "intermediate" | "advanced"
  duration: number
  order: number
  progress: number
  is_completed: boolean
  is_locked: boolean
  content_preview?: {
    total_sections: number
    total_items: number
  }
  current_section?: number
  current_item?: number
}

export interface LessonStats {
  total_lessons: number
  completed_lessons: number
  in_progress_lessons: number
  overall_progress: number
  completion_rate: number
}

export const getLessons = async (): Promise<Lesson[]> => {
  try {
    const response = await api.get(ENDPOINTS.LESSONS)
    return response.data.lessons || response.data
  } catch (error) {
    console.error("Get lessons error:", error)
    throw error
  }
}

export const getLessonById = async (lessonId: number): Promise<Lesson> => {
  try {
    const response = await api.get(ENDPOINTS.LESSON_DETAIL(lessonId)) //Gửi get request đến server
    return response.data.lesson || response.data
  } catch (error) {
    console.error(`Get lesson ${lessonId} error:`, error)
    throw error
  }
}

export const updateLessonProgress = async (
  lessonId: number,
  progressPercentage: number,
  sectionIndex?: number,
  itemIndex?: number,
) => {
  try {
    const response = await api.post(ENDPOINTS.LESSON_PROGRESS(lessonId), {
      progress_percentage: progressPercentage,
      section_index: sectionIndex,
      item_index: itemIndex,
    })
    return response.data
  } catch (error) {
    console.error(`Update lesson ${lessonId} progress error:`, error)
    throw error
  }
}

export const completeLesson = async (lessonId: number) => {
  try {
    const response = await api.post(ENDPOINTS.LESSON_COMPLETE(lessonId))
    return response.data
  } catch (error) {
    console.error(`Complete lesson ${lessonId} error:`, error)
    throw error
  }
}

export const getLessonStats = async (): Promise<LessonStats> => {
  try {
    const response = await api.get(ENDPOINTS.LESSON_STATS)
    return response.data.stats || response.data
  } catch (error) {
    console.error("Get lesson stats error:", error)
    throw error
  }
}
