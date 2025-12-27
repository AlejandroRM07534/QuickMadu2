
import React from 'react';
import { GameState, Player } from '../types';
import { Users, Shield, Play, QrCode } from 'lucide-react';

interface LobbyProps {
  gameState: GameState;
  localPlayer: Player;
  onStart: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, localPlayer, onStart }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col">
      <header className="flex justify-between items-center py-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Sala: <span className="text-yellow-400 font-mono tracking-widest">{gameState.id}</span>
          </h1>
          <p className="text-slate-400 text-sm">Esperando a los jugadores...</p>
        </div>
        <div className="flex items-center gap-4">
           {localPlayer.isHost && (
             <button 
               onClick={onStart}
               disabled={gameState.players.length < 1}
               className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
             >
               <Play className="w-5 h-5" />
               EMPEZAR
             </button>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-yellow-400" />
              Jugadores ({gameState.players.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameState.players.map((p) => (
                <div 
                  key={p.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    p.id === localPlayer.id 
                    ? 'bg-yellow-400/10 border-yellow-400/30' 
                    : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white uppercase">
                      {p.name[0]}
                    </div>
                    <span className="font-semibold">{p.name} {p.id === localPlayer.id && '(Tú)'}</span>
                  </div>
                  {p.isHost && <Shield className="w-4 h-4 text-yellow-400" title="Host" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-center flex flex-col items-center">
            <QrCode className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Escanea para unirte</h3>
            <div className="bg-white p-4 rounded-2xl mb-4">
              {/* Simplified QR Placeholder */}
              <div className="w-32 h-32 bg-slate-100 flex items-center justify-center border-4 border-slate-200">
                <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => <div key={i} className="w-4 h-4 bg-slate-950"></div>)}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Comparte el código <span className="font-mono text-slate-300 font-bold">{gameState.id}</span> con tus amigos.
            </p>
          </div>

          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-3xl p-6">
             <h4 className="font-bold mb-2">¿Cómo jugar?</h4>
             <ul className="text-sm text-slate-300 space-y-2">
               <li>1. El Host inicia la partida.</li>
               <li>2. Aparecerá una letra aleatoria.</li>
               <li>3. Rellena los temas lo más rápido posible.</li>
               <li>4. El primero en terminar detiene la ronda.</li>
               <li>5. ¡Madu AI verificará tus respuestas!</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
