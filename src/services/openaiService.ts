import { OPENAI_API_KEY } from "../constants/config";

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  error?: {
    message: string
    type: string
    code: string
  }
}

class OpenAIService {
  private apiKey: string
  private baseUrl = "https://api.openai.com/v1/chat/completions"

  constructor() {
    this.apiKey = OPENAI_API_KEY
    this.validateApiKey()
  }

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error("OpenAI API key chưa được cấu hình")
    }
    if (!this.apiKey.startsWith('sk-')) {
      throw new Error("OpenAI API key không hợp lệ - phải bắt đầu bằng 'sk-'")
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      const data: OpenAIResponse = await response.json()

      // Xử lý các loại lỗi cụ thể
      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error("API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại API key.")
          case 403:
            throw new Error("Không có quyền truy cập. Kiểm tra permissions của API key.")
          case 429:
            throw new Error("Đã vượt quá giới hạn request. Vui lòng thử lại sau ít phút.")
          case 500:
            throw new Error("Lỗi server của OpenAI. Vui lòng thử lại sau.")
          case 503:
            throw new Error("Dịch vụ OpenAI đang bảo trì. Vui lòng thử lại sau.")
          default:
            const errorMsg = data.error?.message || `Lỗi API: ${response.status}`
            throw new Error(errorMsg)
        }
      }

      if (!data.choices || data.choices.length === 0) {
        throw new Error("Không nhận được phản hồi từ AI")
      }

      return data.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này."
    } catch (error) {
      console.error("OpenAI Service Error:", error)
      
      // Xử lý lỗi network
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Không thể kết nối với OpenAI. Kiểm tra kết nối internet.")
      }
      
      // Ném lại lỗi đã được xử lý
      if (error instanceof Error) {
        throw error
      }
      
      // Lỗi không xác định
      throw new Error("Đã xảy ra lỗi không xác định. Vui lòng thử lại.")
    }
  }

  // Kiểm tra API key có hoạt động không
  async testApiKey(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: "user", content: "Hello" }
      ]
      await this.sendMessage(testMessages)
      return true
    } catch (error) {
      console.error("API Key test failed:", error)
      return false
    }
  }

  // Tạo system prompt cho chatbot dựa trên dữ liệu test
  createSystemPrompt(testData: any): string {
    const questionsContext =
      testData.questions
        ?.map(
          (q: any, index: number) =>
            `Câu ${index + 1}: ${q.question}\nCác lựa chọn: ${q.options.join(", ")}\nĐộ khó: ${q.difficulty}`,
        )
        .join("\n\n") || ""

    return `Bạn là một AI assistant chuyên về tiếng Anh, hỗ trợ học sinh trong bài test "${testData.title}".

THÔNG TIN BÀI TEST:
- Tiêu đề: ${testData.title}
- Mô tả: ${testData.description}
- Loại test: ${testData.type}
- Tổng số câu hỏi: ${testData.total_questions}
- Thời gian: ${testData.time_limit} phút
- Điểm đạt: ${testData.passing_score}%

CÁC CÂU HỎI TRONG BÀI TEST:
${questionsContext}

VAI TRÒ CỦA BẠN:
1. Giải thích ngữ pháp và từ vựng trong các câu hỏi
2. Hướng dẫn cách làm bài test hiệu quả
3. Giải đáp thắc mắc về nội dung tiếng Anh
4. Đưa ra gợi ý học tập
5. có thể trực tiếp đưa ra đáp án đúng, sau khi hướng dẫn cách suy luận mà người dùng vẫn hỏi đáp án đúng là gì

QUY TẮC:
- Trả lời bằng tiếng Việt
- Giải thích rõ ràng, dễ hiểu
- Khuyến khích học sinh tự suy luận
- Đưa ra ví dụ minh họa khi cần thiết`
  }

  // Phân tích câu hỏi cụ thể
  async analyzeQuestion(testData: any, questionId: number, userQuery: string): Promise<string> {
    const question = testData.questions?.find((q: any) => q.id === questionId)
    if (!question) {
      return "Không tìm thấy câu hỏi này trong bài test."
    }

    const systemPrompt = this.createSystemPrompt(testData)
    const questionContext = `
CÂUHỎI CẦN PHÂN TÍCH:
Câu hỏi: ${question.question}
Các lựa chọn: ${question.options.join(", ")}
Độ khó: ${question.difficulty}

Câu hỏi của học sinh: ${userQuery}
`

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: questionContext },
    ]

    return await this.sendMessage(messages)
  }

  // Trả lời câu hỏi chung về test
  async answerGeneralQuestion(testData: any, userQuery: string): Promise<string> {
    const systemPrompt = this.createSystemPrompt(testData)

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ]

    return await this.sendMessage(messages)
  }
}

export default new OpenAIService()