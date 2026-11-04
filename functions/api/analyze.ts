interface Env {
  GEMINI_API_KEY?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

export const onRequestPost = async (context: RequestContext): Promise<Response> => {
  try {
    const { request, env } = context;
    const body: any = await request.json().catch(() => ({}));
    const { boardDesc, turn, history } = body;

    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          evaluation: turn === 'red' ? '红方略占主动' : '黑方攻势严密',
          score: turn === 'red' ? 1.2 : -0.8,
          tacticalAdvice: '双方子力基本均等，需注意中路炮火压制与边路车马出动的速度，防止对方卧槽马或挂角马偷袭。',
          threats: ['注意后防士象联络', '防止对手车控要道'],
          suggestedPlan: '建议稳固中防，活通马路，伺机进车压迫对方卒林线。',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const prompt = `你是一位享誉棋坛的中国象棋特级大师与国家级专业解说员。
请根据以下当前盘面局势与近期走子记录，用沉稳、专业、富有象棋战术底蕴的语言进行精要分析（字数100-180字以内）：

【当前轮到走子方】：${turn === 'red' ? '红方 (先手)' : '黑方 (后手)'}
【近期着法历史】：${history && history.length > 0 ? history.slice(-6).join('，') : '开局阶段'}
【棋盘现状简述】：
${boardDesc || '双方子力完整，处于标准开局阶段。'}

请返回严格的 JSON 格式（不要使用 Markdown 代码块），包含以下字段：
{
  "evaluation": "用4-8个字概括局面优劣",
  "score": 评估分（浮点数，红优为正数如+2.5，黑优为负数如-1.8，均势在-0.5到+0.5之间）,
  "tacticalAdvice": "结合当前子力配置，给出精辟战术指导",
  "threats": ["当前面临的威胁1", "威胁2"],
  "suggestedPlan": "后续1-3步的战略行棋方向"
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    const data: any = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = text ? JSON.parse(text) : {};

    return new Response(JSON.stringify(parsed), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({
        evaluation: '局势胶着',
        score: 0.0,
        tacticalAdvice: '当前局势双方犬牙交错，建议优先确保帅府安全，连环士象，进车占领骑河好位。',
        threats: ['注意防范暗伏炮火'],
        suggestedPlan: '子力互保，徐图进取。',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
