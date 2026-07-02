import { Ingredient, PuddimRecipe, Sale, Expense } from '../types';

export const initialIngredients: Ingredient[] = [
  {
    id: 'ing_1',
    name: 'Leite Condensado Integral Moça',
    unit: 'g',
    currentStock: 11850, // 30 latas de 395g
    minStock: 3950, // 10 latas
    packageCost: 8.50,
    packageSize: 395,
    unitCost: 8.50 / 395,
    category: 'Laticínios',
  },
  {
    id: 'ing_2',
    name: 'Leite Integral Tipo A',
    unit: 'ml',
    currentStock: 18000, // 18 litros
    minStock: 5000,
    packageCost: 5.20,
    packageSize: 1000,
    unitCost: 5.20 / 1000,
    category: 'Laticínios',
  },
  {
    id: 'ing_3',
    name: 'Gemas de Ovo Caipira',
    unit: 'un',
    currentStock: 120,
    minStock: 30,
    packageCost: 24.00, // bandeja com 30 ovos
    packageSize: 30,
    unitCost: 24.00 / 30,
    category: 'Ovos',
  },
  {
    id: 'ing_4',
    name: 'Açúcar Refinado (Calda Caramelo)',
    unit: 'g',
    currentStock: 8500,
    minStock: 2000,
    packageCost: 4.80,
    packageSize: 1000,
    unitCost: 4.80 / 1000,
    category: 'Secos',
  },
  {
    id: 'ing_5',
    name: 'Extrato Natural de Baunilha de Madagascar',
    unit: 'ml',
    currentStock: 350,
    minStock: 100,
    packageCost: 45.00,
    packageSize: 100,
    unitCost: 45.00 / 100,
    category: 'Outros',
  },
  {
    id: 'ing_6',
    name: 'Embalagem Pudim Forneável (Tam. Tradicional)',
    unit: 'un',
    currentStock: 140,
    minStock: 50,
    packageCost: 35.00, // pacote com 25 un
    packageSize: 25,
    unitCost: 35.00 / 25,
    category: 'Embalagens',
  },
  {
    id: 'ing_7',
    name: 'Chocolate Belga Callebaut 70%',
    unit: 'g',
    currentStock: 1800,
    minStock: 500,
    packageCost: 89.00,
    packageSize: 1000,
    unitCost: 89.00 / 1000,
    category: 'Secos',
  },
  {
    id: 'ing_8',
    name: 'Creme de Leite Fresco 35%',
    unit: 'ml',
    currentStock: 4500,
    minStock: 1000,
    packageCost: 22.00,
    packageSize: 500,
    unitCost: 22.00 / 500,
    category: 'Laticínios',
  },
  {
    id: 'ing_9',
    name: 'Pistache Torrado e Moído',
    unit: 'g',
    currentStock: 850,
    minStock: 300,
    packageCost: 140.00,
    packageSize: 1000,
    unitCost: 140.00 / 1000,
    category: 'Secos',
  },
];

export const initialRecipes: PuddimRecipe[] = [
  {
    id: 'rec_1',
    name: 'Pudim Tradicional Lumé (Baunilha & Caramelo)',
    size: 'Tradicional',
    description: 'O clássico absoluto sem furinhos, extremamente cremoso, com fava natural e calda dourada espelhada.',
    yieldCount: 1,
    desiredMargin: 250, // 250% de margem ou multiplicador
    customSalePrice: 42.00,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { ingredientId: 'ing_1', quantity: 395 }, // 1 lata leite condensado
      { ingredientId: 'ing_2', quantity: 300 }, // 300ml leite
      { ingredientId: 'ing_3', quantity: 4 },   // 4 gemas
      { ingredientId: 'ing_4', quantity: 80 },  // 80g açúcar calda
      { ingredientId: 'ing_5', quantity: 5 },   // 5ml baunilha
      { ingredientId: 'ing_6', quantity: 1 },   // 1 embalagem
    ],
  },
  {
    id: 'rec_2',
    name: 'Pudim Gourmet Chocolate Belga 70%',
    size: 'Tradicional',
    description: 'Pudim denso e aveludado feito com legítimo chocolate amargo Callebaut e creme de leite fresco.',
    yieldCount: 1,
    desiredMargin: 260,
    customSalePrice: 52.00,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { ingredientId: 'ing_1', quantity: 395 },
      { ingredientId: 'ing_8', quantity: 200 }, // Creme de leite fresco
      { ingredientId: 'ing_2', quantity: 150 },
      { ingredientId: 'ing_3', quantity: 3 },
      { ingredientId: 'ing_7', quantity: 120 }, // Chocolate 70%
      { ingredientId: 'ing_4', quantity: 70 },
      { ingredientId: 'ing_6', quantity: 1 },
    ],
  },
  {
    id: 'rec_3',
    name: 'Pudim Real de Pistache Siciliano',
    size: 'Tradicional',
    description: 'Textura acetinada com pasta artesanal de pistache e pedacinhos crocantes na coroa de caramelo.',
    yieldCount: 1,
    desiredMargin: 280,
    customSalePrice: 65.00,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { ingredientId: 'ing_1', quantity: 395 },
      { ingredientId: 'ing_2', quantity: 250 },
      { ingredientId: 'ing_8', quantity: 100 },
      { ingredientId: 'ing_3', quantity: 4 },
      { ingredientId: 'ing_9', quantity: 80 }, // Pistache moído
      { ingredientId: 'ing_4', quantity: 75 },
      { ingredientId: 'ing_6', quantity: 1 },
    ],
  },
];

