import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
// Port 3000 is required by the AI Studio preview environment
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// AI Grandmaster commentary & board situation analysis API
app.post('/api/analyze', async (req, res) => {
  try {
    const { boardDesc, turn, history, difficulty } = req.body;

    if (!aiClient) {
      // Heuristic fallback response if API key is not configured
      return res.json({
        evaluation: turn === 'red' ? '红方略占主动' : '黑方攻势严密',
        score: turn === 'red' ? 1.2 : -0.8,
        tacticalAdvice: '双方子力基本均等，需注意中路炮火压制与边路车马出动的速度，防止对方卧槽马或挂角马偷袭。',
        threats: ['注意后防士象联络', '防止对手车控要道'],
        suggestedPlan: '建议稳固中防，活通马路，伺机进车压迫对方卒林线。',
      });
    }

    const prompt = `你是一位享誉棋坛的中国象棋特级大师与国家级专业解说员。
请根据以下当前盘面局势与近期走子记录，用沉稳、专业、富有象棋战术底蕴的语言进行精要分析（字数100-180字以内）：

【当前轮到走子方】：${turn === 'red' ? '红方 (先手)' : '黑方 (后手)'}
【近期着法历史】：${history && history.length > 0 ? history.slice(-6).join('，') : '开局阶段'}
【棋盘现状简述】：
${boardDesc || '双方子力完整，处于标准开局阶段。'}

请返回严格的 JSON 格式（不要使用 Markdown 代码块），包含以下字段：
{
  "evaluation": "用4-8个字概括局面优劣（例如：红方控中占优、黑方攻势凌厉、势均力敌、红方破相有隙等）",
  "score": 评估分（浮点数，红优为正数如+2.5，黑优为负数如-1.8，均势在-0.5到+0.5之间）,
  "tacticalAdvice": "结合当前子力配置，给出精辟战术指导（如巡河车封锁、沉底炮牵制、双马饮泉、铁门栓隐患等）",
  "threats": ["当前面临的威胁1", "威胁2"],
  "suggestedPlan": "后续1-3步的战略行棋方向"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        evaluation: turn === 'red' ? '红方主动' : '黑方稳健',
        score: turn === 'red' ? 1.0 : -0.5,
        tacticalAdvice: responseText.slice(0, 150),
        threats: ['严防对方快马出击'],
        suggestedPlan: '巩固防守，进车争夺要津。',
      };
    }

    return res.json(parsedData);
  } catch (error) {
    console.error('Error analyzing board position with Gemini:', error);
    return res.status(200).json({
      evaluation: '局势胶着',
      score: 0.0,
      tacticalAdvice: '当前局势双方犬牙交错，建议优先确保帅府安全，连环士象，进车占领骑河好位。',
      threats: ['注意防范暗伏炮火'],
      suggestedPlan: '子力互保，徐图进取。',
    });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Xiangqi app running on port ${PORT}`);
  });
}

startServer();
