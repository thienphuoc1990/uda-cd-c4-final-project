// import { TodosAccess } from './todosAcess';
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
// import { createLogger } from '../utils/logger';
import * as uuid from 'uuid';
// import * as createError from 'http-errors';
import * as AWS from 'aws-sdk';
import dateFormat from 'dateformat';

const docClient = new AWS.DynamoDB.DocumentClient();

const todosTable = process.env.TODOS_TABLE;
const indexName = process.env.TODOS_CREATED_AT_INDEX;

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: indexName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  }).promise();

  const items = result.Items as TodoItem[];
  return items;
}

export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
  const itemId = uuid.v4()
  const newItem: TodoItem = {
    todoId: itemId,
    userId: userId,
    done: false,
    createdAt: dateFormat(Date.now(), 'yyyy-mm-dd') as string,
    ...newTodo,
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem,
  }).promise();

  return newItem;
}
