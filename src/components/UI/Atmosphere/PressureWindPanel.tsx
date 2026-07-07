import { useStore } from '@/store/useStore';

export function PressureWindPanel() {
  const {
    showPressureZones,
    showWindBelts,
    showCirculationCells,
    togglePressureZones,
    toggleWindBelts,
    toggleCirculationCells,
    month,
  } = useStore();

  return (
    <div className="p-4 space-y-6 text-white">
      <h2 className="text-lg font-bold">气压带与风带</h2>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">显示选项</h3>

        <div className="flex items-center justify-between">
          <span className="text-gray-200 text-sm">气压带</span>
          <button
            onClick={togglePressureZones}
            className={`w-12 h-6 rounded-full transition-colors ${showPressureZones ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${showPressureZones ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-200 text-sm">风带</span>
          <button
            onClick={toggleWindBelts}
            className={`w-12 h-6 rounded-full transition-colors ${showWindBelts ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${showWindBelts ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-200 text-sm">三圈环流</span>
          <button
            onClick={toggleCirculationCells}
            className={`w-12 h-6 rounded-full transition-colors ${showCirculationCells ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${showCirculationCells ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">当前月份</h3>
        <p className="text-white text-lg font-bold">{month}月</p>
        <p className="text-gray-400 text-xs mt-1">
          {month >= 3 && month <= 5 ? '春季 - 气压带风带向北移动' :
           month >= 6 && month <= 8 ? '夏季 - 气压带风带位置偏北' :
           month >= 9 && month <= 11 ? '秋季 - 气压带风带向南移动' :
           '冬季 - 气压带风带位置偏南'}
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">核心知识</h3>
        <div className="text-gray-300 text-xs space-y-1.5">
          <p>• <span className="text-red-400">赤道低气压带</span>：上升气流，高温多雨</p>
          <p>• <span className="text-blue-400">副热带高气压带</span>：下沉气流，干燥少雨</p>
          <p>• <span className="text-orange-400">副极地低气压带</span>：锋面上升，多雨</p>
          <p>• <span className="text-cyan-400">极地高气压带</span>：下沉气流，寒冷干燥</p>
          <p className="pt-1 border-t border-gray-700">• 北半球夏季偏北，冬季偏南</p>
        </div>
      </div>
    </div>
  );
}
