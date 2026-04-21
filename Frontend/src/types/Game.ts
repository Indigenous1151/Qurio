export type GameStatus = "upcoming" | "active" | "finished";

export type GameParams = {
  question_count: number;   // ← rename for consistency
  type: "multiple";
  category: string | null;
  difficulty: string | null;
};

export type Game = {
  game_id: string;
  group_id: string;
  created_by: string;
  start_at: string;
  end_at: string;
  duration_hours: number;
  status: GameStatus;
  game_params: GameParams;
};