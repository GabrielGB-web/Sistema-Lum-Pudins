import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize GenAI client lazily or safely
function getAIClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY não configurado no servidor.");
  }
  return new GoogleGenAI({ apiKey: key });
}

// API endpoint for Lumé AI Confectionery Consultant
app.post("/api/ai-consultant", async (req, res) => {
  try {
    const { metrics, bestSellingRecipes, lowStockItems, pendingBills } = req.body;

    const ai = getAIClient();
    const prompt = `Você é o Consultor Executivo de Confeitaria Inteligente da marca "Lumé Pudim" (loja artesanal especializada em pudins gourmet).
Sua missão é analisar os indicadores financeiros em tempo real e fornecer um relatório estratégico, motivador e direto ao ponto.

DADOS EM TEMPO REAL DA LUMÉ PUDIM (Mês Atual):
- Faturamento Total: R$ ${metrics.totalSales.toFixed(2)}
- Custo Total das Vendas (CMV Valor): R$ ${metrics.totalCost.toFixed(2)}
- CMV Percentual: ${metrics.cmvPercentage.toFixed(1)}% (Ideal para confeitaria é entre 25% e 32%)
- Lucro Bruto: R$ ${metrics.grossProfit.toFixed(2)}
- Despesas Totais (Fixas e Variáveis): R$ ${metrics.totalExpenses.toFixed(2)}
- Lucro Líquido Estimado: R$ ${metrics.netProfit.toFixed(2)} (${metrics.totalSales > 0 ? ((metrics.netProfit / metrics.totalSales) * 100).toFixed(1) : 0}%)
- Pudins Vendidos: ${metrics.totalPudinsSold} unidades
- Ticket Médio: R$ ${metrics.ticketMedio.toFixed(2)}

DESTAQUES DE VENDAS E ESTOQUE:
- Pudins Mais Vendidos: ${bestSellingRecipes.map((r: any) => `${r.name} (${r.soldCount}x)`).join(", ") || "Nenhum ainda"}
- Itens de Estoque com Alerta Baixo: ${lowStockItems.map((i: any) => `${i.name} (Restante: ${i.currentStock}${i.unit})`).join(", ") || "Estoque saudável"}
- Contas Pendentes: ${pendingBills.length} contas no total de R$ ${pendingBills.reduce((acc: number, b: any) => acc + b.amount, 0).toFixed(2)}

Forneça uma análise estruturada em Markdown com as seguintes seções:
1. **🔍 Diagnóstico Rápido do CMV e Margem**: Comente se o CMV de ${metrics.cmvPercentage.toFixed(1)}% está adequado e como o lucro líquido está se comportando.
2. **💡 Estratégias para Alavancar Vendas**: Dê 2 sugestões práticas de combos ou campanhas para aumentar o ticket médio e vender mais pudins.
3. **⚠️ Atenção Operacional**: Comente sobre o estoque ou contas a pagar caso exijam ação imediata.
4. **🍮 Palavra do Chef Consultor**: Uma mensagem motivadora e dica secreta de produção de pudim gourmet.

Mantenha o tom elegante, caloroso e focado no crescimento da Lumé Pudim. Use formatação limpa e emojis moderados.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Erro na consulta IA:", error);
    res.status(500).json({ 
      error: error.message || "Não foi possível gerar a análise inteligente no momento." 
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Lumé Pudim API" });
});

// API endpoint for Supabase credentials config
app.get("/api/supabase-config", (req, res) => {
  res.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://vryowssixrrmzlcmfewk.supabase.co",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_qh2Vl_e2ofFuE9O0scvyaQ_Ejgrwulj"
  });
});

// Vite middleware for development or Static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lumé Pudim Server running on http://localhost:${PORT}`);
  });
}

startServer();
