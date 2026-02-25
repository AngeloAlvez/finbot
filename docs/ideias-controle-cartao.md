# FinBot - Ideias de Funcionalidades
## Controle de Fatura e Cartão de Crédito

---

## 1. Registro de Cartões

Permite ao usuário cadastrar seus cartões de crédito para organizar os gastos.

**Comandos:**
```
/cartao adicionar Nubank
/cartao adicionar Itaú (fechamento dia 15)
/cartoes → lista todos os cartões cadastrados
/cartao remover Nubank
```

**Dados armazenados:**
- Nome do cartão
- Dia de fechamento da fatura
- Dia de vencimento
- Limite (opcional)
- Bandeira (opcional)

---

## 2. Vincular Gasto ao Cartão

O usuário pode informar o cartão no momento do registro do gasto.

**Exemplos de uso:**
```
Jantar 150 nubank
Uber 25 itau
Mercado 320,50 c6
```

O bot identifica automaticamente o nome do cartão no final da mensagem e vincula o gasto.

**Resposta do bot:**
```
✅ Gasto salvo!
📝 Descrição: Jantar
💰 Valor: R$150,00
📂 Categoria: Alimentação - Restaurantes
💳 Cartão: Nubank
📅 Fatura: Março/2026
```

---

## 3. Parcelamento Automático

Registra compras parceladas e distribui automaticamente nas faturas futuras.

**Exemplos de uso:**
```
Geladeira 3000 12x nubank
iPhone 6000 10x itau
Curso 1200 3x
```

**Comportamento:**
- Divide o valor total pelo número de parcelas
- Registra cada parcela na fatura correspondente
- Mantém rastreabilidade da compra original

**Resposta do bot:**
```
✅ Compra parcelada registrada!
📝 Descrição: Geladeira
💰 Total: R$3.000,00
📊 Parcelas: 12x de R$250,00
💳 Cartão: Nubank
📅 Primeira parcela: Março/2026
📅 Última parcela: Fevereiro/2027
```

**Comando para ver parcelamentos ativos:**
```
/parcelamentos
→ Lista todas as compras parceladas em andamento
→ Mostra parcelas restantes e valor total pendente
```

---

## 4. Consulta de Fatura

Visualiza todos os gastos de um cartão no período da fatura atual ou anterior.

**Comandos:**
```
/fatura nubank → fatura atual
/fatura nubank anterior → fatura fechada
/fatura nubank 03/2026 → fatura específica
```

**Resposta do bot:**
```
💳 Fatura Nubank - Março/2026

📅 Fechamento: 15/03/2026
📅 Vencimento: 22/03/2026

📋 Gastos:
├─ 01/03 Uber R$25,00
├─ 03/03 iFood R$45,00
├─ 05/03 Mercado R$320,00
├─ 10/03 Geladeira (2/12) R$250,00
└─ 12/03 Jantar R$150,00

💰 Total da Fatura: R$790,00
```

---

## 5. Alerta de Limite

Monitora o uso do limite do cartão e envia alertas proativos.

**Configuração:**
```
/limite nubank 5000
/limite itau 3000
```

**Alertas automáticos:**
- ⚠️ 80% do limite: "Você já usou R$4.000 (80%) do limite do Nubank"
- 🚨 95% do limite: "Atenção! Limite quase esgotado: R$4.750 (95%)"
- ❌ 100% do limite: "Limite atingido no Nubank!"

**Comando para verificar:**
```
/limites
→ Nubank: R$4.200 / R$5.000 (84%) ⚠️
→ Itaú: R$1.500 / R$3.000 (50%) ✅
```

---

## 6. Resumo Multi-cartões

Visão consolidada de todos os cartões em um único comando.

**Comando:**
```
/cartoes resumo
```

**Resposta:**
```
💳 Resumo dos Cartões - Março/2026

┌─────────────────────────────────────┐
│ Nubank                              │
│ Fatura: R$1.200,00                  │
│ Vencimento: 10/03/2026              │
│ Limite usado: 24%                   │
├─────────────────────────────────────┤
│ Itaú                                │
│ Fatura: R$850,00                    │
│ Vencimento: 15/03/2026              │
│ Limite usado: 28%                   │
├─────────────────────────────────────┤
│ C6 Bank                             │
│ Fatura: R$430,00                    │
│ Vencimento: 20/03/2026              │
│ Limite usado: 14%                   │
└─────────────────────────────────────┘

💰 Total a pagar: R$2.480,00
📅 Próximo vencimento: Nubank (10/03)
```

---

## 7. Insights de Cartão (com IA)

Análises inteligentes sobre o uso dos cartões.

**Comando:**
```
/insights cartao
```

**Exemplos de insights:**
- "Seu gasto médio no Nubank aumentou 23% este mês"
- "Você tem 5 parcelamentos ativos totalizando R$450/mês"
- "Considere concentrar gastos no Itaú - ele tem cashback maior"
- "Sua fatura do Nubank fecha em 3 dias, ainda há R$800 de limite"

---

## Schema do Banco de Dados

```sql
-- Tabela de cartões
CREATE TABLE cartoes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  nome TEXT NOT NULL,
  dia_fechamento INTEGER DEFAULT 1,
  dia_vencimento INTEGER DEFAULT 10,
  limite DECIMAL(10,2),
  bandeira TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna na tabela gastos
ALTER TABLE gastos ADD COLUMN cartao_id INTEGER REFERENCES cartoes(id);
ALTER TABLE gastos ADD COLUMN parcela_atual INTEGER;
ALTER TABLE gastos ADD COLUMN total_parcelas INTEGER;
ALTER TABLE gastos ADD COLUMN compra_parcelada_id UUID;

-- Tabela de compras parceladas (para rastreabilidade)
CREATE TABLE compras_parceladas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  cartao_id INTEGER REFERENCES cartoes(id),
  descricao TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  total_parcelas INTEGER NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  data_primeira_parcela DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Prioridade de Implementação

| Fase | Funcionalidade | Complexidade | Valor |
|------|----------------|--------------|-------|
| 1 | Registro de cartões | Baixa | Alto |
| 1 | Vincular gasto ao cartão | Baixa | Alto |
| 2 | Consulta de fatura | Média | Alto |
| 2 | Resumo multi-cartões | Média | Alto |
| 3 | Parcelamento automático | Alta | Muito Alto |
| 3 | Alerta de limite | Média | Médio |
| 4 | Insights de cartão | Alta | Alto |

---

## Estimativa de Desenvolvimento

- **Fase 1 (MVP):** 2-3 horas
- **Fase 2 (Faturas):** 3-4 horas
- **Fase 3 (Parcelamento):** 4-5 horas
- **Fase 4 (Insights):** 2-3 horas

**Total estimado:** 11-15 horas de desenvolvimento

---

*Documento gerado em 25/02/2026*
*FinBot - Seu assistente financeiro pessoal*
