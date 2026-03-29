import { useState, useMemo, useRef } from 'react';
import { AppState, Repayment, RepaymentCycle, Category } from './store';
import { Icon } from './Icons';
import { format, parseISO, addDays, addWeeks, addMonths, addQuarters, addYears, isBefore, isSameDay } from 'date-fns';

const CYCLE_OPTIONS: { value: RepaymentCycle; label: string }[] = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'quarterly', label: '每季度' },
  { value: 'yearly', label: '每年' },
];

// 默认还款分类
const DEFAULT_REPAYMENT_CATEGORIES = [
  { id: 'house-loan', name: '房贷', icon: 'Home', color: '#FF3B30' },
  { id: 'car-loan', name: '车贷', icon: 'Car', color: '#FF9500' },
  { id: 'huabei', name: '花呗', icon: 'CreditCard', color: '#007AFF' },
  { id: 'jiebei', name: '借呗', icon: 'Wallet', color: '#5856D6' },
  { id: 'borrow', name: '借钱', icon: 'Banknote', color: '#8E8E93' },
  { id: 'credit-card', name: '信用卡', icon: 'CreditCard', color: '#34C759' },
];

export function Repayments({ store }: { store: any }) {
  const { state, addRepayment, updateRepayment, deleteRepayment, executeRepayment, togglePrivacyMode, addCategory } = store;
  const { repayments, categories, transactions, isPrivacyMode } = state as AppState;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRepayment, setEditingRepayment] = useState<Repayment | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    totalAmount: '',
    installmentCount: '12',
    interestRate: '0',
    cycle: 'monthly' as RepaymentCycle,
    startDate: new Date().toISOString().slice(0, 10),
    reminderEnabled: true,
  });

  // 合并分类（默认还款分类 + 用户自定义支出分类）
  const allCategories = useMemo(() => {
    const expenseCats = categories.filter(c => c.type === 'expense' || !c.type);
    const defaultIds = DEFAULT_REPAYMENT_CATEGORIES.map(c => c.id);
    const filteredExpenseCats = expenseCats.filter(c => !defaultIds.includes(c.id));
    return [...DEFAULT_REPAYMENT_CATEGORIES, ...filteredExpenseCats];
  }, [categories]);

  // 计算下次还款日期
  const calculateNextDueDate = (startDate: string, cycle: RepaymentCycle, paidInstallments: number): string => {
    let date = parseISO(startDate);
    const cyclesToAdd = paidInstallments;

    for (let i = 0; i < cyclesToAdd; i++) {
      switch (cycle) {
        case 'daily':
          date = addDays(date, 1);
          break;
        case 'weekly':
          date = addWeeks(date, 1);
          break;
        case 'monthly':
          date = addMonths(date, 1);
          break;
        case 'quarterly':
          date = addQuarters(date, 1);
          break;
        case 'yearly':
          date = addYears(date, 1);
          break;
      }
    }
    return date.toISOString();
  };

  // 计算每期还款金额（等额本息）
  const calculatePeriodicPayment = (principal: number, annualRate: number, periods: number, cycle: RepaymentCycle): number => {
    if (annualRate === 0) {
      return principal / periods;
    }

    // 根据周期计算月利率
    let monthlyRate = annualRate / 100 / 12;
    switch (cycle) {
      case 'daily':
        monthlyRate = annualRate / 100 / 365;
        break;
      case 'weekly':
        monthlyRate = annualRate / 100 / 52;
        break;
      case 'monthly':
        monthlyRate = annualRate / 100 / 12;
        break;
      case 'quarterly':
        monthlyRate = annualRate / 100 / 4;
        break;
      case 'yearly':
        monthlyRate = annualRate / 100;
        break;
    }

    // 等额本息公式：PMT = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, periods) / (Math.pow(1 + monthlyRate, periods) - 1);
    return Math.round(payment * 100) / 100;
  };

  // 过滤还款项目
  const filteredRepayments = useMemo(() => {
    return repayments.filter(r => showCompleted || r.isActive);
  }, [repayments, showCompleted]);

  // 检查今天是否有到期还款
  const dueTodayRepayments = useMemo(() => {
    const today = new Date();
    return repayments.filter(r => {
      if (!r.isActive) return false;
      const nextDue = parseISO(r.nextDueDate);
      return isSameDay(nextDue, today) || isBefore(nextDue, today);
    });
  }, [repayments]);

  const handleSubmit = () => {
    const totalAmount = parseFloat(formData.totalAmount);
    const installmentCount = parseInt(formData.installmentCount);
    const interestRate = parseFloat(formData.interestRate);

    if (!formData.name || !formData.categoryId || isNaN(totalAmount) || totalAmount <= 0 || isNaN(installmentCount) || installmentCount <= 0) {
      return;
    }

    const periodicPayment = calculatePeriodicPayment(totalAmount, interestRate, installmentCount, formData.cycle);
    const totalPayment = Math.round(periodicPayment * installmentCount * 100) / 100;
    const nextDueDate = calculateNextDueDate(formData.startDate, formData.cycle, 0);

    if (editingRepayment) {
      updateRepayment(editingRepayment.id, {
        ...formData,
        totalAmount,
        installmentCount,
        interestRate,
        periodicPayment,
        totalPayment,
      });
      setEditingRepayment(null);
    } else {
      addRepayment({
        ...formData,
        totalAmount,
        installmentCount,
        interestRate,
        periodicPayment,
        totalPayment,
        nextDueDate,
        isActive: true,
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      totalAmount: '',
      installmentCount: '12',
      interestRate: '0',
      cycle: 'monthly',
      startDate: new Date().toISOString().slice(0, 10),
      reminderEnabled: true,
    });
  };

  const openEditModal = (repayment: Repayment) => {
    setEditingRepayment(repayment);
    setFormData({
      name: repayment.name,
      categoryId: repayment.categoryId,
      totalAmount: repayment.totalAmount.toString(),
      installmentCount: repayment.installmentCount.toString(),
      interestRate: repayment.interestRate.toString(),
      cycle: repayment.cycle,
      startDate: repayment.startDate.slice(0, 10),
      reminderEnabled: repayment.reminderEnabled,
    });
    setIsAddModalOpen(true);
  };

  const handleExecuteRepayment = (repaymentId: string) => {
    if (confirm('确认执行本次还款？')) {
      executeRepayment(repaymentId);
    }
  };

  const getCategoryInfo = (categoryId: string): Category | undefined => {
    return allCategories.find(c => c.id === categoryId) || categories.find(c => c.id === categoryId);
  };

  return (
    <div className="p-4 space-y-4">
      {/* 今日到期提醒 */}
      {dueTodayRepayments.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="AlertCircle" color="#EF4444" size={20} />
            <h3 className="font-semibold text-red-600">今日待还款</h3>
          </div>
          <div className="space-y-3">
            {dueTodayRepayments.map(r => {
              const category = getCategoryInfo(r.categoryId);
              return (
                <div key={r.id} className="flex items-center justify-between bg-white rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color || '#8E8E93'}20` }}
                    >
                      <Icon name={category?.icon || 'CreditCard'} color={category?.color || '#8E8E93'} size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{r.name}</div>
                      <div className="text-xs text-gray-500">第 {r.paidInstallments + 1}/{r.installmentCount} 期</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-semibold text-gray-900 ${isPrivacyMode ? 'blur-sm' : ''}`}>
                      ¥{r.periodicPayment.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleExecuteRepayment(r.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      还款
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 操作栏 */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            resetForm();
            setEditingRepayment(null);
            setIsAddModalOpen(true);
          }}
          className="flex-1 py-4 bg-black text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
        >
          <Icon name="Plus" size={20} />
          添加还款计划
        </button>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={`px-4 py-4 rounded-2xl font-medium transition-colors ${showCompleted ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          {showCompleted ? '隐藏已还清' : '显示已还清'}
        </button>
      </div>

      {/* 还款列表 */}
      <div className="space-y-4">
        {filteredRepayments.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Icon name="CreditCard" size={48} className="mx-auto mb-4 opacity-30" />
            <p>暂无还款计划</p>
            <p className="text-sm mt-1">点击上方按钮添加</p>
          </div>
        ) : (
          filteredRepayments.map(r => {
            const category = getCategoryInfo(r.categoryId);
            const progress = (r.paidInstallments / r.installmentCount) * 100;
            const isOverdue = r.isActive && isBefore(parseISO(r.nextDueDate), new Date()) && !isSameDay(parseISO(r.nextDueDate), new Date());

            return (
              <div key={r.id} className={`bg-white rounded-3xl p-5 shadow-sm border ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color || '#8E8E93'}20` }}
                    >
                      <Icon name={category?.icon || 'CreditCard'} color={category?.color || '#8E8E93'} size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.name}</h3>
                      <p className="text-xs text-gray-500">{category?.name} · {CYCLE_OPTIONS.find(c => c.value === r.cycle)?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {r.isActive ? (
                      <>
                        <button
                          onClick={() => handleExecuteRepayment(r.id)}
                          className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                          title="执行还款"
                        >
                          <Icon name="Check" size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(r)}
                          className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Icon name="Pencil" size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">已还清</span>
                    )}
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">还款进度</span>
                    <span className="font-medium text-gray-900">{r.paidInstallments}/{r.installmentCount} 期</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${isOverdue ? 'bg-red-500' : 'bg-black'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* 金额信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">本期应还</p>
                    <p className={`font-semibold text-gray-900 ${isPrivacyMode ? 'blur-sm' : ''}`}>¥{r.periodicPayment.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">{r.isActive ? '下次还款' : '还清日期'}</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-500' : 'text-gray-900'}`}>
                      {format(parseISO(r.isActive ? r.nextDueDate : r.startDate), 'MM-dd')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">已还/总欠款</p>
                    <p className={`font-semibold text-gray-900 ${isPrivacyMode ? 'blur-sm' : ''}`}>
                      ¥{r.paidAmount.toFixed(0)} / ¥{r.totalPayment.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">利率</p>
                    <p className="font-medium text-gray-900">{r.interestRate}%</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 添加/编辑弹窗 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-[32px] p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingRepayment ? '编辑还款计划' : '添加还款计划'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                  setEditingRepayment(null);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* 名称 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">还款名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：房贷、车贷"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">分类</label>
                <div className="grid grid-cols-3 gap-2">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                      className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all ${formData.categoryId === cat.id ? 'ring-2 ring-black bg-gray-50' : 'hover:bg-gray-50 border border-gray-100'}`}
                    >
                      <Icon name={cat.icon} color={cat.color} size={20} />
                      <span className="text-[10px] font-medium text-gray-600 mt-1">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 金额和利率 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">总欠款金额</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-8 pr-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">年利率 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* 分期数和周期 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">分期数</label>
                  <input
                    type="number"
                    value={formData.installmentCount}
                    onChange={e => setFormData({ ...formData, installmentCount: e.target.value })}
                    placeholder="12"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">还款周期</label>
                  <select
                    value={formData.cycle}
                    onChange={e => setFormData({ ...formData, cycle: e.target.value as RepaymentCycle })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                  >
                    {CYCLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 开始日期 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">首次还款日期</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* 提醒开关 */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">到期提醒</p>
                  <p className="text-xs text-gray-500">还款日前一天提醒</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, reminderEnabled: !formData.reminderEnabled })}
                  className={`w-14 h-8 rounded-full transition-colors relative ${formData.reminderEnabled ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${formData.reminderEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* 预览计算结果 */}
              {formData.totalAmount && formData.installmentCount && (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">预览</p>
                  {(() => {
                    const principal = parseFloat(formData.totalAmount) || 0;
                    const periods = parseInt(formData.installmentCount) || 1;
                    const rate = parseFloat(formData.interestRate) || 0;
                    const payment = calculatePeriodicPayment(principal, rate, periods, formData.cycle);
                    const total = Math.round(payment * periods * 100) / 100;
                    const interest = Math.round((total - principal) * 100) / 100;

                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">每期还款</span>
                          <span className="font-semibold text-gray-900">¥{payment.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">总还款额</span>
                          <span className="font-semibold text-gray-900">¥{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">总利息</span>
                          <span className="font-semibold text-orange-500">¥{interest.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-bold text-white bg-black hover:bg-gray-900 transition-colors"
              >
                {editingRepayment ? '保存修改' : '创建还款计划'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
