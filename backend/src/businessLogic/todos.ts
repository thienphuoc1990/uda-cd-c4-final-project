import * as TodosAccess from '../dataLayer/todosAccess';
import * as AttachmentUtils from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
// import { createLogger } from '../utils/logger';
import * as uuid from 'uuid';
// import * as createError from 'http-errors';
import dateFormat from 'dateformat';

const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return TodosAccess.getTodosForUser(userId);
}

export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
  const itemId = uuid.v4()
  const newItem: TodoItem = {
    todoId: itemId,
    userId: userId,
    done: false,
    createdAt: dateFormat(Date.now(), 'yyyy-mm-dd') as string,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${userId}-${itemId}`,
    ...newTodo,
  }

  await TodosAccess.createTodo(newItem);

  return newItem;
}

export async function updateTodo(userId: string, todoId: string, UpdateTodoRequest: UpdateTodoRequest): Promise<void> {
  await TodosAccess.updateTodo(userId, todoId, UpdateTodoRequest);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  await TodosAccess.deleteTodo(userId, todoId);
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  return await AttachmentUtils.createAttachmentPresignedUrl(userId, todoId);
}