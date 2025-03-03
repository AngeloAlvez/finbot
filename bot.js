require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");
const {
    startOfDay, endOfDay, startOfMonth, endOfMonth,
    startOfYear, endOfYear, startOfWeek, endOfWeek,
    format
} = require("date-fns");
const { ptBR } = require("date-fns/locale");

// Configurações
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Objeto de categorias e subcategorias
const categorias = {
    "Transporte": { emoji: "🏍️", subcategorias: { "Combustível": "⛽", "Manutenção": "🔧", "Uber": "🚕", "Estacionamento": "🅿️", "Ônibus": "🚌", "Outros": "📦" } },
    "Alimentação": { emoji: "🍽️", subcategorias: { "Mercado": "🛒", "Restaurantes": "🍽️", "Delivery": "🍔", "Lanchonete": "🥪", "Outros": "📦" } },
    "Lazer": { emoji: "🎉", subcategorias: { "Jogos": "🎮", "Assinaturas": "📺", "Shows": "🎤", "Viagens": "✈️", "Hobbies": "🎨", "Outros": "📦" } },
    "Moradia": { emoji: "🏠", subcategorias: { "Aluguel": "🏡", "Contas Fixas": "💡", "Manutenção": "🛠️", "Melhorias": "🛠️", "Outros": "📦" } },
    "Saúde": { emoji: "❤️", subcategorias: { "Consultas": "🩺", "Medicamentos": "💊", "Academia": "🏋️", "Outros": "📦" } },
    "Educação": { emoji: "📚", subcategorias: { "Cursos": "🎓", "Livros": "📖", "Mensalidade escolar": "🏫", "Material escolar": "✏️", "Outros": "📦" } },
    "Maconha": { emoji: "🌿", subcategorias: { "Extrações": "🧪", "Erva Pura": "🍁" } },
    "Outros": { emoji: "📦", subcategorias: { "Presentes": "🎁", "Doações": "🙏", "Imprevistos": "⚠️", "Outros": "📦" } }
};


// Função para categorizar gastos com IA
async function categorizarGasto(descricao) {
    const prompt = `Classifique a seguinte despesa em uma das categorias e subcategorias listadas abaixo. 
    Retorne APENAS um JSON puro, sem formatação extra, sem explicações ou texto adicional. 
    Se não houver uma correspondência exata, escolha a mais próxima.
    
    Categorias e subcategorias:
    ${JSON.stringify(categorias, null, 2)}

    Entrada: "${descricao}"
    
    Formato esperado: {"categoria": "Categoria", "subcategoria": "Subcategoria"}
    `;

    try {
        const resposta = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        
        if (resposta?.response?.candidates) {
            let resultado = resposta.response.candidates[0]?.content?.parts?.[0]?.text?.trim();
            resultado = resultado.replace(/```json|```/g, "").trim();

            try {
                const jsonResult = JSON.parse(resultado);
                if (jsonResult.categoria in categorias && jsonResult.subcategoria in categorias[jsonResult.categoria].subcategorias) {
                    return jsonResult;
                }
            } catch (e) {
                console.error("Erro ao parsear JSON da IA:", e);
            }
        }
    } catch (error) {
        console.error("Erro ao classificar gasto:", error);
    }
    
    return { categoria: "Outros", subcategoria: "Outros" };
}
// function formatarCategoria(categoria) {
//         const emojiCategoria = categorias[categoria]?.emoji || "";
//         return `${emojiCategoria} ${nome}`.trim();
// }
    
// function formatarSubCategoria(subcategoria, categoria) {
//     const emojiSubCategoria = categorias[categoria]?.subcategorias[subcategoria] || "";
//         return `${emojiSubCategoria} ${nome}`.trim();
// }

