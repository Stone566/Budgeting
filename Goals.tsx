import React, { useState } from 'react';
import { AppState, SavingGoal } from './store';
import { Icon } from './Icons';
import { format, parseISO } from 'date-fns';

export function Goals({ store }: { store: any }) {
  const { state, addSavingGoal, addDeposit, togglePrivacyMode } = store;
  const { savingGoals, isPrivacyMode } = state as AppState;

  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', monthlyAmount: '', emoji: '', imageUrl: '' });
  
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGoal(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGoal = () => {
    const target = parseFloat(newGoal.targetAmount);
    const monthly = parseFloat(newGoal.monthlyAmount);
    if (newGoal.name && !isNaN(target) && !isNaN(monthly)) {
      addSavingGoal({ 
        name: newGoal.name, 
        targetAmount: target, 
        monthlyAmount: monthly,
        emoji: newGoal.emoji,
        imageUrl: newGoal.imageUrl
      });
      setIsAddGoalModalOpen(false);
      setNewGoal({ name: '', targetAmount: '', monthlyAmount: '', emoji: '', imageUrl: '' });
    }
  };

  const handleAddDeposit = (id: string) => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      addDeposit(id, amount, new Date().toISOString());
      setSelectedGoal(null);
      setDepositAmount('');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <header className="pt-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">存钱目标</h1>
          <p className="text-gray-500 text-sm mt-1">记录您的每一个小目标</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={togglePrivacyMode}
            className="w-10 h-10 bg-white text-gray-500 border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Icon name={isPrivacyMode ? "EyeOff" : "Eye"} size={18} />
          </button>
          <button 
            onClick={() => setIsAddGoalModalOpen(true)}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-md"
          >
            <Icon name="Plus" size={20} />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {savingGoals.map(goal => {
          const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              {goal.imageUrl && (
                <div className="h-32 w-full bg-gray-200 relative">
                  <img src={goal.imageUrl} alt={goal.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              )}
              <div className={`p-6 ${goal.imageUrl ? 'pt-4 relative z-10 -mt-12 text-white' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {goal.emoji && !goal.imageUrl && (
                      <div className="text-4xl">{goal.emoji}</div>
                    )}
                    {goal.emoji && goal.imageUrl && (
                      <div className="text-3xl bg-white/20 backdrop-blur-md rounded-xl p-2 w-12 h-12 flex items-center justify-center shadow-sm">{goal.emoji}</div>
                    )}
                    <div>
                      <h3 className={`text-xl font-bold mb-1 ${goal.imageUrl ? 'text-white' : 'text-gray-900'}`}>{goal.name}</h3>
                      <div className={`text-sm font-medium transition-all duration-300 ${goal.imageUrl ? 'text-white/80' : 'text-gray-500'} ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>
                        目标: ¥{goal.targetAmount.toFixed(2)} · 每月: ¥{goal.monthlyAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold transition-all duration-300 ${goal.imageUrl ? 'text-white' : 'text-black'} ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>
                    {progress.toFixed(0)}%
                  </div>
                </div>

                <div className={`w-full rounded-full h-2 mb-4 overflow-hidden ${goal.imageUrl ? 'bg-white/30' : 'bg-gray-100'}`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${goal.imageUrl ? 'bg-white' : 'bg-black'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div>
                    <div className={`text-xs font-medium mb-1 ${goal.imageUrl ? 'text-white/70' : 'text-gray-400'}`}>已存入</div>
                    <div className={`text-lg font-semibold transition-all duration-300 ${goal.imageUrl ? 'text-white' : 'text-gray-900'} ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>¥{goal.savedAmount.toFixed(2)}</div>
                  </div>
                  <button 
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${goal.imageUrl ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                  >
                    存入一笔
                  </button>
                </div>
                
                {/* Recent Deposits */}
                {goal.deposits.length > 0 && (
                  <div className={`mt-6 pt-4 border-t ${goal.imageUrl ? 'border-white/20' : 'border-gray-100'}`}>
                    <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${goal.imageUrl ? 'text-white/70' : 'text-gray-400'}`}>最近存入记录</h4>
                    <div className="space-y-2">
                      {goal.deposits.slice(0, 3).map(d => (
                        <div key={d.id} className="flex justify-between items-center text-sm">
                          <span className={goal.imageUrl ? 'text-white/80' : 'text-gray-500'}>{format(parseISO(d.date), 'yyyy-MM-dd')}</span>
                          <span className={`font-medium transition-all duration-300 ${goal.imageUrl ? 'text-green-300' : 'text-green-600'} ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>+¥{d.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {savingGoals.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Icon name="Target" size={48} className="mx-auto mb-4 opacity-20" />
            <p>还没有存钱目标，点击右上角添加一个吧</p>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">新建存钱目标</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">表情</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newGoal.emoji}
                    onChange={e => setNewGoal({ ...newGoal, emoji: e.target.value })}
                    placeholder="🎯"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex-[3]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">背景图 (可选)</label>
                  <div className="relative w-full h-[60px] bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                    {newGoal.imageUrl ? (
                      <img src={newGoal.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-50 absolute inset-0" />
                    ) : (
                      <span className="text-sm text-gray-400 font-medium z-10">点击上传</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={newGoal.name}
                onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="目标名称 (例如: 买车)"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="number"
                value={newGoal.targetAmount}
                onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                placeholder="目标总金额"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="number"
                value={newGoal.monthlyAmount}
                onChange={e => setNewGoal({ ...newGoal, monthlyAmount: e.target.value })}
                placeholder="每月计划存入金额"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddGoalModalOpen(false)}
                className="flex-1 py-4 rounded-2xl font-semibold text-gray-600 bg-gray-100"
              >
                取消
              </button>
              <button 
                onClick={handleAddGoal}
                className="flex-1 py-4 rounded-2xl font-semibold text-white bg-black"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Deposit Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">存入一笔钱</h3>
            
            <input
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="输入存入金额"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-lg font-medium text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-black"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedGoal(null)}
                className="flex-1 py-4 rounded-2xl font-semibold text-gray-600 bg-gray-100"
              >
                取消
              </button>
              <button 
                onClick={() => handleAddDeposit(selectedGoal)}
                className="flex-1 py-4 rounded-2xl font-semibold text-white bg-black"
              >
                确认存入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
