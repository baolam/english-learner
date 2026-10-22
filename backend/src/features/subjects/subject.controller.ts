import { Request, Response } from 'express';
import * as subjectService from './subject.service';
import { asyncHandler } from '../../utils/async-handler';
import { NotFoundError, BadRequestError } from '../../errors/app-error';

export const getAllSubjects = asyncHandler(async (req: Request, res: Response) => {
  const { parentId, search } = req.query;
  const subjects = await subjectService.getAllSubjects({
    parentId: parentId as string | undefined,
    search: search as string | undefined
  });
  res.status(200).json(subjects);
});

export const getSubjectById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subject = await subjectService.getSubjectById(id);
  if (!subject) {
    throw new NotFoundError('Subject not found');
  }
  res.status(200).json(subject);
});

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, parentId } = req.body;
  if (!name) {
    throw new BadRequestError('Name is required');
  }
  const subject = await subjectService.createSubject({ name, description, parentId });
  res.status(201).json(subject);
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, parentId } = req.body;
  const subject = await subjectService.updateSubject(id, { name, description, parentId });
  res.status(200).json(subject);
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await subjectService.deleteSubject(id);
  res.status(200).json({ message: 'Subject deleted successfully' });
});
