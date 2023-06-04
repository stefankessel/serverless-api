import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { APIGatewayEvent, Context, APIGatewayProxyCallback } from 'aws-lambda'

const client = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(client)
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  }
}

export const getNotesHandler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: APIGatewayProxyCallback
) => {
  try {
    const params: ScanCommandInput = {
      TableName: NOTES_TABLE_NAME,
    }

    const res = await ddbDocClient.send(new ScanCommand(params))
    return cb(null, send(200, res))
  } catch (err) {
    return cb(null, send(500, err.message))
  }
}
