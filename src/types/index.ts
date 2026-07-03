// ============================================================
// BenchLog — Type Definitions
// ============================================================

// --- Enums ---

export enum WeightUnit {
  KG = 'kg',
  LB = 'lb',
}

export enum TrendDirection {
  GAINING = 'gaining',
  MAINTAINING = 'maintaining',
  LOSING = 'losing',
}

export enum WorkoutCategory {
  PUSH = 'push',
  LEGS = 'legs',
  BACK_BICEPS = 'back_biceps',
  UPPER = 'upper',
}

export enum AnalyticsFilter {
  THIRTY_DAYS = '30d',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  ONE_YEAR = '1y',
  ALL_TIME = 'all',
}

export enum PersonalRecordType {
  HIGHEST_BENCH_WEIGHT = 'highest_bench_weight',
  HIGHEST_1RM = 'highest_1rm',
  MOST_BENCH_REPS = 'most_bench_reps',
  HIGHEST_BODYWEIGHT = 'highest_bodyweight',
  LOWEST_BODYWEIGHT = 'lowest_bodyweight',
  LONGEST_STREAK = 'longest_streak',
  LARGEST_MONTHLY_GAIN = 'largest_monthly_gain',
  LARGEST_MONTHLY_LOSS = 'largest_monthly_loss',
}

// --- Exercise & Workout Templates ---

export interface ExerciseTemplate {
  id: string;
  name: string;
  sets: number;
  reps: number | string; // e.g. 20 or "100" for calf raises
  weight?: number; // in kg, undefined for bodyweight
  restSeconds: number;
  notes?: string;
  isBenchPress?: boolean;
}

export interface WorkoutTemplate {
  id: WorkoutCategory;
  name: string;
  icon: string;
  color: string;
  exercises: ExerciseTemplate[];
  estimatedMinutes: number;
}

// --- Active Workout Logging ---

export interface ExerciseSet {
  setNumber: number;
  targetReps: number;
  actualReps: number | null;
  weight: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes: string;
  isBenchPress: boolean;
}

export interface WorkoutSession {
  id: string;
  templateId: WorkoutCategory;
  templateName: string;
  startedAt: string; // ISO string
  completedAt: string | null;
  duration: number; // in seconds
  exercises: ExerciseLog[];
  completed: boolean;
}

export interface ActiveWorkout {
  session: WorkoutSession;
  currentExerciseIndex: number;
  isRestTimerActive: boolean;
  restTimeRemaining: number;
}

// --- Weight Tracking ---

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // stored in kg internally
  notes?: string;
  createdAt: string; // ISO string
}

export interface WeightStats {
  currentWeight: number | null;
  weeklyAverage: number | null;
  monthlyAverage: number | null;
  weeklyChange: number | null;
  trend: TrendDirection | null;
  goalWeight: number | null;
}

// --- Bench Progression ---

export interface BenchProgressionEntry {
  date: string;
  pushWeight: number;
  upperWeight: number;
  reason: string;
}

export interface BenchProgression {
  currentPushWeight: number; // in kg
  currentUpperWeight: number; // in kg
  history: BenchProgressionEntry[];
}

// --- Personal Records ---

export interface PersonalRecord {
  type: PersonalRecordType;
  value: number;
  date: string;
  workoutSessionId?: string;
  label: string;
  unit: string;
}

// --- Analytics ---

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsData {
  benchWeightProgress: ChartDataPoint[];
  estimated1RM: ChartDataPoint[];
  bodyweightProgress: ChartDataPoint[];
  weeklyAverages: ChartDataPoint[];
  monthlyAverages: ChartDataPoint[];
  benchToBWRatio: ChartDataPoint[];
  workoutVolume: ChartDataPoint[];
}

// --- Smart Insights ---

export interface Insight {
  id: string;
  message: string;
  type: 'weight' | 'bench' | 'streak' | 'plateau' | 'general';
  emoji: string;
  priority: number;
}

// --- Settings ---

export interface AppSettings {
  weightUnit: WeightUnit;
  notifications: boolean;
  goalWeight: number | null;
}

// --- Supabase placeholder ---

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}
