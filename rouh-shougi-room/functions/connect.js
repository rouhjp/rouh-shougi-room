const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const CONNECTION_TABLE_NAME = "shougiConnections";

exports.handler = async (event, context) => {
  console.log("デバッグよ");
  console.log(event);
  console.log(context);
  console.log(event.requestContext?.connectionId);
  console.log("コネクションID");
  try {
    await ddb
      .put({
        TableName: CONNECTION_TABLE_NAME,
        Item: {
          connectionId: event.requestContext.connectionId,
        },
      })
      .promise();
  } catch (err) {
    console.log("エラー起きてますよ");
    console.log(err);
    return {
      statusCode: 500,
    };
  }
  console.log("OKですよ");
  return {
    statusCode: 200,
  };
};
