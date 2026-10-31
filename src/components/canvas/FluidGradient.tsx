import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    // Multi-layer noise for organic fluid movement
    float n1 = snoise(uv * 2.0 + uTime * 0.08);
    float n2 = snoise(uv * 3.5 - uTime * 0.05 + vec2(100.0));
    float n3 = snoise(uv * 5.0 + uTime * 0.03 + vec2(200.0));
    
    float noise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 0.5 + 0.5;
    
    // Color palette: obsidian black -> acid yellow-green
    vec3 color1 = vec3(0.035, 0.035, 0.043); // #09090b
    vec3 color2 = vec3(0.05, 0.08, 0.06);    // dark teal
    vec3 color3 = vec3(0.831, 1.0, 0.0);     // #d4ff00 acid
    
    // Subtle radial gradient from center
    vec2 center = vec2(0.5, 0.5);
    float dist = length(uv - center);
    
    vec3 finalColor = mix(color1, color2, noise);
    finalColor = mix(finalColor, color3, smoothstep(0.7, 1.0, noise) * 0.12);
    
    // Darken edges
    finalColor *= smoothstep(1.2, 0.3, dist);
    
    gl_FragColor = vec4(finalColor, 0.4);
  }
`;

export const FluidGradient = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
        }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

export default FluidGradient;
