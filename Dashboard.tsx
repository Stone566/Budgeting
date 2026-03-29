import { useMemo, useState, useCallback, useRef } from 'react';
import { format, parseISO, isSameMonth, isToday, isYesterday } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AppState, Transaction } from './store';
import { Icon } from './Icons';
import { Repayments } from './Repayments';

export function Dashboard({ store }: { store: any }) {
  const { state, togglePrivacyMode, deleteTransaction, updateTransaction } = store;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const { transactions, categories, isPrivacyMode } = state as AppState;

  // 长按编辑相关
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);

  const now = new Date();

  // Calculate current month's stats
  const currentMonthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), now));
  
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleDelete = useCallback((id: string) => {
    deleteTransaction(id);
    setDeletingId(null);
  }, [deleteTransaction]);

  // 长按开始
  const handlePressStart = (t: Transaction) => {
    setIsLongPressTriggered(false);
    longPressTimer.current = setTimeout(() => {
      setIsLongPressTriggered(true);
      setEditingTransaction(t);
      setEditAmount(t.amount.toString());
    }, 500);
  };

  // 长按结束
  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingTransaction) {
      const newAmount = parseFloat(editAmount);
      if (!isNaN(newAmount) && newAmount > 0) {
        updateTransaction(editingTransaction.id, { amount: newAmount });
      }
      setEditingTransaction(null);
      setEditAmount('');
    }
  };

  // Prepare data for pie chart
  const expensesByCategory = useMemo(() => {
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(t => {
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || '未知',
          value: amount,
          color: category?.color || '#8E8E93',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions, categories]);

  return (
    <div className="p-4 space-y-6">
      <header className="pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">概览</h1>
        <p className="text-gray-500 text-sm mt-1">{format(now, 'yyyy年MM月')}</p>
      </header>

      {/* Balance Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <div className="text-gray-500 text-sm font-medium">总余额</div>
          <button 
            onClick={togglePrivacyMode}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <Icon name={isPrivacyMode ? "EyeOff" : "Eye"} size={18} />
          </button>
        </div>
        <div className={`text-4xl font-bold text-gray-900 tracking-tight mb-6 transition-all duration-300 ${isPrivacyMode ? 'blur-md select-none opacity-40' : ''}`}>
          ¥{balance.toFixed(2)}
        </div>
        
        <div className="flex justify-between">
          <div>
            <div className="text-gray-400 text-xs font-medium mb-1 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              本月收入
            </div>
            <div className={`text-xl font-semibold text-gray-800 transition-all duration-300 ${isPrivacyMode ? 'blur-md select-none opacity-40' : ''}`}>
              ¥{totalIncome.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs font-medium mb-1 flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
              本月支出
            </div>
            <div className={`text-xl font-semibold text-gray-800 transition-all duration-300 ${isPrivacyMode ? 'blur-md select-none opacity-40' : ''}`}>
              ¥{totalExpense.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      {expensesByCategory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">支出分析</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `¥${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {expensesByCategory.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-600 truncate flex-1">{item.name}</span>
                <span className={`font-medium transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none opacity-50 text-gray-900' : 'text-gray-900'}`}>¥{item.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setIsRepaymentModalOpen(true)}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="CreditCard" color="#007AFF" size={20} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">还款管理</div>
            <div className="text-xs text-gray-500">管理周期性还款</div>
          </div>
        </button>
        <button
          onClick={() => setIsRepaymentModalOpen(true)}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Icon name="TrendingUp" color="#34C759" size={20} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">查看报表</div>
            <div className="text-xs text-gray-500">收支统计分析</div>
          </div>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近记录</h2>
        <div className="space-y-4">
          {(() => {
            const recent = transactions.slice(0, 20);
            const groups: { label: string; items: typeof recent }[] = [];
            for (const t of recent) {
              const d = parseISO(t.date);
              const label = isToday(d) ? '今天' : isYesterday(d) ? '昨天' : format(d, 'yyyy-MM-dd');
              const last = groups[groups.length - 1];
              if (!last || last.label !== label) groups.push({ label, items: [t] });
              else last.items.push(t);
            }

            return groups.slice(0, 3).map(g => (
              <div key={g.label} className="space-y-3">
                <div className="text-xs font-semibold text-gray-400 tracking-wider">{g.label}</div>
                {g.items.slice(0, 5).map(t => {
                  const isIncome = t.type === 'income';
                  const category = categories.find(c => c.id === t.categoryId);

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between group relative select-none"
                      onTouchStart={() => handlePressStart(t)}
                      onTouchEnd={handlePressEnd}
                      onTouchMove={handlePressEnd}
                      onMouseDown={() => handlePressStart(t)}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                    >
                      <div className="flex items-center flex-1">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center mr-3 text-xl"
                          style={{ backgroundColor: isIncome ? '#E8F5E9' : `${category?.color}20` }}
                        >
                          {isIncome ? (
                            category?.emoji ? (
                              category.emoji
                            ) : (
                              <Icon name={category?.icon || 'TrendingUp'} color={category?.color || '#4CAF50'} size={20} />
                            )
                          ) : category?.emoji ? (
                            category.emoji
                          ) : (
                            <Icon name={category?.icon || 'HelpCircle'} color={category?.color} size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{isIncome ? (category?.name || '收入') : category?.name}</div>
                          <div className="text-xs text-gray-500">
                            {format(parseISO(t.date), 'HH:mm')} · {t.paymentMethod}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`font-semibold transition-all duration-300 ${isIncome ? 'text-green-500' : 'text-gray-900'} ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}
                        >
                          {isIncome ? '+' : '-'}¥{t.amount.toFixed(2)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(t.id);
                          }}
                          className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ));
          })()}
          {transactions.length === 0 && (
            <div className="text-center text-gray-400 py-4 text-sm">暂无记录</div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-6">删除后无法恢复，是否继续？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-4 rounded-2xl font-semibold text-gray-600 bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-4 rounded-2xl font-semibold text-white bg-red-500 hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Amount Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">修改金额</h3>
            <p className="text-sm text-gray-500 mb-6">
              {categories.find(c => c.id === editingTransaction.categoryId)?.name || '收入'} · {format(parseISO(editingTransaction.date), 'MM-dd HH:mm')}
            </p>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">¥</span>
              <input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-3xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setEditAmount('');
                }}
                className="flex-1 py-4 rounded-2xl font-semibold text-gray-600 bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-4 rounded-2xl font-semibold text-white bg-black hover:bg-gray-900"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {isRepaymentModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">还款管理</h3>
              <button
                onClick={() => setIsRepaymentModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Repayments store={store} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
