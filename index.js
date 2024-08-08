const { chatAuthHandler } = require('./chat-auth');
const { chatEventHandler } = require('./chat-event');
const { chatMsgListHandler } = require('./chat-msg-list');
const { chatRoomListHandler } = require('./chat-room-list');

module.exports.authHandler = async (event) => {
    return await chatAuthHandler(event);
};

module.exports.eventHandler = async (event) => {
    return await chatEventHandler(event);
};

module.exports.msgListHandler = async (event) => {
    return await chatMsgListHandler(event);
};

module.exports.roomListHandler = async (event) => {
    return await chatRoomListHandler(event);
};
