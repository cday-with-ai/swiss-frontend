// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    status: number;
    code: string;
    message: string;
    details?: Record<string, string>;
    path?: string;
  };
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  user: User;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
}

// Tournament Types
export interface TournamentDirector {
  name: string;
  uscfId?: string | null;
  fideId?: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  eventDates: string[];
  tieBreaks: TieBreakType[];
  directors: TournamentDirector[];
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface TournamentDetail extends Tournament {
  sectionCount: number;
  playerCount: number;
  roundCount: number;
}

export interface CreateTournamentRequest {
  name: string;
  description?: string;
  eventDates: string[];
  tieBreaks?: TieBreakType[];
  directors?: TournamentDirector[];
}

export interface UpdateTournamentRequest {
  name?: string;
  description?: string;
  eventDates?: string[];
  tieBreaks?: TieBreakType[];
  directors?: TournamentDirector[];
}

// Section Types
export type SectionType = "INDIVIDUAL";

export interface Section {
  id: string;
  tournamentId: string;
  name: string;
  shortName?: string;
  boardNumber: number;
  boardSpacing: number;
  rounds: number;
  timeControl: string;
  sectionType: SectionType;
  gamesPerRound: number;
  importTag?: string;
  usChessRated: boolean;
  fideRatable: boolean;
  useTieBreaks: boolean;
  currentRound: number;
  playerCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionRequest {
  name: string;
  shortName?: string;
  boardNumber?: number;
  boardSpacing?: number;
  rounds: number;
  timeControl: string;
  sectionType?: SectionType;
  gamesPerRound?: number;
  importTag?: string;
  usChessRated?: boolean;
  fideRatable?: boolean;
  useTieBreaks?: boolean;
}

export interface UpdateSectionRequest {
  name?: string;
  shortName?: string;
  boardNumber?: number;
  boardSpacing?: number;
  rounds?: number;
  timeControl?: string;
  gamesPerRound?: number;
  importTag?: string;
  usChessRated?: boolean;
  fideRatable?: boolean;
  useTieBreaks?: boolean;
}

// Player Types
export type PlayerType = "M" | "F";

export interface RoundBye {
  roundNumber: number;
  byeValue: number;
  reason: "REQUESTED" | "PAIRING_ALLOCATED" | "WITHDRAWAL";
}

export interface Player {
  id: string;
  tournamentId: string;
  sectionId?: string | null;
  name: string;
  mainRating: number;
  localRating?: number | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  teamCode?: string | null;
  team2Code?: string | null;
  clubCode?: string | null;
  prizeGroup?: string | null;
  playerType?: PlayerType | null;
  stateCountry?: string | null;
  birthdate?: string | null;
  uscfId?: string | null;
  fideId?: string | null;
  lichessId?: string | null;
  iccUsername?: string | null;
  chessDotComUsername?: string | null;
  expiry?: string | null;
  active: boolean;
  keepInScoreGroup: boolean;
  feePaid: boolean;
  specialCode?: string | null;
  localSigma?: number | null;
  totalScore: number;
  colorDifference: number;
  consecutiveSameColor: number;
  lastColor?: "WHITE" | "BLACK" | null;
  secondLastColor?: "WHITE" | "BLACK" | null;
  lastFloat?: "UP" | "DOWN" | null;
  secondLastFloat?: "UP" | "DOWN" | null;
  receivedBye: boolean;
  pairingNumber: number;
  byes: RoundBye[];
  opponentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerRequest {
  name: string;
  mainRating: number;
  localRating?: number;
  title?: string;
  sectionId?: string;
  teamCode?: string;
  team2Code?: string;
  clubCode?: string;
  prizeGroup?: string;
  email?: string;
  phone?: string;
  playerType?: PlayerType;
  stateCountry?: string;
  birthdate?: string;
  uscfId?: string;
  fideId?: string;
  lichessId?: string;
  iccUsername?: string;
  chessDotComUsername?: string;
  feePaid?: boolean;
  specialCode?: string;
}

export interface UpdatePlayerRequest extends Partial<CreatePlayerRequest> {
  active?: boolean;
  keepInScoreGroup?: boolean;
}

export interface AssignByeRequest {
  roundNumber: number;
  byeValue: 0 | 0.5 | 1;
}

export interface BulkImportRequest {
  players: CreatePlayerRequest[];
  skipDuplicates?: boolean;
}

export interface BulkImportResponse {
  imported: number;
  skipped: number;
  failed: number;
  players: { id: string; name: string; pairingNumber: number }[];
  errors: { index: number; name: string; error: string }[];
  skippedPlayers?: { index: number; name: string; reason: string }[];
}

// Round & Pairing Types
export type RoundStatus = "PENDING" | "PAIRED" | "IN_PROGRESS" | "COMPLETED";

export type GameResult =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "WHITE_WINS"
  | "BLACK_WINS"
  | "DRAW"
  | "WHITE_WINS_FORFEIT"
  | "BLACK_WINS_FORFEIT"
  | "DOUBLE_FORFEIT";

export interface Pairing {
  id: string;
  boardNumber: number;
  whitePlayerId: string;
  whitePlayerName: string;
  whitePlayerRating?: number;
  whitePlayerTitle?: string;
  whiteScore?: number;
  blackPlayerId: string;
  blackPlayerName: string;
  blackPlayerRating?: number;
  blackPlayerTitle?: string;
  blackScore?: number;
  result: GameResult;
  whiteScoreAfter?: number | null;
  blackScoreAfter?: number | null;
  isFloatPairing: boolean;
  whiteFloat?: "UP" | "DOWN" | null;
  blackFloat?: "UP" | "DOWN" | null;
}

export interface Round {
  id: string;
  tournamentId: string;
  sectionId?: string | null;
  roundNumber: number;
  status: RoundStatus;
  pairings?: Pairing[];
  pairingCount?: number;
  completedCount?: number;
  byePlayerId?: string | null;
  byePlayerName?: string | null;
  byeValue?: number | null;
  pairingTime?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateRoundRequest {
  sectionId?: string;
}

export interface UpdateRoundRequest {
  status?: RoundStatus;
  pairings?: { id: string; result: GameResult }[];
}

export interface UpdatePairingRequest {
  result: GameResult;
}

// Standings Types
export interface PlayerStanding {
  rank: number;
  playerId: string;
  playerName: string;
  title?: string | null;
  rating: number;
  score: number;
  tiebreaks: Record<TieBreakType, number>;
  results: {
    round: number;
    result: "W" | "L" | "D" | "B" | "X";
    color?: "W" | "B";
    opponent?: string;
    opponentRating?: number;
  }[];
  colorHistory: string[];
  opponents: string[];
}

export interface StandingsResponse {
  tournamentId: string;
  sectionId?: string;
  sectionName?: string;
  roundNumber: number;
  totalRounds: number;
  standings: PlayerStanding[];
  generatedAt: string;
}

// Tiebreak Types
export type TieBreakType =
  | "BUCHHOLZ"
  | "BUCHHOLZ_CUT_1"
  | "BUCHHOLZ_CUT_2"
  | "BUCHHOLZ_MEDIAN_1"
  | "BUCHHOLZ_MEDIAN_2"
  | "SONNEBORN_BERGER"
  | "PROGRESSIVE"
  | "DIRECT_ENCOUNTER"
  | "ARO"
  | "NUMBER_OF_WINS"
  | "NUMBER_OF_BLACKS"
  | "KOYA";

export interface TieBreakInfo {
  type: TieBreakType;
  name: string;
  description: string;
}

export interface TieBreakConfigResponse {
  tournamentId: string;
  tieBreaks: TieBreakType[];
  availableTieBreaks: TieBreakInfo[];
}

export interface UpdateTieBreakRequest {
  tieBreaks: TieBreakType[];
}
