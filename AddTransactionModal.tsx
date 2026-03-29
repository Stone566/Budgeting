import React, { useState } from 'react';
import { AppState, TransactionType } from './store';
import { Icon } from './Icons';

export function AddTransactionModal({ store, onClose }: { store: any, onClose: () => void }) {
  const { state, addTransaction } = store;
  const { categories } = state as AppState;

  // 获取当前时间的函数
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('微信');
  const [remark, setRemark] = useState('');
  const [date, setDate] = useState(getCurrentDateTime());

  // 根据类型过滤分类
  const filteredCategories = categories.filter(c => c.type === type || !c.type);

  // 当类型改变时，更新默认分类
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const typeCategories = categories.filter(c => c.type === newType || !c.type);
    setCategoryId(typeCategories[0]?.id || '');
  };

  const paymentMethods = ['微信', '支付宝', '银行卡', '现金'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      addTransaction({
        type,
        amount: parsedAmount,
        categoryId: categoryId || (type === 'income' ? 'income' : categories[0]?.id || ''),
        paymentMethod,
        remark,
        date: new Date(date).toISOString(),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">记一笔</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${type === 'expense' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
          >
            支出
          </button>
          <button
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${type === 'income' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
          >
            收入
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">金额</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">¥</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-3xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">分类</label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all ${categoryId === cat.id ? 'ring-2 ring-black bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1 text-xl"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {cat.emoji ? cat.emoji : <Icon name={cat.icon} color={cat.color} size={20} />}
                  </div>
                  <span className="text-[10px] font-medium text-gray-600">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">支付方式</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black appearance-none"
              >
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">日期</label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">备注</label>
            <input
              type="text"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="添加备注..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-white bg-black hover:bg-gray-900 transition-colors mt-4"
          >
            保存
          </button>
        </form>
      </div>
    </div>
  );
}
