import { Request, Response } from 'express';
import * as todoService from './todo.service';
import { asyncHandler } from '../../utils/async-handler';
import { BadRequestError } from '../../errors/app-error';

export const getAllTodos = asyncHandler(async (req: Request, res: Response) => {
  const todos = await todoService.getAllTodos();
  res.status(200).json(todos);
});

export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, scheduleId, parentId } = req.body;
  if (!title) {
    throw new BadRequestError('Title is required');
  }
  const todo = await todoService.createTodo({ title, description, scheduleId, parentId });
  res.status(201).json(todo);
});

export const updateTodo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, isCompleted, scheduleId, parentId } = req.body;
  const todo = await todoService.updateTodo(id, { title, description, isCompleted, scheduleId, parentId });
  res.status(200).json(todo);
});

export const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await todoService.deleteTodo(id);
  res.status(200).json({ message: 'Todo deleted successfully' });
});
