
import { Task, ProjectGoal } from "../types";
import { api } from "./api";

// These functions now act as Client SDK methods calling the backend API

export const suggestSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  return api.ai.suggestSubtasks(taskTitle, taskDescription);
};

export const suggestDescription = async (taskTitle: string): Promise<string> => {
  return api.ai.suggestDescription(taskTitle);
};

export const generateTaskImage = async (prompt: string): Promise<string | null> => {
  return api.ai.generateImage(prompt);
};

export const analyzeProjectStrategy = async (tasks: Task[], goals?: ProjectGoal[]): Promise<string> => {
  return api.ai.analyzeStrategy(tasks, goals);
};

export const analyzeKanbanWorkflow = async (tasks: Task[]): Promise<string> => {
  return api.ai.analyzeWorkflow(tasks);
};

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string, tasksContext?: Task[]) => {
  return api.ai.chat(history, message, tasksContext);
};
