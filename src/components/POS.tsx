import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, CheckCircle2, DollarSign, CreditCard, QrCode, Banknote } from 'lucide-react';
import { PuddimRecipe, Sale, SaleItem, PaymentMethod, Ingredient } from '../types';
import { calculateRecipeCost } from '../data/mockData';

interface POSProps {
  recipes: PuddimRecipe[];
  ingredients: Ingredient[];
  onAddSale: (sale: Sale) => void;
}

export const POS: React.FC<POSProps> = ({ recipes, ingredients, onAddSale }) => {
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [successMsg, setSuccessMsg] = useState(false);

  const addItemToCart = (recipe: PuddimRecipe) => {
    // Calcula o custo exato desta receita agora com base no estoque
    const currentUnitCost = calculateRecipeCost(recipe, ingredients);
    
    // Calcula preço de venda sugerido (com margem) se não houver customSalePrice
    let suggestedPrice = recipe.customSalePrice || 35.00;
    if (!recipe.customSalePrice && currentUnitCost > 0) {
      suggestedPrice = currentUnitCost * (1 + recipe.desiredMargin / 100);
    }

    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.recipeId === recipe.id);
      if (existing) {
        return prev.map((item) =>
          item.recipeId === recipe.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            recipeId: recipe.id,
            recipeName: recipe.name,
            size: recipe.size,
            quantity: 1,
            unitPrice: suggestedPrice,
            unitCost: currentUnitCost,
          },
        ];
      }
    });
  };

  const updateQuantity = (recipeId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.recipeId === recipeId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeItem = (recipeId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.recipeId !== recipeId));
  };

  const totalCartAmount = selectedItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const totalCartCost = selectedItems.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);

  const finalizeSale = () => {
    if (selectedItems.length === 0) return;

    const newSale: Sale = {
      id: `sal_${Date.now()}`,
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Cliente Balcão Lumé',
      items: selectedItems,
      totalAmount: totalCartAmount,
      totalCost: totalCartCost,
      paymentMethod,
      status: 'Concluído',
    };

    onAddSale(newSale);
    setSelectedItems([]);
    setCustomerName('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3500);
  };

  const paymentIcons: Record<PaymentMethod, any> = {
    Pix: QrCode,
    'Cartão de Crédito': CreditCard,
    'Cartão de Débito': CreditCard,
    Dinheiro: Banknote,
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2DED3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#7B4E2E]">Frente de Caixa (PDV) 🛍️</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Selecione as delícias da vitrine Lumé e registre o pedido instantaneamente.
          </p>
        </div>
        {successMsg && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Venda registrada com sucesso! Estoque abatido.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Catálogo / Vitrine de Pudins (Esquerda) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#7B4E2E]">Vitrine de Sabores</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe) => {
              const exactCost = calculateRecipeCost(recipe, ingredients);
              let price = recipe.customSalePrice || (exactCost * (1 + recipe.desiredMargin / 100));

              return (
                <div
                  key={recipe.id}
                  onClick={() => addItemToCart(recipe)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#F2DED3] hover:border-[#D9A46A] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F7F1E8] text-[#D9A46A] border border-[#F2DED3]">
                        {recipe.size}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#7B4E2E] mt-2 group-hover:text-[#D9A46A] transition-colors line-clamp-2">
                        {recipe.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{recipe.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block font-mono">CMV: R$ {exactCost.toFixed(2)}</span>
                      <span className="text-base font-serif font-bold text-[#7B4E2E]">R$ {price.toFixed(2)}</span>
                    </div>
                    <button 
                      className="w-9 h-9 rounded-xl bg-[#7B4E2E] group-hover:bg-[#D9A46A] text-white flex items-center justify-center shadow transition-colors"
                      title="Adicionar ao pedido"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrinho de Compras / Resumo de Caixa (Direita) */}
        <div className="lg:col-span-5 sticky top-24 bg-white rounded-3xl p-6 shadow-xl border-2 border-[#E7C992] flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2DED3]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#7B4E2E]" />
              <h3 className="font-serif font-bold text-lg text-[#7B4E2E]">Resumo do Pedido</h3>
            </div>
            <span className="text-xs font-mono text-gray-500">
              {selectedItems.reduce((acc, i) => acc + i.quantity, 0)} itens
            </span>
          </div>

          {/* Nome do Cliente */}
          <div className="mt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Nome do Cliente / Mesa (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Maria ou Balcão"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F1E8] border border-[#F2DED3] rounded-xl text-sm text-[#7B4E2E] focus:outline-none focus:ring-2 focus:ring-[#D9A46A]"
            />
          </div>

          {/* Lista de Itens no Carrinho */}
          <div className="my-4 max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <div key={item.recipeId} className="pt-2.5 flex items-center justify-between text-sm">
                  <div className="flex-1 pr-2">
                    <h5 className="font-semibold text-[#7B4E2E] leading-tight line-clamp-1">{item.recipeName}</h5>
                    <span className="text-xs text-gray-400">{item.size} • R$ {item.unitPrice.toFixed(2)} un</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-[#F7F1E8] rounded-lg border border-[#F2DED3]">
                      <button 
                        onClick={() => updateQuantity(item.recipeId, -1)}
                        className="px-2 py-1 text-gray-600 hover:text-red-600 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-[#7B4E2E]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.recipeId, 1)}
                        className="px-2 py-1 text-gray-600 hover:text-emerald-600 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-serif font-bold text-[#7B4E2E] w-16 text-right">
                      R$ {(item.quantity * item.unitPrice).toFixed(2)}
                    </span>

                    <button 
                      onClick={() => removeItem(item.recipeId)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm italic">
                Vitrine pronta! Clique nos pudins ao lado para iniciar uma nova venda.
              </div>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div className="pt-4 border-t border-[#F2DED3] space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Método de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'] as PaymentMethod[]).map((method) => {
                const Icon = paymentIcons[method];
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected 
                        ? 'bg-[#7B4E2E] text-white border-[#7B4E2E] shadow' 
                        : 'bg-[#F7F1E8] text-[#7B4E2E] border-[#F2DED3] hover:bg-[#F2DED3]/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Totais de Fechamento */}
          <div className="mt-6 pt-4 border-t-2 border-[#D9A46A]/30 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>CMV (Custo Estimado):</span>
              <span className="font-mono">R$ {totalCartCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-base font-serif font-bold text-[#7B4E2E]">Total a Receber:</span>
              <span className="text-3xl font-serif font-bold text-[#7B4E2E]">
                R$ {totalCartAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botão Finalizar */}
          <button
            onClick={finalizeSale}
            disabled={selectedItems.length === 0}
            className={`w-full mt-6 py-4 rounded-2xl font-serif font-bold text-base tracking-wide flex items-center justify-center space-x-2 shadow-xl transition-all ${
              selectedItems.length > 0 
                ? 'bg-gradient-to-r from-[#7B4E2E] to-[#D9A46A] hover:scale-[1.02] text-white cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Confirmar e Baixar Estoque</span>
          </button>

        </div>

      </div>

    </div>
  );
};
