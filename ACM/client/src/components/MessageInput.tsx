import React from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: (e?: React.FormEvent) => void;
  isDnDActive: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  inputText, setInputText, handleSendMessage, isDnDActive 
}) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-t z-10 dark:border-slate-800 transition-colors duration-300">
      <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isDnDActive) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={isDnDActive ? "Do Not Disturb active..." : "Type a message..."}
            disabled={isDnDActive}
            className="w-full border-2 border-gray-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl resize-none min-h-[3.5rem] max-h-[150px] bg-gray-50 dark:bg-slate-800/50 p-3 outline-none text-sm dark:text-white placeholder-gray-400 transition-all"
            rows={1}
          />
        </div>

        {/* Feature #9: Send Button (Disabled in DND) */}
        <button 
          type="submit" 
          disabled={isDnDActive || !inputText.trim()} 
          className={`p-3 rounded-xl transition-all flex items-center justify-center shadow-md ${
            isDnDActive || !inputText.trim()
              ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg transform active:scale-95'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
      <p className="text-[10px] text-gray-400 text-center mt-2">
        Press Enter to send, Shift + Enter for new line.
      </p>
    </div>
  );
};

export default MessageInput;
