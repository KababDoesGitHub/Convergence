import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatFeed from './ChatFeed';
import MessageInput from './MessageInput';
import { User, Message, PowerLog } from '../types';

interface MainChatProps {
  user: User;
  onLogout: () => void;
}

const MainChat: React.FC<MainChatProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDnDActive, setIsDnDActive] = useState(false);
  const [isSecurityFreeze, setIsSecurityFreeze] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO and fetch rooms
  useEffect(() => {
    fetchRooms();
    const socket = io('/', {
      auth: { token: localStorage.getItem('token') }
    });
    socketRef.current = socket;

    socket.on('new_message', (msg: any) => {
      const formattedMsg: Message = {
        id: msg.id,
        room_id: msg.room_id,
        user_name: msg.user_name,
        message: msg.message || msg.content,
        created_at: msg.created_at,
        attachments: msg.attachments || []
      };
      
      setMessages((prev) => {
        if (prev.find(m => m.id === formattedMsg.id)) return prev;
        return [...prev, formattedMsg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
        if (data.length > 0 && !selectedRoomId) {
          setSelectedRoomId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Fetch messages when room changes
  useEffect(() => {
    if (selectedRoomId) {
      fetchMessages(selectedRoomId);
      socketRef.current?.emit('join_room', selectedRoomId.toString());
    }
    return () => {
      if (selectedRoomId) {
        socketRef.current?.emit('leave_room', selectedRoomId.toString());
      }
    };
  }, [selectedRoomId]);

  const fetchMessages = async (roomId: number) => {
    try {
      const response = await fetch(`/api/messages/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((m: any) => ({
          id: m.id,
          room_id: m.room_id,
          user_name: m.user_name,
          message: m.message || m.content,
          created_at: m.created_at,
          attachments: m.attachments || []
        })));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedRoomId) return;

    const content = inputText;
    setInputText(''); // Clear early for better UX

    try {
      const response = await fetch(`/api/messages/${selectedRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        console.error('Failed to send message:', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <Header 
        user={user}
        isEmergencyMode={isEmergencyMode}
        isSecurityFreeze={isSecurityFreeze}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminPanelOpen={isAdminPanelOpen}
        setIsAdminPanelOpen={setIsAdminPanelOpen}
        hasNotifications={messages.length > 5}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          user={user}
          messages={messages}
          rooms={rooms}
          isDnDActive={isDnDActive}
          setIsDnDActive={setIsDnDActive}
          isEmergencyMode={isEmergencyMode}
          setIsEmergencyMode={setIsEmergencyMode}
          selectedRoomId={selectedRoomId}
          onRoomSelect={(id) => setSelectedRoomId(id)}
        />

        <main className="flex-1 flex flex-col relative z-0">
          <ChatFeed 
            messages={messages.filter(m => (!selectedRoomId || m.room_id === selectedRoomId) && (!searchQuery || m.message.toLowerCase().includes(searchQuery.toLowerCase()) || m.user_name.toLowerCase().includes(searchQuery.toLowerCase())))}
            currentUser={user}
            isDnDActive={isDnDActive}
          />
          
          {selectedRoomId ? (
            <MessageInput 
              inputText={inputText}
              setInputText={setInputText}
              handleSendMessage={handleSendMessage}
              isDnDActive={isDnDActive}
            />
          ) : (
            <div className="p-8 text-center text-gray-500 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
              Select a room to start messaging
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainChat;
