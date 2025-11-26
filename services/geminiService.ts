import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_FAST, MODEL_SMART, THINKING_BUDGET } from "../constants";
import { Task } from "../types";

// Initialize the client. API Key is expected in process.env.API_KEY
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Uses Flash Lite for ultra-fast task breakdown suggestions.
 */
export const suggestSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  const ai = getAIClient();
  if (!ai) return [];

  const prompt = `
    Tôi có một công việc: "${taskTitle}".
    Mô tả: "${taskDescription}".
    
    Hãy liệt kê giúp tôi 3-5 đầu việc nhỏ (subtasks) cụ thể, mang tính hành động để hoàn thành công việc chính này.
    Trả về CHỈ một mảng JSON các chuỗi (string). Ví dụ: ["Viết đề cương", "Tìm tài liệu tham khảo"].
    Ngôn ngữ: Tiếng Việt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return [];
  }
};

/**
 * Uses Gemini 3 Pro with Thinking for deep strategic analysis of the project.
 */
export const analyzeProjectStrategy = async (tasks: Task[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Thiếu API Key.";

  const tasksJson = JSON.stringify(tasks.map(t => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    assignee: t.assignee || "Chưa giao",
    startDate: t.startDate ? new Date(t.startDate).toDateString() : "Chưa đặt",
    dueDate: t.dueDate ? new Date(t.dueDate).toDateString() : "Chưa đặt",
    description: t.description
  })));

  const prompt = `
    Đây là trạng thái hiện tại của dự án dưới định dạng JSON:
    ${tasksJson}

    Hãy thực hiện một "Đánh giá Chiến lược Chuyên sâu" cho khối lượng công việc này bằng TIẾNG VIỆT.
    1. **Phân bổ nguồn lực:** Phân tích cách phân chia công việc giữa các thành viên (assignee). Có ai đang bị quá tải hoặc rảnh rỗi không?
    2. **Rủi ro tiến độ:** Xác định các công việc quá hạn hoặc có deadline gấp dựa trên ngày bắt đầu/hạn chót.
    3. **Điểm nghẽn (Bottlenecks):** Nhận diện điểm nghẽn dựa trên trạng thái (ví dụ: quá nhiều việc ở cột Review) và độ ưu tiên.
    4. **Đề xuất:** Đưa ra thứ tự thực hiện tối ưu và đề xuất điều chuyển nhân sự nếu cần.
    
    Hãy suy nghĩ sâu sắc về sự phụ thuộc và nguyên tắc quản lý nguồn lực.
    Trình bày câu trả lời dưới dạng Markdown rõ ràng, chuyên nghiệp.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: THINKING_BUDGET }
      }
    });

    return response.text || "Không thể tạo phân tích lúc này.";
  } catch (error) {
    console.error("Error analyzing project:", error);
    return "Đã có lỗi xảy ra khi phân tích dự án. Vui lòng thử lại.";
  }
};

/**
 * Chat with the AI Assistant.
 */
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key missing");

  const chat = ai.chats.create({
    model: MODEL_SMART,
    history: history,
    config: {
      systemInstruction: "Bạn là PlanAI, một trợ lý quản lý dự án và năng suất chuyên nghiệp. Bạn giúp người dùng tổ chức công việc, chia nhỏ các vấn đề phức tạp và duy trì động lực. Bạn trả lời ngắn gọn, chuyên nghiệp và khích lệ bằng TIẾNG VIỆT.",
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text || "";
};