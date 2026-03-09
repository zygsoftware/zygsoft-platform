"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, PerspectiveCamera, Environment, ContactShadows, Float as DreiFloat } from "@react-three/drei";
import * as THREE from "three";

function AbstractShape({ position, color, speed = 1, distort = 0.3, radius = 1 }: any) {
    return (
        <DreiFloat speed={speed * 2} rotationIntensity={2} floatIntensity={2} position={position}>
            <mesh>
                <sphereGeometry args={[radius, 64, 64]} />
                <MeshDistortMaterial color={color} speed={speed} distort={distort} roughness={0} metalness={1} />
            </mesh>
        </DreiFloat>
    );
}

function GlassPanel({ position, scale, rotation }: any) {
    return (
        <DreiFloat speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={position}>
            <mesh rotation={rotation} scale={scale}>
                <boxGeometry args={[1, 1, 0.05]} />
                <meshPhysicalMaterial
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                    metalness={0.8}
                    transmission={0.9}
                    thickness={0.5}
                    envMapIntensity={1}
                    color="#ffffff"
                />
            </mesh>
        </DreiFloat>
    );
}

function Grid({ size = 20, divisions = 20 }) {
    return (
        <gridHelper
            args={[size, divisions, 0xe6c800, 0xeeeeee]}
            position={[0, -2, 0]}
            rotation={[0, 0, 0]}
            transparent
            opacity={0.1}
        />
    );
}

function Connections({ count = 10 }) {
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < count; i++) {
            p.push(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
        }
        return p;
    }, [count]);

    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }, [points]);

    return (
        <lineSegments>
            <bufferGeometry attach="geometry" {...lineGeometry} />
            <lineBasicMaterial attach="material" color="#e6c800" transparent opacity={0.2} />
        </lineSegments>
    );
}

function SceneContent() {
    const { mouse } = useThree();
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.05);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.1, 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#e6c800" />

            {/* Central Tech Core */}
            <AbstractShape position={[0, 0, 0]} color="#e6c800" speed={1.5} distort={0.4} radius={1.2} />

            {/* Floating System Modules (Glass Panels) */}
            <GlassPanel position={[-2.5, 1.5, 1]} scale={[1.8, 1.2, 1]} rotation={[0.2, 0.4, 0]} />
            <GlassPanel position={[3, -1, 2]} scale={[1.5, 1.5, 1]} rotation={[-0.3, -0.5, 0.1]} />
            <GlassPanel position={[-1, -2, -1]} scale={[2, 1, 1]} rotation={[0.1, -0.2, -0.1]} />
            <GlassPanel position={[2, 2, -2]} scale={[1.2, 1.8, 1]} rotation={[-0.1, 0.3, 0.2]} />

            {/* Orbiting Nodes */}
            <AbstractShape position={[-4, -1, -3]} color="#0a0c10" speed={0.8} distort={0.2} radius={0.4} />
            <AbstractShape position={[4, 3, -1]} color="#0a0c10" speed={1.2} distort={0.3} radius={0.3} />

            <Connections count={20} />
            <Grid />
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
        </group>
    );
}

export function HeroScene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
                <SceneContent />
            </Canvas>
        </div>
    );
}
