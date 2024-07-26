import React, { useEffect, useState } from 'react';
import useSocket from './hooks/useSocket';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import Chat from './Chat';
import './index.css';

function App() {
    const socket = useSocket('http://localhost:3000');
    const [isConnected, setIsConnected] = useState(false);
    const [isEntered, setIsEntered] = useState(false);
    const [user, setUser] = useState('');
    const [users, setUsers] = useState([]);
    const [room, setRoom] = useState('');
  
    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            console.log('socket connected');
            setIsConnected(true);
        };

        socket.on('connect', handleConnect);

        socket.on('message', (message) => {
            console.log(`Message is: ${message}`);
        });

        socket.on('userjoined', (joinedUsers) => {
            setUsers(joinedUsers); 
            
        });

        socket.on('userleft', (leftUsername) => {
            setUsers((prevUsers) => prevUsers.filter((user) => user.username !== leftUsername));
        });

        return () => {
            socket.off('connect', handleConnect);
            socket.off('userjoined');
            socket.off('userleft');
        };
    }, [socket]);

    const handleEnter = (event) => {
        event.preventDefault();
        console.log('User:', user);
        console.log('Room:', room);
        socket.emit('joinedroom', { user: user, room: room });
        setIsEntered(true);
    };

    const handleRoomSelect = (eventKey) => {
        setRoom(eventKey);
    };

    return (
        <>
            {isConnected && (
                <div className='bg-gradient-to-r from-cyan-500 to-blue-900 flex flex-col items-center justify-center h-screen'>
                    <h1 className='text-3xl font-bold mb-4 text-yellow-300 font-serif'>CHATROOM</h1>
                    {!isEntered && (
                        <form onSubmit={handleEnter} className='bg-gradient-to-tr from-gray-600 to-black text-white p-4 shadow-md rounded w-full max-w-md'>
                            <label htmlFor='username' className='block mb-2'>
                                Username:
                                <input
                                    type='text'
                                    value={user}
                                    className='border border-black p-2 w-full text-black font-bold'
                                    id='username'
                                    required
                                    onChange={(e) => {
                                        setUser(e.target.value);
                                    }}
                                />
                            </label>
                            <label className='block mb-2'>
                                Enter room:
                                <DropdownButton 
                                    id='dd' 
                                    title={room || 'Select room'} 
                                    className='mb-2 py-2  w-full ' 
                                    onSelect={handleRoomSelect} 
                                >
                                    <Dropdown.Item eventKey='room1' className='transition-transform hover:translate-x-3'>
                                        room1
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey='room2' className='transition-transform hover:translate-x-3 '>
                                        room2
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey='room3' className='transition-transform hover:translate-x-3 '>
                                        room3
                                    </Dropdown.Item>
                                </DropdownButton>
                            </label>
                            <button className='bg-blue-500 text-white p-2 rounded w-full'>Submit</button>
                        </form>
                    )}
                    {isEntered && (
                        <Chat socket={socket} user={user} room={room} users={users}/>
                    )}
                </div>
            )}
        </>
    );
}

export default App;
