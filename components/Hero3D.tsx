'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {ContactShadows, Float, RoundedBox} from '@react-three/drei'
import * as THREE from 'three'

function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))))
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`
}

// Draws the front cover (gradient, label, wrapped title) onto a canvas texture. No network or font downloads.
function makeCover(title: string, color: string) {
  const c = document.createElement('canvas')
  c.width = 768; c.height = 1075
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, c.width, c.height)
  grad.addColorStop(0, color); grad.addColorStop(1, shade(color, -0.3))
  g.fillStyle = grad; g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = 'rgba(255,255,255,0.72)'; g.font = '600 34px system-ui, Arial, sans-serif'; g.fillText('PDF GUIDE', 64, 110)
  g.fillStyle = '#fff'; g.font = '700 82px system-ui, Arial, sans-serif'
  const lines: string[] = []; let cur = ''
  for (const w of title.split(' ')) {
    const t = cur ? `${cur} ${w}` : w
    if (g.measureText(t).width > c.width - 128 && cur) { lines.push(cur); cur = w } else cur = t
  }
  if (cur) lines.push(cur)
  const shown = lines.slice(0, 5)
  shown.forEach((l, i) => g.fillText(l, 64, c.height - 300 - (shown.length - 1 - i) * 92))
  g.fillRect(64, c.height - 190, 120, 12)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8
  return tex
}

function Book({title, color, image, still}: {title: string; color: string; image?: string; still: boolean}) {
  const group = useRef<THREE.Group>(null)
  const {viewport, invalidate} = useThree()
  const fallback = useMemo(() => makeCover(title, color), [title, color])
  useEffect(() => () => fallback.dispose(), [fallback])
  // Uploaded cover from Sanity, cropped to fit the cover face. Falls back to the generated cover until it loads.
  const [photo, setPhoto] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!image) { setPhoto(null); return }
    let dead = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(`${image}?w=1000&q=85`, (t) => {
      if (dead) { t.dispose(); return }
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
      const img = t.image as {width: number; height: number}
      const a = img.width / img.height, p = 1.98 / 2.78
      if (a > p) { t.repeat.x = p / a; t.offset.x = (1 - t.repeat.x) / 2 } else { t.repeat.y = a / p; t.offset.y = (1 - t.repeat.y) / 2 }
      setPhoto(t); invalidate()
    })
    return () => { dead = true }
  }, [image, invalidate])
  useEffect(() => () => photo?.dispose(), [photo])
  const map = photo ?? fallback
  const scale = Math.min(1.15, viewport.width / 3.3, viewport.height / 3.5) // fits any container size
  useFrame((state, dt) => {
    if (!group.current || still) return
    const t = state.clock.elapsedTime
    // Gentle sway plus a pointer-driven tilt, damped so it feels weighted.
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.45 + Math.sin(t * 0.6) * 0.3 + state.pointer.x * 0.4, 4, dt)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.1 - state.pointer.y * 0.2, 4, dt)
  })
  return (
    <group scale={scale}>
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.5}>
        <group ref={group} rotation={[0.1, -0.45, 0]}>
          <RoundedBox args={[2, 2.8, 0.1]} radius={0.03} smoothness={4} position={[0, 0, -0.12]}><meshStandardMaterial color={color} roughness={0.5} /></RoundedBox>
          <RoundedBox args={[1.92, 2.7, 0.2]} radius={0.01} smoothness={2}><meshStandardMaterial color="#F3EFE6" roughness={0.9} /></RoundedBox>
          <RoundedBox args={[2, 2.8, 0.1]} radius={0.03} smoothness={4} position={[0, 0, 0.12]}><meshStandardMaterial color={color} roughness={0.5} /></RoundedBox>
          <mesh position={[0, 0, 0.171]}><planeGeometry args={[1.98, 2.78]} /><meshStandardMaterial map={map} roughness={0.45} /></mesh>
        </group>
      </Float>
      <ContactShadows position={[0, -1.95, 0]} opacity={0.22} scale={7} blur={2.8} far={4} />
    </group>
  )
}

export default function Hero3D({title, color, image, still, paused}: {title: string; color: string; image?: string; still: boolean; paused: boolean}) {
  return (
    <Canvas frameloop={still ? 'demand' : paused ? 'never' : 'always'} dpr={[1, 1.5]} camera={{position: [0, 0, 7], fov: 35}} gl={{antialias: true, powerPreference: 'high-performance'}}>
      <hemisphereLight args={['#ffffff', '#b9c0ff', 0.9]} />
      <directionalLight position={[3, 4, 5]} intensity={1.7} />
      <directionalLight position={[-4, 2, -2]} intensity={0.6} color="#9fb0ff" />
      <Book title={title} color={color} image={image} still={still} />
    </Canvas>
  )
}