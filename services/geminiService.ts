import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_FAST, MODEL_SMART, MODEL_CHAT, THINKING_BUDGET } from "../constants";
import { Task, ProjectGoal } from "../types";

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
 * Uses Flash Lite to generate a professional description for a task based on its title.
 */
export const suggestDescription = async (taskTitle: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "";

  const prompt = `
    Bạn là một trợ lý quản lý dự án chuyên nghiệp.
    Hãy viết một đoạn mô tả ngắn gọn (khoảng 2-3 câu) nhưng đầy đủ ý nghĩa cho công việc có tiêu đề: "${taskTitle}".
    Nội dung cần chuyên nghiệp, tập trung vào mục đích và kết quả mong đợi.
    Ngôn ngữ: Tiếng Việt.
    Không trả về gì ngoài nội dung mô tả.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating description:", error);
    return "";
  }
};

/**
 * Uses Gemini to generate an image for the task.
 */
export const generateTaskImage = async (prompt: string): Promise<string | null> => {
    const ai = getAIClient();
    if (!ai) return null;

    try {
        // Using generateContent with specific prompting for image generation if the model supports it via tools or native generation
        // Note: Currently mimicking the "Generate Images" behaviour via generateContent for the specific model as per instructions
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Using a model known for multimodal capabilities
            contents: {
                parts: [
                    { text: "Generate an image: " + prompt }
                ]
            },
            config: {
                // Config for image generation if supported by the specific model endpoint
            }
        });

        // Loop to find image part
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64String = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64String}`;
                }
            }
        }
        
        // Fallback: If the API returns a text description instead of an image (common in text-only models), we can't show an image.
        // For the purpose of this demo app, if no image is returned, we return null.
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

/**
 * Uses Gemini 3 Pro with Thinking for deep strategic analysis of the project.
 * Updated to include OKR analysis.
 */
export const analyzeProjectStrategy = async (tasks: Task[], goals?: ProjectGoal[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Thiếu API Key.";

  const tasksJson = JSON.stringify(tasks.map(t => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    assignee: t.assignee || "Chưa giao",
    meetingWith: t.meetingWith || "Không có",
    outcome: t.outcome || "Chưa có",
    dueDate: t.dueDate ? new Date(t.dueDate).toDateString() : "Chưa đặt",
    quickNote: t.quickNote || ""
  })));

  const goalsJson = goals ? JSON.stringify(goals.map(g => ({
      objective: g.title,
      keyResults: g.keyResults?.map(kr => `${kr.title}: ${kr.currentValue}/${kr.targetValue} ${kr.unit}`),
      deadline: new Date(g.deadline).toDateString()
  }))) : "Chưa có mục tiêu OKR.";

  const prompt = `
    Tôi đang cung cấp dữ liệu quản trị của công ty bao gồm:
    1. DANH SÁCH CÔNG VIỆC (TASKS):
    ${tasksJson}

    2. MỤC TIÊU & KẾT QUẢ THEN CHỐT (OKRs/KPIs):
    ${goalsJson}

    Đóng vai trò là một CEO dày dạn kinh nghiệm và Giám đốc Chiến lược, hãy phân tích trạng thái vận hành của doanh nghiệp bằng TIẾNG VIỆT (Sử dụng Thinking Mode):

    **Phần 1: Sự liên kết Mục tiêu (Alignment Analysis) - QUAN TRỌNG**
    - Đánh giá xem các công việc hàng ngày (Tasks) có đang thực sự đóng góp vào các OKRs không?
    - Có Mục tiêu (Objective) nào đang bị bỏ rơi (không có task nào hỗ trợ) không? Cảnh báo ngay.

    **Phần 2: Giám sát Hiệu suất & Rủi ro (Performance & Risk)**
    - Phân tích tiến độ các Key Results. Chỉ số nào đang tụt hậu nguy hiểm?
    - Ai trong đội ngũ đang làm việc hiệu quả/kém hiệu quả dựa trên tiến độ task?

    **Phần 3: Chỉ đạo điều hành (Executive Action Plan)**
    - Đưa ra 3 chỉ đạo cụ thể, ngắn gọn cho đội ngũ quản lý để cải thiện tình hình ngay lập tức.
    
    Trình bày dưới dạng Markdown chuyên nghiệp. Dùng ngôn ngữ quản trị, dứt khoát.
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
 * Uses Gemini to analyze Kanban Flow and suggest optimization.
 * Focuses on WIP limits, Bottlenecks, and Flow Efficiency.
 */
export const analyzeKanbanWorkflow = async (tasks: Task[]): Promise<string> => {
    const ai = getAIClient();
    if (!ai) return "Thiếu API Key.";

    // Simplify data for Kanban analysis
    const boardState = tasks.map(t => ({
        id: t.title, // Use title for readability in prompt
        status: t.status, // TODO, IN_PROGRESS, REVIEW, DONE
        assignee: t.assignee || "Unassigned",
        priority: t.priority,
        daysOpen: Math.floor((Date.now() - t.createdAt) / (1000 * 60 * 60 * 24))
    }));

    const prompt = `
      Bạn là một Agile Coach / Scrum Master chuyên nghiệp. Hãy phân tích bảng Kanban hiện tại của nhóm:
      ${JSON.stringify(boardState)}

      Nhiệm vụ: Tối ưu hóa luồng công việc (Workflow) để tăng tốc độ hoàn thành và giảm tắc nghẽn.
      
      Hãy đưa ra báo cáo ngắn gọn gồm 3 phần:
      1. **Điểm nghẽn (Bottlenecks):** Cột nào đang bị ùn ứ (quá nhiều thẻ)? Ai đang ôm đồm quá nhiều việc (WIP cao)?
      2. **Đề xuất di chuyển:** Cụ thể cần ưu tiên làm xong task nào trước? Task nào nên tạm dừng?
      3. **Hành động ngay:** 3 việc cần làm ngay lập tức trên bảng này.

      Trả lời bằng Tiếng Việt, dùng Markdown, giọng văn tích cực, thúc đẩy hành động.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_SMART, // Thinking model is good for logic flow
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: THINKING_BUDGET }
            }
        });
        return response.text || "Không có đề xuất.";
    } catch (error) {
        console.error("Error analyzing workflow:", error);
        return "Lỗi khi phân tích luồng công việc.";
    }
};

/**
 * Chat with the AI Assistant with Context Awareness.
 */
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string, tasksContext?: Task[]) => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key missing");

  // Create a system instruction that includes the current state of the board
  let systemInstruction = "Bạn là PlanAI, một trợ lý quản lý dự án thông minh (Cấp độ CEO Assistant). Bạn trả lời ngắn gọn, chuyên nghiệp và khích lệ bằng TIẾNG VIỆT.";
  
  if (tasksContext && tasksContext.length > 0) {
      const taskSummary = tasksContext.map(t => 
        `- [${t.status}] ${t.title} (${t.priority}, Người làm: ${t.assignee || 'Chưa giao'})`
      ).join('\n');
      
      systemInstruction += `\n\nĐây là dữ liệu thời gian thực về dự án hiện tại. Hãy sử dụng thông tin này để trả lời câu hỏi của người dùng nếu liên quan:\n${taskSummary}`;
  }

  const chat = ai.chats.create({
    model: MODEL_CHAT,
    history: history,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text || "";
};
