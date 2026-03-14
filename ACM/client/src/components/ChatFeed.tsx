import React from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { User, Message } from '../types';
import Avatar from './Avatar';

interface ChatFeedProps {
  messages: Message[];
  currentUser: User;
  isDnDActive: boolean;
}

const ChatFeed: React.FC<ChatFeedProps> = ({ messages, currentUser, isDnDActive }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth dark:bg-slate-900 transition-colors duration-300" id="chat-feed">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-4 ${msg.user_name === currentUser.name ? 'justify-end' : ''}`}>
          
          {/* Other user bubble */}
          {msg.user_name !== currentUser.name && (
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-1">
                <Avatar src={undefined} fallback={msg.user_name} className="w-6 h-6" />
                <span className="text-xs text-gray-400 font-semibold">{msg.user_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 shadow-sm p-4 rounded-xl rounded-tl-none relative border border-gray-100 dark:border-slate-700 group hover:shadow-md transition-all">
                <p className="text-sm leading-relaxed whitespace-pre-wrap dark:text-gray-200">{msg.message}</p>
                
                {/* Feature #5: Message Actions (Copy, Delete) */}
                <div className="absolute -top-2 -right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white dark:bg-slate-900 shadow p-1 rounded-full text-gray-400 hover:text-indigo-600 border dark:border-slate-700">
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Current user bubble */}
          {msg.user_name === currentUser.name && (
            <div className="max-w-[80%]">
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-xs text-gray-400 font-semibold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="bg-indigo-600 text-white shadow-sm p-4 rounded-xl rounded-br-none relative hover:shadow-lg transition-all">
                {/* Feature #6: Polls/Docs inside chat */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex items-center justify-end mb-2 space-x-2 opacity-80">
                    <div className="bg-white/20 p-1 rounded hover:bg-white/40 cursor-pointer backdrop-blur-sm">
                      <FileText size={16} />
                    </div>
                    <span className="text-xs font-mono text-indigo-200">{msg.attachments[0].name}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Feature #12: Notifications Banner */}
      {isDnDActive && (
        <div className="flex justify-center mt-6">
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900 text-sm font-medium flex items-center gap-2 max-w-full animate-in fade-in zoom-in duration-300">
            <AlertCircle size={16} />
            Notification Suppressed (Do Not Disturb Active)
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFeed;
