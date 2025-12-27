
import React, { useState, useEffect } from 'react';
import { GameState, Player } from '../types';
import { Timer, Send, StopCircle, CheckCircle2 } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  localPlayer: Player;
  onStop: (responses: Record<string, string>) => void;
  onSubmit: (responses: Record<string, string>) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, localPlayer, onStop, onSubmit }) => {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(60); // Optional timer visual

  const allFilled = gameState.categories.every(cat => responses[cat] && responses[cat].trim().length > 0);

  const handleChange = (cat: string, val: string) => {
    const newResponses = { ...responses, [cat]: val };
    setResponses(newResponses);
    onSubmit(newResponses);
  };

  const handleStop = () => {
    if (allFilled) {
      onStop(responses);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md py-4 border-b border-slate-800 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 text-slate-950 text-5xl font-black w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
            {gameState.letter}
          </div>
          <div>
             <h2 className="text-2xl font-bold">Ronda {gameState.round}</h2>
             <p className="text-slate-400">Encuentra palabras con "{gameState.letter}"</p>
          </div>
        </div>
        
        <div className="text-right">
           <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${timeLeft < 10 ? 'text-red-500' : 'text-slate-300'}`}>
             <Timer className="w-6 h-6" />
             0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
           </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 pb-32">
        {gameState.categories.map((cat) => (
          <div key={cat} className="group">
            <label className="block text-slate-400 text-sm font-semibold mb-1 ml-1 group-focus-within:text-yellow-400 transition-colors uppercase tracking-wider">
              {cat}
            </label>
            <div className="relative">
              <input 
                type="text"
                placeholder="..."
                value={responses[cat] || ''}
                onChange={(e) => handleChange(cat, e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-5 py-4 text-xl focus:border-yellow-400 outline-none transition-all placeholder:text-slate-700"
              />
              {responses[cat] && responses[cat].trim().toUpperCase().startsWith(gameState.letter) ? (
                 <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 w-6 h-6" />
              ) : responses[cat] && (
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">DEBE EMPEZAR CON {gameState.letter}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={handleStop}
            disabled={!allFilled}
            className={`w-full py-5 rounded-2xl font-black text-2xl tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl ${
              allFilled 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <StopCircle className="w-8 h-8" />
            BASTA TODO
          </button>
          <p className="text-center text-slate-500 text-xs mt-3">Rellena todos los campos para detener la ronda</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
