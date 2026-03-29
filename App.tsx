import { useState } from 'react';
import { useStore } from './store';
import { Dashboard } from './Dashboard';
import { Categories } from './Categories';
import { Goals } from './Goals';
import { History } from './History';
import { Repayments } from './Repayments';
import { Icon } from './Icons';
import { AddTransactionModal } from './AddTransactionModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const store = useStore();

  // When returning to the balance/dashboard screen, auto-enable privacy protection.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard' && store.state?.isPrivacyMode === false) {
      store.togglePrivacyMode();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'dashboard' && <Dashboard store={store} />}
        {activeTab === 'categories' && <Categories store={store} />}
        {activeTab === 'goals' && <Goals store={store} />}
        {activeTab === 'history' && <History store={store} />}
      </main>

      {/* Bottom Navigation - 对称布局：4个图标两侧分布，中间圆形大按钮 */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-200 pb-safe z-40">
        <div className="flex justify-around items-center h-16 px-6">
          {/* 左侧两个图标 */}
          <NavItem icon="LayoutDashboard" label="概览" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} />
          <NavItem icon="Grid" label="分类" active={activeTab === 'categories'} onClick={() => handleTabChange('categories')} />

          {/* 中间圆形大按钮 - 视觉锚点 */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl transform -translate-y-3 hover:scale-110 hover:shadow-2xl transition-all duration-300 shrink-0 mx-4"
          >
            <Icon name="Plus" size={28} />
          </button>

          {/* 右侧两个图标 */}
          <NavItem icon="Target" label="目标" active={activeTab === 'goals'} onClick={() => handleTabChange('goals')} />
          <NavItem icon="FileText" label="账单" active={activeTab === 'history'} onClick={() => handleTabChange('history')} />
        </div>
      </nav>

      {isAddModalOpen && <AddTransactionModal store={store} onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${active ? 'text-black scale-105' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className={`mb-1 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
        <Icon name={icon} size={24} />
      </div>
      <span className={`text-[10px] font-medium transition-all duration-300 ${active ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
}
