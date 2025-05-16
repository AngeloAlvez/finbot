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

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const categorias = {
    "Transporte": { emoji: "🏍️", subcategorias: [ "Combustível", "Manutenção", "Uber", "Estacionamento", "Ônibus", "Outros" ] },
    "Alimentação": { emoji: "🍽️", subcategorias: [ "Mercado", "Restaurantes", "Delivery", "Lanchonete", "Outros" ] },
    "Lazer": { emoji: "🎉", subcategorias: [ "Jogos", "Assinaturas", "Shows", "Viagens", "Hobbies","Alcool", "Fumo", "Cultivo", "Outros" ] },
    "Moradia": { emoji: "🏠", subcategorias: [ "Aluguel", "Contas Fixas" ,"Manutenção", "Melhorias" ,"Outros"] },
    "Saúde": { emoji: "❤️", subcategorias: [ "Consultas", "Medicamentos", "Academia", "Outros"] },
    "Educação": { emoji: "📚", subcategorias: [ "Cursos", "Livros", "Mensalidade escolar", "Material escolar", "Outros" ] },
    "Pessoal": { emoji: "🧍", subcategorias: [ "Cabelo", "Estética", "Roupas", "Acessórios", "Outros" ]},
    "Pets": { emoji: "🐾", subcategorias: [ "Ração", "Veterinário", "Brinquedos", "Higiene", "Outros" ]},
    "Outros": { emoji: "📦", subcategorias: [ "Presentes", "Doações", "Imprevistos", "Parcelamentos", "Outros" ] }
};

function capitalizeFirstLetter(string) {
    return string.split('').map((char, index) =>
      index === 0 ? char.toUpperCase() : char).join('')
  }

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
                if (
                    categorias[jsonResult.categoria] &&
                    categorias[jsonResult.categoria].subcategorias.includes(jsonResult.subcategoria)
                ) {
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
function formatarCategoria(categoria) {
        const emojiCategoria = categorias[categoria]?.emoji || "";
        return `${emojiCategoria} ${categoria}`.trim();
}

function gerarGrafico(totais, totalGeral, maxBarras = 15) {
    let grafico = "\n\n 📊 Distribuição dos Gastos 📊\n\n";
    let linhasGrafico = [];

    // Gera as linhas do gráfico
    for (const categoria in totais) {
        const categoriaFormatada = formatarCategoria(categoria);
        const totalCategoria = Object.values(totais[categoria]).reduce((a, b) => a + b, 0);
        const percentual = ((totalCategoria / totalGeral) * 100).toFixed(0);
        const numBarras = Math.round((percentual / 100) * maxBarras);
        const barras = "█".repeat(numBarras);
        linhasGrafico.push({ barras: barras, categoria: categoriaFormatada, percentual: percentual });
    }

    // Ordena as linhas pelo tamanho das barras (opcional, para melhor visualização)
    linhasGrafico.sort((a, b) => b.barras.length - a.barras.length);

    // Monta a string do gráfico com alinhamento
    linhasGrafico.forEach(linha => {
        grafico += ` ${linha.barras} ${linha.categoria} ${linha.percentual}%\n`;
    });

    return grafico;
}
    

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

        let resposta = `*${titulo}*\n\n`;
        const totais = {};
        let totalGeral = 0;

        if (tipo === "ano") {
            const mesAtual = new Date().getMonth();
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
                resposta += `*◇ ${capitalizeFirstLetter(mes)} ◇*\n\n`; // Adicionado espaçamento

                if (Object.keys(dadosMensais[mes]).length === 0) {
                    resposta += `Sem dados\nTotal: R$0,00\n\n`;
                } else {
                    for (const [categoria, subcategorias] of Object.entries(dadosMensais[mes])) {
                        const totalCategoria = Object.values(subcategorias).reduce((a, b) => a + b, 0);
                        resposta += `*${formatarCategoria(categoria)} - R$${totalCategoria.toFixed(2)}*\n`;

                        for (const [subcategoria, total] of Object.entries(subcategorias)) {
                            const percentual = ((total / totalGeral) * 100).toFixed(2);
                            resposta += `  - ${subcategoria}: R$${total.toFixed(2)} \(${percentual}%\)\n`; // Escapado parênteses
                        }
                        resposta += `\n`;
                    }
                    resposta += `Total de ${mes}: R$${Object.values(dadosMensais[mes]).flatMap(Object.values).reduce((a, b) => a + b, 0).toFixed(2)}\n\n`;
                }
            });

            // Reorganiza os dados para o formato esperado por gerarGrafico
            for (const mes in dadosMensais) {
                for (const categoria in dadosMensais[mes]) {
                    if (!totais[categoria]) totais[categoria] = {};
                    for (const subcategoria in dadosMensais[mes][categoria]) {
                        if (!totais[categoria][subcategoria]) totais[categoria][subcategoria] = 0;
                        totais[categoria][subcategoria] += dadosMensais[mes][categoria][subcategoria];
                    }
                }
            }
        } else {
            data.forEach(({ categoria, subcategoria, valor }) => {
                if (!totais[categoria]) totais[categoria] = {};
                if (!totais[categoria][subcategoria]) totais[categoria][subcategoria] = 0;
                totais[categoria][subcategoria] += valor;
                totalGeral += valor;
            });

            for (const [categoria, subcategorias] of Object.entries(totais)) {
                const totalCategoria = Object.values(subcategorias).reduce((a, b) => a + b, 0);
                resposta += `*${formatarCategoria(categoria)} - R$${totalCategoria.toFixed(2)}*\n`;
                for (const [subcategoria, total] of Object.entries(subcategorias)) {
                    const percentual = ((total / totalGeral) * 100).toFixed(2);
                    resposta += `  - ${subcategoria}: R$${total.toFixed(2)} \(${percentual}%\)\n`; // Escapado parênteses
                }
                resposta += `\n`;
            }
        }

        resposta += `\n*Total Geral:* R$${totalGeral.toFixed(2)}`; // Adicionado espaçamento

        const grafico = gerarGrafico(totais, totalGeral);
        resposta += grafico;

        ctx.reply(resposta, { parse_mode: "Markdown" });

    } catch (err) {
        console.error("Erro inesperado ao gerar relatório:", err);
        ctx.reply("Ocorreu um erro inesperado ao gerar o relatório.");
    }
}

