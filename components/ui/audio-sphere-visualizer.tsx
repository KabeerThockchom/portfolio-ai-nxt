import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface AudioSphereVisualizerProps {
  isAssistantListening: boolean;
  llmAudioElementRef?: React.RefObject<HTMLAudioElement | null>;
  onStartAssistant: () => Promise<void>; 
  onStopAssistant: () => void;
  className?: string;
  canvasClassName?: string;
}

const NUCLEUS_SIZE = 0.8;
const NUCLEUS_PARTICLES = 1;
const ORBITAL_COUNT = 5;
const PARTICLES_PER_ORBITAL = 35;
const PARTICLE_SIZE_MIN = 0.04;
const PARTICLE_SIZE_MAX = 0.09;
const ORBITAL_RADIUS_MIN = 1.2;
const ORBITAL_RADIUS_MAX = 2.5;
const ORBITAL_THICKNESS = 0.25;
const EXPANSION_FACTOR = 1.5;
const REACTION_THRESHOLD = 15; // Audio level to trigger reaction

const AudioSphereVisualizer: React.FC<AudioSphereVisualizerProps> = ({
  isAssistantListening,
  llmAudioElementRef,
  onStartAssistant,
  onStopAssistant,
  className = "flex flex-col items-center justify-center",
  canvasClassName = "w-20 h-20 md:w-24 md:h-24", 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const visualizerSensitivity = 1.8;
  const palette = useMemo(() => ['#6366F1', '#8B87FF', '#A5A2FF', '#47befb', '#FFFFFF'], []);
  const nucleusPalette = useMemo(() => ['#6366F1', '#8B87FF', '#47befb'], []);

  const animationRefs = useRef<any>({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    nucleus: null,
    orbitals: [],
    particles: [],
    frameId: null,
    visAudioContext: null,
    visAnalyser: null,
    visDataArray: null,
    currentVisSource: null,
    mediaStreamForMic: null,
    llmSourceNode: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const currentContainer = containerRef.current;
    const refs = animationRefs.current;

    refs.scene = new THREE.Scene();
    refs.camera = new THREE.PerspectiveCamera(60, currentContainer.clientWidth / currentContainer.clientHeight, 0.1, 100);
    refs.camera.position.z = 5.5;
    
    refs.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    refs.renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
    refs.renderer.setPixelRatio(window.devicePixelRatio);
    currentContainer.appendChild(refs.renderer.domElement);

    // Create nucleus (center of atom)
    refs.nucleus = new THREE.Group();
    refs.scene.add(refs.nucleus);
    
    // Add particles to represent the nucleus
    for (let i = 0; i < NUCLEUS_PARTICLES; i++) {
      const particleSize = THREE.MathUtils.randFloat(NUCLEUS_SIZE * 0.2, NUCLEUS_SIZE * 0.4);
      const geometry = new THREE.SphereGeometry(particleSize, 8, 8);
      const color = new THREE.Color(nucleusPalette[Math.floor(Math.random() * nucleusPalette.length)]);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.7,
        shininess: 50,
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position randomly within nucleus radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = NUCLEUS_SIZE * Math.random() * 0.7;
      
      mesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      
      refs.nucleus.add(mesh);
    }
    
    // Create orbital paths
    for (let i = 0; i < ORBITAL_COUNT; i++) {
      const orbital = new THREE.Group();
      refs.scene.add(orbital);
      refs.orbitals.push(orbital);
      
      // Determine this orbital's properties
      const orbitRadius = THREE.MathUtils.lerp(ORBITAL_RADIUS_MIN, ORBITAL_RADIUS_MAX, i / (ORBITAL_COUNT - 1));
      const orbitAxis = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();
      
      // Apply a random rotation to the orbital path
      orbital.setRotationFromAxisAngle(orbitAxis, Math.random() * Math.PI * 2);
      
      // Create particles for this orbital
      for (let j = 0; j < PARTICLES_PER_ORBITAL; j++) {
        const particleSize = THREE.MathUtils.randFloat(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX);
        const geometry = new THREE.SphereGeometry(particleSize, 8, 8);
        const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
        const material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.6,
          shininess: 50,
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Calculate position on the orbital ring with some variance to create a thickness
        const angle = (j / PARTICLES_PER_ORBITAL) * Math.PI * 2;
        const radialOffset = THREE.MathUtils.randFloatSpread(ORBITAL_THICKNESS);
        const heightOffset = THREE.MathUtils.randFloatSpread(ORBITAL_THICKNESS);
        
        // Place in orbital
        mesh.position.set(
          (orbitRadius + radialOffset) * Math.cos(angle),
          heightOffset,
          (orbitRadius + radialOffset) * Math.sin(angle)
        );
        
        orbital.add(mesh);
        
        // Store particle data for animation
        refs.particles.push({
          mesh,
          orbital,
          orbitRadius: orbitRadius + radialOffset,
          orbitSpeed: THREE.MathUtils.randFloat(0.3, 0.8) * (i % 2 === 0 ? 1 : -1), // Alternate directions
          angle,
          originalScale: new THREE.Vector3(1, 1, 1),
          currentScale: new THREE.Vector3(1, 1, 1),
          lastAudioImpact: 0,
          isExpanding: false,
        });
      }
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    refs.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(3, 3, 3);
    refs.scene.add(pointLight);

    // Setup orbit controls
    refs.controls = new OrbitControls(refs.camera, refs.renderer.domElement);
    refs.controls.enableZoom = false;
    refs.controls.enablePan = false;
    refs.controls.enableDamping = true;
    refs.controls.dampingFactor = 0.1;
    refs.controls.autoRotate = true;
    refs.controls.autoRotateSpeed = 0.5;

    let lastTime = 0;
    const animate = (time: number) => {
      refs.frameId = requestAnimationFrame(animate);
      const deltaTime = (time - lastTime) * 0.001;
      lastTime = time;

      // Get audio data if available
      let audioActive = false;
      let averageFrequency = 0;
      if (refs.visAnalyser && refs.visDataArray && refs.currentVisSource) {
        refs.visAnalyser.getByteFrequencyData(refs.visDataArray);
        let sum = 0;
        for (let k = 0; k < refs.visDataArray.length; k++) sum += refs.visDataArray[k];
        averageFrequency = refs.visDataArray.length > 0 ? sum / refs.visDataArray.length : 0;
        if (averageFrequency > REACTION_THRESHOLD) audioActive = true;
      }

      // Gently pulse the nucleus
      if (refs.nucleus) {
        const pulseScale = 1 + Math.sin(time * 0.001) * 0.05;
        refs.nucleus.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Make nucleus more vibrant on audio
        if (audioActive) {
          const intensityFactor = Math.min(averageFrequency / 100, 1.0) * 0.3;
          refs.nucleus.scale.set(pulseScale + intensityFactor, pulseScale + intensityFactor, pulseScale + intensityFactor);
        }
      }

      // Animate orbital particles
      refs.particles.forEach((p: any) => {
        // Update position on orbital path
        p.angle += p.orbitSpeed * deltaTime;
        p.mesh.position.x = p.orbitRadius * Math.cos(p.angle);
        p.mesh.position.z = p.orbitRadius * Math.sin(p.angle);

        // Audio reaction
        if (audioActive) {
          // Randomly decide if this particle reacts or if it's already expanding
          if (p.isExpanding || Math.random() < 0.05) {
            p.isExpanding = true;
            p.lastAudioImpact = time;
            const intensityFactor = Math.min(averageFrequency / 100, 1.0) * visualizerSensitivity;
            p.currentScale.set(1 + intensityFactor, 1 + intensityFactor, 1 + intensityFactor);
          }
        }
        
        // Decay after time or if audio stops
        if (p.isExpanding && (!audioActive || (time - p.lastAudioImpact > 200))) {
          p.isExpanding = false;
        }

        // Gradually return to original scale
        if (!p.isExpanding && p.currentScale.x !== p.originalScale.x) {
          p.currentScale.lerp(p.originalScale, 4 * deltaTime);
          if (Math.abs(p.currentScale.x - p.originalScale.x) < 0.01) {
            p.currentScale.copy(p.originalScale);
          }
        }
        
        p.mesh.scale.copy(p.currentScale);
      });
      
      // Update orbitals
      refs.orbitals.forEach((orbital: THREE.Group, i: number) => {
        orbital.rotation.x += deltaTime * 0.1 * (i % 2 === 0 ? 1 : -1);
        orbital.rotation.y += deltaTime * 0.15;
      });
      
      refs.controls.update();
      refs.renderer.render(refs.scene, refs.camera);
    };
    animate(0);

    const handleResize = () => {
      if (!currentContainer || !refs.camera || !refs.renderer) return;
      refs.camera.aspect = currentContainer.clientWidth / currentContainer.clientHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (refs.frameId) cancelAnimationFrame(refs.frameId);
      if (refs.controls) refs.controls.dispose();
      if (refs.renderer && currentContainer.contains(refs.renderer.domElement)) {
        currentContainer.removeChild(refs.renderer.domElement);
      }
      if (refs.renderer) refs.renderer.dispose();
      
      // Clean up all meshes
      refs.particles.forEach((p: any) => {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });
      
      if (refs.nucleus) {
        refs.nucleus.children.forEach((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
      
      if (refs.scene) refs.scene.clear();
      window.removeEventListener('resize', handleResize);
    };
  }, [palette, nucleusPalette]);

  // Audio infrastructure (same as before)
  useEffect(() => {
    const refs = animationRefs.current;
    const initBaseAudioInfra = async () => {
        if (!userHasInteracted || !animationRefs.current) return false;
        const refs = animationRefs.current;
        if (!refs.visAudioContext) {
            try {
                refs.visAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                refs.visAnalyser = refs.visAudioContext.createAnalyser();
                refs.visAnalyser.fftSize = 128;
                refs.visDataArray = new Uint8Array(refs.visAnalyser.frequencyBinCount);
            } catch (e) { console.error("Audio Infra Fail:", e); return false; }
        }
        if (refs.visAudioContext.state === 'suspended') await refs.visAudioContext.resume();
        return true;
    };
    const disconnectCurrentSource = () => {
        const refs = animationRefs.current;
        if (refs.currentVisSource) { refs.currentVisSource.disconnect(); refs.currentVisSource = null; }
        if (refs.mediaStreamForMic) { refs.mediaStreamForMic.getTracks().forEach((t:any) => t.stop()); refs.mediaStreamForMic = null; }
    };
    const setupMicSource = async () => {
        const refs = animationRefs.current;
        disconnectCurrentSource();
        if (!refs.visAudioContext || !refs.visAnalyser) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            refs.mediaStreamForMic = stream;
            const source = refs.visAudioContext.createMediaStreamSource(stream);
            source.connect(refs.visAnalyser);
            refs.currentVisSource = source;
        } catch (e) { console.error("Mic Source Fail:", e); }
    };
    const setupLlmSource = () => {
        const refs = animationRefs.current;
        disconnectCurrentSource();
        if (!refs.visAudioContext || !refs.visAnalyser || !llmAudioElementRef?.current) return;
        if (!refs.llmSourceNode) {
            try { refs.llmSourceNode = refs.visAudioContext.createMediaElementSource(llmAudioElementRef.current); }
            catch (e) { console.error("LLM Source Node Fail:", e); return; }
        }
        try {
            refs.llmSourceNode.connect(refs.visAnalyser);
            refs.currentVisSource = refs.llmSourceNode;
        } catch (e) { console.error("LLM Connect Fail:", e); if(refs.llmSourceNode) refs.llmSourceNode.disconnect(); refs.currentVisSource = null; }
    };

    const manageAudioSources = async () => {
      if (!(await initBaseAudioInfra())) return;
      if (isAssistantListening) await setupMicSource();
      else if (llmAudioElementRef?.current) setupLlmSource();
      else disconnectCurrentSource();
    };
    manageAudioSources();
    return () => {
        disconnectCurrentSource();
        const refs = animationRefs.current;
        if(refs.llmSourceNode && refs.visAnalyser) { try { refs.llmSourceNode.disconnect(refs.visAnalyser); } catch(e){}}
    };
  }, [isAssistantListening, userHasInteracted, llmAudioElementRef]);
  
  const handleInteraction = async () => {
    setUserHasInteracted(true); 
    if (isAssistantListening) onStopAssistant();
    else onStartAssistant();
  };

  return (
    <div className={className} onClick={handleInteraction} style={{ cursor: 'pointer' }}>
      <div ref={containerRef} className={canvasClassName}></div>
    </div>
  );
};

export default AudioSphereVisualizer; 