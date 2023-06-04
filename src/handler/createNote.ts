'use strict'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
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
export const createNoteHandler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: APIGatewayProxyCallback
) => {
  let data: Item = JSON.parse(event.body!)
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesID: data.notesID,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: 'attribute_not_exists(notesID)',
    }
    const res = await ddbDocClient.send(new PutCommand(params))
    return cb(null, send(201, res))
  } catch (err) {
    return cb(null, send(500, err.message))
  }
}

// const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
// const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

// const client = new DynamoDBClient({})
// const docClient = DynamoDBDocumentClient.from(client)

// module.exports.createNote = async (event, context, cb) => {
//   const data = JSON.parse(event)
//   try {
//     const command = new PutCommand({
//       TableName: 'notes',
//       Item: {
//         notesID: data.notesID,
//         title: data.title,
//         description: data.description,
//       },
//       ConditionExpression: 'attribute_not_exists(notesID)',
//       removeUndefinedValues: true,
//     })

//     const response = await docClient.send(command)
//     return JSON.stringify(response)
//   } catch (err) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify(err.message),
//     }
//   }
// }
