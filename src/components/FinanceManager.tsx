import React, { useState } from 'react';
import { DollarSign, Plus, CheckCircle, Clock, AlertCircle, Trash2, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { Expense, ExpenseCategory, Sale } from '../types';

interface FinanceManagerProps {
  expenses: Expense[];
  sales: Sale[];
  onAddExpense: (expense: Expense) => void;
  onUpdateExpenseStatus: (id: string, status: Expense['status']) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteSale: (id: string) => void;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({
  expenses,
  sales,
  onAddExpense,
  onUpdateExpenseStatus,
  onDeleteExpense,
  onDeleteSale,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'expenses' | 'sales'>('expenses');
  const [confirmDeleteSaleId, setConfirmDeleteSaleId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Ingredientes');
  const [isFixed, setIsFixed] = useState(false);
  const [statusTab, setStatusTab] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');

  const totalRevenue = sales
    .filter((s) => s.status === 'Concluído')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const totalExpensesPaid = expenses
    .filter((e) => e.status === 'Pago')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalPending = expenses
    .filter((e) => e.status === 'Pendente')
    .reduce((acc, e) => acc + e.amount, 0);

  const netBalance = totalRevenue - totalExpensesPaid;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !dueDate) return;

    onAddExpense({
      id: `exp_${Date.now()}`,
      description: description.trim(),
      amount: Number(amount),
      dueDate,
      category,
      status: 'Pendente',
      isFixed,
    });

    setDescription('');
    setAmount('');
    setDueDate('');
    setShowModal(false);
  };

  const filteredExpenses = expenses.filter((e) => {
    if (statusTab === 'Todos') return true;
    return e.status === statusTab;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#7B4E2E]">Gestão Financeira & Contas a Pagar 💰</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Controle suas despesas fixas (aluguel, pró-labore, luz) e variáveis (embalagens, tráfego) para apurar o lucro real da loja.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-[#7B4E2E] text-[#E7C992] hover:bg-[#D9A46A] hover:text-white font-serif font-bold text-sm shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa / Conta</span>
        </button>
      </div>

      {/* Mini Cards Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Entradas (Vendas Totais)</span>
            <h3 className="text-2xl font-serif font-bold text-emerald-900 mt-1">
              R$ {totalRevenue.toFixed(2)}
            </h3>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-600 opacity-80" />
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Saídas Pagas (Despesas)</span>
            <h3 className="text-2xl font-serif font-bold text-rose-900 mt-1">
              R$ {totalExpensesPaid.toFixed(2)}
            </h3>
            <span className="text-[11px] text-rose-700 block mt-0.5">Pendentes: R$ {totalPending.toFixed(2)}</span>
          </div>
          <TrendingDown className="w-8 h-8 text-rose-600 opacity-80" />
        </div>

        <div className="bg-[#7B4E2E] text-white rounded-3xl p-5 flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E7C992]">Saldo em Caixa</span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">
              R$ {netBalance.toFixed(2)}
            </h3>
            <span className="text-[11px] text-[#F7F1E8]/70 block mt-0.5">Disponível apurado</span>
          </div>
          <DollarSign className="w-8 h-8 text-[#E7C992]" />
        </div>
      </div>

      {/* Abas Principais do Financeiro */}
      <div className="flex space-x-6 border-b border-[#F2DED3] pb-1">
        <button
          onClick={() => setActiveSubSection('expenses')}
          className={`pb-2.5 px-2 text-sm font-serif font-bold transition-all border-b-4 relative ${
            activeSubSection === 'expenses'
              ? 'border-[#7B4E2E] text-[#7B4E2E]'
              : 'border-transparent text-gray-400 hover:text-[#7B4E2E]'
          }`}
        >
          Contas & Despesas 💸
        </button>
        <button
          onClick={() => setActiveSubSection('sales')}
          className={`pb-2.5 px-2 text-sm font-serif font-bold transition-all border-b-4 relative ${
            activeSubSection === 'sales'
              ? 'border-[#7B4E2E] text-[#7B4E2E]'
              : 'border-transparent text-gray-400 hover:text-[#7B4E2E]'
          }`}
        >
          Histórico de Vendas 📈
        </button>
      </div>

      {activeSubSection === 'expenses' ? (
        <>
          {/* Filtros de Aba */}
          <div className="flex space-x-2 border-b border-[#F2DED3] pb-2">
            {(['Todos', 'Pendente', 'Pago'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
                  statusTab === tab
                    ? 'bg-[#7B4E2E] text-[#F7F1E8] shadow'
                    : 'bg-[#F7F1E8] text-[#7B4E2E] hover:bg-[#F2DED3]'
                }`}
              >
                {tab} {tab === 'Pendente' && totalPending > 0 ? `(R$ ${totalPending.toFixed(0)})` : ''}
              </button>
            ))}
          </div>

          {/* Lista de Contas / Despesas */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#F2DED3] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F1E8] border-b border-[#F2DED3] text-[#7B4E2E] font-serif text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">Descrição da Despesa</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4 font-mono">Valor</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right pr-6">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-sans">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#F7F1E8]/40 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-[#7B4E2E]">{exp.description}</td>
                      <td className="p-4 text-xs text-gray-500">
                        <span className="px-2.5 py-1 rounded-md bg-[#F2DED3]/50 text-[#7B4E2E]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        {exp.isFixed ? (
                          <span className="text-purple-800 font-semibold bg-purple-100 px-2 py-0.5 rounded">Fixa</span>
                        ) : (
                          <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Variável</span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-600 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(exp.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#7B4E2E]">
                        R$ {exp.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        {exp.status === 'Pago' ? (
                          <button
                            onClick={() => onUpdateExpenseStatus(exp.id, 'Pendente')}
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                            title="Clique para marcar como pendente"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pago</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateExpenseStatus(exp.id, 'Pago')}
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer animate-pulse"
                            title="Clique para dar baixa como pago"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pagar Agora</span>
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="text-gray-300 hover:text-red-500 p-1.5 transition-colors"
                          title="Excluir conta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Lista de Vendas com Opção de Exclusão */
        <div className="bg-white rounded-3xl shadow-sm border border-[#F2DED3] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F1E8] border-b border-[#F2DED3] text-[#7B4E2E] font-serif text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Data & Hora</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Produtos Vendidos</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4 font-mono text-right">Valor Total</th>
                  <th className="p-4 text-right pr-6">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-sans">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                      Nenhuma venda registrada ainda no sistema.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#F7F1E8]/40 transition-colors">
                      <td className="p-4 pl-6 text-xs font-mono text-gray-600">
                        {new Date(sale.date).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 font-semibold text-[#7B4E2E]">{sale.customerName}</td>
                      <td className="p-4 text-xs text-gray-500">
                        <div className="space-y-1">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="font-medium">
                              {item.quantity}x {item.recipeName} <span className="text-[10px] bg-amber-100 text-[#7B4E2E] px-1.5 py-0.5 rounded ml-1 font-bold">{item.size}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-[#F7F1E8] border border-[#F2DED3] text-[#7B4E2E] font-medium">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#7B4E2E] text-right">
                        R$ {sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        {confirmDeleteSaleId === sale.id ? (
                          <div className="flex items-center justify-end space-x-1.5 animate-fadeIn">
                            <span className="text-[10px] text-red-600 font-bold uppercase">Devolver estoque?</span>
                            <button
                              onClick={() => {
                                onDeleteSale(sale.id);
                                setConfirmDeleteSaleId(null);
                              }}
                              className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                              title="Confirmar exclusão e devolver estoque"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSaleId(null)}
                              className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs hover:bg-gray-300 transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteSaleId(sale.id)}
                            className="text-gray-300 hover:text-red-500 p-1.5 transition-colors inline-block"
                            title="Excluir venda e estornar insumos do estoque"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nova Despesa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#F7F1E8] w-full max-w-lg rounded-3xl shadow-2xl border-2 border-[#E7C992] overflow-hidden flex flex-col">
            <div className="bg-[#7B4E2E] p-6 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl">Registrar Nova Conta a Pagar</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">X</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-[#7B4E2E]">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel Cozinha ou Fornecedor Embalagem"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 350.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  >
                    <option value="Aluguel">Aluguel</option>
                    <option value="Ingredientes">Ingredientes</option>
                    <option value="Embalagens">Embalagens</option>
                    <option value="Luz/Gás">Luz/Gás</option>
                    <option value="Pró-labore">Pró-labore</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Impostos">Impostos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fixed"
                    checked={isFixed}
                    onChange={(e) => setIsFixed(e.target.checked)}
                    className="w-4 h-4 text-[#7B4E2E] rounded border-gray-300 focus:ring-[#D9A46A]"
                  />
                  <label htmlFor="fixed" className="text-xs font-semibold text-gray-700 cursor-pointer">
                    Despesa Fixa Mensal?
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#7B4E2E] hover:bg-[#D9A46A] text-white font-serif font-bold text-sm shadow transition-colors cursor-pointer"
                >
                  Confirmar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
