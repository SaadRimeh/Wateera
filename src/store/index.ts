import { localStore } from '../services/storage';
import {
  TaskItem,
  WorkoutRoutine,
  WorkoutSession,
  SetLog,
  TimeBlock,
  BlockSubTask,
  FocusSession,
  FinanceTransaction,
  DebtReceivable,
  DebtPaymentRecord,
  MuscleGroup,
  SupplementItem,
} from '../types';
import { NotificationService } from '../services/notifications';

// Storage keys
const KEYS = {
  TASKS: 'wateera_tasks_v4_clean',
  GYM_ROUTINES: 'wateera_gym_routines_v4_clean',
  GYM_SESSIONS: 'wateera_gym_sessions_v4_clean',
  GYM_ACTIVE: 'wateera_gym_active_v4_clean',
  SUPPLEMENTS: 'wateera_supplements_v4_clean',
  TIME_BLOCKS: 'wateera_time_blocks_v4_clean',
  FOCUS_SESSIONS: 'wateera_focus_sessions_v4_clean',
  FINANCE_TXS: 'wateera_finance_txs_v4_clean',
  FINANCE_DEBTS: 'wateera_finance_debts_v4_clean',
  AUTH_UNLOCKED: 'wateera_auth_unlocked_v1',
};

// 7-Day Weekly Workout Routine Structure (No mock exercises)
export const DEFAULT_ROUTINES: WorkoutRoutine[] = [
  { id: 'routine-sun', name: 'Leg Day & Calves', dayOfWeek: 0, targetMuscles: ['LEGS', 'CALVES'], exercises: [], createdAt: new Date().toISOString() },
  { id: 'routine-mon', name: 'Chest, Shoulders & Triceps', dayOfWeek: 1, targetMuscles: ['CHEST', 'SHOULDERS', 'TRICEPS'], exercises: [], createdAt: new Date().toISOString() },
  { id: 'routine-tue', name: 'Back & Biceps', dayOfWeek: 2, targetMuscles: ['BACK', 'BICEPS'], exercises: [], createdAt: new Date().toISOString() },
  { id: 'routine-wed', name: 'Active Rest & Core', dayOfWeek: 3, targetMuscles: ['ABS'], exercises: [], createdAt: new Date().toISOString() },
  { id: 'routine-thu', name: 'Shoulders & Arms Focus', dayOfWeek: 4, targetMuscles: ['SHOULDERS', 'BICEPS', 'TRICEPS'], exercises: [], createdAt: new Date().toISOString() },
  { id: 'routine-fri', name: 'Hamstrings & Glutes', dayOfWeek: 5, targetMuscles: ['LEGS', 'CALVES'], exercises: [], createdAt: new Date().toISOString() },
  { id: 'routine-sat', name: 'Full Body & Conditioning', dayOfWeek: 6, targetMuscles: ['CHEST', 'BACK', 'LEGS', 'ABS'], exercises: [], createdAt: new Date().toISOString() },
];

const DEFAULT_SESSIONS_HISTORY: WorkoutSession[] = [];
export const DEFAULT_SUPPLEMENTS: SupplementItem[] = [];
const DEFAULT_TIME_BLOCKS: TimeBlock[] = [];
const DEFAULT_DEBTS: DebtReceivable[] = [];
const DEFAULT_TRANSACTIONS: FinanceTransaction[] = [];
const DEFAULT_TASKS: TaskItem[] = [];

// ---------------- Reactive Store System ----------------
type Listener = () => void;

class ReactiveStore {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  constructor() {
    this.sanitizeData();
  }

