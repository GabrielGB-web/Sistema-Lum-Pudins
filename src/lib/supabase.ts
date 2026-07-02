import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ingredient, PuddimRecipe, Sale, Expense } from '../types';

// Default fallbacks from the user's prompt
const DEFAULT_URL = 'https://vryowssixrrmzlcmfewk.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_qh2Vl_e2ofFuE9O0scvyaQ_Ejgrwulj';

let supabaseInstance: SupabaseClient | null = null;

// Initialize Supabase Client (lazily pulls config from API or fallback)
export async function initSupabaseClient(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;

  let url = DEFAULT_URL;
  let key = DEFAULT_ANON_KEY;

  try {
    const res = await fetch('/api/supabase-config');
    if (res.ok) {
      const config = await res.json();
      if (config.supabaseUrl && config.supabaseAnonKey) {
        url = config.supabaseUrl;
        key = config.supabaseAnonKey;
      }
    }
  } catch (err) {
    console.warn('Could not fetch Supabase config from API, using default fallbacks:', err);
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(DEFAULT_URL, DEFAULT_ANON_KEY);
  }
  return supabaseInstance;
}

// ==========================================
// MAPPERS (TypeScript <-> PostgreSQL Schema)
// ==========================================

export function mapIngredientFromDb(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit as any,
    currentStock: Number(row.current_stock) || 0,
    minStock: Number(row.min_stock) || 0,
    packageCost: Number(row.package_cost) || 0,
    packageSize: Number(row.package_size) || 1,
    unitCost: Number(row.unit_cost) || 0,
    category: row.category as any,
  };
}

export function mapIngredientToDb(ing: Ingredient) {
  return {
    id: ing.id,
    name: ing.name,
    unit: ing.unit,
    current_stock: ing.currentStock,
    min_stock: ing.minStock,
    package_cost: ing.packageCost,
    package_size: ing.packageSize,
    unit_cost: ing.unitCost,
    category: ing.category,
  };
}

export function mapRecipeFromDb(row: any): PuddimRecipe {
  return {
    id: row.id,
    name: row.name,
    size: row.size as any,
    description: row.description || '',
    yieldCount: Number(row.yield_count) || 1,
    desiredMargin: Number(row.desired_margin) || 0,
    customSalePrice: row.custom_sale_price ? Number(row.custom_sale_price) : undefined,
    imageUrl: row.image_url || '',
    ingredients: row.ingredients || [],
  };
}

export function mapRecipeToDb(rec: PuddimRecipe) {
  return {
    id: rec.id,
    name: rec.name,
    size: rec.size,
    description: rec.description,
    yield_count: rec.yieldCount,
    desired_margin: rec.desiredMargin,
    custom_sale_price: rec.customSalePrice || null,
    image_url: rec.imageUrl,
    ingredients: rec.ingredients, // JSONB
  };
}

export function mapSaleFromDb(row: any): Sale {
  return {
    id: row.id,
    date: row.date,
    customerName: row.customer_name || '',
    totalAmount: Number(row.total_amount) || 0,
    totalCost: Number(row.total_cost) || 0,
    paymentMethod: row.payment_method as any,
    status: row.status as any,
    items: row.items || [],
  };
}

export function mapSaleToDb(sale: Sale) {
  return {
    id: sale.id,
    date: sale.date,
    customer_name: sale.customerName,
    total_amount: sale.totalAmount,
    total_cost: sale.totalCost,
    payment_method: sale.paymentMethod,
    status: sale.status,
    items: sale.items, // JSONB
  };
}

export function mapExpenseFromDb(row: any): Expense {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount) || 0,
    dueDate: row.due_date,
    paymentDate: row.payment_date || undefined,
    category: row.category as any,
    status: row.status as any,
    isFixed: !!row.is_fixed,
  };
}

export function mapExpenseToDb(exp: Expense) {
  return {
    id: exp.id,
    description: exp.description,
    amount: exp.amount,
    due_date: exp.dueDate,
    payment_date: exp.paymentDate || null,
    category: exp.category,
    status: exp.status,
    is_fixed: exp.isFixed,
  };
}

// ==========================================
// SQL SETUP SCRIPT GENERATOR
// ==========================================

export const SQL_SETUP_SCRIPT = `-- LUMÉ PUDIM - COPIE E EXECUTE ESTE SCRIPT NO SQL EDITOR DO SEU SUPABASE
-- Acesse: https://supabase.com/dashboard -> Escolha seu projeto -> SQL Editor -> Novo Script -> Cole e Execute!

-- 1. TABELA DE INGREDIENTES / INSUMOS
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  package_cost NUMERIC NOT NULL DEFAULT 0,
  package_size NUMERIC NOT NULL DEFAULT 1,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL
);

-- Habilitar leitura pública (ou desabilitar RLS para facilitar protótipo rápido)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública para todos" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Escrita pública para todos" ON ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização pública para todos" ON ingredients FOR UPDATE USING (true);
CREATE POLICY "Exclusão pública para todos" ON ingredients FOR DELETE USING (true);

-- 2. TABELA DE RECEITAS / FICHAS TÉCNICAS
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  description TEXT,
  yield_count NUMERIC NOT NULL DEFAULT 1,
  desired_margin NUMERIC NOT NULL DEFAULT 0,
  custom_sale_price NUMERIC,
  image_url TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública para todos" ON recipes FOR SELECT USING (true);
CREATE POLICY "Escrita pública para todos" ON recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização pública para todos" ON recipes FOR UPDATE USING (true);
CREATE POLICY "Exclusão pública para todos" ON recipes FOR DELETE USING (true);

-- 3. TABELA DE VENDAS (PDV)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  customer_name TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública para todos" ON sales FOR SELECT USING (true);
CREATE POLICY "Escrita pública para todos" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização pública para todos" ON sales FOR UPDATE USING (true);
CREATE POLICY "Exclusão pública para todos" ON sales FOR DELETE USING (true);

-- 4. TABELA DE CONTAS E DESPESAS
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date TEXT NOT NULL,
  payment_date TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  is_fixed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública para todos" ON expenses FOR SELECT USING (true);
CREATE POLICY "Escrita pública para todos" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização pública para todos" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Exclusão pública para todos" ON expenses FOR DELETE USING (true);
`;
