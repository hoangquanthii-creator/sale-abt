
import { Task, ProjectGoal, ZaloSettings, TeamMember, BackupData, ChatMessage } from '../types';
import { DEFAULT_MEMBERS, DEMO_OKRS } from '../constants';

const KEYS = {
  TASKS: 'planai-tasks',
  GOALS: 'planai-goals',
  SETTINGS: 'planai-settings',
  MEMBERS: 'planai-members',
  CHAT: 'planai-chat',
  STRATEGY: 'planai-strategy',
  WORKFLOW: 'planai-workflow',
};

// Singleton Storage Service
export const storageService = {
  // Tasks
  getTasks: (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  // Goals
  getGoals: (): ProjectGoal[] => {
    const data = localStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : DEMO_OKRS;
  },
  saveGoals: (goals: ProjectGoal[]) => {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  // Settings
  getSettings: (): ZaloSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
        enabled: false,
        oaId: '',
        checkInterval: 1,
        notifyUpcoming: true,
        notifyOverdue: true
    };
  },
  saveSettings: (settings: ZaloSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Team Members
  getMembers: (): TeamMember[] => {
    const data = localStorage.getItem(KEYS.MEMBERS);
    return data ? JSON.parse(data) : DEFAULT_MEMBERS;
  },
  saveMembers: (members: TeamMember[]) => {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
  },

  // Chat History
  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem(KEYS.CHAT);
    return data ? JSON.parse(data) : [];
  },
  saveChatHistory: (messages: ChatMessage[]) => {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
  },

  // Cached Analysis
  getLastStrategy: (): string => {
    return localStorage.getItem(KEYS.STRATEGY) || '';
  },
  saveStrategy: (analysis: string) => {
    localStorage.setItem(KEYS.STRATEGY, analysis);
  },

  getLastWorkflow: (): string => {
    return localStorage.getItem(KEYS.WORKFLOW) || '';
  },
  saveWorkflow: (analysis: string) => {
    localStorage.setItem(KEYS.WORKFLOW, analysis);
  },

  // EXPORT DATA
  exportData: (): string => {
    const backup: BackupData = {
        version: 1,
        timestamp: Date.now(),
        tasks: storageService.getTasks(),
        goals: storageService.getGoals(),
        members: storageService.getMembers(),
        settings: storageService.getSettings(),
        chatHistory: storageService.getChatHistory(),
        lastStrategyAnalysis: storageService.getLastStrategy(),
        lastWorkflowAnalysis: storageService.getLastWorkflow(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // IMPORT DATA
  importData: (jsonString: string): boolean => {
      try {
          const backup: BackupData = JSON.parse(jsonString);
          if (backup.tasks) storageService.saveTasks(backup.tasks);
          if (backup.goals) storageService.saveGoals(backup.goals);
          if (backup.members) storageService.saveMembers(backup.members);
          if (backup.settings) storageService.saveSettings(backup.settings);
          if (backup.chatHistory) storageService.saveChatHistory(backup.chatHistory);
          if (backup.lastStrategyAnalysis) storageService.saveStrategy(backup.lastStrategyAnalysis);
          if (backup.lastWorkflowAnalysis) storageService.saveWorkflow(backup.lastWorkflowAnalysis);
          return true;
      } catch (e) {
          console.error("Import failed:", e);
          return false;
      }
  }
};
