import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import type { StyleProp, ViewStyle } from "react-native";

// ============================================================================
// CORE TYPES & ENUMS
// ============================================================================
export type Priority = "low" | "medium" | "high";
export type HabitFrequency = "daily" | "weekly" | "monthly" | "custom";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

// ============================================================================
// HABIT TYPES
// ============================================================================
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  quantity: number;
  measure: string;
  streak: number;
  longestStreak: number;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  customDays?: number[]; // 0-6 (Sunday-Saturday)
  reminderTime?: string; // ISO 8601 time (e.g., "14:30:00")
  completed?: boolean[]; // Array for daily completion tracking
  currentStreak?: number;
  category?: string;
  color?: string;
  icon?: string;
}

export interface HabitForHome extends Habit {
  checkins: HabitCheckin[];
}

export interface HabitCheckin {
  id: string;
  habitId: string;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  completed: boolean;
  quantity: number;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

// ============================================================================
// TASK TYPES
// ============================================================================
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO 8601 date string (YYYY-MM-DD)
  dueTimestamp?: string; // ISO 8601 date-time string with timezone offset
  priority: Priority;
  status: TaskStatus;
  completed: boolean;
  completedAt?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  userId: string;
  category?: string;
  tags?: string[];
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  parentTaskId?: string; // for subtasks
  subtasks?: Task[];
}

// ============================================================================
// SCHEDULE & TIME TYPES
// ============================================================================
export interface Schedule {
  id: string;
  time: string; // ISO 8601 time
  label: string;
  isActive: boolean;
  endTime?: string; // ISO 8601 time
  duration?: number; // in minutes
  category?: string;
  color?: string;
}

// ============================================================================
// FINANCE TYPES
// ============================================================================
export interface Money {
  value: number;
  currency: string;
  locale?: string;
}

export interface FinanceSummary {
  totalIncome: Money;
  totalExpenses: Money;
  netWorth: Money;
  monthlyBudget: Money;
  spentThisMonth: Money;
  remainingBudget: Money;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================
export type AuthStackParamList = {
  Auth: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  HabitsScreen: { habits: Habit[] };
  TaskDetails: { taskId: string };
  HabitDetails: { habitId: string };
  AddHabit: undefined;
  AddTask: undefined;
  EditHabit: { habit: Habit };
  EditTask: { task: Task };
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Calendar: undefined;
  Gym: undefined;
  Wallet: undefined;
};

// Navigation Props
export type AuthNavigationProp = StackNavigationProp<AuthStackParamList, "Auth">;
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;
export type HomeStackNavigationProp = StackNavigationProp<HomeStackParamList>;

// Route Props
export type HabitsScreenRouteProp = RouteProp<HomeStackParamList, "HabitsScreen">;
export type TaskDetailsRouteProp = RouteProp<HomeStackParamList, "TaskDetails">;
export type HabitDetailsRouteProp = RouteProp<HomeStackParamList, "HabitDetails">;

// ============================================================================
// COMPONENT PROPS
// ============================================================================
export interface BaseScreenProps {
  navigation: TabNavigationProp;
  route?: RouteProp<Record<string, object | undefined>, string>;
}

export interface AuthScreenProps {
  navigation: AuthNavigationProp;
}

export interface HomeScreenProps extends BaseScreenProps {}
export interface ProfileScreenProps extends BaseScreenProps {}

export interface HabitsScreenProps {
  navigation: HomeStackNavigationProp;
  route: HabitsScreenRouteProp;
}

export interface TaskDetailsScreenProps {
  navigation: HomeStackNavigationProp;
  route: TaskDetailsRouteProp;
}

// Tab Bar Props (usa el tipo oficial de React Navigation)
export type TabBarProps = BottomTabBarProps;

// ============================================================================
// COMMON ITEM TYPES (for reusable components)
// ============================================================================
export interface BaseItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: Priority;
  description?: string;
  footerSecondaryText?: string;
  dueTimestamp?: string;
  streak?: number;
  measure?: string | null;
  quantity?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItemProps<T extends BaseItem> {
  item: T;
  onToggleComplete: (_unusedId: string) => void;
  style?: StyleProp<ViewStyle>;
  isAnimatingOut?: boolean;
  type?: "task" | "habit";
  showStreak?: boolean;
  showQuantity?: boolean;
  isLastItem?: boolean;
}
