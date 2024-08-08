const AWS = require("aws-sdk");

const response = {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST"
    },
    body: ""
};


AWS.config.update({
  region: process.env.AWS_REGION,
  credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY),
});
const IVSChat = new AWS.Ivschat();

exports.chatAuthHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`chatAuthHandler only accepts POST method, you tried: ${event.httpMethod}`);
    }

    console.info('chatAuthHandler received:', event);

    const body = JSON.parse(event.body);
    const { arn, roomIdentifier, userId } = body;
    const roomId = arn || roomIdentifier;
    const additionalAttributes = body.attributes || {};
    const capabilities = body.capabilities || [];
    const durationInMinutes = body.durationInMinutes || 55;

    if (!roomId || !userId) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: 'Missing parameters: `arn or roomIdentifier`, `userId`' });
      return response;
    }

    const params = {
      roomIdentifier: `${roomId}`,
      userId: `${userId}`,
      attributes: { ...additionalAttributes },
      capabilities: capabilities,
      sessionDurationInMinutes: durationInMinutes,
    };

    try {
      const data = await IVSChat.createChatToken(params).promise();
      console.info("Got data:", data);
      response.statusCode = 200;
      response.body = JSON.stringify(data);
    } catch (err) {
      console.error('ERROR: chatAuthHandler > IVSChat.createChatToken:', err);
      response.statusCode = 500;
      response.body = err.stack;
    }

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
