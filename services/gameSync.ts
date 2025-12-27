
import { GameState, GameStatus, Player } from '../types';
import { APP_ID } from '../constants';

// This service simulates a real-time database using LocalStorage + Storage Events
// It allows multiple tabs to communicate as if they were connected to a backend.

export const saveGameState = (state: GameState) => {
  localStorage.setItem(`${APP_ID}-state`, JSON.stringify(state));
  // Manually dispatch storage event for same-tab updates if needed
  window.dispatchEvent(new Event('storage'));
};

export const getGameState = (): GameState | null => {
  const data = localStorage.getItem(`${APP_ID}-state`);
  return data ? JSON.parse(data) : null;
};

export const subscribeToGame = (callback: (state: GameState) => void) => {
  const handler = () => {
    const state = getGameState();
    if (state) callback(state);
  };
  window.addEventListener('storage', handler);
  // Initial call
  handler();
  return () => window.removeEventListener('storage', handler);
};

export const createRoom = (hostName: string): GameState => {
  const hostId = Math.random().toString(36).substring(7);
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const newState: GameState = {
    id: roomId,
    status: GameStatus.LOBBY,
    letter: '',
    categories: [],
    players: [{
      id: hostId,
      name: hostName,
      score: 0,
      isHost: true,
      status: 'active'
    }],
    round: 0
  };
  
  saveGameState(newState);
  return newState;
};

export const joinRoom = (roomId: string, playerName: string): string | null => {
  const state = getGameState();
  if (!state || state.id !== roomId) return null;
  
  const playerId = Math.random().toString(36).substring(7);
  const updatedPlayers: Player[] = [
    ...state.players,
    {
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false,
      status: 'active'
    }
  ];
  
  saveGameState({ ...state, players: updatedPlayers });
  return playerId;
};
