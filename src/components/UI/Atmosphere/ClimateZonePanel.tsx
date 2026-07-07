const CLIMATE_DATA = [
  { name: '热带雨林气候', pressure: '赤道低气压带', wind: '赤道无风带', precip: '全年多雨', color: '#1B5E20' },
  { name: '热带沙漠气候', pressure: '副热带高气压带', wind: '信风带', precip: '全年少雨', color: '#F57F17' },
  { name: '地中海气候', pressure: '副热带高气压带/西风带', wind: '西风带', precip: '冬雨型', color: '#E65100' },
  { name: '温带海洋性气候', pressure: '西风带', wind: '盛行西风', precip: '全年湿润', color: '#00695C' },
  { name: '温带季风气候', pressure: '海陆热力差异', wind: '季风', precip: '夏雨型', color: '#1565C0' },
  { name: '极地气候', pressure: '极地高气压带', wind: '极地东风', precip: '全年少雨', color: '#455A64' },
];

export function ClimateZonePanel() {
  return (
    <div className="p-4 space-y-6 text-white">
      <h2 className="text-lg font-bold">气压带风带与气候</h2>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">气候类型与成因</h3>
        <div className="space-y-2">
          {CLIMATE_DATA.map((item) => (
            <div key={item.name} className="bg-gray-800 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-xs text-gray-400 space-y-0.5 pl-5">
                <p>气压带/风带: {item.pressure}</p>
                <p>降水特征: {item.precip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">核心规律</h3>
        <div className="text-gray-300 text-xs space-y-1">
          <p>• 低压带 + 上升气流 → 多雨</p>
          <p>• 高压带 + 下沉气流 → 少雨</p>
          <p>• 西风带（低纬→高纬）→ 多雨</p>
          <p>• 信风带（高纬→低纬）→ 少雨</p>
          <p>• 大陆东岸季风 → 夏雨型</p>
          <p>• 大陆西岸西风 → 年雨型</p>
        </div>
      </div>
    </div>
  );
}
