import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodosPage from './page';
import { useTodos } from '@/hooks/useTodos';
import { useSchedules } from '@/hooks/useSchedules';
import { toast } from 'sonner';

jest.mock('@/hooks/useTodos');
jest.mock('@/hooks/useSchedules');
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedUseTodos = useTodos as jest.Mock;
const mockedUseSchedules = useSchedules as jest.Mock;

const baseTodos = [
  { id: 't1', title: 'Buy milk', description: 'From the shop', isCompleted: false, scheduleId: undefined },
  { id: 't2', title: '[Nghiên cứu] Read paper', description: '', isCompleted: false, scheduleId: undefined },
  { id: 't3', title: '[Thường nhật] Morning walk', description: '', isCompleted: false, scheduleId: undefined },
  { id: 't4', title: 'Done task', description: '', isCompleted: true, scheduleId: undefined },
];

const schedules = [{ id: 's1', title: 'IELTS Prep', startTime: 'a', endTime: 'b' }];

function setup(todosOverride?: any[], hookOverrides?: Partial<ReturnType<typeof useTodos>>) {
  const createTodo = jest.fn().mockResolvedValue({});
  const updateTodo = jest.fn().mockResolvedValue({});
  const deleteTodo = jest.fn().mockResolvedValue(undefined);
  const toggleTodo = jest.fn().mockResolvedValue({});

  mockedUseTodos.mockReturnValue({
    todos: todosOverride ?? baseTodos,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    ...hookOverrides,
  });
  mockedUseSchedules.mockReturnValue({ schedules, isLoading: false, error: null, refetch: jest.fn(), updateSchedule: jest.fn() });

  return { createTodo, updateTodo, deleteTodo, toggleTodo };
}

describe('TodosPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('categorizes todos into research, routine, pending, and completed sections', () => {
    setup();
    render(<TodosPage />);

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('[Nghiên cứu] Read paper')).toBeInTheDocument();
    expect(screen.getByText('[Thường nhật] Morning walk')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();

    expect(screen.getByText('Research & Discussions')).toBeInTheDocument();
    expect(screen.getByText('Daily Routines')).toBeInTheDocument();
  });

  it('shows the empty state when there are no pending normal tasks', () => {
    setup([]);
    render(<TodosPage />);
    expect(screen.getByText('No pending tasks. Great job!')).toBeInTheDocument();
  });

  it('renders the goal badge using the matching schedule title', () => {
    setup([{ id: 't5', title: 'Practice speaking', description: '', isCompleted: false, scheduleId: 's1' }]);
    render(<TodosPage />);
    expect(screen.getByText('Goal: IELTS Prep')).toBeInTheDocument();
  });

  it('toggles a todo without opening the edit modal', async () => {
    const { toggleTodo } = setup();
    render(<TodosPage />);

    const row = screen.getByText('Buy milk').parentElement!.parentElement!;
    const toggleBtn = within(row).getByRole('button');
    await userEvent.click(toggleBtn);

    expect(toggleTodo).toHaveBeenCalledWith(baseTodos[0]);
    expect(screen.queryByText('Edit Todo')).not.toBeInTheDocument();
  });

  it('opens the edit modal when clicking a todo row, and saves changes', async () => {
    const { updateTodo } = setup();
    render(<TodosPage />);

    await userEvent.click(screen.getByText('Buy milk'));
    expect(screen.getByText('Edit Todo')).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue('Buy milk');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Buy oat milk');

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(updateTodo).toHaveBeenCalledWith('t1', {
        title: 'Buy oat milk',
        description: 'From the shop',
        scheduleId: undefined,
      })
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('deletes a todo from the edit modal', async () => {
    const { deleteTodo } = setup();
    render(<TodosPage />);

    await userEvent.click(screen.getByText('Buy milk'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteTodo).toHaveBeenCalledWith('t1'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('creates a new todo via the create modal', async () => {
    const { createTodo } = setup();
    render(<TodosPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create Todo/ }));
    const modal = screen.getByText('Create New Todo').closest('.fixed') as HTMLElement;

    const titleInput = within(modal).getByPlaceholderText('What needs to be done?');
    await userEvent.type(titleInput, 'New task');

    const submitBtn = within(modal).getByRole('button', { name: 'Create Todo' });
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(createTodo).toHaveBeenCalledWith({
        title: 'New task',
        description: '',
        scheduleId: undefined,
      })
    );
    expect(toast.success).toHaveBeenCalled();
    expect(screen.queryByText('Create New Todo')).not.toBeInTheDocument();
  });

  it('disables the create-modal submit button while the title is empty', async () => {
    setup();
    render(<TodosPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create Todo/ }));
    const modal = screen.getByText('Create New Todo').closest('.fixed') as HTMLElement;
    const submitBtn = within(modal).getByRole('button', { name: 'Create Todo' });

    expect(submitBtn).toBeDisabled();
  });
});
