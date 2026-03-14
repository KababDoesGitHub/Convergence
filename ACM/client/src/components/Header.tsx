import React from 'react';
import { 
  Search, Calendar, Bell, Settings, Lock, AlertCircle, Hash, Phone, ChevronDown 
} from 'lucide-react';
import Avatar from './Avatar';
import { User } from '../types';

interface HeaderProps {
  user: User;
  isEmergencyMode: boolean;
  isSecurityFreeze: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsAdminPanelOpen: (isOpen: boolean) => void;
  isAdminPanelOpen: boolean;
  hasNotifications: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  user, isEmergencyMode, isSecurityFreeze, searchQuery, setSearchQuery, 
  setIsAdminPanelOpen, isAdminPanelOpen, hasNotifications 
}) => {
  return (
    <nav className="h-16 bg-white border-b flex items-center justify-between px-4 z-20 relative dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Emergency Indicator */}
        {isEmergencyMode && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-2">
            <AlertCircle size={16} /> EMERGENCY ROOM ACTIVE
          </span>
        )}

        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Hash size={20} />
          WorkSpace<span className="font-light text-gray-500 dark:text-gray-400">UI</span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className={`hidden md:flex relative bg-white dark:bg-slate-800 border rounded-full shadow-md transition-all ${searchQuery ? 'w-64' : 'w-48'} items-center px-3 py-1`}>
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent px-2 py-1 outline-none text-sm dark:text-gray-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-3">
        <button onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}>
          {isSecurityFreeze ? (
            <Lock size={20} className="text-red-500 animate-pulse" />
          ) : (
            <Settings size={20} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full p-1" />
          )}
        </button>

        <div className="relative group">
          <Bell size={20} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full p-1 cursor-pointer" />
          {hasNotifications && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          )}

          {/* Feature #8: Calendar / Calls */}
          <div className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-lg py-2 text-sm opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto border border-gray-100 dark:border-slate-700 transition-opacity duration-200">
            <button className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 dark:text-gray-300">
              <Calendar size={16} /> Schedule
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 dark:text-gray-300">
              <Phone size={16} /> Call Logs
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l pl-4 ml-2 dark:border-slate-800">
          <Avatar src={user.avatar} fallback={user.name} />
          
          <div className="group relative">
            <button className="p-1 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400">
              <ChevronDown size={16} />
            </button>

            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-slate-900 shadow-xl rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 dark:border-slate-700">
              <button className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm rounded text-gray-600 dark:text-gray-300">
                <Calendar size={14} className="inline mr-2"/> Schedule
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm rounded text-gray-600 dark:text-gray-300">
                <Phone size={14} className="inline mr-2"/> Call Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
