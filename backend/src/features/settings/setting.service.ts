import { prisma } from '../../utils/prisma';

export const getSettings = async () => {
  let setting = await prisma.integrationSetting.findFirst();
  if (!setting) {
    setting = await prisma.integrationSetting.create({
      data: {
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
        vadUseGpu: true
      }
    });
  } else {
    const updates: any = {};
    if (setting.vadThreshold === 0.5) updates.vadThreshold = 0.2;
    if (setting.vadSilenceDuration !== 5.0) updates.vadSilenceDuration = 5.0;

    if (Object.keys(updates).length > 0) {
      setting = await prisma.integrationSetting.update({
        where: { id: setting.id },
        data: updates
      });
    }
  }
  return setting;
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
}>) => {
  const current = await getSettings();
  return prisma.integrationSetting.update({
    where: { id: current.id },
    data
  });
};
