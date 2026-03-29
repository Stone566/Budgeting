import { useState, useMemo, useRef } from 'react';
import { AppState, Category, CategoryType } from './store';
import { Icon } from './Icons';
import { format, parseISO, isSameMonth } from 'date-fns';

const ICONS = [
  'Home',
  'Utensils',
  'Car',
  'Bus',
  'Train',
  'Bike',
  'Zap',
  'ShoppingBag',
  'ShoppingCart',
  'Film',
  'Gamepad2',
  'Heart',
  'Stethoscope',
  'Coffee',
  'Gift',
  'Smartphone',
  'Monitor',
  'Book',
  'GraduationCap',
  'Plane',
  'Hotel',
  'Music',
  'Briefcase',
  'Camera',
  'Smile',
  'Star',
  'Sun',
  'Moon',
  'Cloud',
  'Umbrella',
  'Scissors',
  'PenTool',
  'Map',
  'Compass',
  'Clock',
  'Bell',
  'Wallet',
  'Receipt',
  'CreditCard',
  'Banknote',
  'PiggyBank',
  'Shield',
  'Baby',
  'PawPrint',
  'Dumbbell',
  'Flower2',
  'Sprout',
  'Fuel',
  'Wrench',
  'TrendingUp',
  'MoreHorizontal',
];

const COLORS = [
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#5AC8FA',
  '#007AFF',
  '#5856D6',
  '#AF52DE',
  '#FF2D55',
  '#8E8E93',
  '#00C7BE',
  '#32D74B',
  '#64D2FF',
  '#0A84FF',
  '#FFD60A',
  '#FF9F0A',
  '#FF453A',
  '#BF5AF2',
  '#30D158',
  '#66D4CF',
  '#AC8E68',
  '#A2845E',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FF6B6B',
  '#D4A5A5',
  '#34495E',
  '#16A085',
  '#27AE60',
];

