import React from 'react';
import { LayoutDashboard, ShoppingBag, ChefHat, Package, DollarSign, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAI }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pdv', label: 'Nova Venda (PDV)', icon: ShoppingBag },
    { id: 'recipes', label: 'Custos & Pudins', icon: ChefHat },
    { id: 'stock', label: 'Estoque', icon: Package },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
  ];

  return (
    <header className="sticky top-0 z-40 shadow-sm border-b" style={{ backgroundColor: '#F7F1E8', borderColor: '#F2DED3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md text-2xl font-serif font-bold transition-transform hover:scale-105" 
                 style={{ backgroundColor: '#7B4E2E', color: '#E7C992' }}>
              LP
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-wider" style={{ color: '#7B4E2E' }}>
                Lumé Pudim
              </h1>
              <p className="text-xs font-sans tracking-widest uppercase font-semibold" style={{ color: '#D9A46A' }}>
                Confeitaria Artesanal
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? 'shadow-md scale-105 font-semibold' 
                      : 'hover:bg-opacity-50 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#7B4E2E' : 'transparent',
                    color: isActive ? '#F7F1E8' : '#7B4E2E',
                  }}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#E7C992]' : 'text-[#7B4E2E]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* AI Executive Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAI}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl font-medium text-sm group border"
              style={{
                background: 'linear-gradient(135deg, #7B4E2E 0%, #D9A46A 100%)',
                color: '#F7F1E8',
                borderColor: '#E7C992'
              }}
            >
              <Sparkles className="w-4 h-4 text-[#E7C992] animate-pulse" />
              <span className="hidden sm:inline font-serif tracking-wide">Consultor IA</span>
            </button>
          </div>

        </div>

        {/* Navigation Links (Mobile) */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t no-scrollbar" style={{ borderColor: '#F2DED3' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive ? 'shadow font-bold' : ''
                }`}
                style={{
                  backgroundColor: isActive ? '#7B4E2E' : '#F2DED3',
                  color: isActive ? '#F7F1E8' : '#7B4E2E',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
