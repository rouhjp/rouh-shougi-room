const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const CONNECTION_TABLE_NAME = "shougiConnections";

exports.handler = async (event, context) => {
  let connections;
  try {
    connections = await ddb.scan({ TableName: CONNECTION_TABLE_NAME }).promise();
  } catch (err) {
    console.log("困ったことにエラー起きてますよ");
    console.log(err);
    return {
      statusCode: 500,
    };
  }
  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  const message = JSON.parse(event.body).message;

  const sendMessages = connections.Items.map(async ({ connectionId }) => {
    console.log(connectionId);
    if (connectionId !== event.requestContext.connectionId) {
      console.log("これは他人だね");
      try {
        await callbackAPI
          .postToConnection({ ConnectionId: connectionId, Data: message })
          .promise();
      } catch (e) {
    console.log("エラーだね");
    console.log(e);
      }
    }
  });

  try {
    await Promise.all(sendMessages);
  } catch (e) {
    console.log("ここもエラーだね");
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  return { statusCode: 200 };
};
