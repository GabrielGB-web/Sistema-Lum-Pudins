import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Award, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  AlertTriangle,
  Database,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Server
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { FinancialMetrics, Sale, PuddimRecipe, Ingredient, Expense } from '../types';
import { SQL_SETUP_SCRIPT } from '../lib/supabase';

interface DashboardProps {
  metrics: FinancialMetrics;
  sales: Sale[];
  recipes: PuddimRecipe[];
  ingredients: Ingredient[];
  expenses: Expense[];
  onOpenAI: () => void;
  onNavigateTab: (tab: string) => void;
  supabaseStatus?: 'connected' | 'missing_tables' | 'error';
  supabaseLoading?: boolean;
  dbError?: string | null;
  onSeedDb?: () => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  sales,
  recipes,
  ingredients,
  expenses,
  onOpenAI,
  onNavigateTab,
  supabaseStatus = 'connected',
  supabaseLoading = false,
  dbError = null,
  onSeedDb,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleRunSeed = async () => {
    if (!onSeedDb) return;
    try {
      setSeeding(true);
      await onSeedDb();
    } finally {
      setSeeding(false);
    }
  };
  // Cores oficiais da Lumé
  const COLORS = {
    creme: '#F7F1E8',
    rose: '#F2DED3',
    caramelo: '#D9A46A',
    chocolate: '#7B4E2E',
    dourado: '#E7C992',
  };

  // Prepara dados para o gráfico de vendas por dia
  const salesByDateMap: Record<string, number> = {};
  sales.forEach((s) => {
    if (s.status !== 'Concluído') return;
    const day = new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    salesByDateMap[day] = (salesByDateMap[day] || 0) + s.totalAmount;
  });

  const chartSalesData = Object.entries(salesByDateMap).map(([day, total]) => ({
    dia: day,
    Vendas: total,
  }));

  // Pudins mais vendidos (ranking)
  const pudimSalesCount: Record<string, { name: string; count: number; receita: number }> = {};
  sales.forEach((s) => {
    if (s.status !== 'Concluído') return;
    s.items.forEach((item) => {
      if (!pudimSalesCount[item.recipeId]) {
        pudimSalesCount[item.recipeId] = { name: item.recipeName, count: 0, receita: 0 };
      }
      pudimSalesCount[item.recipeId].count += item.quantity;
      pudimSalesCount[item.recipeId].receita += item.quantity * item.unitPrice;
    });
  });

  const topSellingList = Object.values(pudimSalesCount).sort((a, b) => b.count - a.count);

