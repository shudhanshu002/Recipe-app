import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from '@react-three/postprocessing';

/* ===================== CONSTANT COLORS (ESLINT SAFE) ===================== */
const PRIMARY_COLOR = new THREE.Color('#f97316');
const LIGHT_COLOR = new THREE.Color('#e5e7eb');
const DARK_COLOR = new THREE.Color('#2d2d2d');

/* ===================== PARTICLES ===================== */
const Particles = ({ count = 300, isDarkMode }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const particles = useRef([]);
  const [dummy] = useState(() => new THREE.Object3D());

  /* ===================== SHADER MATERIAL ===================== */
  const bubbleMaterial = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uColorPrimary: { value: PRIMARY_COLOR },
        uColorSecondary: { value: LIGHT_COLOR },
        isDarkMode: { value: false },
      },
      vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vViewPosition = cameraPosition - worldPosition.xyz;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform float uTime;
                uniform vec3 uColorPrimary;
                uniform vec3 uColorSecondary;
                uniform bool isDarkMode;

                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    vec3 viewDir = normalize(vViewPosition);
                    vec3 normal = normalize(vNormal);

                    float fresnel = pow(1.0 + dot(viewDir, normal), 6.0) * 1.2;
                    vec3 color = mix(uColorSecondary, uColorPrimary, fresnel);

                    float noise = sin(uTime * 1.5 + normal.x * 5.0) * 0.1;
                    color += noise;

                    float opacity = isDarkMode ? 0.9 : 0.7;
                    gl_FragColor = vec4(color, opacity);
                }
            `,
    }),
    []
  );

  /* ===================== PARTICLE INITIALIZATION (SAFE) ===================== */
  useEffect(() => {
    particles.current = Array.from({ length: count }, () => ({
      t: Math.random() * 100,
      factor: 20 + Math.random() * 100,
      speed: 0.01 + Math.random() / 50,
      xFactor: -50 + Math.random() * 100,
      yFactor: -30 + Math.random() * 60,
      zFactor: -30 + Math.random() * 60,
      floatSpeed: 0.5 + Math.random() * 0.5,
      mx: 0,
      my: 0,
    }));
  }, [count]);

  /* ===================== ANIMATION LOOP ===================== */
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.isDarkMode.value = isDarkMode;
    materialRef.current.uniforms.uColorSecondary.value.copy(
      isDarkMode ? DARK_COLOR : LIGHT_COLOR
    );

    particles.current.forEach((p, i) => {
      p.t += p.speed * 4.5;

      p.mx += (state.mouse.x * 20 - p.mx) * 0.02;
      p.my += (state.mouse.y * 20 - p.my) * 0.02;

      const wanderX = Math.sin(p.t * p.floatSpeed);
      const wanderY = Math.cos(p.t * p.floatSpeed);
      const wanderZ = Math.sin(p.t * 0.3);

      dummy.position.set(
        p.xFactor + wanderX * 4 + p.mx,
        p.yFactor + wanderY * 4 + p.my,
        p.zFactor + wanderZ * 4
      );

      const s = 1 + Math.sin(p.t * 2) * 0.1;
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 2, s * 2, s * 2);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.45, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        args={[bubbleMaterial]}
        transparent
        depthWrite={false}
      />
    </instancedMesh>
  );
};

/* ===================== CAMERA ===================== */
const CameraRig = () => {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      state.mouse.x * 1.5,
      0.02
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      state.mouse.y * 1.5,
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

/* ===================== ENVIRONMENT ===================== */
const BackgroundEnvironment = () => (
  <Environment resolution={256}>
    <group rotation={[-Math.PI / 3, 0, 1]}>
      <Lightformer
        form="circle"
        intensity={4}
        position={[0, 5, -9]}
        scale={2}
      />
      <Lightformer
        form="circle"
        intensity={2}
        position={[-5, 1, -1]}
        scale={2}
      />
      <Lightformer
        form="ring"
        color="#f97316"
        intensity={10}
        scale={10}
        position={[-15, 4, -18]}
      />
    </group>
  </Environment>
);

/* ===================== MAIN ===================== */
const Login3DBackground = ({ isDarkMode }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <color
          attach="background"
          args={[isDarkMode ? '#121212' : '#f0f0f0']}
        />
        <fog attach="fog" args={[isDarkMode ? '#121212' : '#f0f0f0', 10, 60]} />

        <ambientLight intensity={isDarkMode ? 0.4 : 0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#f97316" />

        <Particles count={300} isDarkMode={isDarkMode} />
        <CameraRig />
        <BackgroundEnvironment />

        <Stars radius={50} depth={50} count={3000} fade />

        <EffectComposer disableNormalPass>
          <Bloom intensity={1.2} />
          <Noise opacity={0.03} />
          <Vignette offset={0.1} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Login3DBackground;
