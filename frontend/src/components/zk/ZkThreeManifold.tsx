import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Sparkles, Eye, RotateCw, Layers } from "lucide-react";
import { MidnightGlyph } from "./MidnightGlyph";

export function ZkThreeManifold() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [activeGateCount, setActiveGateCount] = useState(16384);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 340;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for all 3D circuit elements
    const circuitGroup = new THREE.Group();
    scene.add(circuitGroup);

    // 1. Outer Torus Knot representing Halo2 Constraint Orbit
    const knotGeo = new THREE.TorusKnotGeometry(4.2, 0.85, 128, 32, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x6c5ce7),
      emissive: new THREE.Color(0x28156e),
      emissiveIntensity: 0.8,
      roughness: 0.25,
      metalness: 0.85,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    circuitGroup.add(knotMesh);

    // 2. Wireframe Lattice Layer
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00f2fe),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(knotGeo, wireMat);
    wireMesh.scale.set(1.03, 1.03, 1.03);
    circuitGroup.add(wireMesh);

    // 3. Inner Witness Ring (Torus)
    const innerTorusGeo = new THREE.TorusGeometry(2.4, 0.12, 16, 64);
    const innerTorusMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00ffa3),
      emissive: new THREE.Color(0x005533),
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9,
    });
    const innerRing = new THREE.Mesh(innerTorusGeo, innerTorusMat);
    innerRing.rotation.x = Math.PI / 2;
    circuitGroup.add(innerRing);

    // 4. Orbiting Witness Spheres (Commitment Nodes)
    const sphereGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const nodes: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; height: number }[] = [];
    const colors = [0x00f2fe, 0x6c5ce7, 0x00ffa3, 0xff7675, 0xffb800];

    for (let i = 0; i < 14; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colors[i % colors.length]),
        emissive: new THREE.Color(colors[i % colors.length]),
        emissiveIntensity: 1.8,
        roughness: 0.1,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      const angle = (i / 14) * Math.PI * 2;
      const radius = 5.2 + Math.sin(i * 1.5) * 0.8;
      const height = (Math.sin(i * 2.2) * 2.2);

      mesh.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      circuitGroup.add(mesh);

      nodes.push({
        mesh,
        angle,
        speed: 0.008 + (i % 3) * 0.004,
        radius,
        height,
      });
    }

    // 5. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f2fe, 2.5, 30);
    cyanLight.position.set(8, 8, 8);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x6c5ce7, 3, 30);
    purpleLight.position.set(-8, -8, 6);
    scene.add(purpleLight);

    const emeraldLight = new THREE.PointLight(0x00ffa3, 2, 20);
    emeraldLight.position.set(0, 0, 8);
    scene.add(emeraldLight);

    // Particle Cloud (ZK Witness Permutations)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    circuitGroup.add(particles);

    // Mouse Interaction Parallax
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = mouseX * 0.8;
      targetRotationX = -mouseY * 0.8;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate group
      circuitGroup.rotation.y += 0.006 * rotationSpeed;
      circuitGroup.rotation.x += 0.003 * rotationSpeed;

      // Parallax smoothing
      circuitGroup.rotation.y += (targetRotationY - circuitGroup.rotation.y) * 0.05;
      circuitGroup.rotation.x += (targetRotationX - circuitGroup.rotation.x) * 0.05;

      // Animate inner ring
      innerRing.rotation.z = time * 0.6;
      innerRing.rotation.y = time * 0.4;

      // Orbiting witness spheres
      nodes.forEach((n, idx) => {
        n.angle += n.speed * rotationSpeed;
        n.mesh.position.x = Math.cos(n.angle) * n.radius;
        n.mesh.position.z = Math.sin(n.angle) * n.radius;
        n.mesh.position.y = n.height + Math.sin(time * 2 + idx) * 0.4;
      });

      // Animate particles
      particles.rotation.y = -time * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      wireMat.dispose();
      innerTorusGeo.dispose();
      innerTorusMat.dispose();
      sphereGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [rotationSpeed]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-background/40 p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(108,92,231,0.18)]">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-cyan/20 blur-3xl" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10 shadow-[0_0_20px_rgba(0,242,254,0.35)]">
            <MidnightGlyph className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-semibold tracking-wide text-foreground">
                Midnight ZK Circuit Manifold
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal/10 px-2 py-0.5 font-mono text-[10px] text-signal">
                <span className="pulse-dot size-1.5 rounded-full bg-signal" />
                BN254 Pairings Active
              </span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Off-chain Halo2 proof synthesis · Persistent commitment topology
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRotationSpeed((s) => (s === 0 ? 1 : s === 1 ? 2.5 : 0))}
            className="glass inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-cyan/50"
            title="Toggle Manifold Velocity"
          >
            <RotateCw className="size-3.5 text-cyan" />
            {rotationSpeed === 0 ? "Paused" : rotationSpeed === 1 ? "1.0x" : "2.5x"}
          </button>
          <button
            onClick={() => setActiveGateCount((c) => (c === 16384 ? 32768 : c === 32768 ? 65536 : 16384))}
            className="glass inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-violet/50"
            title="Adjust Constraint Degree"
          >
            <Layers className="size-3.5 text-violet" />
            {activeGateCount.toLocaleString()} Gates
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative my-2 h-[340px] w-full cursor-grab active:cursor-grabbing"
      />

      {/* HUD Telemetry Footer */}
      <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5 backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Circuit Type
          </p>
          <p className="mt-0.5 font-mono text-xs font-semibold text-cyan">Halo2-BN254 (Compact)</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5 backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Witness Privacy
          </p>
          <p className="mt-0.5 font-mono text-xs font-semibold text-signal">Zero-Knowledge (128-bit)</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5 backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Commitment Scheme
          </p>
          <p className="mt-0.5 font-mono text-xs font-semibold text-violet">persistentCommit&lt;Bytes32&gt;</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5 backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Local Proof Server
          </p>
          <p className="mt-0.5 font-mono text-xs font-semibold text-primary">Docker :6300 (Active)</p>
        </div>
      </div>
    </div>
  );
}
