import { useState, useEffect } from 'react';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string; // 'income' if type is income, or specific category id
  paymentMethod: string;
  date: string; // ISO string
  remark: string;
}

export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  emoji?: string;
  type?: CategoryType; // 默认为 'expense'
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  monthlyAmount: number;
  savedAmount: number;
  emoji?: string;
  imageUrl?: string;
  deposits: {
    id: string;
    amount: number;
    date: string;
  }[];
}

// 还款周期类型
export type RepaymentCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// 还款项目接口
export interface Repayment {
  id: string;
  name: string;                    // 还款名称（如房贷、车贷）
  categoryId: string;              // 关联的分类ID
  totalAmount: number;             // 总欠款金额
  installmentCount: number;        // 分期数
  interestRate: number;            // 利率（百分比）
  cycle: RepaymentCycle;           // 还款周期
  startDate: string;               // 开始日期（ISO）
  nextDueDate: string;             // 下次还款日期（ISO）
  paidInstallments: number;        // 已还期数
  paidAmount: number;              // 已还金额
  periodicPayment: number;         // 每期还款金额（自动计算）
  totalPayment: number;            // 总还款金额（本金+利息）
  reminderEnabled: boolean;        // 是否开启提醒
  isActive: boolean;               // 是否激活
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  savingGoals: SavingGoal[];
  repayments: Repayment[];
  isPrivacyMode?: boolean;
}

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'rent', name: '房租', icon: 'Home', color: '#FF3B30', type: 'expense' },
  { id: 'food', name: '餐饮', icon: 'Utensils', color: '#FF9500', type: 'expense' },
  { id: 'transport', name: '交通', icon: 'Car', color: '#FFCC00', type: 'expense' },
  { id: 'utilities', name: '水电煤', icon: 'Zap', color: '#4CD964', type: 'expense' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', color: '#5AC8FA', type: 'expense' },
  { id: 'entertainment', name: '娱乐', icon: 'Film', color: '#007AFF', type: 'expense' },
  { id: 'health', name: '医疗', icon: 'Heart', color: '#5856D6', type: 'expense' },
  { id: 'education', name: '学习', icon: 'GraduationCap', color: '#AF52DE', type: 'expense' },
  { id: 'travel', name: '旅行', icon: 'Plane', color: '#00C7BE', type: 'expense' },
  { id: 'pet', name: '宠物', icon: 'PawPrint', color: '#AC8E68', type: 'expense' },
  { id: 'fitness', name: '健身', icon: 'Dumbbell', color: '#34C759', type: 'expense' },
  { id: 'other', name: '其他', icon: 'MoreHorizontal', color: '#8E8E93', type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: '工资', icon: 'Wallet', color: '#34C759', type: 'income' },
  { id: 'pocket-money', name: '零花钱', icon: 'Banknote', color: '#5AC8FA', type: 'income' },
  { id: 'bonus', name: '奖金', icon: 'Gift', color: '#FF9500', type: 'income' },
  { id: 'investment', name: '投资收益', icon: 'TrendingUp', color: '#007AFF', type: 'income' },
  { id: 'side-income', name: '兼职收入', icon: 'Briefcase', color: '#AF52DE', type: 'income' },
  { id: 'red-envelope', name: '红包', icon: 'Heart', color: '#FF2D55', type: 'income' },
  { id: 'refund', name: '退款', icon: 'Receipt', color: '#8E8E93', type: 'income' },
  { id: 'other-income', name: '其他收入', icon: 'MoreHorizontal', color: '#00C7BE', type: 'income' },
];

export const DEFAULT_CATEGORIES: Category[] = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

const initialState: AppState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  savingGoals: [],
  repayments: [],
  isPrivacyMode: true,
};

