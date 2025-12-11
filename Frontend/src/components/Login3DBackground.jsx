import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

const BubbleMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uColorPrimary: { value: new THREE.Color('#f97316') },
        uColorSecondary: { value: new THREE.Color('#ffffff') },
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

            // Strong fresnel for permanent glow (no color change)
            float fresnel = pow(1.0 + dot(viewDir, normal), 6.0) * 1.2;

            // Original color logic preserved
            vec3 color = mix(uColorSecondary, uColorPrimary, fresnel);

            float noise = sin(uTime * 1.5 + normal.x * 5.0) * 0.1;
            color += noise;

            float opacity = isDarkMode ? 0.9 : 0.7;

            gl_FragColor = vec4(color, opacity);
        }
    `,
};

const Particles = ({ count = 300, isDarkMode }) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const [dummy] = useState(() => new THREE.Object3D());

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 50;

            temp.push({
                t,
                factor,
                speed,
                xFactor: -50 + Math.random() * 100,
                yFactor: -30 + Math.random() * 60,
                zFactor: -30 + Math.random() * 60,
                floatSpeed: 0.5 + Math.random() * 0.5,
                mx: 0,
                my: 0,
            });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;

        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            materialRef.current.uniforms.isDarkMode.value = isDarkMode;
            materialRef.current.uniforms.uColorSecondary.value.set(isDarkMode ? '#2d2d2d' : '#e5e7eb');
        }

        particles.forEach((particle, i) => {
            let { t, speed, xFactor, yFactor, zFactor, floatSpeed } = particle;
            t = particle.t += speed * 4.5;

            particle.mx += (state.mouse.x * 20 - particle.mx) * 0.02;
            particle.my += (state.mouse.y * 20 - particle.my) * 0.02;

            const wanderX = Math.sin(t * floatSpeed) + Math.cos(t * 0.3);
            const wanderY = Math.sin(t * 0.5) + Math.cos(t * floatSpeed);
            const wanderZ = Math.cos(t * 0.3) + Math.sin(t * 0.2);

            dummy.position.set(xFactor + wanderX * 4 + particle.mx, yFactor + wanderY * 4 + particle.my, zFactor + wanderZ * 4 + particle.mx * 0.2);

            const s = 1 + Math.sin(t * 2) * 0.1;
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
            <shaderMaterial ref={materialRef} attach="material" args={[BubbleMaterial]} transparent depthWrite={false} />
        </instancedMesh>
    );
};

const CameraRig = () => {
    useFrame((state) => {
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 1.5, 0.02);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.mouse.y * 1.5, 0.02);
        state.camera.lookAt(0, 0, 0);
    });
    return null;
};

const BackgroundEnvironment = ({ isDarkMode }) => {
    return (
        <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 0, 1]}>
                <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
                <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
                <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
                <Lightformer form="ring" color="#f97316" intensity={10} scale={10} position={[-15, 4, -18]} target={[0, 0, 0]} />
            </group>
        </Environment>
    );
};

const Login3DBackground = ({ isDarkMode }) => {
    return (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <Canvas camera={{ position: [0, 0, 30], fov: 45 }} gl={{ antialias: false }}>
                <color attach="background" args={[isDarkMode ? '#121212' : '#f0f0f0']} />

                <fog attach="fog" args={[isDarkMode ? '#121212' : '#f0f0f0', 10, 60]} />

                <ambientLight intensity={isDarkMode ? 0.4 : 0.6} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#f97316" />
                <pointLight position={[-10, -10, -5]} intensity={1} color="blue" />

                <Particles count={300} isDarkMode={isDarkMode} />

                <CameraRig />

                <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} opacity={isDarkMode ? 0.8 : 0.3} />

                <BackgroundEnvironment isDarkMode={isDarkMode} />

                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={0.0}
                        luminanceSmoothing={0}
                        mipmapBlur
                        intensity={1.2} 
                    />
                    <Noise opacity={0.03} />
                    <Vignette eskil={false} offset={0.1} darkness={0.6} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};

export default Login3DBackground;
