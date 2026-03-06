import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Geometry, Program, Mesh, Color } from 'ogl';
import './Prism.css';

export default function Prism() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 5);

    const scene = new Transform();

    const vertex = `
      attribute vec3 position;
      attribute vec3 normal;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragment = `
      precision highp float;
      varying vec3 vNormal;
      uniform vec3 uColor;
      void main() {
        float lighting = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)));
        gl_FragColor = vec4(uColor * (0.5 + 0.5 * lighting), 0.1);
      }
    `;

    const geometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array([-1, -1, 1, 1, -1, 1, 0, 1, 0, -1, -1, -1, 1, -1, -1, 0, 1, 0]) },
      normal: { size: 3, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1]) },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uColor: { value: new Color('#10b981') },
      },
      transparent: true,
    });

    const meshes: Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const mesh = new Mesh(gl, { geometry, program });
      mesh.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.set(0.5 + Math.random());
      scene.addChild(mesh);
      meshes.push(mesh);
    }

    function resize() {
      if (!containerRef.current) return;
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    }

    window.addEventListener('resize', resize);
    resize();

    let request: number;
    function update(t: number) {
      request = requestAnimationFrame(update);
      meshes.forEach((mesh, i) => {
        mesh.rotation.y += 0.01 * (i + 1);
        mesh.rotation.x += 0.005;
      });
      renderer.render({ scene, camera });
    }
    request = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(request);
      if (containerRef.current && gl.canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, []);

  return <div ref={containerRef} className="prism-container" />;
}