export const useStore = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('finance_app_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialState,
          ...parsed,
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES
        };
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('finance_app_state', JSON.stringify(state));
  }, [state]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setState(s => ({
      ...s,
      transactions: [{ ...t, id: crypto.randomUUID() }, ...s.transactions],
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(s => ({
      ...s,
      transactions: s.transactions.filter(t => t.id !== id),
    }));
  };

  const addCategory = (c: Omit<Category, 'id'>) => {
    setState(s => ({
      ...s,
      categories: [...s.categories, { ...c, id: crypto.randomUUID() }],
    }));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setState(s => ({
      ...s,
      categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteCategory = (id: string) => {
    setState(s => ({
      ...s,
      categories: s.categories.filter(c => c.id !== id),
    }));
  };

  const addSavingGoal = (g: Omit<SavingGoal, 'id' | 'savedAmount' | 'deposits'>) => {
    setState(s => ({
      ...s,
      savingGoals: [...s.savingGoals, { ...g, id: crypto.randomUUID(), savedAmount: 0, deposits: [] }],
    }));
  };

  const addDeposit = (goalId: string, amount: number, date: string) => {
    setState(s => ({
      ...s,
      savingGoals: s.savingGoals.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            savedAmount: g.savedAmount + amount,
            deposits: [{ id: crypto.randomUUID(), amount, date }, ...g.deposits],
          };
        }
        return g;
      }),
    }));
  };

  const togglePrivacyMode = () => {
    setState(s => ({
      ...s,
      isPrivacyMode: !s.isPrivacyMode,
    }));
  };

  // 更新交易金额
  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState(s => ({
      ...s,
      transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  // 添加还款项目
  const addRepayment = (r: Omit<Repayment, 'id' | 'paidInstallments' | 'paidAmount'>) => {
    const newRepayment: Repayment = {
      ...r,
      id: crypto.randomUUID(),
      paidInstallments: 0,
      paidAmount: 0,
    };
    setState(s => ({
      ...s,
      repayments: [...s.repayments, newRepayment],
    }));
    return newRepayment.id;
  };

  // 更新还款项目
  const updateRepayment = (id: string, updates: Partial<Repayment>) => {
    setState(s => ({
      ...s,
      repayments: s.repayments.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  };

  // 删除还款项目
  const deleteRepayment = (id: string) => {
    setState(s => ({
      ...s,
      repayments: s.repayments.filter(r => r.id !== id),
    }));
  };

  // 执行还款（添加一条还款记录并更新还款项目状态）
  const executeRepayment = (repaymentId: string) => {
    const repayment = state.repayments.find(r => r.id === repaymentId);
    if (!repayment || !repayment.isActive) return;

    const now = new Date();
    const newPaidInstallments = repayment.paidInstallments + 1;
    const newPaidAmount = repayment.paidAmount + repayment.periodicPayment;

    // 计算下次还款日期
    const nextDue = new Date(repayment.nextDueDate);
    switch (repayment.cycle) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'yearly':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
    }

    // 检查是否已还清
    const isCompleted = newPaidInstallments >= repayment.installmentCount;

    // 添加交易记录
    const transaction: Omit<Transaction, 'id'> = {
      type: 'expense',
      amount: repayment.periodicPayment,
      categoryId: repayment.categoryId,
      paymentMethod: '自动还款',
      remark: `${repayment.name} - 第${newPaidInstallments}期`,
      date: now.toISOString(),
    };

    setState(s => ({
      ...s,
      transactions: [{ ...transaction, id: crypto.randomUUID() }, ...s.transactions],
      repayments: s.repayments.map(r => {
        if (r.id === repaymentId) {
          return {
            ...r,
            paidInstallments: newPaidInstallments,
            paidAmount: newPaidAmount,
            nextDueDate: isCompleted ? r.nextDueDate : nextDue.toISOString(),
            isActive: !isCompleted,
          };
        }
        return r;
      }),
    }));
  };

  return {
    state,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addSavingGoal,
    addDeposit,
    togglePrivacyMode,
    addRepayment,
    updateRepayment,
    deleteRepayment,
    executeRepayment,
  };
};
