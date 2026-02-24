import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { CATEGORIAS } from '../constants/categories';
import { CategoriaResult, Gasto } from '../types';

class AIService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async categorizarGasto(descricao: string): Promise<CategoriaResult> {
    const prompt = `Classifique a seguinte despesa em uma das categorias e subcategorias listadas abaixo. 
    Retorne APENAS um JSON puro, sem formatação extra, sem explicações ou texto adicional. 
    Se não houver uma correspondência exata, escolha a mais próxima.
    
    Categorias e subcategorias:
    ${JSON.stringify(CATEGORIAS, null, 2)}

    Entrada: "${descricao}"
    
    Formato esperado: {"categoria": "Categoria", "subcategoria": "Subcategoria"}
    `;

    try {
      const resposta = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (resposta?.response?.candidates) {
        let resultado = resposta.response.candidates[0]?.content?.parts?.[0]?.text?.trim();
        if (resultado) {
          resultado = resultado.replace(/```json|```/g, '').trim();

          try {
            const jsonResult = JSON.parse(resultado) as CategoriaResult;
            if (
              CATEGORIAS[jsonResult.categoria] &&
              CATEGORIAS[jsonResult.categoria].subcategorias.includes(jsonResult.subcategoria)
            ) {
              return jsonResult;
            }
          } catch (e) {
            console.error('Erro ao parsear JSON da IA:', e);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao classificar gasto:', error);
    }

    return { categoria: 'Outros', subcategoria: 'Outros' };
  }

  async gerarInsights(gastos: Gasto[]): Promise<string | null> {
    const gastosFormatados = JSON.stringify(
      gastos.map((gasto) => ({
        categoria: gasto.categoria,
        subcategoria: gasto.subcategoria,
        valor: gasto.valor,
        data_hora: gasto.data_hora,
      }))
    );

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

    try {
      const resposta = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (resposta?.response?.candidates) {
        return resposta.response.candidates[0]?.content?.parts?.[0]?.text?.trim() || null;
      }
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    }

    return null;
  }
}

export const ai = new AIService();
