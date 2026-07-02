import React, { useState } from 'react';
import { X, Sparkles, Bot, Loader2, RefreshCw } from 'lucide-react';
import { FinancialMetrics, PuddimRecipe, Ingredient, Expense } from '../types';

interface AIConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FinancialMetrics;
  recipes: PuddimRecipe[];
  ingredients: Ingredient[];
  expenses: Expense[];
}

export const AIConsultantModal: React.FC<AIConsultantModalProps> = ({
  isOpen,
  onClose,
  metrics,
  recipes,
  ingredients,
  expenses,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const bestSellingRecipes = recipes.map((r) => ({
        name: r.name,
        soldCount: 15, // simulado no mock ou calculado
      })).slice(0, 3);

      const lowStockItems = ingredients.filter((i) => i.currentStock <= i.minStock);
      const pendingBills = expenses.filter((e) => e.status === 'Pendente');

      const response = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          bestSellingRecipes,
          lowStockItems,
          pendingBills,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao comunicar com a IA');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao gerar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2"
        style={{ backgroundColor: '#F7F1E8', borderColor: '#E7C992' }}
      >
        {/* Header */}
        <div 
          className="p-6 text-white flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #7B4E2E 0%, #D9A46A 100%)' }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-[#E7C992]/40">
              <Sparkles className="w-6 h-6 text-[#E7C992] animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold tracking-wide">Chef Executivo IA - Lumé Pudim</h2>
              <p className="text-xs text-[#F7F1E8]/80 font-sans">Análise estratégica de faturamento, margem e custos em tempo real</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/20 text-white/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-[#7B4E2E]">
          {!analysis && !loading && !error && (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-[#F2DED3] text-[#7B4E2E] shadow-inner">
                <Bot className="w-10 h-10 text-[#D9A46A]" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-serif font-bold">Pronto para auditar a sua loja?</h3>
                <p className="text-sm opacity-80">
                  A inteligência artificial irá correlacionar suas vendas totais (R$ {metrics.totalSales.toFixed(2)}), seu CMV atual ({metrics.cmvPercentage.toFixed(1)}%), o nível do seu estoque e as contas a pagar para gerar sugestões valiosas de crescimento.
                </p>
              </div>
              <button
                onClick={generateReport}
                className="px-8 py-3.5 rounded-2xl shadow-lg font-serif font-bold tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-xl text-white flex items-center space-x-2 mx-auto"
                style={{ backgroundColor: '#7B4E2E' }}
              >
                <Sparkles className="w-5 h-5 text-[#E7C992]" />
                <span>Gerar Diagnóstico da Marca</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-12 h-12 text-[#D9A46A] animate-spin" />
              <p className="text-base font-serif font-semibold animate-pulse">Consultor analisando fichas técnicas e fluxo de caixa...</p>
              <p className="text-xs text-gray-500">Calculando margens ideais para confeitaria artesanal gourmet</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-4">
              <p className="font-semibold">{error}</p>
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-xl text-sm transition-colors inline-flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F2DED3] prose max-w-none text-[#7B4E2E] space-y-3 leading-relaxed whitespace-pre-line font-sans text-sm">
                {analysis}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={generateReport}
                  className="px-5 py-2.5 rounded-xl border border-[#D9A46A] text-[#7B4E2E] hover:bg-[#F2DED3]/40 font-medium text-sm transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4 text-[#D9A46A]" />
                  <span>Atualizar Análise</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F2DED3]/50 border-t border-[#F2DED3] text-center text-xs text-[#7B4E2E]/70 font-sans">
          ⚡ Powered by Gemini 2.5 • Especializado em Confeitaria e CMV de Pudins Artesanais
        </div>
      </div>
    </div>
  );
};
