
export enum GameStatus {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  JUDGING = 'JUDGING',
  RESULTS = 'RESULTS'
}

export interface Player {
  id: string;
  name: string;
  score: number;
  lastResponses?: Record<string, string>;
  isHost: boolean;
  status: 'active' | 'ready' | 'stopped';
}

export interface GameState {
  id: string;
  status: GameStatus;
  letter: string;
  categories: string[];
  players: Player[];
  round: number;
  stoppedBy?: string;
}

export interface ValidationResult {
  category: string;
  word: string;
  isValid: boolean;
  points: number;
  reason?: string;
}

export interface PlayerRoundResult {
  playerId: string;
  results: ValidationResult[];
  totalRoundPoints: number;
}