//    const emojiSubcategoria = categorias[categoria]?.subcategorias[subcategoria] || "";
// Função para gerar relatórios
async function gerarRelatorio(ctx, dataInicio, dataFim, titulo, tipo) {
    try {
        const dataInicioISO = dataInicio.toISOString();
        const dataFimISO = dataFim.toISOString();

        const { data, error } = await supabase
            .from("gastos")
            .select("descricao, valor, categoria, subcategoria, data_hora")
            .eq("usuario", ctx.from.id)
            .gte("data_hora", dataInicioISO)
            .lte("data_hora", dataFimISO);

        if (error) {
            console.error("Erro ao buscar informações:", error);
            return ctx.reply("Ocorreu um erro ao gerar o relatório.");
        }

        let resposta = `📊 *${titulo}*\n\n`;
        const totais = {};
        let totalGeral = 0;

        if (tipo === "ano") {
            const mesAtual = new Date().getMonth(); // Obtém o índice do mês atual (0 = Janeiro, 11 = Dezembro)
            const meses = Array.from({ length: mesAtual + 1 }, (_, i) => 
                format(new Date(2025, i, 1), "MMMM", { locale: ptBR })
            );
            const dadosMensais = {};

            meses.forEach(mes => dadosMensais[mes] = {});

            data.forEach(({ categoria, subcategoria, valor, data_hora }) => {
                const mes = format(new Date(data_hora), "MMMM", { locale: ptBR });
                if (!dadosMensais[mes][categoria]) dadosMensais[mes][categoria] = {};
                if (!dadosMensais[mes][categoria][subcategoria]) dadosMensais[mes][categoria][subcategoria] = 0;
                dadosMensais[mes][categoria][subcategoria] += valor;
                totalGeral += valor;
            });

            meses.forEach(mes => {
                resposta += `📅 *${mes}*\n`;
                if (Object.keys(dadosMensais[mes]).length === 0) {
                    resposta += `Sem dados\nTotal: R$0,00\n\n`;
                } else {
                    for (const [categoria, subcategorias] of Object.entries(dadosMensais[mes])) {
                        resposta += `*${categoria}*\n`;
                        for (const [subcategoria, total] of Object.entries(subcategorias)) {
                            const percentual = ((total / totalGeral) * 100).toFixed(2);
                            resposta += `  - ${subcategoria}: R$${total.toFixed(2)} (${percentual}%)\n`;
                        }
                    }
                    resposta += `Total: R$${Object.values(dadosMensais[mes]).flatMap(Object.values).reduce((a, b) => a + b, 0).toFixed(2)}\n\n`;
                }
            });
        } else {
            data.forEach(({ categoria, subcategoria, valor }) => {
                if (!totais[categoria]) totais[categoria] = {};
                if (!totais[categoria][subcategoria]) totais[categoria][subcategoria] = 0;
                totais[categoria][subcategoria] += valor;
                totalGeral += valor;
            });

            for (const [categoria, subcategorias] of Object.entries(totais)) {
                resposta += `*${categoria}*\n`;
                for (const [subcategoria, total] of Object.entries(subcategorias)) {
                    const percentual = ((total / totalGeral) * 100).toFixed(2);
                    resposta += `  - ${subcategoria}: R$${total.toFixed(2)} (${percentual}%)\n`;
                }
            }
        }

        resposta += `\n💰 *Total Geral:* R$${totalGeral.toFixed(2)}`;
        ctx.reply(resposta, { parse_mode: "Markdown" });
    } catch (err) {
        console.error("Erro inesperado ao gerar relatório:", err);
        ctx.reply("Ocorreu um erro inesperado ao gerar o relatório.");
    }
}

// Comando único para relatórios com botões
bot.command("relatorio", (ctx) => {
    ctx.reply("Escolha um tipo de relatório:", Markup.inlineKeyboard([
        [Markup.button.callback("📅 Relatório do Dia", "relatorio_dia")],
        [Markup.button.callback("📆 Relatório da Semana", "relatorio_semana")],
        [Markup.button.callback("🗓 Relatório do Mês", "relatorio_mes")],
        [Markup.button.callback("📊 Relatório do Ano", "relatorio_ano")]
    ]));
});
bot.command(["start", "ajuda"], (ctx) => {
    ctx.reply(`👋 Olá! Estou aqui para tornar o controle dos seus gastos simples, rápido e inteligente!  

💡 *Como funciona?*  
Basta enviar uma mensagem curta, como *"Uber 10"* ou *"padaria 30,99"*, e eu automaticamente categorizo e salvo seu gasto. Nada de planilhas ou apps complicados!  

🔍 *Errei na categorização?*  
Sem problemas! Use */delete* para apagar o último gasto e tente um nome mais descritivo.  

📊 *Quer um resumo dos seus gastos?*  
É só usar */relatorio* e eu te mostro tudo de forma organizada!

✨ *Quer insights inteligentes sobre seus gastos?*
Use */insights* e eu analisarei seus dados para te dar dicas personalizadas de como economizar e otimizar suas finanças!

⚡ Simples, eficiente e sem burocracia. Bora começar? 🚀`, { parse_mode: "Markdown" });
});

