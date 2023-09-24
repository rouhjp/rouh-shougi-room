const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const CONNECTION_TABLE_NAME = "shougiConnections";

exports.handler = async (event, context) => {
  await ddb
    .delete({
      TableName: CONNECTION_TABLE_NAME,
      Key: {
        connectionId: event.requestContext.connectionId,
      },
    })
    .promise();
  return {
    statusCode: 200,
  };
}
