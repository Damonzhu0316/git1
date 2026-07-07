import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useStore } from '@/store/useStore';
import { Earth } from '@/components/Scene/Earth';
import { Atmosphere } from '@/components/Scene/Atmosphere';
import { PressureWindScene } from '@/components/Scene/Atmosphere/PressureWindScene';
import { ColdFrontDemo } from '@/components/Scene/Atmosphere/ColdFrontDemo';
import { WarmFrontDemo } from '@/components/Scene/Atmosphere/WarmFrontDemo';
import { StationaryFrontDemo } from '@/components/Scene/Atmosphere/StationaryFrontDemo';
import { CycloneSystem } from '@/components/Scene/Atmosphere/CycloneSystem';
import { AnticycloneSystem } from '@/components/Scene/Atmosphere/AnticycloneSystem';
import { MonsoonFlowDemo } from '@/components/Scene/Atmosphere/MonsoonFlow';
import { ClimateZoneScene } from '@/components/Scene/Atmosphere/ClimateZoneScene';
import { KnowledgePanel } from '@/components/UI/KnowledgePanel';
import { PressureWindPanel } from '@/components/UI/Atmosphere/PressureWindPanel';
import { FrontControlPanel } from '@/components/UI/Atmosphere/FrontControlPanel';
import { CycloneControlPanel } from '@/components/UI/Atmosphere/CycloneControlPanel';
import { ClimateZonePanel } from '@/components/UI/Atmosphere/ClimateZonePanel';
import { MonthSlider } from '@/components/UI/Atmosphere/MonthSlider';
import { QuizPanel } from '@/components/UI/Atmosphere/QuizPanel';
import { BookOpen } from 'lucide-react';

export default function AtmosphereIndexPage() {
  const sceneMode = useStore((s) => s.sceneMode);
  const hemisphere = useStore((s) => s.hemisphere);
  const month = useStore((s) => s.month);
  const isPlaying = useStore((s) => s.isPlaying);
  const animationSpeed = useStore((s) => s.animationSpeed);
  const showQuiz = useStore((s) => s.showQuiz);
  const setMonth = useStore((s) => s.setMonth);
  const toggleQuiz = useStore((s) => s.toggleQuiz);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMonth(month >= 12 ? 1 : month + 1);
    }, 2000 / animationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, animationSpeed, month, setMonth]);

  const renderScene = () => {
    switch (sceneMode) {
      case 'pressure-wind':
      case 'circulation':
      case 'seasonal-shift':
      case 'land-sea':
        return <PressureWindScene />;
      case 'monsoon':
        return (
          <>
            <PressureWindScene />
            <MonsoonFlowDemo season={month >= 4 && month <= 9 ? 'summer' : 'winter'} visible />
          </>
        );
      case 'cold-front':
        return <ColdFrontDemo visible />;
      case 'warm-front':
        return <WarmFrontDemo visible />;
      case 'stationary-front':
        return <StationaryFrontDemo visible />;
      case 'cyclone':
        return <CycloneSystem hemisphere={hemisphere} visible />;
      case 'anticyclone':
        return <AnticycloneSystem hemisphere={hemisphere} visible />;
      case 'climate-zone':
        return <ClimateZoneScene />;
      default:
        return <PressureWindScene />;
    }
  };

  const renderRightPanel = () => {
    switch (sceneMode) {
      case 'pressure-wind':
      case 'circulation':
      case 'seasonal-shift':
      case 'land-sea':
      case 'monsoon':
        return <PressureWindPanel />;
      case 'cold-front':
      case 'warm-front':
      case 'stationary-front':
        return <FrontControlPanel />;
      case 'cyclone':
      case 'anticyclone':
        return <CycloneControlPanel />;
      case 'climate-zone':
        return <ClimateZonePanel />;
      default:
        return <PressureWindPanel />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
      <div className="h-12 bg-gray-900 flex items-center px-4 border-b border-gray-700">
        <h1 className="text-white font-bold mr-8">第三章 大气的运动</h1>
        <div className="flex gap-2">
          <ModeTab mode="pressure-wind" label="气压带和风带" />
          <ModeTab mode="cold-front" label="常见天气系统" />
          <ModeTab mode="climate-zone" label="气候影响" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <KnowledgePanel />
        </div>

        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
            <ambientLight intensity={0.12} />
            <pointLight position={[10, 10, 10]} intensity={250} color="#fff8e7" />
            <pointLight position={[-10, -5, -10]} intensity={30} color="#4a90d9" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Earth />
            <Atmosphere />
            {renderScene()}
            <OrbitControls
              enablePan={false}
              minDistance={8}
              maxDistance={30}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        <div className="w-72 flex-shrink-0 bg-gray-900/90 border-l border-gray-700 overflow-y-auto">
          <div className="p-3 border-b border-gray-700 flex gap-2">
            <button
              onClick={() => toggleQuiz()}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                showQuiz ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BookOpen className="w-3 h-3 inline mr-1" />
              随堂测验
            </button>
          </div>
          {showQuiz ? <QuizPanel /> : renderRightPanel()}
        </div>
      </div>

      <div className="h-16 bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-4">
        <MonthSlider />
      </div>
    </div>
  );
}

function ModeTab({ mode, label }: { mode: string; label: string }) {
  const currentMode = useStore((s) => s.sceneMode);
  const setSceneMode = useStore((s) => s.setSceneMode);
  const isActive = currentMode === mode ||
    (mode === 'pressure-wind' && ['circulation', 'seasonal-shift', 'land-sea', 'monsoon'].includes(currentMode)) ||
    (mode === 'cold-front' && ['warm-front', 'stationary-front', 'cyclone', 'anticyclone'].includes(currentMode));

  return (
    <button
      onClick={() => setSceneMode(mode as any)}
      className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
}