  private sanitizeData() {
    const isMock = (id: string) =>
      id === 'task-1' ||
      id === 'task-2' ||
      id === 'task-3' ||
      id === 'task-4' ||
      id.startsWith('sess-seed-') ||
      (id.startsWith('supp-') && !id.includes('-') && Number(id.replace('supp-', '')) <= 10) ||
      id.startsWith('block-study-') ||
      id.startsWith('block-work-') ||
      (id.startsWith('debt-') && Number(id.replace('debt-', '')) <= 10) ||
      (id.startsWith('tx-') && Number(id.replace('tx-', '')) <= 10);

    let changed = false;
    if (this.tasks.some((t) => isMock(t.id))) {
      this.tasks = this.tasks.filter((t) => !isMock(t.id));
      localStore.setObject(KEYS.TASKS, this.tasks);
      changed = true;
    }
    if (this.timeBlocks.some((b) => isMock(b.id))) {
      this.timeBlocks = this.timeBlocks.filter((b) => !isMock(b.id));
      localStore.setObject(KEYS.TIME_BLOCKS, this.timeBlocks);
      changed = true;
    }
    if (this.debts.some((d) => isMock(d.id))) {
      this.debts = this.debts.filter((d) => !isMock(d.id));
      localStore.setObject(KEYS.FINANCE_DEBTS, this.debts);
      changed = true;
    }
    if (this.transactions.some((t) => isMock(t.id))) {
      this.transactions = this.transactions.filter((t) => !isMock(t.id));
      localStore.setObject(KEYS.FINANCE_TXS, this.transactions);
      changed = true;
    }
    if (this.supplements.some((s) => isMock(s.id))) {
      this.supplements = this.supplements.filter((s) => !isMock(s.id));
      localStore.setObject(KEYS.SUPPLEMENTS, this.supplements);
      changed = true;
    }
    if (this.sessionsHistory.some((s) => isMock(s.id))) {
      this.sessionsHistory = this.sessionsHistory.filter((s) => !isMock(s.id));
      localStore.setObject(KEYS.GYM_SESSIONS, this.sessionsHistory);
      changed = true;
    }
    if (changed) {
      this.notify();
    }
  }

  // --- Auth State ---
  isUnlocked: boolean = localStore.getObject<boolean>(KEYS.AUTH_UNLOCKED, false);

  unlock() {
    this.isUnlocked = true;
    localStore.setObject(KEYS.AUTH_UNLOCKED, true);
    this.notify();
  }

  lock() {
    this.isUnlocked = false;
    localStore.setObject(KEYS.AUTH_UNLOCKED, false);
    this.notify();
  }

  // --- Tasks State ---
  tasks: TaskItem[] = localStore.getObject<TaskItem[]>(KEYS.TASKS, DEFAULT_TASKS);