bot.command("delete", async (ctx) => {
    try {
        const { data, error } = await supabase
            .from("gastos")
            .select("id, descricao, valor, categoria, subcategoria, data_hora")
            .eq("usuario", ctx.from.id)
            .order("data_hora", { ascending: false })
            .limit(1);
        
        if (error) throw error;
        if (!data || data.length === 0) return ctx.reply("Nenhum gasto encontrado para excluir.");

        const gasto = data[0];
        const { error: deleteError } = await supabase
            .from("gastos")
            .delete()
            .eq("id", gasto.id);
        
        if (deleteError) throw deleteError;

        ctx.reply(`❌ Gasto deletado com sucesso!\n\n💸 *${gasto.descricao}*\n💰 Valor: R$${gasto.valor.toFixed(2)}\n📂 Categoria: ${gasto.categoria} - ${gasto.subcategoria}\n🕒 Data: ${format(new Date(gasto.data_hora), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, { parse_mode: "Markdown" });
    } catch (err) {
        console.error("Erro ao deletar gasto:", err);
        ctx.reply("Ocorreu um erro ao deletar o gasto. Tente novamente mais tarde.");
    }
});

bot.command("insights", async (ctx) => {
    try {
        // 1. Buscar todos os gastos do usuário
        const { data, error } = await supabase
            .from("gastos")
            .select("categoria, subcategoria, valor, data_hora")
            .eq("usuario", ctx.from.id);

        if (error) {
            console.error("Erro ao buscar gastos para insights:", error);
            return ctx.reply("Ocorreu um erro ao buscar seus dados para gerar insights.");
        }

        if (!data || data.length === 0) {
            return ctx.reply("Você ainda não possui dados de gastos para gerar insights. Comece a registrar seus gastos!");
        }

        // 2. Preparar os dados para o prompt da IA (você pode formatar como preferir)
        const gastosFormatados = JSON.stringify(data); // Formata os dados como JSON para a IA

        // 3. Criar o prompt para a IA
        const prompt = `Analise os seguintes dados de gastos e forneça insights valiosos sobre os padrões de gastos do usuário.
        Inclua pelo menos 3 insights e recomendações para ajudar o usuário a otimizar seus gastos.
        Seja conciso e direto.
        Identifique pontos de atenção e também pontos positivos, que o usuário esteja fazendo bem
        
        Dados dos gastos: ${gastosFormatados}
        
        resposta esperada: (algo nesse formato ou semelhante, seja criativo)
        - (Primeiro insight): [Insight]
        - Recomendação: [Recomendação]

        (use algum separador)

        - (Segundo insight) [Insight]
        - Recomendação 2: [Recomendação]

        (use algum separador)

        - (nome do bom habito) [explicação do porque é bom]
        - Recomendação 3: [Recomendação]

        Use alguns poucos emojis e seje educado/jovial/engraçado
        `;

        // 4. Enviar o prompt para a IA
        const resposta = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });

        // 5. Extrair e enviar a resposta da IA para o usuário
        if (resposta?.response?.candidates) {
            const insights = resposta.response.candidates[0]?.content?.parts?.[0]?.text?.trim();
            ctx.reply(`💡 *Seus Insights:* \n\n${insights}`, { parse_mode: "Markdown" });
        } else {
            ctx.reply("Não foi possível gerar insights com os dados fornecidos.");
        }

    } catch (err) {
        console.error("Erro ao gerar insights:", err);
        ctx.reply("Ocorreu um erro ao gerar seus insights. Tente novamente mais tarde.");
    }
});


// Ações para os botões de relatório
bot.action("relatorio_dia", (ctx) => {
    const hoje = new Date();
    gerarRelatorio(ctx, startOfDay(hoje), endOfDay(hoje), "Relatório do Dia", "dia");
});

bot.action("relatorio_semana", (ctx) => {
    const hoje = new Date();
    gerarRelatorio(ctx, startOfWeek(hoje, { weekStartsOn: 1 }), endOfWeek(hoje, { weekStartsOn: 1 }), "Relatório da Semana", "semana");
});

bot.action("relatorio_mes", (ctx) => {
    const hoje = new Date();
    gerarRelatorio(ctx, startOfMonth(hoje), endOfMonth(hoje), `Relatório de ${format(hoje, "MMMM", { locale: ptBR })}`, "mes");
});

bot.action("relatorio_ano", (ctx) => {
    const hoje = new Date();
    gerarRelatorio(ctx, startOfYear(hoje), endOfYear(hoje), "Relatório do Ano", "ano");
});


// Captura de mensagens para registrar gastos
bot.on("text", async (ctx) => {
    try {
        const mensagem = ctx.message.text.trim();
        const regex = /(.+)\s(\d+(?:[.,]\d+)?)/;
        const match = mensagem.match(regex);
        if (!match) {
            return ctx.reply("⚠️ Opa! Parece que o formato está incorreto.\n\n📌 Envie algo simples como: *Almoço 45* e eu registrarei seu gasto automaticamente! 😉\n\n Precisa de /ajuda?", { parse_mode: "Markdown" });
        }
        
        const descricao = match[1].trim();
        const valor = parseFloat(match[2].replace(",", "."));
        const { categoria, subcategoria } = await categorizarGasto(mensagem);
        const dataHora = new Date().toISOString();

        const { error } = await supabase.from("gastos").insert([{ descricao, valor, categoria, subcategoria, usuario: ctx.from.id, data_hora: dataHora }]);
        if (error) return ctx.reply("Erro ao salvar gasto.");
               ctx.reply(`✅ Gasto salvo!\n Descrição: ${descricao}\n Valor: R$${valor.toFixed(2)}\n Categoria: ${categoria} - ${subcategoria}\n Data e Hora: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`);
    } catch (err) {
        ctx.reply("Ocorreu um erro inesperado. Tente novamente mais tarde.");
    }

    
});

bot.launch();
