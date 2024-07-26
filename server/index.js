const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();

app.use(express.static(path.join(__dirname, '../client/public')));

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

const server = http.createServer(app);

const io = socketio(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
});

const rooms = {};
const messages = {};

io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('joinedroom', ({ user, room }) => {
        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = {};
        }
        rooms[room][socket.id] = { username: user };

        io.to(room).emit('userjoined', Object.values(rooms[room]));

        if (messages[room]) {
            socket.emit('receive_msg', messages[room]);
        }

        const announcement = { username: 'System', message: `${user} has joined the room`, time: new Date().toLocaleTimeString() };
        messages[room] = messages[room] || [];
        messages[room].push(announcement);
        io.to(room).emit('receive_msg', messages[room]);
    });

    socket.on('disconnect', () => {
        Object.keys(rooms).forEach((room) => {
            if (rooms[room][socket.id]) {
                const { username } = rooms[room][socket.id];
                delete rooms[room][socket.id];

                io.to(room).emit('userleft', username);

                const announcement = { username: 'System', message: `${username} has left the room`, time: new Date().toLocaleTimeString() };
                messages[room] = messages[room] || [];
                messages[room].push(announcement);
                io.to(room).emit('receive_msg', messages[room]);
            }
        });
        console.log('Disconnected:', socket.id);
    });

    socket.on('send_msg', (msg) => {
        if (!messages[msg.room]) {
            messages[msg.room] = [];
        }
        const newMsg = {
            username: msg.user,
            time: msg.time,
            message: msg.message
        };
        messages[msg.room].push(newMsg);
        io.to(msg.room).emit('receive_msg', [newMsg]);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
