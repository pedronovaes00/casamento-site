import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Gift, Heart, Settings, LogOut, Menu, X } from 'lucide-react';
import { GuestsList } from './GuestsList';
import { GiftsManagement } from './GiftsManagement';
import { VaquinhasManagement } from './VaquinhasManagement';
import { WeddingSettings } from './WeddingSettings';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('guests');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logout realizado com sucesso');
    navigate('/admin');
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('adminToken');
    toast.error('Sua sessão expirou. Faça login novamente.');
    navigate('/admin');
  };

  const menuItems = [
    { id: 'guests', label: 'Convidados', icon: Users, badge: notifCount },
    { id: 'gifts', label: 'Presentes', icon: Gift },
    { id: 'vaquinhas', label: 'Vaquinhas', icon: Heart },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="mobile-menu-toggle"
          className="p-3 bg-wedding-blue text-white rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-serif text-2xl text-wedding-blue">Painel Admin</h2>
          <p className="text-sm text-slate-500 mt-1">Gestão do Casamento</p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                data-testid={`admin-tab-${item.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all relative ${
                  activeTab === item.id ? 'bg-wedding-blue text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-sans">{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            data-testid="admin-logout-button"
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-sans">Sair</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {activeTab === 'guests' && <GuestsList onNotifCount={setNotifCount} onUnauthorized={handleUnauthorized} />}
          {activeTab === 'gifts' && <GiftsManagement />}
          {activeTab === 'vaquinhas' && <VaquinhasManagement />}
          {activeTab === 'settings' && <WeddingSettings />}
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
