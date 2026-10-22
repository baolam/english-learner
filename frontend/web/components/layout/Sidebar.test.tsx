import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

// Bypass real drag-and-drop mechanics (not practical/useful to test via jsdom
// here) and just render children synchronously like a plain list.
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Droppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({ droppableProps: {}, innerRef: () => {}, placeholder: null }),
  Draggable: ({ children }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode }) =>
    children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}));

const EXPECTED_NAV = [
  { label: 'Dashboard', href: '/' },
  { label: 'Study Sessions', href: '/sessions' },
  { label: 'Library', href: '/library' },
  { label: 'Schedules', href: '/schedules' },
  { label: 'Todos', href: '/todos' },
  { label: 'Screenshots', href: '/screenshots' },
  { label: 'Audios', href: '/audios' },
  { label: 'AI Copilot', href: '/copilot' },
];

describe('Sidebar', () => {
  it('renders every nav item with the correct link target', () => {
    render(<Sidebar />);

    for (const item of EXPECTED_NAV) {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.href);
    }
  });

  it('renders a Settings link at the bottom', () => {
    render(<Sidebar />);

    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });
});
