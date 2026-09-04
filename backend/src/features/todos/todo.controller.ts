import { Request, Response } from 'express';
import * as todoService from './todo.service';

export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const todos = await todoService.getAllTodos();
    res.status(200).json(todos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const todo = await todoService.createTodo({ title, description });
    res.status(201).json(todo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, isCompleted } = req.body;
    const todo = await todoService.updateTodo(id, { title, description, isCompleted });
    res.status(200).json(todo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await todoService.deleteTodo(id);
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
