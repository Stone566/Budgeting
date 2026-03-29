import { useState, useMemo } from 'react';
import { AppState, TransactionType } from './store';
import { Icon } from './Icons';
import { Repayments } from './Repayments';
import { format, parseISO, isSameDay, isSameMonth, isSameQuarter, isSameYear, addDays, subDays, addMonths, subMonths, addQuarters, subQuarters, addYears, subYears, getDaysInMonth } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

type FilterType = 'day' | 'month' | 'quarter' | 'year';

export function History({ store }: { store: any }) {
  const { state, togglePrivacyMode } = store;
  const { transactions, categories, isPrivacyMode } = state as AppState;
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);

  const [filterType, setFilterType] = useState<FilterType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const handleLegendClick = (e: any) => {
    const name = typeof e === 'string' ? e : e.value;
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handlePrev = () => {
    switch (filterType) {
      case 'day': setCurrentDate(subDays(currentDate, 1)); break;
      case 'month': setCurrentDate(subMonths(currentDate, 1)); break;
      case 'quarter': setCurrentDate(subQuarters(currentDate, 1)); break;
      case 'year': setCurrentDate(subYears(currentDate, 1)); break;
    }
  };

  const handleNext = () => {
    switch (filterType) {
      case 'day': setCurrentDate(addDays(currentDate, 1)); break;
      case 'month': setCurrentDate(addMonths(currentDate, 1)); break;
      case 'quarter': setCurrentDate(addQuarters(currentDate, 1)); break;
      case 'year': setCurrentDate(addYears(currentDate, 1)); break;
    }
  };

  const dateLabel = useMemo(() => {
    switch (filterType) {
      case 'day': return format(currentDate, 'yyyy年MM月dd日');
      case 'month': return format(currentDate, 'yyyy年MM月');
      case 'quarter': return `${format(currentDate, 'yyyy年')} Q${Math.floor(currentDate.getMonth() / 3) + 1}`;
      case 'year': return format(currentDate, 'yyyy年');
    }
  }, [currentDate, filterType]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = parseISO(t.date);
      switch (filterType) {
        case 'day': return isSameDay(d, currentDate);
        case 'month': return isSameMonth(d, currentDate);
        case 'quarter': return isSameQuarter(d, currentDate);
        case 'year': return isSameYear(d, currentDate);
      }
    });
  }, [transactions, currentDate, filterType]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const trendData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    if (filterType === 'month') {
      const days = getDaysInMonth(currentDate);
      const data = Array.from({ length: days }, (_, i) => ({ name: `${i + 1}日`, value: 0 }));
      expenses.forEach(t => {
        const d = parseISO(t.date).getDate();
        data[d - 1].value += t.amount;
      });
      return data;
    } else if (filterType === 'year') {
      const data = Array.from({ length: 12 }, (_, i) => ({ name: `${i + 1}月`, value: 0 }));
      expenses.forEach(t => {
        const m = parseISO(t.date).getMonth();
        data[m].value += t.amount;
      });
      return data;
    } else if (filterType === 'quarter') {
      const data = Array.from({ length: 3 }, (_, i) => ({ name: `第${i + 1}月`, value: 0 }));
      expenses.forEach(t => {
        const m = parseISO(t.date).getMonth() % 3;
        data[m].value += t.amount;
      });
      return data;
    }
    return [];
  }, [filteredTransactions, filterType, currentDate]);

  const expensesByCategory = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
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
  }, [filteredTransactions, categories]);

  const visibleExpensesByCategory = useMemo(() => {
    return expensesByCategory.filter(item => !hiddenCategories.has(item.name));
  }, [expensesByCategory, hiddenCategories]);

  return (
    <div className="p-4 space-y-6">
      <header className="pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">账单与统计</h1>
        <p className="text-gray-500 text-sm mt-1">查看所有时期的收支记录</p>
      </header>

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
          onClick={() => {}}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon name="Download" color="#AF52DE" size={20} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">导出账单</div>
            <div className="text-xs text-gray-500">导出Excel/CSV</div>
          </div>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {(['day', 'month', 'quarter', 'year'] as FilterType[]).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${filterType === type ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
            >
              {type === 'day' ? '日' : type === 'month' ? '月' : type === 'quarter' ? '季' : '年'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between px-2">
          <button onClick={handlePrev} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Icon name="ChevronLeft" size={20} />
          </button>
          <div className="font-semibold text-gray-900">{dateLabel}</div>
          <button onClick={handleNext} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-center mb-1">
            <div className="text-gray-400 text-xs font-medium">总支出</div>
            <button 
              onClick={togglePrivacyMode}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={isPrivacyMode ? "EyeOff" : "Eye"} size={14} />
            </button>
          </div>
          <div className={`text-xl font-bold text-gray-900 transition-all duration-300 ${isPrivacyMode ? 'blur-md select-none opacity-40' : ''}`}>
            ¥{totalExpense.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-center mb-1">
            <div className="text-gray-400 text-xs font-medium">总收入</div>
            <button 
              onClick={togglePrivacyMode}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={isPrivacyMode ? "EyeOff" : "Eye"} size={14} />
            </button>
          </div>
          <div className={`text-xl font-bold text-gray-900 transition-all duration-300 ${isPrivacyMode ? 'blur-md select-none opacity-40' : ''}`}>
            ¥{totalIncome.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      {expensesByCategory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">支出分类</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleExpensesByCategory}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {visibleExpensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `¥${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  onClick={handleLegendClick}
                  payload={expensesByCategory.map(item => ({
                    id: item.name,
                    type: 'circle',
                    value: item.name,
                    color: hiddenCategories.has(item.name) ? '#E5E7EB' : item.color,
                  }))}
                  wrapperStyle={{ fontSize: '12px', cursor: 'pointer', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-2">
            {expensesByCategory.map(item => {
              const maxExpense = Math.max(...expensesByCategory.map(c => c.value), 1);
              const percentage = ((item.value / totalExpense) * 100).toFixed(1);
              const barWidth = `${(item.value / maxExpense) * 100}%`;
              const isHidden = hiddenCategories.has(item.name);
              
              return (
                <div key={item.name} className={`relative transition-opacity duration-300 ${isHidden ? 'opacity-40' : 'opacity-100'}`}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center cursor-pointer" onClick={() => handleLegendClick(item.name)}>
                      <div className="w-3 h-3 rounded-full mr-2 transition-colors" style={{ backgroundColor: isHidden ? '#E5E7EB' : item.color }}></div>
                      <span className={`font-medium transition-colors ${isHidden ? 'text-gray-400' : 'text-gray-700'}`}>{item.name}</span>
                    </div>
                    <div className={`font-semibold transition-all duration-300 ${isHidden ? 'text-gray-400' : 'text-gray-900'} ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>
                      ¥{item.value.toFixed(2)} 
                      <span className="text-gray-400 text-xs font-normal ml-2 w-10 inline-block text-right">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden cursor-pointer" onClick={() => handleLegendClick(item.name)}>
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: barWidth, backgroundColor: isHidden ? '#E5E7EB' : item.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && filterType !== 'day' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">支出趋势</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `¥${val}`} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '12px' }}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, '支出']}
                  labelStyle={{ color: '#6B7280', marginBottom: '4px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">账单明细</h2>
        <div className="space-y-4">
          {filteredTransactions.map(t => {
            const isIncome = t.type === 'income';
            const isRepayment = t.paymentMethod === '自动还款';
            const category = categories.find(c => c.id === t.categoryId);

            return (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center mr-3 text-xl"
                    style={{ backgroundColor: isIncome ? '#E8F5E9' : `${category?.color || '#8E8E93'}20` }}
                  >
                    {isIncome ? (
                      category?.emoji ? category.emoji : <Icon name={category?.icon || 'TrendingUp'} color={category?.color || '#4CAF50'} size={20} />
                    ) : category?.emoji ? (
                      category.emoji
                    ) : (
                      <Icon name={category?.icon || 'CreditCard'} color={category?.color || '#8E8E93'} size={20} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {isIncome ? (category?.name || '收入') : (category?.name || t.remark?.split(' - ')[0] || '支出')}
                      {isRepayment && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">还款</span>}
                    </div>
                    <div className="text-xs text-gray-500">{format(parseISO(t.date), 'MM-dd HH:mm')} {t.remark ? `· ${t.remark}` : ''}</div>
                  </div>
                </div>
                <div className={`font-semibold transition-all duration-300 ${isIncome ? 'text-green-500' : 'text-gray-900'} ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>
                  {isIncome ? '+' : '-'}¥{t.amount.toFixed(2)}
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">该时间段暂无记录</div>
          )}
        </div>
      </div>

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
