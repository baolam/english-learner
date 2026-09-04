import { create } from 'zustand';

interface AppState {
  isRightPanelOpen: boolean;
  activeRightPanelTab: 'chat' | 'vocabulary' | 'speaking';
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'chat' | 'vocabulary' | 'speaking') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isRightPanelOpen: true,
  activeRightPanelTab: 'chat',
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  setRightPanelTab: (tab) => set({ activeRightPanelTab: tab, isRightPanelOpen: true }),
}));
