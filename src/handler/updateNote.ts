'use strict'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayEvent, Context, APIGatewayProxyCallback } from 'aws-lambda'
import { Item } from '../types'

const client = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(client)
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  }
}

export const updateNoteHandler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: APIGatewayProxyCallback
) => {
  const notesID = event.pathParameters!.id
  const data: Item = JSON.parse(event.body!)

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesID },
      UpdateExpression: 'set #title= :title, #body = :body',
      ExpressionAttributeNames: { '#title': 'title', '#body': 'body' },
      ExpressionAttributeValues: { ':title': data.title, ':body': data.body },
      ConditionExpression: 'attribute_exists(notesID)',
    }
    const res = await ddbDocClient.send(new UpdateCommand(params))
    return cb(null, send(201, res))
  } catch (err) {
    return cb(null, send(500, err.message))
  }
}
