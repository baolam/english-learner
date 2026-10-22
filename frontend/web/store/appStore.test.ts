import { useAppStore } from './appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ isRightPanelOpen: true, activeRightPanelTab: 'chat' });
  });

  it('has the expected initial state', () => {
    const state = useAppStore.getState();
    expect(state.isRightPanelOpen).toBe(true);
    expect(state.activeRightPanelTab).toBe('chat');
  });

  it('toggleRightPanel flips isRightPanelOpen', () => {
    useAppStore.getState().toggleRightPanel();
    expect(useAppStore.getState().isRightPanelOpen).toBe(false);

    useAppStore.getState().toggleRightPanel();
    expect(useAppStore.getState().isRightPanelOpen).toBe(true);
  });

  it('setRightPanelTab sets the tab and forces the panel open', () => {
    useAppStore.setState({ isRightPanelOpen: false });

    useAppStore.getState().setRightPanelTab('vocabulary');

    expect(useAppStore.getState().activeRightPanelTab).toBe('vocabulary');
    expect(useAppStore.getState().isRightPanelOpen).toBe(true);
  });

  it('setRightPanelTab accepts speaking too', () => {
    useAppStore.getState().setRightPanelTab('speaking');
    expect(useAppStore.getState().activeRightPanelTab).toBe('speaking');
  });
});
