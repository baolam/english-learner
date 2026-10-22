import { render, screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';

jest.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

jest.mock('./MarqueeBanner', () => ({
  MarqueeBanner: () => <div data-testid="mock-marquee">Marquee</div>,
}));

describe('AppLayout', () => {
  it('renders the sidebar, children, and marquee banner', () => {
    render(
      <AppLayout>
        <div data-testid="page-content">Page content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-marquee')).toBeInTheDocument();
  });

  it('renders children inside the main content area, between sidebar and marquee in DOM order', () => {
    render(
      <AppLayout>
        <div data-testid="page-content">Page content</div>
      </AppLayout>
    );

    const sidebar = screen.getByTestId('mock-sidebar');
    const content = screen.getByTestId('page-content');
    const marquee = screen.getByTestId('mock-marquee');

    // DOM order: sidebar, then content, then marquee banner at the bottom.
    expect(sidebar.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(content.compareDocumentPosition(marquee) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
