import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (serverUrl) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
      
        const newSocket = io(serverUrl, { autoConnect: false });
        setSocket(newSocket);

        newSocket.connect();

       
        return () => {
            newSocket.disconnect();
        };
    }, [serverUrl]);

    return socket;
};

export default useSocket;
