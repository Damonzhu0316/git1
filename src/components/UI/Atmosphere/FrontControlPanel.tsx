import { useStore } from '@/store/useStore';

export function FrontControlPanel() {
  const sceneMode = useStore((s) => s.sceneMode);
  const setSceneMode = useStore((s) => s.setSceneMode);

  return (
    <div className="p-4 space-y-6 text-white">
      <h2 className="text-lg font-bold">锋与天气</h2>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">锋面类型</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setSceneMode('cold-front')}
            className={`px-4 py-2 rounded text-left flex items-center transition-colors ${sceneMode === 'cold-front' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            冷锋
          </button>
          <button
            onClick={() => setSceneMode('warm-front')}
            className={`px-4 py-2 rounded text-left flex items-center transition-colors ${sceneMode === 'warm-front' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            暖锋
          </button>
          <button
            onClick={() => setSceneMode('stationary-front')}
            className={`px-4 py-2 rounded text-left flex items-center transition-colors ${sceneMode === 'stationary-front' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <span className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
            准静止锋
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">
          {sceneMode === 'cold-front' ? '冷锋特征' :
           sceneMode === 'warm-front' ? '暖锋特征' : '锋面知识'}
        </h3>
        {sceneMode === 'cold-front' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 冷气团主动向暖气团移动</p>
            <p>• 锋面坡度较陡（约60°）</p>
            <p>• 过境时：大风、雨雪、降温</p>
            <p>• 过境后：气温下降、气压上升</p>
            <p>• 降水区窄，主要在锋后</p>
          </div>
        )}
        {sceneMode === 'warm-front' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 暖气团主动向冷气团移动</p>
            <p>• 锋面坡度较缓（约30°）</p>
            <p>• 过境时：连续性降水</p>
            <p>• 过境后：气温升高、气压降低</p>
            <p>• 降水区宽，主要在锋前</p>
          </div>
        )}
      </div>
    </div>
  );
}
