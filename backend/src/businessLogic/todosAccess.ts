import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

// @ts-ignore
const XAWS = AWSXRay.captureAWS(AWS);

// const logger = createLogger('TodosAccess');
const docClient = new DocumentClient();
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
  
  export async function createTodo(newItem: TodoItem): Promise<TodoItem> {
    await docClient.put({
      TableName: todosTable,
      Item: newItem,
    }).promise();
  
    return newItem;
  }
  
  export async function updateTodo(userId: string, todoId: string, updateTodoData: TodoUpdate): Promise<void> {
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