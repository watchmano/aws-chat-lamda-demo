const AWS = require('aws-sdk');
const IVSChat = new AWS.Ivschat();
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

exports.chatEventHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: `Method Not Allowed: ${event.httpMethod}` }),
    };
  }

  console.info('chatEventHandler received:', event);

  const body = JSON.parse(event.body);
  const { arn, eventAttributes, eventName } = body;

  // Prepare parameters for IVSChat and DynamoDB
  const params = { 
    roomIdentifier: arn,
    eventName,
    attributes: { ...eventAttributes }
  };

  const dynamoParams = {
    TableName: 'ChatEvents', // Replace with your DynamoDB table name
    Item: {
      roomArn: arn,
      eventName,
      timestamp: new Date().toISOString(), // Adding timestamp
      eventAttributes: { ...eventAttributes }
    }
  };

  try {
    // Send event to IVS Chat
    await IVSChat.sendEvent(params).promise();
    console.info("chatEventHandler > IVSChat.sendEvent > Success");

    // Store event in DynamoDB
    await DynamoDB.put(dynamoParams).promise();
    console.info("chatEventHandler > DynamoDB.put > Success");

    response.statusCode = 200;
    response.body = JSON.stringify({ 
      arn,
      status: "success" 
    });
  } catch (err) {
    console.error('ERROR: chatEventHandler:', err);
    response.statusCode = 500;
    response.body = JSON.stringify({ error: err.message });
  }

  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
