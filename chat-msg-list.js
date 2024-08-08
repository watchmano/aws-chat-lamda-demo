const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

const response = {
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST"
  },
  body: ""
};

exports.chatMsgListHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: `Method Not Allowed: ${event.httpMethod}` }),
    };
  }

  console.info('chatMsgListHandler received:', event);

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const roomArn = body.roomArn;
    console.log("chatMsgListHandler > roomArn:", roomArn);
    if (!roomArn) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing roomArn in request body' }),
      };
    }

    // Query DynamoDB or another storage service to retrieve messages
    const params = {
        TableName: 'ChatEvents',
        KeyConditionExpression: 'roomArn = :roomArn AND #ts BETWEEN :startTs AND :endTs',
        ExpressionAttributeNames: {
          '#ts': 'timestamp' // This is needed because 'timestamp' is a reserved word
        },
        ExpressionAttributeValues: {
          ':roomArn': roomArn,
          ':startTs': '2024-08-01T00:00:00Z', // Example start timestamp
          ':endTs': '2024-08-31T23:59:59Z'  // Example end timestamp
        }
      };
      

    const data = await DynamoDB.query(params).promise();
    console.info("chatMsgListHandler > DynamoDB.query > Success");
    response.statusCode = 200;
    response.body = JSON.stringify(data.Items);
  } catch (err) {
    console.error('ERROR: chatMsgListHandler > DynamoDB.query:', err);
    response.statusCode = 500;
    response.body = JSON.stringify({ error: err.message });
  }

  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
