import React from 'react';

interface AvatarProps {
  src?: string;
  fallback: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, fallback, className = "" }) => (
  <div className={`relative ${className}`}>
    <img
      src={src || `https://ui-avatars.com/api/?name=${fallback}&background=6366f1&color=fff`}
      alt="Avatar"
      className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
    />
    {fallback && !src && (
      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-[10px] text-white rounded-full flex items-center justify-center">
        {fallback[0].toUpperCase()}
      </span>
    )}
  </div>
);

export default Avatar;