// Função auxiliar para calcular o custo exato de uma receita com base nos custos unitários atuais
export function calculateRecipeCost(recipe: PuddimRecipe, ingredientsList: Ingredient[]): number {
  const totalBatchCost = recipe.ingredients.reduce((acc, item) => {
    const ing = ingredientsList.find((i) => i.id === item.ingredientId);
    if (!ing) return acc;
    return acc + (ing.unitCost * item.quantity);
  }, 0);

  return totalBatchCost / (recipe.yieldCount || 1);
}

const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

export const initialSales: Sale[] = [
  {
    id: 'sal_1',
    date: `${currentYear}-${currentMonth}-02T14:30:00.000Z`,
    customerName: 'Mariana Silva',
    paymentMethod: 'Pix',
    status: 'Concluído',
    totalAmount: 84.00,
    totalCost: 26.80,
    items: [
      { recipeId: 'rec_1', recipeName: 'Pudim Tradicional Lumé', size: 'Tradicional', quantity: 2, unitPrice: 42.00, unitCost: 13.40 }
    ]
  },
  {
    id: 'sal_2',
    date: `${currentYear}-${currentMonth}-05T10:15:00.000Z`,
    customerName: 'Dr. Roberto Campos',
    paymentMethod: 'Cartão de Crédito',
    status: 'Concluído',
    totalAmount: 117.00,
    totalCost: 38.50,
    items: [
      { recipeId: 'rec_2', recipeName: 'Pudim Gourmet Chocolate Belga', size: 'Tradicional', quantity: 1, unitPrice: 52.00, unitCost: 17.60 },
      { recipeId: 'rec_3', recipeName: 'Pudim Real de Pistache Siciliano', size: 'Tradicional', quantity: 1, unitPrice: 65.00, unitCost: 20.90 }
    ]
  },
  {
    id: 'sal_3',
    date: `${currentYear}-${currentMonth}-08T16:45:00.000Z`,
    customerName: 'Beatriz Vasconcelos',
    paymentMethod: 'Pix',
    status: 'Concluído',
    totalAmount: 126.00,
    totalCost: 40.20,
    items: [
      { recipeId: 'rec_1', recipeName: 'Pudim Tradicional Lumé', size: 'Tradicional', quantity: 3, unitPrice: 42.00, unitCost: 13.40 }
    ]
  },
  {
    id: 'sal_4',
    date: `${currentYear}-${currentMonth}-12T11:20:00.000Z`,
    customerName: 'Carlos Eduardo (Restaurante Le Sabor)',
    paymentMethod: 'Pix',
    status: 'Concluído',
    totalAmount: 260.00,
    totalCost: 83.60,
    items: [
      { recipeId: 'rec_3', recipeName: 'Pudim Real de Pistache Siciliano', size: 'Tradicional', quantity: 4, unitPrice: 65.00, unitCost: 20.90 }
    ]
  },
  {
    id: 'sal_5',
    date: `${currentYear}-${currentMonth}-15T15:00:00.000Z`,
    customerName: 'Juliana Paes',
    paymentMethod: 'Cartão de Débito',
    status: 'Concluído',
    totalAmount: 94.00,
    totalCost: 31.00,
    items: [
      { recipeId: 'rec_1', recipeName: 'Pudim Tradicional Lumé', size: 'Tradicional', quantity: 1, unitPrice: 42.00, unitCost: 13.40 },
      { recipeId: 'rec_2', recipeName: 'Pudim Gourmet Chocolate Belga', size: 'Tradicional', quantity: 1, unitPrice: 52.00, unitCost: 17.60 }
    ]
  },
  {
    id: 'sal_6',
    date: `${currentYear}-${currentMonth}-19T18:10:00.000Z`,
    customerName: 'Lucas Ferraz',
    paymentMethod: 'Dinheiro',
    status: 'Concluído',
    totalAmount: 42.00,
    totalCost: 13.40,
    items: [
      { recipeId: 'rec_1', recipeName: 'Pudim Tradicional Lumé', size: 'Tradicional', quantity: 1, unitPrice: 42.00, unitCost: 13.40 }
    ]
  },
  {
    id: 'sal_7',
    date: `${currentYear}-${currentMonth}-22T13:40:00.000Z`,
    customerName: 'Fernanda Lima',
    paymentMethod: 'Pix',
    status: 'Concluído',
    totalAmount: 156.00,
    totalCost: 52.80,
    items: [
      { recipeId: 'rec_2', recipeName: 'Pudim Gourmet Chocolate Belga', size: 'Tradicional', quantity: 3, unitPrice: 52.00, unitCost: 17.60 }
    ]
  },
  {
    id: 'sal_8',
    date: `${currentYear}-${currentMonth}-25T16:00:00.000Z`,
    customerName: 'Evento Corporativo TechCorp',
    paymentMethod: 'Pix',
    status: 'Concluído',
    totalAmount: 420.00,
    totalCost: 134.00,
    items: [
      { recipeId: 'rec_1', recipeName: 'Pudim Tradicional Lumé', size: 'Tradicional', quantity: 10, unitPrice: 42.00, unitCost: 13.40 }
    ]
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    description: 'Aluguel Cozinha Artesanal Lumé',
    amount: 1450.00,
    dueDate: `${currentYear}-${currentMonth}-10`,
    paymentDate: `${currentYear}-${currentMonth}-09`,
    category: 'Aluguel',
    status: 'Pago',
    isFixed: true,
  },
  {
    id: 'exp_2',
    description: 'Conta de Energia Elétrica (Fornos/Geladeiras)',
    amount: 380.50,
    dueDate: `${currentYear}-${currentMonth}-15`,
    paymentDate: `${currentYear}-${currentMonth}-14`,
    category: 'Luz/Gás',
    status: 'Pago',
    isFixed: true,
  },
  {
    id: 'exp_3',
    description: 'Gás de Cozinha (2 Botijões P13)',
    amount: 220.00,
    dueDate: `${currentYear}-${currentMonth}-08`,
    paymentDate: `${currentYear}-${currentMonth}-08`,
    category: 'Luz/Gás',
    status: 'Pago',
    isFixed: false,
  },
  {
    id: 'exp_4',
    description: 'Compra Atacado Leite Condensado & Laticínios',
    amount: 480.00,
    dueDate: `${currentYear}-${currentMonth}-05`,
    paymentDate: `${currentYear}-${currentMonth}-04`,
    category: 'Ingredientes',
    status: 'Pago',
    isFixed: false,
  },
  {
    id: 'exp_5',
    description: 'Embalagens Personalizadas com Fita Cetim Rosé',
    amount: 350.00,
    dueDate: `${currentYear}-${currentMonth}-28`,
    category: 'Embalagens',
    status: 'Pendente',
    isFixed: false,
  },
  {
    id: 'exp_6',
    description: 'Tráfego Pago Instagram Ads (Lumé Gourmet)',
    amount: 300.00,
    dueDate: `${currentYear}-${currentMonth}-30`,
    category: 'Marketing',
    status: 'Pendente',
    isFixed: true,
  },
  {
    id: 'exp_7',
    description: 'Pró-labore Chef Confeiteiro',
    amount: 2000.00,
    dueDate: `${currentYear}-${currentMonth}-30`,
    category: 'Pró-labore',
    status: 'Pendente',
    isFixed: true,
  }
];
