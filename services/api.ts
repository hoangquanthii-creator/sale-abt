
import { GoogleGenAI, Type } from "@google/genai";
import { storageService } from "./storageService";
import { Task, ProjectGoal, TeamMember, ZaloSettings, ChatMessage, TaskStatus } from "../types";
import { MODEL_FAST, MODEL_SMART, MODEL_CHAT, THINKING_BUDGET } from "../constants";

// --- MOCK BACKEND SIMULATION ---

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Securely initialize GenAI only within this "server" scope
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// --- API IMPLEMENTATION ---

export const api = {
  // 1. DATA ENDPOINTS
  getData: async () => {
    await delay(300); // Simulate fetch latency
    return {
      tasks: storageService.getTasks(),
      goals: storageService.getGoals(),
      members: storageService.getMembers(),
      settings: storageService.getSettings(),
      chatHistory: storageService.getChatHistory(),
      lastStrategy: storageService.getLastStrategy(),
      lastWorkflow: storageService.getLastWorkflow(),
    };
  },

  saveTasks: async (tasks: Task[]) => {
    await delay(200);
    storageService.saveTasks(tasks);
    return { success: true };
  },

  saveGoals: async (goals: ProjectGoal[]) => {
    await delay(200);
    storageService.saveGoals(goals);
    return { success: true };
  },

  saveMembers: async (members: TeamMember[]) => {
    await delay(200);
    storageService.saveMembers(members);
    return { success: true };
  },

  saveSettings: async (settings: ZaloSettings) => {
    await delay(200);
    storageService.saveSettings(settings);
    return { success: true };
  },

  saveChatHistory: async (messages: ChatMessage[]) => {
    // No delay needed for chat usually
    storageService.saveChatHistory(messages);
  },

  // 2. AI SERVICES (Running on "Backend")
  ai: {
    suggestSubtasks: async (taskTitle: string, taskDescription: string): Promise<string[]> => {
      await delay(500);
      const ai = getAIClient();
      if (!ai) return [];

      const prompt = `
        Tôi có một công việc: "${taskTitle}".
        Mô tả: "${taskDescription}".
        Hãy liệt kê giúp tôi 3-5 đầu việc nhỏ (subtasks) cụ thể, mang tính hành động.
        Trả về CHỈ một mảng JSON các chuỗi (string).
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
        return JSON.parse(response.text || "[]") as string[];
      } catch (error) {
        console.error("API Error:", error);
        return [];
      }
    },

    suggestDescription: async (taskTitle: string): Promise<string> => {
      await delay(500);
      const ai = getAIClient();
      if (!ai) return "";

      const prompt = `
        Viết một đoạn mô tả ngắn gọn (2-3 câu), chuyên nghiệp cho công việc: "${taskTitle}".
        Ngôn ngữ: Tiếng Việt. Chỉ trả về nội dung mô tả.
      `;

      try {
        const response = await ai.models.generateContent({
          model: MODEL_FAST,
          contents: prompt,
        });
        return response.text?.trim() || "";
      } catch (error) {
        console.error("API Error:", error);
        return "";
      }
    },

    generateImage: async (prompt: string): Promise<string | null> => {
      await delay(1000);
      const ai = getAIClient();
      if (!ai) return null;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp', // Or 'gemini-3-pro-image-preview' if available
          contents: { parts: [{ text: "Generate an image: " + prompt }] },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
      } catch (error) {
        console.error("API Error:", error);
        return null;
      }
    },

    analyzeStrategy: async (tasks: Task[], goals?: ProjectGoal[]): Promise<string> => {
      await delay(1500); // Heavy task
      const ai = getAIClient();
      if (!ai) return "Lỗi kết nối AI.";

      const tasksJson = JSON.stringify(tasks.map(t => ({
        title: t.title, status: t.status, priority: t.priority,
        assignee: t.assignee, outcome: t.outcome
      })));
      
      const goalsJson = goals ? JSON.stringify(goals.map(g => ({
        objective: g.title, progress: g.progress,
        krs: g.keyResults.map(k => `${k.title} (${k.currentValue}/${k.targetValue})`)
      }))) : "N/A";

      const prompt = `
        Dữ liệu:
        Tasks: ${tasksJson}
        OKRs: ${goalsJson}

        Vai trò: CEO & Giám đốc Chiến lược.
        Yêu cầu: Phân tích sự liên kết giữa Task và OKRs. Chỉ ra rủi ro và 3 hành động điều hành cụ thể.
        Dùng Tiếng Việt, Thinking Mode. Markdown.
      `;

      try {
        const response = await ai.models.generateContent({
          model: MODEL_SMART,
          contents: prompt,
          config: { thinkingConfig: { thinkingBudget: THINKING_BUDGET } }
        });
        const result = response.text || "Không có phản hồi.";
        storageService.saveStrategy(result); // Cache on server
        return result;
      } catch (error) {
        console.error("API Error:", error);
        return "Lỗi phân tích.";
      }
    },

    analyzeWorkflow: async (tasks: Task[]): Promise<string> => {
      await delay(1500);
      const ai = getAIClient();
      if (!ai) return "Lỗi kết nối AI.";

      const boardState = tasks.map(t => ({
        status: t.status, assignee: t.assignee, priority: t.priority
      }));

      const prompt = `
        Vai trò: Agile Coach.
        Dữ liệu Kanban: ${JSON.stringify(boardState)}
        Yêu cầu: Tìm điểm nghẽn (Bottlenecks) và đề xuất tối ưu luồng việc.
        Tiếng Việt. Markdown.
      `;

      try {
        const response = await ai.models.generateContent({
          model: MODEL_SMART,
          contents: prompt,
          config: { thinkingConfig: { thinkingBudget: THINKING_BUDGET } }
        });
        const result = response.text || "Không có phản hồi.";
        storageService.saveWorkflow(result);
        return result;
      } catch (error) {
        console.error("API Error:", error);
        return "Lỗi phân tích.";
      }
    },

    chat: async (history: {role: string, parts: {text: string}[]}[], message: string, tasksContext?: Task[]) => {
      await delay(500);
      const ai = getAIClient();
      if (!ai) throw new Error("API Key missing");

      let systemInstruction = "Bạn là PlanAI, trợ lý quản lý dự án (CEO Assistant). Trả lời ngắn gọn, chuyên nghiệp, tiếng Việt.";
      if (tasksContext) {
        systemInstruction += `\nContext: ${JSON.stringify(tasksContext.map(t => t.title + ' - ' + t.status))}`;
      }

      const chatSession = ai.chats.create({
        model: MODEL_CHAT,
        history: history,
        config: { systemInstruction }
      });

      const result = await chatSession.sendMessage({ message });
      return result.text || "";
    }
  },

  // 3. ZALO SERVICES (Running on "Backend")
  zalo: {
    checkAndNotify: async (): Promise<{ updatedTasks: Task[], notifications: string[] }> => {
      await delay(500);
      const tasks = storageService.getTasks();
      const settings = storageService.getSettings();
      const members = storageService.getMembers();

      if (!settings.enabled) return { updatedTasks: tasks, notifications: [] };

      const now = Date.now();
      const ONE_DAY_MS = 86400000;
      let hasUpdates = false;
      const notifications: string[] = [];

      const updatedTasks = tasks.map(task => {
        if (task.status === TaskStatus.DONE || !task.dueDate || !task.assignee) return task;

        const member = members.find(m => m.name === task.assignee);
        if (!member || !member.phone) return task;

        const timeDiff = task.dueDate - now;
        let newTask = { ...task };

        // Check Overdue
        if (timeDiff < 0 && settings.notifyOverdue && task.notificationStatus !== 'OVERDUE') {
          newTask.notificationStatus = 'OVERDUE';
          newTask.lastNotificationSent = now;
          notifications.push(`[Gửi Zalo cho ${member.name}] ⚠️ QUÁ HẠN: "${task.title}"`);
          hasUpdates = true;
        }
        // Check Upcoming
        else if (timeDiff > 0 && timeDiff < ONE_DAY_MS && settings.notifyUpcoming && task.notificationStatus !== 'UPCOMING') {
          newTask.notificationStatus = 'UPCOMING';
          newTask.lastNotificationSent = now;
          notifications.push(`[Gửi Zalo cho ${member.name}] 📅 NHẮC NHỞ: "${task.title}" sắp đến hạn.`);
          hasUpdates = true;
        }

        return newTask;
      });

      if (hasUpdates) {
        storageService.saveTasks(updatedTasks);
      }

      return { updatedTasks, notifications };
    }
  },
  
  // 4. UTILS
  exportData: () => storageService.exportData(),
  importData: (json: string) => storageService.importData(json),
};
