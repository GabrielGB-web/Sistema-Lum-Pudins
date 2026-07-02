import React, { useState } from 'react';
import { ChefHat, Plus, Trash2, Edit2, Check, X, Sparkles, Scale, DollarSign, Percent } from 'lucide-react';
import { PuddimRecipe, Ingredient, RecipeIngredientItem } from '../types';
import { calculateRecipeCost } from '../data/mockData';

interface RecipeManagerProps {
  recipes: PuddimRecipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: PuddimRecipe) => void;
  onUpdateRecipe: (recipe: PuddimRecipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({
  recipes,
  ingredients,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form State for new or edit
  const [name, setName] = useState('');
  const [size, setSize] = useState<'Mini' | 'Tradicional' | 'Família' | 'Geladinho'>('Tradicional');
  const [description, setDescription] = useState('');
  const [desiredMargin, setDesiredMargin] = useState(250);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredientItem[]>([]);
  const [tempIngId, setTempIngId] = useState('');
  const [tempIngQty, setTempIngQty] = useState('');

  const handleOpenCreate = () => {
    setName('');
    setSize('Tradicional');
    setDescription('');
    setDesiredMargin(250);
    setCustomPrice('');
    setSelectedIngredients([
      { ingredientId: ingredients[0]?.id || '', quantity: 395 }
    ]);
    setShowNewModal(true);
  };

  const addIngredientToForm = () => {
    if (!tempIngId || !tempIngQty || Number(tempIngQty) <= 0) return;
    setSelectedIngredients((prev) => {
      const exists = prev.find((i) => i.ingredientId === tempIngId);
      if (exists) {
        return prev.map((i) => i.ingredientId === tempIngId ? { ...i, quantity: i.quantity + Number(tempIngQty) } : i);
      }
      return [...prev, { ingredientId: tempIngId, quantity: Number(tempIngQty) }];
    });
    setTempIngQty('');
  };

  const removeIngredientFromForm = (id: string) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.ingredientId !== id));
  };

  // Custo estimado da receita em edição/criação
  const tempRecipeCost = selectedIngredients.reduce((acc, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    if (!ing) return acc;
    return acc + (ing.unitCost * item.quantity);
  }, 0);

  const suggestedFormPrice = tempRecipeCost * (1 + desiredMargin / 100);

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedIngredients.length === 0) return;

    const newRecipe: PuddimRecipe = {
      id: `rec_${Date.now()}`,
      name: name.trim(),
      size,
      description: description.trim() || 'Receita artesanal exclusiva Lumé Pudim.',
      yieldCount: 1,
      desiredMargin: Number(desiredMargin) || 200,
      customSalePrice: customPrice ? Number(customPrice) : undefined,
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
      ingredients: selectedIngredients,
    };

    onAddRecipe(newRecipe);
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Banner Superior */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#7B4E2E]">Fichas Técnicas & Custos 🍮 Geladinho/Pudim</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Cada grama conta! O custo dos seus pudins e geladinhos gourmet é atualizado em tempo real conforme você abastece seu estoque.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-[#7B4E2E] text-[#E7C992] hover:bg-[#D9A46A] hover:text-white font-serif font-bold text-sm shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Ficha Técnica</span>
        </button>
      </div>

      {/* Grid de Receitas Cadastradas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recipes.map((recipe) => {
          const exactCost = calculateRecipeCost(recipe, ingredients);
          const autoPrice = exactCost * (1 + recipe.desiredMargin / 100);
          const finalPrice = recipe.customSalePrice || autoPrice;
          const grossProfit = finalPrice - exactCost;
          const marginPercentage = finalPrice > 0 ? ((grossProfit / finalPrice) * 100) : 0;

          return (
            <div 
              key={recipe.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F1E8] border border-[#F2DED3] flex items-center justify-center shrink-0">
                      <ChefHat className="w-6 h-6 text-[#7B4E2E]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#7B4E2E] text-[#E7C992]">
                          {recipe.size}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">Rende {recipe.yieldCount || 1} un</span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-[#7B4E2E] mt-1">{recipe.name}</h3>
                    </div>
                  </div>

                  <button 
                    onClick={() => onDeleteRecipe(recipe.id)}
                    className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                    title="Excluir ficha técnica"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3 font-sans leading-relaxed">{recipe.description}</p>

                {/* Lista de Ingredientes (Ficha Técnica) */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center space-x-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Composição Exata (Matéria-Prima)</span>
                  </h4>

                  <div className="bg-[#F7F1E8] rounded-2xl p-3.5 space-y-2 border border-[#F2DED3]/60 max-h-44 overflow-y-auto">
                    {recipe.ingredients.map((item, idx) => {
                      const ingObj = ingredients.find((i) => i.id === item.ingredientId);
                      const itemCost = ingObj ? (ingObj.unitCost * item.quantity) : 0;

                      return (
                        <div key={idx} className="flex items-center justify-between text-xs font-sans">
                          <span className="text-[#7B4E2E] truncate font-medium">
                            • {ingObj?.name || 'Ingrediente Desconhecido'} ({item.quantity}{ingObj?.unit || 'g'})
                          </span>
                          <span className="font-mono text-gray-500 shrink-0 ml-2">
                            R$ {itemCost.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Indicadores de Custo e Preço de Venda */}
              <div className="mt-6 pt-4 border-t-2 border-[#E7C992]/40 grid grid-cols-3 gap-3">
                <div className="bg-[#F7F1E8] p-3 rounded-2xl text-center border border-[#F2DED3]">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Custo (CMV)</span>
                  <span className="text-base font-serif font-bold text-rose-800">
                    R$ {exactCost.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#F7F1E8] p-3 rounded-2xl text-center border border-[#F2DED3]">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Lucro Bruto</span>
                  <span className="text-base font-serif font-bold text-emerald-700">
                    R$ {grossProfit.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#7B4E2E] p-3 rounded-2xl text-center text-white shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-[#E7C992] block">Preço Final</span>
                  <span className="text-base font-serif font-bold text-white">
                    R$ {finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-right">
                <span className="text-[11px] text-gray-400 font-sans">
                  Margem sobre preço: <strong className="text-[#7B4E2E]">{marginPercentage.toFixed(1)}%</strong>
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal para Adicionar Nova Receita */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#F7F1E8] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-[#E7C992] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#7B4E2E] p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-6 h-6 text-[#E7C992]" />
                <h3 className="font-serif font-bold text-xl">Nova Ficha Técnica (Pudim ou Geladinho)</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveNew} className="p-6 overflow-y-auto space-y-5 flex-1 text-[#7B4E2E]">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Nome do Produto Gourmet
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Geladinho de Ninho com Nutella ou Pudim Sublime"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D9A46A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Categoria / Forma
                  </label>
                  <select
                    value={size}
                    onChange={(e: any) => setSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D9A46A]"
                  >
                    <option value="Mini">Pudim Mini</option>
                    <option value="Tradicional">Pudim Tradicional</option>
                    <option value="Família">Pudim Família</option>
                    <option value="Geladinho">Geladinho Gourmet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Descrição Sensorial
                </label>
                <input
                  type="text"
                  placeholder="Ex: Textura firme e aveludada com notas intensas de caramelo toffee."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D9A46A]"
                />
              </div>

              {/* Adicionar Ingredientes na Receita */}
              <div className="bg-white p-4 rounded-2xl border border-[#F2DED3] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B4E2E]">
                  Ingredientes da Ficha Técnica
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={tempIngId}
                    onChange={(e) => setTempIngId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F7F1E8] border border-[#F2DED3] rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">-- Selecione o ingrediente do estoque --</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (R$ {ing.unitCost.toFixed(3)}/{ing.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Qtd (g/ml/un)"
                    value={tempIngQty}
                    onChange={(e) => setTempIngQty(e.target.value)}
                    className="w-full sm:w-32 px-3 py-2 bg-[#F7F1E8] border border-[#F2DED3] rounded-xl text-xs focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={addIngredientToForm}
                    className="px-4 py-2 bg-[#D9A46A] text-white font-bold rounded-xl text-xs hover:bg-[#7B4E2E] transition-colors whitespace-nowrap"
                  >
                    + Adicionar
                  </button>
                </div>

                {/* Ingredientes atualmente adicionados nesta receita */}
                <div className="space-y-1.5 pt-2">
                  {selectedIngredients.map((item, idx) => {
                    const ing = ingredients.find((i) => i.id === item.ingredientId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#F7F1E8] text-xs">
                        <span>• {ing?.name || 'Ingrediente'} — <strong>{item.quantity} {ing?.unit}</strong></span>
                        <button
                          type="button"
                          onClick={() => removeIngredientFromForm(item.ingredientId)}
                          className="text-red-500 font-bold hover:text-red-700 ml-2"
                        >
                          X
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Definição de Preço e Margem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Margem Desejada (%)
                  </label>
                  <input
                    type="number"
                    value={desiredMargin}
                    onChange={(e) => setDesiredMargin(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Preço Sugerido: <strong>R$ {suggestedFormPrice.toFixed(2)}</strong> (CMV: R$ {tempRecipeCost.toFixed(2)})
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Preço de Venda Fixado R$ (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`Sugerido: ${suggestedFormPrice.toFixed(2)}`}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F2DED3] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={selectedIngredients.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#7B4E2E] hover:bg-[#D9A46A] text-white font-serif font-bold text-sm shadow transition-colors cursor-pointer"
                >
                  Salvar na Vitrine
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
