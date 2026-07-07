import { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraTransitionConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  duration?: number;
  easing?: (t: number) => number;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useCameraTransition() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const animRef = useRef<{
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    startTime: number;
    duration: number;
    easing: (t: number) => number;
  } | null>(null);

  const setControls = useCallback((controls: any) => {
    controlsRef.current = controls;
  }, []);

  const transitionTo = useCallback(
    (config: CameraTransitionConfig) => {
      const startPos = camera.position.clone();
      const startTarget = controlsRef.current?.target
        ? (controlsRef.current.target as THREE.Vector3).clone()
        : new THREE.Vector3(0, 0, 0);

      animRef.current = {
        startPos,
        endPos: config.position.clone(),
        startTarget,
        endTarget: config.target.clone(),
        startTime: performance.now(),
        duration: (config.duration ?? 800) / 1000,
        easing: config.easing ?? easeInOutCubic,
      };
    },
    [camera]
  );

  useFrame(() => {
    const anim = animRef.current;
    if (!anim) return;

    const elapsed = (performance.now() - anim.startTime) / 1000;
    const t = Math.min(elapsed / anim.duration, 1);
    const eased = anim.easing(t);

    camera.position.lerpVectors(anim.startPos, anim.endPos, eased);

    if (controlsRef.current?.target) {
      (controlsRef.current.target as THREE.Vector3).lerpVectors(
        anim.startTarget,
        anim.endTarget,
        eased
      );
    }

    if (t >= 1) {
      animRef.current = null;
    }
  });

  return { transitionTo, setControls };
}