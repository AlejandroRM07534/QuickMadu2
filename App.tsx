
import React, { useState, useEffect } from 'react';
import { GameState, GameStatus, Player } from './types';
import { subscribeToGame, saveGameState, createRoom, joinRoom } from './services/gameSync';
import { DEFAULT_CATEGORIES, LETTERS } from './constants';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import ResultScreen from './components/ResultScreen';
import { validateWords } from './services/geminiService';
import { Trophy, Users, Zap, PlayCircle, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(localStorage.getItem('quickmadu-player-id'));
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isJudging, setIsJudging] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToGame((state) => {
      setGameState(state);
    });
    return unsubscribe;
  }, []);

  const handleCreateRoom = () => {
    if (!playerName) return alert("Enter your name first!");
    const state = createRoom(playerName);
    setLocalPlayerId(state.players[0].id);
    localStorage.setItem('quickmadu-player-id', state.players[0].id);
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomIdInput) return alert("Enter name and Room ID!");
    const pid = joinRoom(roomIdInput.toUpperCase(), playerName);
    if (pid) {
      setLocalPlayerId(pid);
      localStorage.setItem('quickmadu-player-id', pid);
    } else {
      alert("Room not found!");
    }
  };

  const startGame = () => {
    if (!gameState) return;
    const randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    saveGameState({
      ...gameState,
      status: GameStatus.PLAYING,
      letter: randomLetter,
      categories: DEFAULT_CATEGORIES,
      round: gameState.round + 1,
      stoppedBy: undefined,
      players: gameState.players.map(p => ({ ...p, status: 'active', lastResponses: {} }))
    });
  };

  const stopRound = (responses: Record<string, string>) => {
    if (!gameState || !localPlayerId) return;
    
    // Update self
    const updatedPlayers = gameState.players.map(p => 
      p.id === localPlayerId ? { ...p, status: 'stopped' as const, lastResponses: responses } : p
    );

    saveGameState({
      ...gameState,
      status: GameStatus.JUDGING,
      stoppedBy: localPlayerId,
      players: updatedPlayers
    });
  };

  const submitResponses = (responses: Record<string, string>) => {
    if (!gameState || !localPlayerId) return;
    const updatedPlayers = gameState.players.map(p => 
      p.id === localPlayerId ? { ...p, lastResponses: responses } : p
    );
    saveGameState({ ...gameState, players: updatedPlayers });
  };

  const triggerJudging = async () => {
    if (!gameState || isJudging) return;
    setIsJudging(true);

    const submissions = gameState.players.map(p => ({
      playerId: p.id,
      words: p.lastResponses || {}
    }));

    const result = await validateWords(gameState.letter, gameState.categories, submissions);

    if (result && result.playerResults) {
      const updatedPlayers = gameState.players.map(p => {
        const playerResult = result.playerResults.find((pr: any) => pr.playerId === p.id);
        return {
          ...p,
          score: p.score + (playerResult?.totalRoundPoints || 0),
          lastRoundResults: playerResult?.results
        };
      });

      saveGameState({
        ...gameState,
        status: GameStatus.RESULTS,
        players: updatedPlayers
      });
    } else {
      // Emergency fallback if AI fails: give everyone 10 pts for each non-empty answer
      const updatedPlayers = gameState.players.map(p => {
        let roundScore = 0;
        Object.values(p.lastResponses || {}).forEach(v => {
            // Fix: Cast v to string to access trim() as v is from a Record<string, string>
            const val = v as string;
            if(val && val.trim()) roundScore += 10;
        });
        return { ...p, score: p.score + roundScore };
      });
      saveGameState({ ...gameState, status: GameStatus.RESULTS, players: updatedPlayers });
    }
    setIsJudging(false);
  };

  const resetToLobby = () => {
    if (!gameState) return;
    saveGameState({
      ...gameState,
      status: GameStatus.LOBBY,
      letter: '',
      stoppedBy: undefined
    });
  };

  const localPlayer = gameState?.players.find(p => p.id === localPlayerId);

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400" />
            <h1 className="text-6xl font-extrabold tracking-tight">Quick<span className="text-yellow-400">Madu</span></h1>
          </div>
          <p className="text-slate-400 text-lg">El juego de palabras más rápido, juzgado por IA</p>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="glass p-8 rounded-3xl shadow-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tu Nombre</label>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Escribe tu nombre..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
            
            <button 
              onClick={handleCreateRoom}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <PlayCircle className="w-5 h-5" />
              CREAR PARTIDA
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-2 text-slate-500">O Únete a una</span></div>
            </div>

            <div className="space-y-3">
              <input 
                type="text" 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="CÓDIGO DE SALA"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center font-bold tracking-widest focus:ring-2 focus:ring-slate-400 outline-none transition-all"
              />
              <button 
                onClick={handleJoinRoom}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-5 h-5" />
                UNIRSE
              </button>
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-slate-600 text-sm flex items-center gap-2">
          Powered by Gemini AI <Zap className="w-3 h-3" />
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {gameState.status === GameStatus.LOBBY && (
        <Lobby 
          gameState={gameState} 
          localPlayer={localPlayer!} 
          onStart={startGame} 
        />
      )}
      {gameState.status === GameStatus.PLAYING && (
        <GameBoard 
          gameState={gameState} 
          localPlayer={localPlayer!} 
          onStop={stopRound}
          onSubmit={submitResponses}
        />
      )}
      {gameState.status === GameStatus.JUDGING && (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mb-6"></div>
            <h2 className="text-3xl font-bold mb-2">¡Madu está juzgando!</h2>
            <p className="text-slate-400 max-w-sm">
                Nuestra IA está verificando las palabras de todos los jugadores. 
                {gameState.stoppedBy && ` Detenido por ${gameState.players.find(p => p.id === gameState.stoppedBy)?.name}.`}
            </p>
            {localPlayer?.isHost && !isJudging && (
                <button 
                    onClick={triggerJudging}
                    className="mt-8 bg-yellow-400 text-slate-950 px-8 py-3 rounded-full font-bold animate-pulse"
                >
                    CALCULAR RESULTADOS
                </button>
            )}
        </div>
      )}
      {gameState.status === GameStatus.RESULTS && (
        <ResultScreen 
          gameState={gameState} 
          localPlayer={localPlayer!} 
          onNextRound={resetToLobby} 
        />
      )}
    </div>
  );
};

export default App;
