import React, { useEffect, useState, useRef } from 'react';
import { Settings, Map, User, MessageSquare, Send, X } from 'lucide-react';
import { inputStore, setupKeyboardListeners } from '../utils/inputStore';

interface UIOverlayProps {
  onChatSend: (msg: string) => void;
  onColorChange: (color: string) => void;
  currentColor: string;
}

const COLORS = ['#06b6d4', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899'];

export const UIOverlay: React.FC<UIOverlayProps> = ({ onChatSend, onColorChange, currentColor }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const touchLookRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const cleanup = setupKeyboardListeners();
    return cleanup;
  }, []);

  // --- Joystick Logic (Left Side) ---
  const handleJoystickDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // Prevent camera look
    setIsDragging(true);
    updateJoystick(e);
  };

  const handleJoystickMove = (e: React.PointerEvent) => {
    if (isDragging) updateJoystick(e);
  };

  const handleJoystickUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    setJoystickPos({ x: 0, y: 0 });
    inputStore.move = { x: 0, y: 0 };
  };

  const updateJoystick = (e: React.PointerEvent) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;
    const maxRadius = 40;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxRadius;
      dy = Math.sin(angle) * maxRadius;
    }
    setJoystickPos({ x: dx, y: dy });
    inputStore.move = { x: dx / maxRadius, y: -(dy / maxRadius) };
  };

  // --- Camera Look Logic (Right Side / Full Screen) ---
  const handleLookDown = (e: React.PointerEvent) => {
    // Only capture look if not clicking UI elements
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    touchLookRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleLookMove = (e: React.PointerEvent) => {
    if (touchLookRef.current) {
      const deltaX = e.clientX - touchLookRef.current.x;
      const deltaY = e.clientY - touchLookRef.current.y;
      
      // Update inputStore directly
      inputStore.look.x = deltaX * 0.005; 
      inputStore.look.y = deltaY * 0.005;

      touchLookRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleLookUp = () => {
    touchLookRef.current = null;
    inputStore.look.x = 0;
    inputStore.look.y = 0;
  };

  const handleJump = (e: React.PointerEvent) => { 
      e.stopPropagation();
      inputStore.jump = true; 
  };

  const submitChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (chatInput.trim()) {
      onChatSend(chatInput);
      setChatInput("");
      setShowChat(false);
    }
  };

  return (
    <div 
        className="absolute inset-0 flex flex-col justify-between p-4 z-10 select-none touch-none"
        onPointerDown={handleLookDown}
        onPointerMove={(e) => { handleJoystickMove(e); handleLookMove(e); }}
        onPointerUp={(e) => { handleJoystickUp(e); handleLookUp(); }}
        onPointerLeave={(e) => { handleJoystickUp(e); handleLookUp(); }}
    >
      
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/50">
           <h1 className="text-xl font-bold text-slate-800 tracking-tight">Neon City</h1>
           {/* Nome da Vila Atualizado */}
           <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">📍 Vila Aurora</p>
        </div>

        <div className="flex gap-2">
           <button 
              onClick={() => setShowProfile(!showProfile)}
              className="pointer-events-auto p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:scale-105 transition-transform text-slate-700 active:scale-95"
            >
             <User size={24} />
           </button>
           <button className="pointer-events-auto p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:scale-105 transition-transform text-slate-700 active:scale-95">
             <Settings size={24} />
           </button>
        </div>
      </div>

      {/* Profile/Color Modal */}
      {showProfile && (
        <div className="absolute top-20 right-4 pointer-events-auto bg-white rounded-2xl p-4 shadow-xl border border-slate-100 w-64 animate-in slide-in-from-right-10 fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-700">Customize Avatar</h3>
             <button onClick={() => setShowProfile(false)}><X size={20} className="text-slate-400" /></button>
          </div>
          <p className="text-xs text-slate-500 mb-2">NEON COLOR</p>
          <div className="grid grid-cols-6 gap-2">
             {COLORS.map(c => (
               <button 
                 key={c}
                 onClick={() => onColorChange(c)}
                 className={`w-8 h-8 rounded-full border-2 ${currentColor === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                 style={{ backgroundColor: c }}
               />
             ))}
          </div>
        </div>
      )}

      {/* Chat Input Modal */}
      {showChat && (
        <div className="pointer-events-auto absolute bottom-24 left-4 right-4 md:left-1/3 md:right-1/3 bg-white rounded-2xl shadow-xl p-2 flex gap-2 animate-in slide-in-from-bottom-10 fade-in duration-200">
           <form onSubmit={submitChat} className="flex-1 flex gap-2">
             <input 
                autoFocus
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-slate-100 rounded-xl px-4 py-2 outline-none text-slate-800 font-bold"
             />
             <button type="submit" className="bg-cyan-500 text-white p-3 rounded-xl">
               <Send size={20} />
             </button>
           </form>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex justify-between items-end pb-4 pointer-events-none">
        {/* Joystick Zone (Left) */}
        <div 
            className="pointer-events-auto relative w-32 h-32"
            onPointerDown={handleJoystickDown}
        >
            <div ref={joystickRef} className="absolute inset-0 rounded-full border-2 border-white/30 bg-black/20 backdrop-blur-sm" />
            <div 
                className="absolute w-12 h-12 bg-white/90 rounded-full shadow-lg border-4 border-sky-200 transition-transform duration-75"
                style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-24px',
                    marginTop: '-24px',
                    transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
                }}
            />
        </div>

        {/* Buttons (Right) */}
        <div className="flex gap-4 items-end">
             <button 
                onClick={() => setShowChat(!showChat)}
                className="pointer-events-auto w-14 h-14 bg-white rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all text-slate-700 flex items-center justify-center"
             >
                <MessageSquare size={24} />
             </button>

             <button 
                onPointerDown={handleJump}
                className="pointer-events-auto w-20 h-20 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/30 hover:bg-cyan-300 active:bg-cyan-500 transition-colors text-white font-bold flex items-center justify-center border-4 border-cyan-200"
             >
                JUMP
             </button>
        </div>
      </div>
    </div>
  );
};