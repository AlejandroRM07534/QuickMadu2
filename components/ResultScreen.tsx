
import React from 'react';
import { GameState, Player } from '../types';
import { Trophy, ArrowRight, CheckCircle, XCircle, Info } from 'lucide-react';

interface ResultScreenProps {
  gameState: GameState;
  localPlayer: Player;
  onNextRound: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ gameState, localPlayer, onNextRound }) => {
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-extrabold mb-2 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400 w-10 h-10" />
          Clasificación
        </h1>
        <p className="text-slate-400">Resultados validados por Madu AI</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-300 mb-4">Puntuaciones Globales</h2>
          <div className="space-y-3">
            {sortedPlayers.map((p, idx) => (
              <div 
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${
                  p.id === localPlayer.id 
                  ? 'bg-yellow-400/10 border-yellow-400/40' 
                  : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold">{p.name} {p.id === localPlayer.id && '(Tú)'}</p>
                    {p.id === gameState.stoppedBy && <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">¡DETUVO LA RONDA!</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">{p.score}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Puntos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-400" />
                    Tus Respuestas
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {gameState.categories.map((cat) => {
                        const word = localPlayer.lastResponses?.[cat] || '-';
                        // Ideally we'd map AI validation results here if available
                        const isValid = word !== '-' && word.trim().toUpperCase().startsWith(gameState.letter);

                        return (
                            <div key={cat} className="flex flex-col border-b border-slate-800 pb-3">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{cat}</span>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="font-medium text-lg">{word}</span>
                                    {isValid ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      <div className="mt-auto py-8">
        {localPlayer.isHost ? (
          <button 
            onClick={onNextRound}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01]"
          >
            NUEVA RONDA
            <ArrowRight className="w-6 h-6" />
          </button>
        ) : (
          <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse">
            <p className="text-slate-400">Esperando a que el host inicie una nueva ronda...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;
