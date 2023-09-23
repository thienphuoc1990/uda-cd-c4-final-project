// import { TodosAccess } from './todosAcess';
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
// import { createLogger } from '../utils/logger';
import * as uuid from 'uuid';
// import * as createError from 'http-errors';
import * as AWS from 'aws-sdk';
import dateFormat from 'dateformat';

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const todosTable = process.env.TODOS_TABLE;
const indexName = process.env.TODOS_CREATED_AT_INDEX;
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

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

export async function updateTodo(userId: string, todoId: string, updateTodoData: UpdateTodoRequest): Promise<void> {
  await docClient.update({
    TableName: todosTable,
    Key: {
      userId: userId,
      todoId: todoId,
    },
    UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
    ExpressionAttributeNames: {
      "#name": "name",
      "#dueDate": "dueDate",
      "#done": "done",
    },
    ExpressionAttributeValues: {
      ":name": updateTodoData.name,
      ":dueDate": updateTodoData.dueDate,
      ":done": updateTodoData.done,
    }
  }).promise();
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  await docClient.delete({
    TableName: todosTable,
    Key: {
      userId: userId,
      todoId: todoId,
    },
  }).promise();
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: `${userId}-${todoId}`,
    Expires: parseInt(urlExpiration),
  })
}