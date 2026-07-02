import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { Ingredient, UnitType } from '../types';

interface StockManagerProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Ingredient) => void;
  onUpdateIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  ingredients,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<UnitType>('g');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [packageCost, setPackageCost] = useState('');
  const [packageSize, setPackageSize] = useState('');
  const [category, setCategory] = useState<Ingredient['category']>('Laticínios');

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setUnit('g');
    setCurrentStock('');
    setMinStock('');
    setPackageCost('');
    setPackageSize('');
    setCategory('Laticínios');
    setShowModal(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingId(ing.id);
    setName(ing.name);
    setUnit(ing.unit);
    setCurrentStock(String(ing.currentStock));
    setMinStock(String(ing.minStock));
    setPackageCost(String(ing.packageCost));
    setPackageSize(String(ing.packageSize));
    setCategory(ing.category);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !packageSize || !packageCost) return;

    const sizeNum = Number(packageSize) || 1;
    const costNum = Number(packageCost) || 0;
    const unitCost = costNum / sizeNum;

    if (editingId) {
      onUpdateIngredient({
        id: editingId,
        name: name.trim(),
        unit,
        currentStock: Number(currentStock) || 0,
        minStock: Number(minStock) || 0,
        packageCost: costNum,
        packageSize: sizeNum,
        unitCost,
        category,
      });
    } else {
      onAddIngredient({
        id: `ing_${Date.now()}`,
        name: name.trim(),
        unit,
        currentStock: Number(currentStock) || 0,
        minStock: Number(minStock) || 0,
        packageCost: costNum,
        packageSize: sizeNum,
        unitCost,
        category,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#7B4E2E]">Controle de Estoque & Insumos 📦</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Mantenha o almoxarifado abastecido para garantir o cálculo automático do CMV e evitar paradas na produção de pudins.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-3 rounded-2xl bg-[#7B4E2E] text-[#E7C992] hover:bg-[#D9A46A] hover:text-white font-serif font-bold text-sm shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Insumo</span>
        </button>
      </div>

      {/* Tabela de Insumos */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#F2DED3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F1E8] border-b border-[#F2DED3] text-[#7B4E2E] font-serif text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Ingrediente / Matéria-Prima</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Custo Embalagem</th>
                <th className="p-4">Custo Unitário</th>
                <th className="p-4">Estoque Atual</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-sans">
              {ingredients.map((ing) => {
                const isLow = ing.currentStock <= ing.minStock;
                return (
                  <tr key={ing.id} className="hover:bg-[#F7F1E8]/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-[#7B4E2E]">{ing.name}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F2DED3]/40 text-[#7B4E2E]">
                        {ing.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-600">
                      R$ {ing.packageCost.toFixed(2)} ({ing.packageSize}{ing.unit})
                    </td>
                    <td className="p-4 font-mono font-bold text-[#7B4E2E] text-xs">
                      R$ {ing.unitCost.toFixed(4)} / {ing.unit}
                    </td>
                    <td className="p-4 font-bold text-[#7B4E2E]">
                      {ing.currentStock} {ing.unit}
                    </td>
                    <td className="p-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Repor</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Adequado
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(ing)}
                        className="p-1.5 text-gray-400 hover:text-[#D9A46A] transition-colors"
                        title="Editar insumo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteIngredient(ing.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover insumo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo / Editar Insumo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#F7F1E8] w-full max-w-lg rounded-3xl shadow-2xl border-2 border-[#E7C992] overflow-hidden flex flex-col">
            <div className="bg-[#7B4E2E] p-6 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl">
                {editingId ? 'Atualizar Ingrediente' : 'Novo Insumo de Produção'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                X
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-[#7B4E2E]">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Nome da Matéria-Prima
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leite Condensado Integral"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  >
                    <option value="Laticínios">Laticínios</option>
                    <option value="Secos">Secos</option>
                    <option value="Ovos">Ovos</option>
                    <option value="Embalagens">Embalagens</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Unidade de Medida
                  </label>
                  <select
                    value={unit}
                    onChange={(e: any) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  >
                    <option value="g">Gramas (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="un">Unidades (un)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Custo da Embalagem Fechada (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 8.50"
                    value={packageCost}
                    onChange={(e) => setPackageCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Conteúdo da Embalagem ({unit})
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 395"
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Estoque Atual ({unit})
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 11850"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Estoque Mínimo de Alerta
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 3950"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
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
                  Confirmar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
