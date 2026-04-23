import { CATEGORY_MAP, DIFFICULTY_MAP } from "../constants/gameConstants";

export const getCategoryLabel = (category: string | null) => {
  if (!category) return "Random";
  return CATEGORY_MAP[category] ?? "Unknown";
};

export const getDifficultyLabel = (difficulty: string | null) => {
  if (!difficulty) return "Random";
  return DIFFICULTY_MAP[difficulty] ?? "Unknown";
};