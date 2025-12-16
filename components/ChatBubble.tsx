import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';

interface ChatBubbleProps {
  message: string | null;
  onTimeout?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onTimeout }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onTimeout) onTimeout();
      }, 5000); // Bubble lasts 5 seconds
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, onTimeout]);

  if (!visible || !message) return null;

  return (
    <Html position={[0, 2.5, 0]} center distanceFactor={10}>
      <div className="bg-white/90 text-slate-900 px-3 py-2 rounded-xl shadow-lg border border-sky-200 backdrop-blur-sm min-w-[100px] text-center transform -translate-y-4">
        <p className="text-sm font-semibold font-[Fredoka] leading-tight">{message}</p>
        {/* Triangle pointer */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white/90 border-r border-b border-sky-200"></div>
      </div>
    </Html>
  );
};