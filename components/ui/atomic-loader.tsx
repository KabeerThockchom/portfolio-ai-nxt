"use client"

import React, { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

interface AtomicLoaderProps {
  message?: string
}

const NUCLEUS_SIZE = 0.5
const ORBITAL_COUNT = 3
const PARTICLES_PER_ORBITAL = 20
const PARTICLE_SIZE = 0.03
const ORBITAL_RADIUS_MIN = 0.8
const ORBITAL_RADIUS_MAX = 1.5

export function AtomicLoader({ message = "Loading..." }: AtomicLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const palette = useMemo(() => ['#FFE600', '#999999', '#CCCCCC'], [])

  useEffect(() => {
    if (!containerRef.current) return
    const currentContainer = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.z = 3.5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(200, 200)
    renderer.setPixelRatio(window.devicePixelRatio)
    currentContainer.appendChild(renderer.domElement)

    // Create nucleus
    const nucleusGeometry = new THREE.SphereGeometry(NUCLEUS_SIZE, 16, 16)
    const nucleusMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color('#FFE600'),
      emissive: new THREE.Color('#FFE600'),
      emissiveIntensity: 0.3,
      shininess: 100,
    })
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial)
    scene.add(nucleus)

    // Create orbitals and particles
    const orbitals: any[] = []
    const particles: any[] = []

    for (let i = 0; i < ORBITAL_COUNT; i++) {
      const orbital = new THREE.Group()
      const orbitRadius = ORBITAL_RADIUS_MIN + (ORBITAL_RADIUS_MAX - ORBITAL_RADIUS_MIN) * (i / ORBITAL_COUNT)

      // Tilt each orbital differently
      orbital.rotation.x = (Math.PI / 3) * i
      orbital.rotation.y = (Math.PI / 4) * i

      scene.add(orbital)
      orbitals.push(orbital)

      // Add particles to orbital
      for (let j = 0; j < PARTICLES_PER_ORBITAL; j++) {
        const angle = (j / PARTICLES_PER_ORBITAL) * Math.PI * 2
        const geometry = new THREE.SphereGeometry(PARTICLE_SIZE, 8, 8)
        const color = new THREE.Color(palette[i % palette.length])
        const material = new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.2,
        })
        const mesh = new THREE.Mesh(geometry, material)

        mesh.position.set(
          orbitRadius * Math.cos(angle),
          0,
          orbitRadius * Math.sin(angle)
        )

        orbital.add(mesh)
        particles.push({ mesh, orbital, angle, orbitRadius, speed: 0.3 * (i % 2 === 0 ? 1 : -1) })
      }
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1.0)
    pointLight.position.set(2, 2, 2)
    scene.add(pointLight)

    // Animation loop
    let frameId: number
    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate)

      // Gentle pulse on nucleus
      const pulseScale = 1 + Math.sin(time * 0.002) * 0.1
      nucleus.scale.set(pulseScale, pulseScale, pulseScale)

      // Rotate orbitals
      orbitals.forEach((orbital, i) => {
        orbital.rotation.z += 0.005 * (i % 2 === 0 ? 1 : -1)
      })

      renderer.render(scene, camera)
    }
    animate(0)

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId)
      currentContainer.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [palette])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <div ref={containerRef} className="w-[200px] h-[200px]" />
      <p className="mt-6 text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  )
}
