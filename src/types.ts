export type UnitType = 'g' | 'ml' | 'un' | 'kg' | 'l';

export interface Ingredient {
  id: string;
  name: string;
  unit: UnitType;
  currentStock: number;
  minStock: number;
  packageCost: number; // ex: R$ 10,00 por lata de 395g
  packageSize: number; // ex: 395
  unitCost: number; // calculado: packageCost / packageSize (ex: custo por grama)
  category: 'Laticínios' | 'Secos' | 'Ovos' | 'Embalagens' | 'Outros';
}

export interface RecipeIngredientItem {
  ingredientId: string;
  quantity: number; // em g, ml ou un
}

export interface PuddimRecipe {
  id: string;
  name: string;
  size: 'Mini' | 'Tradicional' | 'Família' | 'Geladinho';
  description: string;
  ingredients: RecipeIngredientItem[];
  yieldCount: number; // Rendimento de unidades por batida/receita (geralmente 1 ou mais)
  desiredMargin: number; // porcentagem de lucro desejado ex: 200% ou margem sobre preço
  customSalePrice?: number; // Preço de venda fixado pelo chef
  imageUrl: string;
}

export interface SaleItem {
  recipeId: string;
  recipeName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // Custo exato no momento da venda
}

export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro';

export interface Sale {
  id: string;
  date: string; // ISO string
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  totalCost: number; // CMV desta venda
  paymentMethod: PaymentMethod;
  status: 'Concluído' | 'Cancelado';
}

export type ExpenseCategory = 'Aluguel' | 'Ingredientes' | 'Embalagens' | 'Luz/Gás' | 'Pró-labore' | 'Marketing' | 'Impostos' | 'Outros';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string;
  category: ExpenseCategory;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  isFixed: boolean; // Despesa fixa mensal ou variável
}

export interface FinancialMetrics {
  totalSales: number;
  totalCost: number; // CMV total
  grossProfit: number;
  totalExpenses: number; // Despesas pagas ou do mês
  netProfit: number;
  ticketMedio: number;
  totalPudinsSold: number;
  cmvPercentage: number;
}