  // Gráfico Pie de despesas por categoria
  const expMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expMap[e.category] = (expMap[e.category] || 0) + e.amount;
  });
  const pieExpensesData = Object.entries(expMap).map(([cat, val]) => ({ name: cat, value: val }));
  const PIE_COLORS = ['#7B4E2E', '#D9A46A', '#E7C992', '#B87A4B', '#9C623C', '#E2B878'];

  // Alertas
  const lowStock = ingredients.filter((i) => i.currentStock <= i.minStock);
  const pendingBills = expenses.filter((e) => e.status === 'Pendente');

  const isCmvIdeal = metrics.cmvPercentage >= 20 && metrics.cmvPercentage <= 32;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      
      {/* Indicador e Controle de Conectividade do Banco de Dados Supabase */}
      {supabaseLoading ? (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F2DED3] flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="text-xs font-semibold text-[#7B4E2E]">Sincronizando com seu Supabase...</span>
          </div>
        </div>
      ) : supabaseStatus === 'missing_tables' ? (
        <div className="bg-[#FFFBEB] border-2 border-amber-200 rounded-3xl p-6 shadow-md space-y-4 animate-fadeIn text-[#7B4E2E]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-amber-900">
                  Conexão Supabase Ativa! Mas faltam as tabelas 📊
                </h3>
                <p className="text-xs text-amber-800 font-sans mt-0.5">
                  Crie a estrutura de dados no seu painel para começar a registrar dados reais e duradouros.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-xl bg-amber-800 text-white hover:bg-amber-900 text-xs font-bold font-serif flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs font-serif font-bold transition-all"
              >
                Painel Supabase &rarr;
              </a>
            </div>
          </div>

          <div className="bg-[#FAF5E6] border border-amber-200 rounded-2xl p-4 text-xs space-y-2 font-sans">
            <h4 className="font-bold text-amber-950 uppercase tracking-wide">Como criar as tabelas em 10 segundos:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-amber-900 leading-relaxed">
              <li>Clique no botão <strong>"Copiar Script SQL"</strong> acima.</li>
              <li>Acesse seu projeto no painel do Supabase.</li>
              <li>Clique em <strong>"SQL Editor"</strong> (ícone de terminal) no menu lateral esquerdo.</li>
              <li>Clique em <strong>"New query"</strong> (ou <strong>"New Script"</strong>), cole o código copiado e clique no botão verde <strong>"Run"</strong>.</li>
              <li>Pronto! Recarregue esta página e sua confeitaria estará conectada a um banco real!</li>
            </ol>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setShowSql(!showSql)}
              className="inline-flex items-center space-x-1 text-xs text-amber-800 font-bold hover:underline cursor-pointer"
            >
              {showSql ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showSql ? 'Ocultar Código SQL' : 'Visualizar Código SQL Completo'}</span>
            </button>

            {showSql && (
              <pre className="mt-3 p-4 bg-gray-900 text-gray-100 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-60 border-2 border-gray-800">
                {SQL_SETUP_SCRIPT}
              </pre>
            )}
          </div>
        </div>
      ) : supabaseStatus === 'error' ? (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 shadow-sm text-[#7B4E2E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-100 text-rose-800 rounded-2xl">
              <Server className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">Falha ao conectar ao Supabase</h3>
              <p className="text-xs text-rose-800 font-sans mt-0.5">
                {dbError || 'Por favor, revise as chaves enviadas no arquivo ou configurações de ambiente.'}
              </p>
            </div>
          </div>
          <div className="text-xs text-rose-900 bg-rose-100/50 px-3 py-1.5 rounded-lg border border-rose-200">
            Falling back to Offline Mock Mode
          </div>
        </div>
      ) : (
        <div className="bg-[#ECFDF5] border border-emerald-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn text-[#7B4E2E]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 flex items-center space-x-2">
                <span>Conectado com Supabase Real! 🚀</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-xs text-emerald-800 font-sans mt-0.5">
                Todos os dados de insumos, receitas, vendas e despesas estão sendo salvos e lidos diretamente do seu banco.
              </p>
            </div>
          </div>
          
          {ingredients.length <= 1 && (
            <button
              onClick={handleRunSeed}
              disabled={seeding}
              className="px-4 py-2 rounded-xl bg-[#7B4E2E] text-[#E7C992] hover:bg-[#D9A46A] hover:text-white text-xs font-serif font-bold transition-all shadow-sm shrink-0 flex items-center space-x-1.5 cursor-pointer"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{seeding ? 'Semeando...' : 'Semear Dados Iniciais'}</span>
            </button>
          )}
        </div>
      )}
      
      {/* Banner de Boas-vindas e Consultor */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#E7C992]/40 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7B4E2E 0%, #9A653F 60%, #D9A46A 100%)' }}
      >
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#E7C992] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestão Inteligente em Tempo Real</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
            Bem-vindo à Lumé Pudim 🍮
          </h2>
          <p className="text-sm text-[#F7F1E8]/90 max-w-xl font-sans leading-relaxed">
            Acompanhe o faturamento, controle seu CMV com precisão de gramas e garanta margens gourmet saudáveis.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto z-10">
          <button
            onClick={onOpenAI}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[#F7F1E8] text-[#7B4E2E] font-serif font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-[#D9A46A]" />
            <span>Análise do Chef IA</span>
          </button>
        </div>

        {/* Detalhe de Fundo */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#E7C992]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid de Cards KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Faturamento do Mês */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Faturamento Mês</span>
            <div className="p-3 rounded-2xl bg-[#F2DED3]/60 text-[#7B4E2E]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#7B4E2E]">
              R$ {metrics.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center space-x-1 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{metrics.totalPudinsSold} pudins vendidos</span>
            </div>
          </div>
        </div>

        {/* Custo Mercadoria Vendida (CMV) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">CMV (Custo dos Pudins)</span>
            <div className={`p-3 rounded-2xl ${isCmvIdeal ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#7B4E2E]">
                {metrics.cmvPercentage.toFixed(1)}%
              </h3>
              <span className="text-xs text-gray-400">/ meta 28%</span>
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: isCmvIdeal ? '#10B981' : '#D97706' }}>
              {isCmvIdeal ? '✨ Excelente margem de produção' : '⚠️ Acima do ideal (revisar custos)'}
            </p>
          </div>
        </div>

        {/* Lucro Bruto */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Lucro Bruto</span>
            <div className="p-3 rounded-2xl bg-[#E7C992]/40 text-[#7B4E2E]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#7B4E2E]">
              R$ {metrics.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-sans">
              Após abater custo exato dos ingredientes
            </p>
          </div>
        </div>

        {/* Lucro Líquido Estimado */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Lucro Líquido (Livre)</span>
            <div className="p-3 rounded-2xl bg-[#7B4E2E] text-[#E7C992]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl sm:text-3xl font-serif font-bold ${metrics.netProfit >= 0 ? 'text-[#7B4E2E]' : 'text-red-600'}`}>
              R$ {metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
              <span>Despesas Totais: R$ {metrics.totalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Alertas Rápida Ação */}
      {(lowStock.length > 0 || pendingBills.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStock.length > 0 && (
            <div 
              onClick={() => onNavigateTab('stock')}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Alerta de Estoque Baixo ({lowStock.length})</h4>
                  <p className="text-xs text-amber-700">{lowStock.map(i => i.name).slice(0, 2).join(', ')}{lowStock.length > 2 ? '...' : ''}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 underline">Repor Estoque &rarr;</span>
            </div>
          )}

          {pendingBills.length > 0 && (
            <div 
              onClick={() => onNavigateTab('finance')}
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between cursor-pointer hover:bg-rose-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-rose-900">Contas Pendentes ({pendingBills.length})</h4>
                  <p className="text-xs text-rose-700">Total a pagar: R$ {pendingBills.reduce((acc, b) => acc + b.amount, 0).toFixed(2)}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-900 underline">Ver Contas &rarr;</span>
            </div>
          )}
        </div>
      )}

      {/* Gráficos e Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evolução de Vendas (Chart Bar) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#F2DED3] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#7B4E2E]">Curva de Vendas Diárias</h3>
              <p className="text-xs text-gray-500 font-sans">Evolução do faturamento bruto no mês</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F7F1E8] text-[#7B4E2E] border border-[#F2DED3]">
              Ticket Médio: R$ {metrics.ticketMedio.toFixed(2)}
            </span>
          </div>

          <div className="h-72 w-full mt-2">
            {chartSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2DED3" vertical={false} />
                  <XAxis dataKey="dia" stroke="#7B4E2E" fontSize={12} tickLine={false} />
                  <YAxis stroke="#7B4E2E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                    contentStyle={{ backgroundColor: '#F7F1E8', borderColor: '#E7C992', borderRadius: '12px', color: '#7B4E2E' }}
                  />
                  <Bar dataKey="Vendas" fill="#D9A46A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Nenhuma venda concluída registrada neste período.
              </div>
            )}
          </div>
        </div>

        {/* Pudins Mais Vendidos (Ranking) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#F2DED3] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#7B4E2E]">Top Pudins Lumé 🍮</h3>
                <p className="text-xs text-gray-500 font-sans">Campeões de preferência do público</p>
              </div>
              <ShoppingBag className="w-5 h-5 text-[#D9A46A]" />
            </div>

            <div className="space-y-4">
              {topSellingList.length > 0 ? (
                topSellingList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F1E8] border border-[#F2DED3]/60">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-[#7B4E2E] text-[#E7C992] font-serif font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}º
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#7B4E2E] line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.count} unidades vendidas</p>
                      </div>
                    </div>
                    <span className="text-sm font-serif font-bold text-[#7B4E2E] whitespace-nowrap pl-2">
                      R$ {item.receita.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Registre vendas no PDV para ver o ranking aqui.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('pdv')}
            className="w-full mt-6 py-3 rounded-xl border-2 border-[#7B4E2E] text-[#7B4E2E] hover:bg-[#7B4E2E] hover:text-[#F7F1E8] font-serif font-bold text-sm transition-all text-center"
          >
            Ir para Ponto de Venda (PDV)
          </button>
        </div>

      </div>

      {/* Seção Secundária: Despesas por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#F2DED3] lg:col-span-1 flex flex-col justify-center">
          <h3 className="text-lg font-serif font-bold text-[#7B4E2E] mb-2">Composição de Despesas</h3>
          <p className="text-xs text-gray-500 mb-6">Onde os recursos da confeitaria estão alocados</p>
          
          <div className="h-56 w-full">
            {pieExpensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieExpensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieExpensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `R$ ${val.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                Sem despesas cadastradas
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieExpensesData.map((d, i) => (
              <div key={i} className="flex items-center space-x-1.5 text-xs text-gray-600 truncate">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="truncate">{d.name}: R$ {d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dicas Rápidas de Produção */}
        <div className="bg-[#F7F1E8] p-6 sm:p-8 rounded-3xl border border-[#D9A46A]/40 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#7B4E2E]">
              <Award className="w-6 h-6 text-[#D9A46A]" />
              <h3 className="text-lg font-serif font-bold">Manual de Padrão e Qualidade Lumé</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/80 p-4 rounded-2xl border border-[#F2DED3]">
                <h4 className="font-serif font-bold text-sm text-[#7B4E2E]">✨ Calda Caramelo Perfeita</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Para evitar cristais de açúcar, cozinhe o açúcar refinado em fogo médio-baixo sem mexer com colher até atingir o tom âmbar luminoso (#D9A46A).
                </p>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-[#F2DED3]">
                <h4 className="font-serif font-bold text-sm text-[#7B4E2E]">🍮 Pudim Sem Furinhos (Liso)</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Bata os ingredientes delicadamente ou passe a batida por uma peneira fina duas vezes antes de despejar na forma para eliminar microbolhas de ar.
                </p>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-[#F2DED3]">
                <h4 className="font-serif font-bold text-sm text-[#7B4E2E]">⏱️ Banho-Maria Uniforme</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Asse em forno a 150°C-160°C coberto com papel alumínio por 65 a 75 minutos. Água do banho-maria deve estar quente ao colocar no forno.
                </p>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-[#F2DED3]">
                <h4 className="font-serif font-bold text-sm text-[#7B4E2E]">📦 Armazenamento e Estoque</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Desenforme apenas após no mínimo 6 horas de refrigeração intensa. Mantenha as latas de leite condensado em local seco longe do calor dos fornos.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F2DED3] flex items-center justify-between text-xs text-[#7B4E2E]">
            <span>Marca registrada Lumé Pudim • Confeitaria Gourmet</span>
            <button onClick={() => onNavigateTab('recipes')} className="font-bold text-[#D9A46A] hover:underline">
              Gerenciar Fichas Técnicas &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
