import React, { useState } from 'react';
import { Menu, Home, Users, DollarSign, X } from 'lucide-react';
import { MenuPrincipal } from './pages/MenuPrincipal';
import { Alunos } from './pages/Alunos';
import { Financeiro } from './pages/Financeiro';
import { ToastContainer } from './components/Toast';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'alunos' | 'financeiro'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { id: 'home', label: 'Menu Principal', icon: Home },
    { id: 'alunos', label: 'Alunos', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar mobile header – logo centralizado com espaço espelho */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 bg-[#5A0B13] md:hidden">
          <div className="w-8 shrink-0" />
          <div className="flex-1 flex justify-center">
            <img src="/logo.png" alt="MJ Fitness" className="h-10 object-contain" />
          </div>
          <button onClick={closeSidebar} aria-label="Fechar menu" className="text-white p-1 w-8 shrink-0 flex justify-end">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  closeSidebar();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#5A0B13] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-[#5A0B13] flex items-center px-4 sticky top-0 z-30 shadow-md">
          {/* Mobile menu button – stays on the left */}
          <button
            onClick={toggleSidebar}
            aria-label="Abrir menu"
            className="p-2 -ml-2 mr-2 md:hidden hover:bg-white/10 rounded-md transition-colors text-white"
          >
            <Menu size={24} />
          </button>

          {/* Logo – centered in the full header width */}
          {/*
            LOGO: para trocar a imagem, edite apenas o src abaixo.
            - Arquivo local:  src="/logo.png"   (coloque o arquivo em public/)
            - URL externa:    src="https://..."
          */}
          <div className="flex-1 flex justify-center">
            <img
              src="/logo.png"
              alt="MJ Fitness"
              className="h-11 object-contain"
            />
          </div>

          {/* Espaço espelho para balancear o botão mobile e manter o logo centralizado */}
          <div className="w-10 md:hidden" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          {currentView === 'home' && <MenuPrincipal />}
          {currentView === 'alunos' && <Alunos />}
          {currentView === 'financeiro' && <Financeiro />}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
