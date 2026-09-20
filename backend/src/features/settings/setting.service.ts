import { prisma } from '../../utils/prisma';

export const SINGLETON_SETTING_ID = 'default';

const DEFAULT_SETTING_DATA = {
  defaultDeckName: 'LingoAnki Default',
  defaultModelName: 'Basic',
  ankiConnectUrl: process.env.ANKI_CONNECT_URL || 'http://127.0.0.1:8765',
  autoSyncAnki: false,
  autoSyncObsidian: false,
  screenshotHotkey: 'windows+shift+s',
  audioHotkey: 'ctrl+shift+a',
  textHotkey: 'ctrl+q',
  vadEnabled: true,
  vadThreshold: 0.2,
  vadSilenceDuration: 5.0,
  vadUseGpu: true,
  marqueeText: '🔥 QUYẾT TÂM!!!!! • Có tiền ít thì từ thiện ít, nhiều thì từ thiện nhiều nha!!! • Học cái hiểu biết nhiều để biết ơn • Lấy tham thiền làm niềm vui • English learner! (chuẩn bị về các cơ chế management và cách thu âm) • Bản vẽ • PHẢI OBSERVATION NHIỀU HƠN NỮA!!!!! • PHẢI BIẾT LƯỢNG SỨC MÌNH!!!',
  marqueeEnabled: true,
  marqueeSpeed: 1.0,
  marqueeDirection: 'left',
  geminiApiKey: process.env.GEMINI_API_KEY || null
};

export const getSettings = async () => {
  return prisma.integrationSetting.upsert({
    where: { id: SINGLETON_SETTING_ID },
    create: {
      id: SINGLETON_SETTING_ID,
      ...DEFAULT_SETTING_DATA
    },
    update: {}
  });
};

export const updateSettings = async (data: Partial<{
  defaultDeckName: string;
  defaultModelName: string;
  ankiConnectUrl: string;
  autoSyncAnki: boolean;
  obsidianVaultPath: string | null;
  autoSyncObsidian: boolean;
  screenshotHotkey: string;
  audioHotkey: string;
  textHotkey: string;
  vadEnabled: boolean;
  vadThreshold: number;
  vadSilenceDuration: number;
  vadUseGpu: boolean;
  marqueeText: string;
  marqueeEnabled: boolean;
  marqueeSpeed: number;
  marqueeDirection: string;
  geminiApiKey: string | null;
}>) => {

  return prisma.integrationSetting.upsert({
    where: { id: SINGLETON_SETTING_ID },
    create: {
      id: SINGLETON_SETTING_ID,
      ...DEFAULT_SETTING_DATA,
      ...data
    },
    update: data
  });
};
