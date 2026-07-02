/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ChefHat, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Sparkles, 
  Menu, 
  X,
  Bot,
  ChevronRight
} from 'lucide-react';
import { initialIngredients, initialRecipes, initialSales, initialExpenses } from './data/mockData';
import { Ingredient, PuddimRecipe, Sale, Expense, FinancialMetrics } from './types';

// Componentes
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { RecipeManager } from './components/RecipeManager';
import { StockManager } from './components/StockManager';
import { FinanceManager } from './components/FinanceManager';
import { AIConsultantModal } from './components/AIConsultantModal';

// Supabase Connection
import {
  initSupabaseClient,
  getSupabase,
  mapIngredientFromDb,
  mapIngredientToDb,
  mapRecipeFromDb,
  mapRecipeToDb,
  mapSaleFromDb,
  mapSaleToDb,
  mapExpenseFromDb,
  mapExpenseToDb
} from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recipes' | 'pdv' | 'stock' | 'finance'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Estados Globais de Dados da Confeitaria
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [recipes, setRecipes] = useState<PuddimRecipe[]>(initialRecipes);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  // Estados de Conectividade do Supabase
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'missing_tables' | 'error'>('connected');
  const [dbError, setDbError] = useState<string | null>(null);

  // Carregar dados iniciais do Supabase ou disparar verificação de tabelas
  useEffect(() => {
    async function loadData() {
      try {
        setSupabaseLoading(true);
        const supabase = await initSupabaseClient();
        
        // Verificação rápida se as tabelas existem no banco
        const [testIng, testRec, testSal, testExp] = await Promise.all([
          supabase.from('ingredients').select('id').limit(1),
          supabase.from('recipes').select('id').limit(1),
          supabase.from('sales').select('id').limit(1),
          supabase.from('expenses').select('id').limit(1),
        ]);

        const isMissingTableError = (error: any) => {
          if (!error) return false;
          const msg = String(error.message || '').toLowerCase();
          const code = String(error.code || '').toLowerCase();
          const details = String(error.details || '').toLowerCase();
          return (
            code === '42p01' ||
            code === 'pgrst116' ||
            msg.includes('could not find the table') ||
            (msg.includes('relation') && msg.includes('does not exist')) ||
            details.includes('could not find the table') ||
            details.includes('does not exist')
          );
        };

        const missing = [testIng, testRec, testSal, testExp].some(
          r => r.error && isMissingTableError(r.error)
        );
        
        if (missing) {
          setSupabaseStatus('missing_tables');
          setSupabaseLoading(false);
          return;
        }

        const someErr = [testIng, testRec, testSal, testExp].find(r => r.error);
        if (someErr && someErr.error) {
          throw new Error(someErr.error.message);
        }

        // Buscar dados reais das 4 tabelas
        const [ingRes, recRes, salRes, expRes] = await Promise.all([
          supabase.from('ingredients').select('*'),
          supabase.from('recipes').select('*'),
          supabase.from('sales').select('*').order('date', { ascending: false }),
          supabase.from('expenses').select('*').order('due_date', { ascending: false }),
        ]);

        if (ingRes.data) {
          setIngredients(ingRes.data.map(mapIngredientFromDb));
        }
        if (recRes.data) {
          setRecipes(recRes.data.map(mapRecipeFromDb));
        }
        if (salRes.data) {
          setSales(salRes.data.map(mapSaleFromDb));
        }
        if (expRes.data) {
          setExpenses(expRes.data.map(mapExpenseFromDb));
        }

        setSupabaseStatus('connected');
      } catch (err: any) {
        console.error('Erro ao conectar com o Supabase:', err);
        setSupabaseStatus('error');
        setDbError(err.message || 'Erro de conexão.');
      } finally {
        setSupabaseLoading(false);
      }
    }

    loadData();
  }, []);

  // Semear dados iniciais no Supabase se as tabelas existirem e estiverem limpas
  const handleSeedDatabase = async () => {
    try {
      setSupabaseLoading(true);
      const supabase = getSupabase();

      // Semear ingredientes
      const ingRows = initialIngredients.map(mapIngredientToDb);
      const { error: ingErr } = await supabase.from('ingredients').insert(ingRows);
      if (ingErr) throw ingErr;

      // Semear receitas
      const recRows = initialRecipes.map(mapRecipeToDb);
      const { error: recErr } = await supabase.from('recipes').insert(recRows);
      if (recErr) throw recErr;

      // Semear vendas
      const salRows = initialSales.map(mapSaleToDb);
      const { error: salErr } = await supabase.from('sales').insert(salRows);
      if (salErr) throw salErr;

      // Semear despesas
      const expRows = initialExpenses.map(mapExpenseToDb);
      const { error: expErr } = await supabase.from('expenses').insert(expRows);
      if (expErr) throw expErr;

      // Recarregar os estados locais com os dados do mock recém-semeados
      setIngredients(initialIngredients);
      setRecipes(initialRecipes);
      setSales(initialSales);
      setExpenses(initialExpenses);
      
      alert('Banco de dados Supabase semeado com os dados iniciais do Lumé Pudim com sucesso! 🍮🎉');
    } catch (err: any) {
      console.error('Erro ao semear o banco de dados:', err);
      alert('Erro ao semear banco de dados: ' + err.message);
    } finally {
      setSupabaseLoading(false);
    }
  };

  // Handlers de Estoque com Sync Supabase
  const handleAddIngredient = async (newIng: Ingredient) => {
    setIngredients(prev => [newIng, ...prev]);
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('ingredients').insert(mapIngredientToDb(newIng));
      } catch (err) {
        console.error('Erro ao gravar ingrediente no Supabase:', err);
      }
    }
  };

  const handleUpdateIngredient = async (updated: Ingredient) => {
    setIngredients(prev => prev.map(i => i.id === updated.id ? updated : i));
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('ingredients').update(mapIngredientToDb(updated)).eq('id', updated.id);
      } catch (err) {
        console.error('Erro ao atualizar ingrediente no Supabase:', err);
      }
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('ingredients').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao remover ingrediente no Supabase:', err);
      }
    }
  };

  // Handlers de Receitas (Fichas Técnicas) com Sync Supabase
  const handleAddRecipe = async (newRec: PuddimRecipe) => {
    setRecipes(prev => [newRec, ...prev]);
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('recipes').insert(mapRecipeToDb(newRec));
      } catch (err) {
        console.error('Erro ao gravar receita no Supabase:', err);
      }
    }
  };

  const handleUpdateRecipe = async (updated: PuddimRecipe) => {
    setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('recipes').update(mapRecipeToDb(updated)).eq('id', updated.id);
      } catch (err) {
        console.error('Erro ao atualizar receita no Supabase:', err);
      }
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('recipes').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao remover receita no Supabase:', err);
      }
    }
  };

  // Handlers de Vendas (PDV e Baixa de Estoque) com Sync Supabase
  const handleAddSale = async (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);

    // Baixa automática de estoque de insumos (local)
    let updatedIngredients: Ingredient[] = [];
    setIngredients(prevIngredients => {
      updatedIngredients = [...prevIngredients];

      newSale.items.forEach(soldItem => {
        const recipeObj = recipes.find(r => r.id === soldItem.recipeId);
        if (!recipeObj) return;

        recipeObj.ingredients.forEach(recIng => {
          const totalQtyUsed = recIng.quantity * soldItem.quantity;
          updatedIngredients = updatedIngredients.map(ing => {
            if (ing.id === recIng.ingredientId) {
              const newStock = Math.max(0, ing.currentStock - totalQtyUsed);
              return { ...ing, currentStock: newStock };
            }
            return ing;
          });
        });
      });

      return updatedIngredients;
    });

    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        // Gravar venda no banco
        await supabase.from('sales').insert(mapSaleToDb(newSale));
        
        // Atualizar estoque dos ingredientes utilizados
        await Promise.all(
          updatedIngredients.map(ing => 
            supabase.from('ingredients').update({ current_stock: ing.currentStock }).eq('id', ing.id)
          )
        );
      } catch (err) {
        console.error('Erro ao registrar venda/estoque no Supabase:', err);
      }
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    // Calcular o estoque estornado sincronamente antes de atualizar os estados e o Supabase
    let updatedIngredients = [...ingredients];

    saleToDelete.items.forEach(soldItem => {
      const recipeObj = recipes.find(r => r.id === soldItem.recipeId);
      if (!recipeObj) return;

      recipeObj.ingredients.forEach(recIng => {
        const totalQtyUsed = recIng.quantity * soldItem.quantity;
        updatedIngredients = updatedIngredients.map(ing => {
          if (ing.id === recIng.ingredientId) {
            const newStock = ing.currentStock + totalQtyUsed;
            return { ...ing, currentStock: newStock };
          }
          return ing;
        });
      });
    });

    // Atualizar estados locais de imediato
    setSales(prev => prev.filter(s => s.id !== saleId));
    setIngredients(updatedIngredients);

    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        // Deletar do banco
        const { error: deleteError } = await supabase.from('sales').delete().eq('id', saleId);
        if (deleteError) {
          console.error('Erro ao deletar venda do Supabase:', deleteError);
          return;
        }
        
        // Sincronizar os estoques atualizados no Supabase
        await Promise.all(
          updatedIngredients.map(ing => 
            supabase.from('ingredients').update({ current_stock: ing.currentStock }).eq('id', ing.id)
          )
        );
      } catch (err) {
        console.error('Erro ao excluir venda/restaurar estoque no Supabase:', err);
      }
    }
  };

  // Handlers de Financeiro / Despesas com Sync Supabase
  const handleAddExpense = async (newExp: Expense) => {
    setExpenses(prev => [newExp, ...prev]);
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('expenses').insert(mapExpenseToDb(newExp));
      } catch (err) {
        console.error('Erro ao gravar despesa no Supabase:', err);
      }
    }
  };

  const handleUpdateExpenseStatus = async (id: string, status: Expense['status']) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('expenses').update({ status }).eq('id', id);
      } catch (err) {
        console.error('Erro ao atualizar status de despesa no Supabase:', err);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (supabaseStatus === 'connected') {
      try {
        const supabase = getSupabase();
        await supabase.from('expenses').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao remover despesa no Supabase:', err);
      }
    }
  };

  // Cálculo de Métricas Financeiras Consolidadas (CMV, Lucro Bruto, Lucro Líquido)
  const metrics: FinancialMetrics = useMemo(() => {
    const completedSales = sales.filter(s => s.status === 'Concluído');
    const totalSales = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalCost = completedSales.reduce((acc, s) => acc + s.totalCost, 0); // CMV Apurado
    const grossProfit = totalSales - totalCost;

    const totalExpenses = expenses
      .filter(e => e.status === 'Pago')
      .reduce((acc, e) => acc + e.amount, 0);

    const netProfit = grossProfit - totalExpenses;
    const totalPudinsSold = completedSales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);
    const ticketMedio = completedSales.length > 0 ? (totalSales / completedSales.length) : 0;
    const cmvPercentage = totalSales > 0 ? ((totalCost / totalSales) * 100) : 0;

    return {
      totalSales,
      totalCost,
      grossProfit,
      totalExpenses,
      netProfit,
      ticketMedio,
      totalPudinsSold,
      cmvPercentage
    };
  }, [sales, expenses]);

  // Links da Barra Lateral
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recipes', label: 'Fichas Técnicas', icon: ChefHat },
    { id: 'pdv', label: 'PDV', icon: ShoppingBag },
    { id: 'stock', label: 'Estoque', icon: Package },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
  ] as const;

  return (
    <div className="min-h-screen flex bg-[#F7F1E8] font-sans text-[#7B4E2E]">
      
      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Barra Lateral (Sidebar) */}
      <aside 
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-64 shadow-2xl lg:shadow-none flex flex-col border-r transition-transform duration-300 ease-in-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: '#F7F1E8', borderColor: '#F2DED3' }}
      >
        {/* Logo / Título da Marca */}
        <div className="h-20 px-6 flex items-center justify-between border-b" style={{ borderColor: '#F2DED3' }}>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg text-xl font-serif font-bold tracking-tight"
              style={{ backgroundColor: '#7B4E2E', color: '#E7C992' }}
            >
              LP
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-wide" style={{ color: '#7B4E2E' }}>
                Lumé Pudim
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#D9A46A' }}>
                Confeitaria AI
              </p>
            </div>
          </div>

          <button 
            className="lg:hidden p-1 text-[#7B4E2E] hover:bg-[#F2DED3] rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Navegação Principal
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all duration-200 group cursor-pointer ${
                  isActive 
                    ? 'shadow-md font-bold text-white' 
                    : 'hover:bg-[#F2DED3]/60 font-medium text-[#7B4E2E]'
                }`}
                style={{
                  backgroundColor: isActive ? '#7B4E2E' : 'transparent',
                }}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#E7C992]' : 'text-[#7B4E2E] group-hover:scale-110 transition-transform'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#E7C992]" />}
              </button>
            );
          })}
        </nav>

        {/* Card do Consultor Chef IA no rodapé da Sidebar */}
        <div className="p-4 m-4 rounded-3xl relative overflow-hidden border shadow-lg" 
             style={{ background: 'linear-gradient(135deg, #7B4E2E 0%, #D9A46A 100%)', borderColor: '#E7C992' }}>
          <div className="flex items-center space-x-2 text-[#E7C992] mb-1">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs font-serif font-bold uppercase tracking-wider">Chef IA Executivo</span>
          </div>
          <p className="text-xs text-[#F7F1E8]/90 font-sans leading-tight mb-3">
            Receba insights e alertas de CMV da sua confeitaria.
          </p>
          <button
            onClick={() => {
              setAiModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#F7F1E8] text-[#7B4E2E] font-serif font-bold text-xs shadow hover:bg-[#E7C992] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-[#7B4E2E]" />
            <span>Consultar Chef IA</span>
          </button>
        </div>

        {/* Versão e Direitos */}
        <div className="p-4 text-center text-[11px] text-gray-400 border-t" style={{ borderColor: '#F2DED3' }}>
          Sistema Lumé Pudim v1.0
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Barra Superior Mobile */}
        <div className="lg:hidden sticky top-0 z-30 h-16 px-4 bg-[#F7F1E8] border-b border-[#F2DED3] flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#7B4E2E] hover:bg-[#F2DED3] rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-lg font-serif font-bold text-[#7B4E2E]">
            Lumé Pudim
          </h2>

          <button
            onClick={() => setAiModalOpen(true)}
            className="p-2 rounded-xl bg-[#7B4E2E] text-[#E7C992] shadow"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </button>
        </div>

        {/* View da Aba Ativa */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              metrics={metrics}
              sales={sales}
              recipes={recipes}
              ingredients={ingredients}
              expenses={expenses}
              onOpenAI={() => setAiModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              supabaseStatus={supabaseStatus}
              supabaseLoading={supabaseLoading}
              dbError={dbError}
              onSeedDb={handleSeedDatabase}
            />
          )}

          {activeTab === 'recipes' && (
            <RecipeManager
              recipes={recipes}
              ingredients={ingredients}
              onAddRecipe={handleAddRecipe}
              onUpdateRecipe={handleUpdateRecipe}
              onDeleteRecipe={handleDeleteRecipe}
            />
          )}

          {activeTab === 'pdv' && (
            <POS
              recipes={recipes}
              ingredients={ingredients}
              onAddSale={handleAddSale}
            />
          )}

          {activeTab === 'stock' && (
            <StockManager
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceManager
              expenses={expenses}
              sales={sales}
              onAddExpense={handleAddExpense}
              onUpdateExpenseStatus={handleUpdateExpenseStatus}
              onDeleteExpense={handleDeleteExpense}
              onDeleteSale={handleDeleteSale}
            />
          )}
        </div>
      </main>

      {/* Modal do Chef Executivo IA */}
      <AIConsultantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        metrics={metrics}
        recipes={recipes}
        ingredients={ingredients}
        expenses={expenses}
      />

    </div>
  );
}

