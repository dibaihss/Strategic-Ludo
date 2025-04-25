import { View, Text, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJs from 'sockjs-client'

export default function SimpleWebSocketConnection() {
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Create new STOMP client
        const client = new Client({
            // Use the SockJS client with a connection timeout and optional headers
            webSocketFactory: () => {
                const socket = new SockJs('http://localhost:8080/ws', null, {
                    transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                    timeout: 10000,
                    // You might need these headers to handle CORS if configuring server-side isn't possible
                    headers: {
                        'Origin': 'http://localhost:8081'
                    }
                });
                return socket;
            },
            onConnect: () => {
                setConnected(true);
                console.log('Connected to WebSocket');
               
                // client.subscribe('/topic/public', (message) => {
                //     const receivedMessage = JSON.parse(message.body);
                //     console.log('Received message: ', receivedMessage);
                //     setMessage(JSON.stringify(receivedMessage));
                // });

            
            },
            onDisconnect: () => {
                console.log('Disconnected');
                setConnected(false);
            },
            onStompError: (error) => {
                console.error('STOMP error: ', error);
            },
            // Add reconnect options for better resilience
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        // Activate the client
        client.activate();
        setStompClient(client);

        return () => {
            if (client && client.connected) {
                client.deactivate();
            }
        };
    }, []);

    const handleSendMessage = () => {
        if (stompClient && stompClient.connected) {

            const messageToSend = { text: 'Hello from React Native!' };
            stompClient.subscribe('/topic/public', onMessageReceived);
            stompClient.publish({
                destination: '/app/chat.addUser',
                body: JSON.stringify({ sender: "username", type: 'JOIN' })
            });
            console.log('Message sent: ', messageToSend);
        } else {
            console.error('STOMP client is not connected');
        }
    };


    const onMessageReceived = (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received message: ', receivedMessage);
        setMessage(JSON.stringify(receivedMessage));
    }

    return (
        <View>
            <Text>SimpleWebSocketConnection</Text>
            <Text>Connected: {connected ? 'Yes' : 'No'}</Text>
            <Text>Message: {message}</Text>
            <Text>StompClient: {stompClient ? 'Yes' : 'No'}</Text>
            <Pressable onPress={handleSendMessage}>
                <Text>Send Message</Text>
            </Pressable>
            <Pressable onPress={() => stompClient.deactivate()}>
                <Text>Disconnect</Text>
            </Pressable>
        </View>
    )
}