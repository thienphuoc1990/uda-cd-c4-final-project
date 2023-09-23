// import { TodosAccess } from './todosAcess';
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem';
// import { CreateTodoRequest } from '../requests/CreateTodoRequest';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
// import { createLogger } from '../utils/logger';
// import * as uuid from 'uuid';
// import * as createError from 'http-errors';
import * as AWS  from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

const todosTable = process.env.TODOS_TABLE;
const indexName = process.env.TODOS_CREATED_AT_INDEX;

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    const result = await docClient.query({
        TableName: todosTable,
        IndexName: indexName,
        KeyConditionExpression: 'paritionKey = :paritionKey',
        ExpressionAttributeValues: {
            paritionKey: userId,
        },
      }).promise();
    
      const items = result.Items as TodoItem[];
      return items;
}