export function Categories({ store }: { store: any }) {
  const { state, updateCategory, addCategory, deleteCategory, togglePrivacyMode } = store;
  const { categories, transactions, isPrivacyMode } = state as AppState;

  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), now));

  // 分离支出和收入分类
  const expenseCategories = categories.filter(c => c.type === 'expense' || !c.type);
  const incomeCategories = categories.filter(c => c.type === 'income');

  const categoryStats = useMemo(() => {
    return expenseCategories.map(cat => {
      const spent = currentMonthTransactions
        .filter(t => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, spent };
    });
  }, [expenseCategories, currentMonthTransactions]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>('expense');
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: ICONS[0],
    color: COLORS[0],
    emoji: '',
    budget: undefined as number | undefined,
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);

  const handlePressStart = (cat: Category) => {
    setIsLongPressTriggered(false);
    longPressTimer.current = setTimeout(() => {
      setIsLongPressTriggered(true);
      setEditingCategory(cat);
    }, 500); // 500ms for long press
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCategoryClick = (cat: Category) => {
    if (!isLongPressTriggered && cat.type === 'expense' || !cat.type) {
      setSelectedCategory(cat.id);
      setBudgetInput(cat.budget ? cat.budget.toString() : '');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name) {
      addCategory({
        ...newCategory,
        type: newCategoryType,
      });
      setIsAddCategoryModalOpen(false);
      setNewCategory({
        name: '',
        icon: ICONS[0],
        color: COLORS[0],
        emoji: '',
        budget: undefined,
      });
      setNewCategoryType('expense');
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name) {
      updateCategory(editingCategory.id, {
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        emoji: editingCategory.emoji,
        budget: editingCategory.budget,
      });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = () => {
    if (editingCategory) {
      deleteCategory(editingCategory.id);
      setEditingCategory(null);
    }
  };

  const handleSetBudget = (id: string) => {
    if (budgetInput.trim() === '' || parseFloat(budgetInput) === 0) {
      updateCategory(id, { budget: undefined });
      setBudgetInput('');
      setSelectedCategory(null);
      return;
    }

    const budget = parseFloat(budgetInput);
    if (!isNaN(budget) && budget > 0) {
      updateCategory(id, { budget });
      setBudgetInput('');
      setSelectedCategory(null);
    }
  };

  const openAddModal = (type: CategoryType) => {
    setNewCategoryType(type);
    setIsAddCategoryModalOpen(true);
  };

  return (
    <div className="p-4 space-y-6">
      <header className="pt-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">分类与预算</h1>
          <p className="text-gray-500 text-sm mt-1">管理您的支出和收入分类</p>
        </div>
        <button
          onClick={togglePrivacyMode}
          className="w-10 h-10 bg-white text-gray-500 border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Icon name={isPrivacyMode ? "EyeOff" : "Eye"} size={18} />
        </button>
      </header>

      {/* 支出分类 */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">支出分类</h2>
          <button
            onClick={() => openAddModal('expense')}
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            <Icon name="Plus" size={16} />
            添加
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categoryStats.map(cat => {
            const progress = cat.budget ? Math.min((cat.spent / cat.budget) * 100, 100) : 0;
            const isOverBudget = cat.budget && cat.spent > cat.budget;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                onTouchStart={() => handlePressStart(cat)}
                onTouchEnd={handlePressEnd}
                onTouchMove={handlePressEnd}
                onMouseDown={() => handlePressStart(cat)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer transition-transform hover:scale-105 relative group select-none"
              >
                <div className="flex justify-between items-start mb-4 mt-2">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {cat.emoji ? cat.emoji : <Icon name={cat.icon} color={cat.color} size={24} />}
                  </div>
                  {cat.budget && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {progress.toFixed(0)}%
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-1">{cat.name}</h3>
                  <div className={`text-gray-500 text-sm font-medium transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>
                    ¥{cat.spent.toFixed(2)} {cat.budget ? `/ ¥${cat.budget}` : ''}
                  </div>
                </div>

                {cat.budget && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-black'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 收入分类 */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">收入分类</h2>
          <button
            onClick={() => openAddModal('income')}
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            <Icon name="Plus" size={16} />
            添加
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {incomeCategories.map(cat => {
            // 计算本月收入
            const earned = currentMonthTransactions
              .filter(t => t.type === 'income' && t.categoryId === cat.id)
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div
                key={cat.id}
                onTouchStart={() => handlePressStart(cat)}
                onTouchEnd={handlePressEnd}
                onTouchMove={handlePressEnd}
                onMouseDown={() => handlePressStart(cat)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer transition-transform hover:scale-105 relative group select-none"
              >
                <div className="flex justify-between items-start mb-4 mt-2">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {cat.emoji ? cat.emoji : <Icon name={cat.icon} color={cat.color} size={24} />}
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-1">{cat.name}</h3>
                  <div className={`text-gray-500 text-sm font-medium transition-all duration-300 ${isPrivacyMode ? 'blur-sm select-none opacity-50' : ''}`}>
                    本月: ¥{earned.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Budget Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">设置预算</h3>
            <p className="text-sm text-gray-500 mb-6">
              为 {expenseCategories.find(c => c.id === selectedCategory)?.name} 设置本月预算
            </p>

            <input
              type="number"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              placeholder="输入金额"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-lg font-medium text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex-1 py-4 rounded-2xl font-semibold text-gray-600 bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={() => handleSetBudget(selectedCategory)}
                className="flex-1 py-4 rounded-2xl font-semibold text-white bg-black"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑分类</h3>
              <button onClick={() => setEditingCategory(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-6 mb-6">
              <div className="flex gap-3">
                <div className="flex-[3]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">名称</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">表情</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editingCategory.emoji || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, emoji: e.target.value })}
                    placeholder="🍔"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {(editingCategory.type === 'expense' || !editingCategory.type) && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">预算</label>
                  <input
                    type="number"
                    value={editingCategory.budget || ''}
                    onChange={e => setEditingCategory({
                      ...editingCategory,
                      budget: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="不设置预算请留空"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">颜色</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${editingCategory.color === color ? 'scale-125 ring-2 ring-offset-2 ring-black' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">图标</label>
                <div className="grid grid-cols-6 gap-3 max-h-40 overflow-y-auto p-1">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setEditingCategory({ ...editingCategory, icon })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${editingCategory.icon === icon ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Icon name={icon} size={20} color={editingCategory.icon === icon ? '#fff' : undefined} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpdateCategory}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-black"
              >
                保存修改
              </button>
              <button
                onClick={handleDeleteCategory}
                className="w-full py-4 rounded-2xl font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              >
                删除分类
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {newCategoryType === 'expense' ? '新建支出分类' : '新建收入分类'}
              </h3>
              <button onClick={() => setIsAddCategoryModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-6 mb-6">
              <div className="flex gap-3">
                <div className="flex-[3]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">名称</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="例如: 宠物"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">表情</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newCategory.emoji}
                    onChange={e => setNewCategory({ ...newCategory, emoji: e.target.value })}
                    placeholder="🐶"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {newCategoryType === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">预算</label>
                  <input
                    type="number"
                    value={newCategory.budget || ''}
                    onChange={e => setNewCategory({
                      ...newCategory,
                      budget: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="不设置预算请留空"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">颜色</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${newCategory.color === color ? 'scale-125 ring-2 ring-offset-2 ring-black' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">图标</label>
                <div className="grid grid-cols-6 gap-3 max-h-40 overflow-y-auto p-1">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${newCategory.icon === icon ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Icon name={icon} size={20} color={newCategory.icon === icon ? '#fff' : undefined} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="flex-1 py-4 rounded-2xl font-semibold text-gray-600 bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 py-4 rounded-2xl font-semibold text-white bg-black"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
