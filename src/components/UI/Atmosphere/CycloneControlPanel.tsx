import { useStore } from '@/store/useStore';

export function CycloneControlPanel() {
  const sceneMode = useStore((s) => s.sceneMode);
  const hemisphere = useStore((s) => s.hemisphere);
  const setSceneMode = useStore((s) => s.setSceneMode);
  const setHemisphere = useStore((s) => s.setHemisphere);

  return (
    <div className="p-4 space-y-6 text-white">
      <h2 className="text-lg font-bold">气旋与反气旋</h2>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">天气系统</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSceneMode('cyclone')}
            className={`px-4 py-2 rounded transition-colors ${sceneMode === 'cyclone' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            气旋（低压）
          </button>
          <button
            onClick={() => setSceneMode('anticyclone')}
            className={`px-4 py-2 rounded transition-colors ${sceneMode === 'anticyclone' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            反气旋（高压）
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">半球</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setHemisphere('north')}
            className={`px-4 py-2 rounded transition-colors ${hemisphere === 'north' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            北半球
          </button>
          <button
            onClick={() => setHemisphere('south')}
            className={`px-4 py-2 rounded transition-colors ${hemisphere === 'south' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            南半球
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">
          {sceneMode === 'cyclone' ? '气旋特征' : '反气旋特征'}
        </h3>
        {sceneMode === 'cyclone' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 中心气压低，四周气压高</p>
            <p>• 北半球：逆时针辐合</p>
            <p>• 南半球：顺时针辐合</p>
            <p>• 上升气流 → 阴雨天气</p>
            <p>• 典型：台风、温带气旋</p>
          </div>
        )}
        {sceneMode === 'anticyclone' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 中心气压高，四周气压低</p>
            <p>• 北半球：顺时针辐散</p>
            <p>• 南半球：逆时针辐散</p>
            <p>• 下沉气流 → 晴朗干燥</p>
            <p>• 典型：伏旱、寒潮</p>
          </div>
        )}
      </div>
    </div>
  );
}