  addTask(task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: TaskItem = {
      ...task,
      id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks = [newTask, ...this.tasks];
    localStore.setObject(KEYS.TASKS, this.tasks);
    this.notify();
    return newTask;
  }

  toggleTask(id: string) {
    this.tasks = this.tasks.map((t) => {
      if (t.id === id) {
        const isDone = t.status === 'COMPLETED';
        const nextStatus = isDone ? 'PENDING' : 'COMPLETED';
        const updated = {
          ...t,
          status: nextStatus as any,
          completedAt: isDone ? null : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (t.sourceEntityType === 'SUB_TASK' && t.sourceEntityId) {
          this.syncSubTaskStatusFromTask(t.sourceEntityId, !isDone);
        }

        return updated;
      }
      return t;
    });
    localStore.setObject(KEYS.TASKS, this.tasks);
    this.notify();
  }

  startTask(id: string) {
    let startedTask: TaskItem | null = null;
    this.tasks = this.tasks.map((t) => {
      if (t.id === id) {
        startedTask = {
          ...t,
          status: 'IN_PROGRESS',
          updatedAt: new Date().toISOString(),
        };
        return startedTask;
      }
      return t;
    });
    localStore.setObject(KEYS.TASKS, this.tasks);
    this.notify();

    if (startedTask) {
      const taskObj = startedTask as TaskItem;
      NotificationService.notifyTaskStarted(
        taskObj.title,
        taskObj.sourceModule !== 'NONE' ? taskObj.sourceModule : 'Global Task'
      );
    }
    return startedTask;
  }

  deleteTask(id: string) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    localStore.setObject(KEYS.TASKS, this.tasks);
    this.notify();
  }

  // --- Gym State ---
  routines: WorkoutRoutine[] = localStore.getObject<WorkoutRoutine[]>(KEYS.GYM_ROUTINES, DEFAULT_ROUTINES);
  activeSession: WorkoutSession | null = localStore.getObject<WorkoutSession | null>(KEYS.GYM_ACTIVE, null);
  sessionsHistory: WorkoutSession[] = localStore.getObject<WorkoutSession[]>(KEYS.GYM_SESSIONS, DEFAULT_SESSIONS_HISTORY);

  saveRoutine(updatedRoutine: WorkoutRoutine) {
    this.routines = this.routines.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r));
    localStore.setObject(KEYS.GYM_ROUTINES, this.routines);
    this.notify();
  }

  addExerciseToRoutine(routineId: string, name: string, targetMuscle: MuscleGroup, defaultSets: number = 3) {
    const routine = this.routines.find((r) => r.id === routineId);
    if (!routine) return;

    const newExercise = {
      id: 'ex-' + Date.now(),
      routineId,
      name,
      targetMuscle,
      defaultSets,
      order: routine.exercises.length + 1,
    };

    const targetMuscles = Array.from(new Set([...routine.targetMuscles, targetMuscle]));
    const updatedRoutine: WorkoutRoutine = {
      ...routine,
      targetMuscles,
      exercises: [...routine.exercises, newExercise],
    };

    this.saveRoutine(updatedRoutine);
  }

  removeExerciseFromRoutine(routineId: string, exerciseId: string) {
    const routine = this.routines.find((r) => r.id === routineId);
    if (!routine) return;

    const updatedExercises = routine.exercises.filter((e) => e.id !== exerciseId);
    const remainingMuscles = Array.from(new Set(updatedExercises.map((e) => e.targetMuscle)));

    const updatedRoutine: WorkoutRoutine = {
      ...routine,
      targetMuscles: remainingMuscles,
      exercises: updatedExercises,
    };

    this.saveRoutine(updatedRoutine);
  }

  startWorkout(routineId: string) {
    const routine = this.routines.find((r) => r.id === routineId) || this.routines[0];
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sessionId = 'session-' + Date.now();

    const task = this.addTask({
      title: `Workout Session: ${routine.name}`,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      sourceModule: 'GYM',
      sourceEntityId: sessionId,
      sourceEntityType: 'WORKOUT_CHECKIN',
    });

    const newSession: WorkoutSession = {
      id: sessionId,
      routineId: routine.id,
      routineName: routine.name,
      checkInTime,
      status: 'ACTIVE',
      linkedTaskId: task.id,
      setLogs: [],
    };

    this.activeSession = newSession;
    localStore.setObject(KEYS.GYM_ACTIVE, newSession);
    this.notify();
    return newSession;
  }

  logSet(exerciseId: string, exerciseName: string, weightKg: number, reps: number) {
    if (!this.activeSession) return;
    const setLog: SetLog = {
      id: 'set-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      sessionId: this.activeSession.id,
      exerciseId,
      exerciseName,
      setNumber: this.activeSession.setLogs.filter((s) => s.exerciseId === exerciseId).length + 1,
      weightKg,
      reps,
      completed: true,
      timestamp: new Date().toISOString(),
    };

    this.activeSession = {
      ...this.activeSession,
      setLogs: [...this.activeSession.setLogs, setLog],
    };
    localStore.setObject(KEYS.GYM_ACTIVE, this.activeSession);
    this.notify();
  }

  saveFullWorkoutSession(
    routineId: string,
    routineName: string,
    exerciseSets: {
      exerciseId: string;
      exerciseName: string;
      targetMuscle: MuscleGroup;
      sets: { weightKg: number; reps: number; completed: boolean }[];
    }[]
  ) {
    const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sessionId = 'session-' + Date.now();

    const flatSetLogs: SetLog[] = [];
    exerciseSets.forEach((ex) => {
      ex.sets.forEach((s, idx) => {
        if (s.completed || s.weightKg > 0) {
          flatSetLogs.push({
            id: 'set-' + Date.now() + '-' + Math.floor(Math.random() * 1000) + '-' + idx,
            sessionId,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            setNumber: idx + 1,
            weightKg: s.weightKg,
            reps: s.reps,
            completed: true,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    const newSession: WorkoutSession = {
      id: sessionId,
      routineId,
      routineName,
      checkInTime: this.activeSession?.checkInTime || checkOutTime,
      checkOutTime,
      durationMinutes: 60,
      status: 'COMPLETED',
      setLogs: flatSetLogs,
    };

    this.addTask({
      title: `Logged Workout: ${routineName}`,
      status: 'COMPLETED',
      priority: 'HIGH',
      sourceModule: 'GYM',
      sourceEntityId: sessionId,
      sourceEntityType: 'WORKOUT_CHECKIN',
      completedAt: new Date().toISOString(),
    });

    this.sessionsHistory = [newSession, ...this.sessionsHistory];
    this.activeSession = null;
    localStore.setObject(KEYS.GYM_ACTIVE, null);
    localStore.setObject(KEYS.GYM_SESSIONS, this.sessionsHistory);
    this.notify();
    return newSession;
  }

  finishWorkout() {
    if (!this.activeSession) return;
    const completedSession: WorkoutSession = {
      ...this.activeSession,
      status: 'COMPLETED',
      checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (completedSession.linkedTaskId) {
      this.tasks = this.tasks.map((t) =>
        t.id === completedSession.linkedTaskId
          ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() }
          : t
      );
      localStore.setObject(KEYS.TASKS, this.tasks);
    }

    this.sessionsHistory = [completedSession, ...this.sessionsHistory];
    this.activeSession = null;
    localStore.setObject(KEYS.GYM_ACTIVE, null);
    localStore.setObject(KEYS.GYM_SESSIONS, this.sessionsHistory);
    this.notify();
  }

  getMuscleProgress(muscleGroup: MuscleGroup) {
    const muscleExerciseNames = new Set<string>();
    this.routines.forEach((r) => {
      r.exercises.forEach((ex) => {
        if (ex.targetMuscle === muscleGroup) {
          muscleExerciseNames.add(ex.name);
        }
      });
    });

    const points: {
      date: string;
      displayDate: string;
      maxWeight: number;
      totalReps: number;
      totalVolume: number;
      exerciseName: string;
    }[] = [];

    const sortedSessions = [...this.sessionsHistory].reverse();

    sortedSessions.forEach((sess) => {
      const logsForMuscle = sess.setLogs.filter(
        (l) => muscleExerciseNames.has(l.exerciseName) || l.exerciseName.toLowerCase().includes(muscleGroup.toLowerCase())
      );

      if (logsForMuscle.length > 0) {
        let maxW = 0;
        let totR = 0;
        let totVol = 0;
        let topExName = logsForMuscle[0].exerciseName;

        logsForMuscle.forEach((l) => {
          if (l.weightKg > maxW) {
            maxW = l.weightKg;
            topExName = l.exerciseName;
          }
          totR += l.reps;
          totVol += l.weightKg * l.reps;
        });

        const rawDate = logsForMuscle[0].timestamp ? new Date(logsForMuscle[0].timestamp) : new Date();
        const displayDate = `${rawDate.getMonth() + 1}/${rawDate.getDate()}`;

        points.push({
          date: rawDate.toISOString(),
          displayDate,
          maxWeight: maxW,
          totalReps: totR,
          totalVolume: totVol,
          exerciseName: topExName,
        });
      }
    });

    return points;
  }

  // --- Supplements & Medications State ---
  supplements: SupplementItem[] = localStore.getObject<SupplementItem[]>(KEYS.SUPPLEMENTS, DEFAULT_SUPPLEMENTS);

  addSupplement(item: Omit<SupplementItem, 'id' | 'createdAt' | 'takenDates'>) {
    const newItem: SupplementItem = {
      ...item,
      id: 'supp-' + Date.now(),
      takenDates: [],
      createdAt: new Date().toISOString(),
    };
    this.supplements = [newItem, ...this.supplements];
    localStore.setObject(KEYS.SUPPLEMENTS, this.supplements);
    this.notify();
    return newItem;
  }

  updateSupplement(id: string, updates: Partial<SupplementItem>) {
    this.supplements = this.supplements.map((s) => (s.id === id ? { ...s, ...updates } : s));
    localStore.setObject(KEYS.SUPPLEMENTS, this.supplements);
    this.notify();
  }

  deleteSupplement(id: string) {
    this.supplements = this.supplements.filter((s) => s.id !== id);
    localStore.setObject(KEYS.SUPPLEMENTS, this.supplements);
    this.notify();
  }

  toggleSupplementTakenToday(id: string) {
    const today = new Date().toISOString().split('T')[0];
    this.supplements = this.supplements.map((s) => {
      if (s.id === id) {
        const isTaken = s.takenDates.includes(today);
        const newDates = isTaken
          ? s.takenDates.filter((d) => d !== today)
          : [...s.takenDates, today];
        return { ...s, takenDates: newDates };
      }
      return s;
    });
    localStore.setObject(KEYS.SUPPLEMENTS, this.supplements);
    this.notify();
  }

  isSupplementTakenToday(id: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const item = this.supplements.find((s) => s.id === id);
    return item ? item.takenDates.includes(today) : false;
  }

  // --- Study & Work State ---
  timeBlocks: TimeBlock[] = localStore.getObject<TimeBlock[]>(KEYS.TIME_BLOCKS, DEFAULT_TIME_BLOCKS);

  addTimeBlock(block: Omit<TimeBlock, 'id'>) {
    const newBlock: TimeBlock = {
      ...block,
      id: 'block-' + Date.now(),
    };
    this.timeBlocks = [newBlock, ...this.timeBlocks];
    localStore.setObject(KEYS.TIME_BLOCKS, this.timeBlocks);
    this.notify();
    return newBlock;
  }

  addSubTask(blockId: string, title: string) {
    const subId = 'sub-' + Date.now();
    const block = this.timeBlocks.find((b) => b.id === blockId);
    if (!block) return;

    const globalTask = this.addTask({
      title: title,
      status: 'PENDING',
      priority: 'MEDIUM',
      sourceModule: block.type === 'STUDY' ? 'STUDY' : 'WORK',
      sourceEntityId: subId,
      sourceEntityType: 'SUB_TASK',
    });

    const newSub: BlockSubTask = {
      id: subId,
      blockId,
      title,
      isCompleted: false,
      linkedTaskId: globalTask.id,
      order: block.subTasks.length + 1,
    };

    this.timeBlocks = this.timeBlocks.map((b) =>
      b.id === blockId ? { ...b, subTasks: [...b.subTasks, newSub] } : b
    );
    localStore.setObject(KEYS.TIME_BLOCKS, this.timeBlocks);
    this.notify();
  }

  toggleSubTask(blockId: string, subId: string) {
    this.timeBlocks = this.timeBlocks.map((b) => {
      if (b.id === blockId) {
        const updatedSubs = b.subTasks.map((s) => {
          if (s.id === subId) {
            const nextVal = !s.isCompleted;
            if (s.linkedTaskId) {
              this.syncTaskStatusFromSubTask(s.linkedTaskId, nextVal);
            }
            return {
              ...s,
              isCompleted: nextVal,
              completedAt: nextVal ? new Date().toISOString() : null,
            };
          }
          return s;
        });

        const allDone = updatedSubs.length > 0 && updatedSubs.every((s) => s.isCompleted);
        return {
          ...b,
          isCompleted: allDone,
          subTasks: updatedSubs,
        };
      }
      return b;
    });

    localStore.setObject(KEYS.TIME_BLOCKS, this.timeBlocks);
    this.notify();
  }

  private syncTaskStatusFromSubTask(taskId: string, isDone: boolean) {
    this.tasks = this.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: isDone ? 'COMPLETED' : 'PENDING',
            completedAt: isDone ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    localStore.setObject(KEYS.TASKS, this.tasks);
  }

  private syncSubTaskStatusFromTask(subId: string, isDone: boolean) {
    this.timeBlocks = this.timeBlocks.map((b) => {
      const hasSub = b.subTasks.some((s) => s.id === subId);
      if (!hasSub) return b;

      const updatedSubs = b.subTasks.map((s) =>
        s.id === subId
          ? {
              ...s,
              isCompleted: isDone,
              completedAt: isDone ? new Date().toISOString() : null,
            }
          : s
      );
      const allDone = updatedSubs.length > 0 && updatedSubs.every((s) => s.isCompleted);
      return {
        ...b,
        isCompleted: allDone,
        subTasks: updatedSubs,
      };
    });
    localStore.setObject(KEYS.TIME_BLOCKS, this.timeBlocks);
  }

  // --- Focus Module ---
  focusSessions: FocusSession[] = localStore.getObject<FocusSession[]>(KEYS.FOCUS_SESSIONS, []);

  completeFocusSession(durationSeconds: number) {
    const sessionId = 'focus-' + Date.now();
    const task = this.addTask({
      title: `5-Min Focus Sprint Completed (${Math.round(durationSeconds / 60)} min)`,
      status: 'COMPLETED',
      priority: 'MEDIUM',
      sourceModule: 'FOCUS',
      sourceEntityId: sessionId,
      sourceEntityType: 'FOCUS_SESSION',
      completedAt: new Date().toISOString(),
    });

    const session: FocusSession = {
      id: sessionId,
      durationSeconds,
      completedAt: new Date().toISOString(),
      status: 'COMPLETED',
      linkedTaskId: task.id,
    };

    this.focusSessions = [session, ...this.focusSessions];
    localStore.setObject(KEYS.FOCUS_SESSIONS, this.focusSessions);
    this.notify();
    return session;
  }

  // --- Finances Module ---
  transactions: FinanceTransaction[] = localStore.getObject<FinanceTransaction[]>(KEYS.FINANCE_TXS, DEFAULT_TRANSACTIONS);
  debts: DebtReceivable[] = localStore.getObject<DebtReceivable[]>(KEYS.FINANCE_DEBTS, DEFAULT_DEBTS);

  addTransaction(tx: Omit<FinanceTransaction, 'id'>) {
    const newTx: FinanceTransaction = {
      ...tx,
      id: 'tx-' + Date.now(),
    };
    this.transactions = [newTx, ...this.transactions];
    localStore.setObject(KEYS.FINANCE_TXS, this.transactions);
    this.notify();
    return newTx;
  }

  payDebtFull(debtId: string) {
    const debt = this.debts.find((d) => d.id === debtId);
    if (!debt || debt.remainingAmount <= 0) return;

    const amountToPay = debt.remainingAmount;
    const txId = 'tx-debt-' + Date.now();

    const incomeTx: FinanceTransaction = {
      id: txId,
      type: 'INCOME',
      categoryId: 'cat-debt-settled',
      categoryName: 'Debt Repayment (Full)',
      amount: amountToPay,
      date: new Date().toISOString(),
      referenceDebtId: debt.id,
      note: `Full settlement from ${debt.debtorName}`,
    };
    this.transactions = [incomeTx, ...this.transactions];
    localStore.setObject(KEYS.FINANCE_TXS, this.transactions);

    const paymentRecord: DebtPaymentRecord = {
      id: 'pay-' + Date.now(),
      debtId: debt.id,
      amountPaid: amountToPay,
      paidAt: new Date().toISOString(),
      transactionId: txId,
    };

    this.debts = this.debts.map((d) =>
      d.id === debtId
        ? {
            ...d,
            paidAmount: d.totalAmount,
            remainingAmount: 0,
            status: 'SETTLED',
            paymentHistory: [paymentRecord, ...d.paymentHistory],
          }
        : d
    );
    localStore.setObject(KEYS.FINANCE_DEBTS, this.debts);
    this.notify();
  }

  payDebtPartial(debtId: string, amount: number) {
    const debt = this.debts.find((d) => d.id === debtId);
    if (!debt || amount <= 0) return;

    const actualAmount = Math.min(amount, debt.remainingAmount);
    const newPaidAmount = debt.paidAmount + actualAmount;
    const newRemaining = Math.max(0, debt.totalAmount - newPaidAmount);
    const newStatus = newRemaining === 0 ? 'SETTLED' : 'PARTIALLY_PAID';

    const txId = 'tx-debt-partial-' + Date.now();

    const incomeTx: FinanceTransaction = {
      id: txId,
      type: 'INCOME',
      categoryId: 'cat-debt-partial',
      categoryName: 'Debt Repayment (Partial)',
      amount: actualAmount,
      date: new Date().toISOString(),
      referenceDebtId: debt.id,
      note: `Partial payment from ${debt.debtorName} (${actualAmount} of ${debt.totalAmount})`,
    };
    this.transactions = [incomeTx, ...this.transactions];
    localStore.setObject(KEYS.FINANCE_TXS, this.transactions);

    const paymentRecord: DebtPaymentRecord = {
      id: 'pay-' + Date.now(),
      debtId: debt.id,
      amountPaid: actualAmount,
      paidAt: new Date().toISOString(),
      transactionId: txId,
    };

    this.debts = this.debts.map((d) =>
      d.id === debtId
        ? {
            ...d,
            paidAmount: newPaidAmount,
            remainingAmount: newRemaining,
            status: newStatus,
            paymentHistory: [paymentRecord, ...d.paymentHistory],
          }
        : d
    );
    localStore.setObject(KEYS.FINANCE_DEBTS, this.debts);
    this.notify();
  }

  addDebt(debt: Omit<DebtReceivable, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'paymentHistory'>) {
    const newDebt: DebtReceivable = {
      ...debt,
      id: 'debt-' + Date.now(),
      paidAmount: 0,
      remainingAmount: debt.totalAmount,
      status: 'PENDING',
      paymentHistory: [],
    };
    this.debts = [newDebt, ...this.debts];
    localStore.setObject(KEYS.FINANCE_DEBTS, this.debts);
    this.notify();
    return newDebt;
  }
}

export const store = new ReactiveStore();

import React, { useSyncExternalStore } from 'react';

export function useWateeraStore<T>(selector: (state: ReactiveStore) => T): T {
  return useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    () => selector(store),
    () => selector(store)
  );
}
