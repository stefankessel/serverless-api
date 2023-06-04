import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb'
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

export const deleteNoteHandler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: APIGatewayProxyCallback
) => {
  try {
    const notesID = event.pathParameters!.id
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesID },
      ConditionExpression: 'attribute_exists(notesID)',
    }

    const res = await ddbDocClient.send(new DeleteCommand(params))

    cb(null, send(500, res))
  } catch (err) {
    return cb(null, send(500, err.message))
  }
}
