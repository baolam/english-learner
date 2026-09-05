import { Request, Response } from 'express';
import * as subjectService from './subject.service';

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const { parentId, search } = req.query;
    const subjects = await subjectService.getAllSubjects({
      parentId: parentId as string | undefined,
      search: search as string | undefined
    });
    res.status(200).json(subjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subject = await subjectService.getSubjectById(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.status(200).json(subject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, description, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const subject = await subjectService.createSubject({ name, description, parentId });
    res.status(201).json(subject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;
    const subject = await subjectService.updateSubject(id, { name, description, parentId });
    res.status(200).json(subject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await subjectService.deleteSubject(id);
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
