const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Pool = require('pg').Pool;
const config = require('./core/config.json');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http').Server(app);
const io = require('socket.io')(http);
global.config = Object.assign(process.env.ENV || config.development);
global.config['root'] = __dirname;
global.util = require('./core/util');
require('dotenv').config({ path: '../.env' })

global.pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PW,
    port: process.env.POSTGRES_PORT,
});
require('./core/init')();

/**
 * Configure app CORS, BodyParser, Morgan
 */
app.use(cors());
app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: false}) );
app.use(bodyParser.json());

/**
 * Socket.io
 */
const chatQueries = require('./models/chats');
io.on('connection', (socket) => {
    socket.on('getChats', (user) => { 
        if (user)
            chatQueries.getChats(user, (chats) => socket.emit('chats', chats));
        else
            socket.emit('chats', []); 
    });
    socket.on('getChat', (chat) => { 
        chatQueries.getChat(chat, (messages) => socket.emit('chat', {chat: chat, messages: messages}));
        socket.join(`${chat.id}`);
    });
    socket.on('sendMessage', (message) => {
        chatQueries.addMessage(message, (addedMessage) => {
            io.to(`${message.chat.id}`).emit('receivedMessage', addedMessage);
        });
    });
});

/**
 * Begin listening for requests
 */
const port = process.env.PORT || global.config.port;
http.listen(port, () => console.log(`Listening on port ${global.config.port}`));