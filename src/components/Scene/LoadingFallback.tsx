import { Html } from '@react-three/drei';

export default function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          {/* 外圈旋转 */}
          <div className="absolute inset-0 rounded-full border-2 border-[#00d4ff]/15" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#00d4ff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          {/* 内圈反向旋转 */}
          <div className="absolute inset-2 rounded-full border border-[#f0c060]/20" />
          <div className="absolute inset-2 rounded-full border border-t-[#f0c060] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          {/* 中心点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff]/60 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-[#00d4ff]/80 font-mono">正在加载3D场景</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </Html>
  );
}