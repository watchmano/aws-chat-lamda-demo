const AWS = require('aws-sdk');

// Configuring AWS SDK with the credentials
AWS.config.update({
    region: process.env.AWS_REGION,
    credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY),
});

const IVSChat = new AWS.Ivschat();

const response = {
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST"
  },
  body: ""
};

exports.chatRoomListHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: `Method Not Allowed: ${event.httpMethod}` }),
        };
    }

    console.info('Request received:', event);

    try {
        const action = event.queryStringParameters?.action;

        if (action === 'listRooms') {
            const data = await IVSChat.listRooms().promise();
            console.info("Success: listRooms");
            response.body = JSON.stringify(data);
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid action parameter' }),
            };
        }
        
        response.statusCode = 200;
        return response;
    } catch (err) {
        console.error('ERROR:', err);
        response.statusCode = 500;
        response.body = JSON.stringify({ error: err.message });
        return response;
    }
};
