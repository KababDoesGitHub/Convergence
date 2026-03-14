import React from 'react';
import { Shield, AlertCircle, FileText } from 'lucide-react';
import { User, Message } from '../types';
import Avatar from './Avatar';

interface SidebarProps {
  user: User;
  messages: Message[];
  rooms: any[];
  isDnDActive: boolean;
  setIsDnDActive: (active: boolean) => void;
  isEmergencyMode: boolean;
  setIsEmergencyMode: (active: boolean) => void;
  selectedRoomId: number | null;
  onRoomSelect: (roomId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  messages,
  rooms,
  isDnDActive,
  setIsDnDActive,
  isEmergencyMode,
  setIsEmergencyMode,
  selectedRoomId,
  onRoomSelect
}) => {
  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r hidden md:flex flex-col z-10 transition-colors duration-300 dark:border-slate-800">
      <div className="p-4">
        <button 
          onClick={() => setIsDnDActive(!isDnDActive)} 
          className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
            isDnDActive 
              ? 'bg-red-50 dark:bg-red-900/10 text-red-600' 
              : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isDnDActive ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            Do Not Disturb
          </div>
          {isDnDActive && <AlertCircle size={16} />}
        </button>

        {/* Feature #2: Emergency Room Toggle (Mini) */}
        <button 
          onClick={() => setIsEmergencyMode(!isEmergencyMode)} 
          className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
            isEmergencyMode 
              ? 'bg-red-50 dark:bg-red-900/10 text-red-600' 
              : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield size={18} className={isEmergencyMode ? "text-red-500" : "text-gray-400"} />
            Emergency Room
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rooms</h3>
        <div className="space-y-1 mb-6">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                selectedRoomId === room.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
              {room.name}
            </button>
          ))}
        </div>

        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Messages</h3>

        {/* Feature #7: Filter by Date */}
        <div className="px-4 mb-4">
          <select className="w-full p-2 text-xs border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 outline-none rounded">
            <option>All Messages</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            onClick={() => onRoomSelect(msg.room_id)}
            className={`p-4 cursor-pointer border-l-4 transition-colors ${
              selectedRoomId === msg.room_id 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' 
                : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-medium text-sm dark:text-gray-200">{msg.user_name}</h4>
              <span className="text-xs text-gray-400">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{msg.message}</p>

            {/* Feature #6: File/Doc Preview */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="mt-2 flex items-center gap-3 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                <FileText size={14} />
                <span className="truncate">{msg.attachments[0].name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feature #5: User Profile & Status */}
      <div className="p-3 border-t bg-gray-50 dark:bg-slate-800/50 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} fallback={user.name} />
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold dark:text-gray-200">{user.name}</span>
            <span className={`text-xs ${isDnDActive ? 'text-red-500' : 'text-emerald-600'} capitalize`}>
              {isDnDActive ? 'Away (DND)' : user.role === 'admin' ? 'Online (Admin)' : 'Online'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