bot.command("relatorio", (ctx) => {
    ctx.reply("Escolha um tipo de relatório:", Markup.inlineKeyboard([
        [Markup.button.callback("📅 Relatório do Dia", "relatorio_dia")],
        [Markup.button.callback("📆 Relatório da Semana", "relatorio_semana")],
        [Markup.button.callback("🗓 Relatório do Mês", "relatorio_mes")],
        [Markup.button.callback("📊 Relatório do Ano", "relatorio_ano")]
    ]));
});

bot.command(["start", "ajuda"], (ctx) => {
    ctx.reply(`👋 Olá! Sou o FinBot 🤖

Estou aqui para tornar o controle dos seus gastos simples, rápido e inteligente!  

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

        // Formata os dados no formato esperado pela IA
        const gastosFormatados = JSON.stringify(data.map(gasto => ({
            categoria: gasto.categoria,
            subcategoria: gasto.subcategoria,
            valor: gasto.valor,
            data_hora: gasto.data_hora
        })));

        const prompt = `Analise os seguintes dados de gastos e forneça insights valiosos sobre os padrões de gastos do usuário.
            Inclua pelo menos 3 insights e recomendações para ajudar o usuário a otimizar seus gastos.
            Seja conciso e direto.
            Identifique pontos de atenção e também pontos positivos, que o usuário esteja fazendo bem
            
            Dados dos gastos: ${gastosFormatados}
            
            resposta esperada: (algo nesse formato ou semelhante, seja criativo)
            🤖 Olá! Analisei seus dados e tive alguns insights:
            
            ✨ [insira seu Insight aqui]
            [Recomendação]
            

            ✨ [insira seu Insight aqui]
            [Recomendação]


            🏆 (nome do bom habito) [explicação do porque é bom]
            [Recomendação]

            [insira uma conclusão]
            

            o padrão é esse, mas seja criativo e analise os dados de verdade, tente entender pontos fracos e fortes.
            não tente inventar dados, trate somente com a verdade.
            tente fugir do clichê e extraía o melhor possível, comparando gastos mês a mês podemos descobrir padrões.
            se achar necessário, dê exemplos reais com os dados do usuário para explicar seus pontos.
            exemplo de análise legal:
            "percebei que o gasto de delivery aumenta no fim do mês, isso pode ser fruto de uma compra de mercado mal planejada.",
            "seus gastos com assinatura tem aumentado gradualmente a meses, você tem aproveitado todos estes streamings de verdade? Talvez valha a pena dar uma revisitada e cancelar alguns"
            este são só alguns exemplos, crie análises verdadeiras.

            Use alguns emojis e seja leve, breve, educado/jovial/engraçado.
            Cuidado para não comparar dados que não conversem entre si e também para não parecer muito mão de vaca, tentando fazer o usuário economizar a qualquer custo.
    
        `;

        const resposta = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });

        if (resposta?.response?.candidates) {
            const insights = resposta.response.candidates[0]?.content?.parts?.[0]?.text?.trim();
            ctx.reply(` *Seus Insights:* \n\n${insights}`, { parse_mode: "Markdown" });
        } else {
            ctx.reply("Não foi possível gerar insights com os dados fornecidos.");
        }

    } catch (err) {
        console.error("Erro ao gerar insights:", err);
        ctx.reply("Ocorreu um erro ao gerar seus insights. Tente novamente mais tarde.");
    }
});


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

if (process.env.BOT_ACTIVE === "true") {
    bot.launch();
  }
