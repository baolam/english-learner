'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings, Save, Check, RotateCcw, Type, Eye, ToggleLeft, ToggleRight, AlertCircle, ArrowLeftRight, Gauge } from 'lucide-react';

const DEFAULT_SLOGAN =
  '🔥 QUYẾT TÂM!!!!! • Có tiền ít thì từ thiện ít, nhiều thì từ thiện nhiều nha!!! • Học cái hiểu biết nhiều để biết ơn • Lấy tham thiền làm niềm vui • English learner! (chuẩn bị về các cơ chế management và cách thu âm) • Bản vẽ • PHẢI OBSERVATION NHIỀU HƠN NỮA!!!!! • PHẢI BIẾT LƯỢNG SỨC MÌNH!!!';

export default function SettingsPage() {
  const [marqueeText, setMarqueeText] = useState<string>(DEFAULT_SLOGAN);
  const [marqueeEnabled, setMarqueeEnabled] = useState<boolean>(true);
  const [marqueeSpeed, setMarqueeSpeed] = useState<number>(1.0);
  const [marqueeDirection, setMarqueeDirection] = useState<string>('left'); // 'left' = Right-to-Left, 'right' = Left-to-Right
  
  // Other integration settings
  const [ankiConnectUrl, setAnkiConnectUrl] = useState<string>('http://127.0.0.1:8765');
  const [defaultDeckName, setDefaultDeckName] = useState<string>('LingoAnki Default');
  const [obsidianVaultPath, setObsidianVaultPath] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Tải cài đặt ban đầu từ localStorage và Backend API
    const cachedText = localStorage.getItem('marquee_text');
    const cachedEnabled = localStorage.getItem('marquee_enabled');
    const cachedSpeed = localStorage.getItem('marquee_speed');
    const cachedDirection = localStorage.getItem('marquee_direction');

    if (cachedText !== null) setMarqueeText(cachedText);
    if (cachedEnabled !== null) setMarqueeEnabled(cachedEnabled === 'true');
    if (cachedSpeed !== null) setMarqueeSpeed(parseFloat(cachedSpeed) || 1.0);
    if (cachedDirection !== null) setMarqueeDirection(cachedDirection);

    axios
      .get('http://localhost:3000/api/settings')
      .then((res) => {
        if (res.data) {
          if (res.data.marqueeText !== undefined) {
            setMarqueeText(res.data.marqueeText);
            localStorage.setItem('marquee_text', res.data.marqueeText);
          }
          if (res.data.marqueeEnabled !== undefined) {
            setMarqueeEnabled(res.data.marqueeEnabled);
            localStorage.setItem('marquee_enabled', String(res.data.marqueeEnabled));
          }
          if (res.data.marqueeSpeed !== undefined) {
            setMarqueeSpeed(Number(res.data.marqueeSpeed) || 1.0);
            localStorage.setItem('marquee_speed', String(res.data.marqueeSpeed));
          }
          if (res.data.marqueeDirection !== undefined) {
            setMarqueeDirection(res.data.marqueeDirection);
            localStorage.setItem('marquee_direction', res.data.marqueeDirection);
          }
          if (res.data.ankiConnectUrl) setAnkiConnectUrl(res.data.ankiConnectUrl);
          if (res.data.defaultDeckName) setDefaultDeckName(res.data.defaultDeckName);
          if (res.data.obsidianVaultPath) setObsidianVaultPath(res.data.obsidianVaultPath);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch settings from backend:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const payload = {
      marqueeText,
      marqueeEnabled,
      marqueeSpeed,
      marqueeDirection,
      ankiConnectUrl,
      defaultDeckName,
      obsidianVaultPath
    };

    // Save to localStorage immediately
    localStorage.setItem('marquee_text', marqueeText);
    localStorage.setItem('marquee_enabled', String(marqueeEnabled));
    localStorage.setItem('marquee_speed', String(marqueeSpeed));
    localStorage.setItem('marquee_direction', marqueeDirection);

    // Dispatch custom event for immediate UI update in MarqueeBanner component
    window.dispatchEvent(
      new CustomEvent('marquee-updated', {
        detail: { marqueeText, marqueeEnabled, marqueeSpeed, marqueeDirection }
      })
    );

    try {
      await axios.put('http://localhost:3000/api/settings', payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMessage('Không thể kết nối đến server backend. Đã lưu cài đặt tạm thời trên trình duyệt.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    setMarqueeText(DEFAULT_SLOGAN);
    setMarqueeSpeed(1.0);
    setMarqueeDirection('left');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="text-slate-500 animate-pulse flex items-center gap-2 font-medium">
          <Settings className="animate-spin" size={20} />
          Đang tải cài đặt hệ thống...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <Settings size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống (Settings)</h1>
              <p className="text-slate-500 text-sm">Quản lý cấu hình dòng chữ chạy và các tùy chỉnh ứng dụng</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow transition disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check size={18} />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
              </>
            )}
          </button>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 text-sm animate-fade-in">
            <Check className="text-emerald-600 flex-shrink-0" size={20} />
            <span>Cài đặt đã được lưu lại thành công và đồng bộ ổn định vào Database & LocalStorage!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Marquee Banner Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Type size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Cấu hình Dòng Chữ Chạy (Marquee Banner)</h2>
            </div>
            
            {/* Toggle Enable/Disable */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">
                {marqueeEnabled ? 'Đang bật' : 'Đang tắt'}
              </span>
              <button
                type="button"
                onClick={() => setMarqueeEnabled(!marqueeEnabled)}
                className="text-slate-700 hover:text-blue-600 transition"
              >
                {marqueeEnabled ? (
                  <ToggleRight size={36} className="text-blue-600" />
                ) : (
                  <ToggleLeft size={36} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Marquee Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Nội dung dòng chữ chạy:
              </label>
              <button
                type="button"
                onClick={handleResetDefault}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition"
              >
                <RotateCcw size={12} />
                <span>Khôi phục mặc định</span>
              </button>
            </div>
            
            <textarea
              rows={3}
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              placeholder="Nhập nội dung slogan hoặc câu nhắc nhở..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 text-sm leading-relaxed"
            />
          </div>

          {/* Direction & Speed Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Direction Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ArrowLeftRight size={16} className="text-blue-600" />
                <span>Hướng chạy của chữ:</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMarqueeDirection('right')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                    marqueeDirection === 'right'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Từ Trái sang Phải (➔)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMarqueeDirection('left')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                    marqueeDirection === 'left'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Từ Phải sang Trái (⬅)</span>
                </button>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Gauge size={16} className="text-blue-600" />
                  <span>Tốc độ chạy:</span>
                </label>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {marqueeSpeed}x
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="3.0"
                step="0.1"
                value={marqueeSpeed}
                onChange={(e) => setMarqueeSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Chậm (0.3x)</span>
                <span>Vừa (1.0x)</span>
                <span>Nhanh (2.0x)</span>
                <span>Rất nhanh (3.0x)</span>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <Eye size={14} />
              <span>Xem trước (Live Preview):</span>
            </div>
            
            {marqueeEnabled ? (
              <div className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg overflow-hidden whitespace-nowrap text-sm font-semibold shadow-inner border border-blue-500">
                <div
                  className="inline-block transition-all"
                  style={{
                    animation: `marquee-preview ${10 / marqueeSpeed}s linear infinite`,
                    animationDirection: marqueeDirection === 'right' ? 'reverse' : 'normal'
                  }}
                >
                  {marqueeText || DEFAULT_SLOGAN} • {marqueeText || DEFAULT_SLOGAN}
                </div>
              </div>
            ) : (
              <div className="w-full bg-slate-100 text-slate-400 py-3 px-4 rounded-lg text-center text-sm border border-dashed border-slate-300 italic">
                Dòng chữ chạy hiện đang bị ngắt (Disabled)
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Other Integration Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4">
            Cài đặt tích hợp Anki & Obsidian
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">AnkiConnect URL</label>
              <input
                type="text"
                value={ankiConnectUrl}
                onChange={(e) => setAnkiConnectUrl(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Tên Anki Deck mặc định</label>
              <input
                type="text"
                value={defaultDeckName}
                onChange={(e) => setDefaultDeckName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Đường dẫn Obsidian Vault Path</label>
              <input
                type="text"
                value={obsidianVaultPath}
                onChange={(e) => setObsidianVaultPath(e.target.value)}
                placeholder="C:\Users\username\Documents\ObsidianVault"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Floating Bar for quick save on long page */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check size={20} />
                <span>Đã lưu tất cả cài đặt!</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả cài đặt'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
