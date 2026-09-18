export type TaskModuleSource = 'NONE' | 'GYM' | 'STUDY' | 'WORK' | 'FOCUS';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string | null;
  sourceModule: TaskModuleSource;
  sourceEntityId?: string;
  sourceEntityType?: 'WORKOUT_CHECKIN' | 'TIME_BLOCK' | 'SUB_TASK' | 'FOCUS_SESSION';
  createdAt: string;
  updatedAt: string;
}

// ---------------- Gym Module ----------------
export type MuscleGroup = 
  | 'CHEST' 
  | 'BACK' 
  | 'SHOULDERS' 
  | 'BICEPS' 
  | 'TRICEPS' 
  | 'LEGS' 
  | 'ABS' 
  | 'CALVES';

export interface ExerciseDefinition {
  id: string;
  routineId: string;
  name: string;
  targetMuscle: MuscleGroup;
  defaultSets: number;
  order: number;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  targetMuscles: MuscleGroup[];
  exercises: ExerciseDefinition[];
  createdAt: string;
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  timestamp: string;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  checkInTime: string;
  checkOutTime?: string | null;
  durationMinutes?: number;
  status: 'ACTIVE' | 'COMPLETED';
  linkedTaskId?: string;
  setLogs: SetLog[];
}

// ---------------- Study & Work Module ----------------
export type TimeBlockType = 'STUDY' | 'WORK';

export interface BlockSubTask {
  id: string;
  blockId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string | null;
  linkedTaskId?: string;
  order: number;
}

export interface TimeBlock {
  id: string;
  type: TimeBlockType;
  title: string;
  category: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  date: string;      // YYYY-MM-DD
  isCompleted: boolean;
  notes?: string;
  color: string;
  linkedTaskId?: string;
  subTasks: BlockSubTask[];
}

// ---------------- Focus Module ----------------
export interface FocusSession {
  id: string;
  durationSeconds: number;
  completedAt: string;
  status: 'COMPLETED' | 'CANCELLED';
  linkedTaskId?: string;
}

// ---------------- Finances Module (Air-Gapped) ----------------
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  amount: number;
  date: string;
  note?: string;
  referenceDebtId?: string;
}

export type DebtStatus = 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';

export interface DebtPaymentRecord {
  id: string;
  debtId: string;
  amountPaid: number;
  paidAt: string;
  transactionId: string;
}

export interface DebtReceivable {
  id: string;
  debtorName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: DebtStatus;
  initialDate: string;
  dueDate?: string;
  notes?: string;
  paymentHistory: DebtPaymentRecord[];
}

// ---------------- Supplements & Medications Module ----------------
export type SupplementCategory = 'SUPPLEMENT' | 'MEDICATION';

export interface SupplementItem {
  id: string;
  name: string;
  category: SupplementCategory;
  dosage: string;
  timing: string;
  isGymRelated: boolean;
  notes?: string;
  daysSchedule: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  takenDates: string[];   // ['YYYY-MM-DD']
  createdAt: string;
}

