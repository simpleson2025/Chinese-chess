import React from 'react';
import { X, BookOpen, Shield, Sword, Eye } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const pieceRules = [
    {
      name: '帥 / 將 (将军/元帅)',
      desc: '棋局核心。只能在【九宫】（3×3九宫格）内走动，每次沿横线或竖线走一格。',
      spec: '【飞将规则】：红黑两将绝不能在同一直线上正面对视且中间无任何子遮挡，否则判为违规负。',
    },
    {
      name: '仕 / 士 (卫士)',
      desc: '贴身护卫。只能在【九宫】内沿对角线斜行一格，全盘仅有5个落脚点。',
      spec: '主要用于拱卫帅府，构筑仕角防线。',
    },
    {
      name: '相 / 象 (文臣/防御)',
      desc: '防守主力。每次走“田”字对角线（两格），【绝不能过河】。',
      spec: '【塞象眼】：若田字正中心有任何棋子阻碍，则该方向不能走。',
    },
    {
      name: '傌 / 馬 (轻骑兵)',
      desc: '灵活战将。走“日”字（先沿横或竖走一格，再向斜前走一格）。可以过河。',
      spec: '【蹩马腿】：若马前行方向相邻的第一格有棋子挡路，则被“蹩腿”无法向该侧跳跃。',
    },
    {
      name: '俥 / 車 (重甲战车)',
      desc: '全盘最强战力。只要无子阻拦，可沿横线或竖线任意纵横驰骋，直冲敌阵。',
      spec: '价值最高（九分），俗称“一车十子寒”。',
    },
    {
      name: '砲 / 炮 (神机火炮)',
      desc: '远程打击。不吃子时移动与车完全相同；【吃子时必须隔一个棋子】（无论敌我，称为“炮架”）。',
      spec: '中炮控盘、沉底炮牵制是经典战术。',
    },
    {
      name: '兵 / 卒 (步兵先锋)',
      desc: '过河前只能向前直走一格；【过河之后不仅能向前，还能向左右平移一格】。',
      spec: '兵卒永不退后。过河卒威力倍增，堪比半个车。',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-stone-900 border border-stone-700/80 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-amber-500" />
            <h2 className="text-base font-bold text-stone-100 font-serif-sc">
              中国象棋规则与走子要诀
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-stone-300">
          {/* Win / Loss Conditions */}
          <div className="bg-stone-950/70 p-3 rounded-lg border border-stone-800">
            <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5 text-xs">
              <Sword size={14} /> 胜负判定准则
            </h3>
            <p className="leading-relaxed text-stone-300">
              1. <strong className="text-stone-100">绝杀（将死）</strong>：一方将军后，对方无任何合法解将招法，攻方胜。<br />
              2. <strong className="text-stone-100">困毙（无子可动）</strong>：轮到一方行棋时虽未被将军，但全盘无任何合乎规则的着法，该方判负（象棋与国际象棋和棋规则不同）。<br />
              3. <strong className="text-stone-100">认输</strong>：一方主动投子认负。
            </p>
          </div>

          {/* Pieces Overview */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
              <Shield size={14} className="text-stone-400" /> 七大兵种走法与特殊规则
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {pieceRules.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-stone-950/40 rounded border border-stone-800/80 hover:border-stone-700 transition-colors"
                >
                  <div className="font-bold text-amber-300 font-serif-sc mb-0.5">
                    {p.name}
                  </div>
                  <div className="text-stone-300 leading-normal">{p.desc}</div>
                  <div className="text-stone-400 text-[11px] mt-1 text-amber-400/90">
                    {p.spec}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-xs transition-colors"
          >
            知晓并返回对局
          </button>
        </div>
      </div>
    </div>
  );
};
