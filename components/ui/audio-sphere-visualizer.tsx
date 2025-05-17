import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface AudioSphereVisualizerProps {
  isAssistantListening: boolean;
  llmAudioElementRef?: React.RefObject<HTMLAudioElement | null>;
  onStartAssistant: () => Promise<void>; 
  onStopAssistant: () => void;
  className?: string;
  canvasClassName?: string;
}

const PARTICLE_COUNT = 75; // Number of orbiting "atoms"
const ORBIT_RADIUS_MIN = 1.0;
const ORBIT_RADIUS_MAX = 1.8;
const PARTICLE_SIZE_MIN = 0.03;
const PARTICLE_SIZE_MAX = 0.07;
const EXPANSION_FACTOR = 1.3;
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
  const visualizerSensitivity = 1.5; // Increased for particle reaction
  const palette = useMemo(() => ['#ffe600', '#ffffff', '#cccccc', '#999999'], []);

  const animationRefs = useRef<any>({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    particlesGroup: null,
    particles: [], // To store individual particle data { mesh, originalScale, originalRadius, orbitSpeed, orbitAxis, currentRadius, currentScale, lastAudioImpact }
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
    refs.camera.position.z = 4.0;

    refs.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    refs.renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
    refs.renderer.setPixelRatio(window.devicePixelRatio);
    currentContainer.appendChild(refs.renderer.domElement);

    refs.particlesGroup = new THREE.Group();
    refs.scene.add(refs.particlesGroup);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
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
      
      const originalRadius = THREE.MathUtils.randFloat(ORBIT_RADIUS_MIN, ORBIT_RADIUS_MAX);
      mesh.position.x = originalRadius; // Initial position on x-axis before rotation
      
      refs.particles.push({
        mesh,
        originalScale: new THREE.Vector3(1,1,1), // mesh.scale.clone(),
        currentScale: new THREE.Vector3(1,1,1), //mesh.scale.clone(),
        originalRadius,
        currentRadius: originalRadius,
        orbitSpeed: THREE.MathUtils.randFloat(0.2, 0.8),
        // Random normalized axis for pseudo-random orbit plane
        orbitAxis: new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize(),
        // Random initial angle on the orbit plane
        angle: Math.random() * Math.PI * 2,
        lastAudioImpact: 0, // Timestamp of last audio impact for decay
        isExpanding: false,
      });
      refs.particlesGroup.add(mesh);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    refs.scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position.set(3, 3, 3);
    refs.scene.add(pointLight);

    refs.controls = new OrbitControls(refs.camera, refs.renderer.domElement);
    refs.controls.enableZoom = false; refs.controls.enablePan = false;
    refs.controls.enableDamping = true; refs.controls.dampingFactor = 0.1;
    refs.controls.autoRotate = true; refs.controls.autoRotateSpeed = 0.3;

    let lastTime = 0;
    const animate = (time: number) => {
      refs.frameId = requestAnimationFrame(animate);
      const deltaTime = (time - lastTime) * 0.001;
      lastTime = time;

      let audioActive = false;
      let averageFrequency = 0;
      if (refs.visAnalyser && refs.visDataArray && refs.currentVisSource) {
        refs.visAnalyser.getByteFrequencyData(refs.visDataArray);
        let sum = 0;
        for (let k = 0; k < refs.visDataArray.length; k++) sum += refs.visDataArray[k];
        averageFrequency = refs.visDataArray.length > 0 ? sum / refs.visDataArray.length : 0;
        if (averageFrequency > REACTION_THRESHOLD) audioActive = true;
      }

      refs.particles.forEach((p: any) => {
        // Orbiting logic
        p.angle += p.orbitSpeed * deltaTime;
        const q = new THREE.Quaternion().setFromAxisAngle(p.orbitAxis, p.angle);
        p.mesh.position.set(p.currentRadius, 0, 0).applyQuaternion(q);

        // Audio reaction logic
        if (audioActive) {
            // Randomly decide if this particle reacts this frame or if it's already expanding
            if (p.isExpanding || Math.random() < 0.05) { // Small chance to pick new particle
                p.isExpanding = true;
                p.lastAudioImpact = time;
                const intensityFactor = Math.min(averageFrequency / 100, 1.0) * visualizerSensitivity;
                p.currentRadius = p.originalRadius * (1 + intensityFactor * (EXPANSION_FACTOR -1));
                p.currentScale.set(1 + intensityFactor, 1 + intensityFactor, 1 + intensityFactor);
            }
        } 
        
        if (p.isExpanding && (!audioActive || (time - p.lastAudioImpact > 200))) { // Decay after 200ms or if audio stops
             p.isExpanding = false; // Start decay even if audio is still going but this particle wasn't picked again
        }

        if(!p.isExpanding && (p.currentRadius !== p.originalRadius || p.currentScale.x !== p.originalScale.x)) {
            // Decay back to original state
            p.currentRadius = THREE.MathUtils.lerp(p.currentRadius, p.originalRadius, 4 * deltaTime); // Faster decay
            p.currentScale.lerp(p.originalScale, 4 * deltaTime);
            if(Math.abs(p.currentRadius - p.originalRadius) < 0.01) p.currentRadius = p.originalRadius;
            if(Math.abs(p.currentScale.x - p.originalScale.x) < 0.01) p.currentScale.copy(p.originalScale);
        }
        p.mesh.scale.copy(p.currentScale);
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
      refs.particles.forEach((p: any) => {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });
      if (refs.scene) refs.scene.clear(); // Clear scene children
      window.removeEventListener('resize', handleResize);
    };
  }, [palette]); // Only run scene setup once

  // Effect for managing audio sources (largely same as before)
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