import React, { useEffect, useState } from 'react';

function Chat({ socket, user, room, users }) {
    const [currentMsg, setCurrentMsg] = useState('');
    const [allMsg, setAllMsg] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const receiveMessage = (messages) => {
            setAllMsg((prevMsgs) => [...prevMsgs, ...messages]);
        };

        socket.on('receive_msg', receiveMessage);

        return () => {
            socket.off('receive_msg', receiveMessage);
        };
    }, [socket]);

    const sendMsg = async () => {
        if (currentMsg.trim() !== '') {
            const msg = {
                user: user,
                message: currentMsg,
                room: room,
                time: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            await socket.emit('send_msg', msg);
            setCurrentMsg('');
        }
    };

    return (
        <>
            <div className='Chat-header'>
                <h1>{room}</h1>
                <p>Users:</p>
                <ul>
                    {users.map((user, index) => (
                        <li key={index}>{user.username}</li>
                    ))}
                </ul>
            </div>
            <div className='msgbox'>
                {allMsg && (
                    <ul>
                        {allMsg.map((msg, index) => (
                            <li key={index}>
                                <strong>{msg.username}</strong> ({msg.time}): {msg.message}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className='chat-foot'>
                <input 
                    type='text' 
                    value={currentMsg}
                    required 
                    onKeyPress={(event)=>{event.key==="Enter" &&  sendMsg()}}
                    onChange={e => setCurrentMsg(e.target.value)} 
                    placeholder='Type your message' 
                />
                <button onClick={sendMsg}>&#9658;</button>
            </div>
        </>
    );
}

export default Chat;
