import React, { useEffect, useRef } from 'react';

export const ParticleBackground3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let width = (canvas.width = window.innerWidth || 1280);
      let height = (canvas.height = window.innerHeight || 720);

      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth || 1280;
        height = canvas.height = window.innerHeight || 720;
      };
      window.addEventListener('resize', handleResize);

      const numParticles = Math.min(Math.floor(width / 20), 50);
      const particles: Array<{
        x: number;
        y: number;
        z: number;
        vx: number;
        vy: number;
        vz: number;
        radius: number;
        color: string;
      }> = [];

      const colors = ['#38bdf8', '#818cf8', '#34d399'];

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width,
          y: (Math.random() - 0.5) * height,
          z: Math.random() * 600 + 100,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          vz: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          color: colors[i % colors.length],
        });
      }

      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX - width / 2) * 0.03;
        mouseY = (e.clientY - height / 2) * 0.03;
      };
      window.addEventListener('mousemove', handleMouseMove);

      const render = () => {
        try {
          ctx.clearRect(0, 0, width, height);
          const fov = 400;
          const centerX = width / 2 + mouseX;
          const centerY = height / 2 + mouseY;

          for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.x += p1.vx;
            p1.y += p1.vy;
            p1.z += p1.vz;

            if (p1.x < -width / 2 || p1.x > width / 2) p1.vx *= -1;
            if (p1.y < -height / 2 || p1.y > height / 2) p1.vy *= -1;
            if (p1.z < 100 || p1.z > 700) p1.vz *= -1;

            const scale1 = fov / (fov + p1.z);
            const x1 = p1.x * scale1 + centerX;
            const y1 = p1.y * scale1 + centerY;

            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const scale2 = fov / (fov + p2.z);
              const x2 = p2.x * scale2 + centerX;
              const y2 = p2.y * scale2 + centerY;

              const dx = x1 - x2;
              const dy = y1 - y2;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 100) {
                const alpha = (1 - dist / 100) * 0.2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }

            const projectedRadius = Math.max(1, p1.radius * scale1 * 2);
            ctx.beginPath();
            ctx.arc(x1, y1, projectedRadius, 0, Math.PI * 2);
            ctx.fillStyle = p1.color;
            ctx.fill();
          }

          animationFrameId = requestAnimationFrame(render);
        } catch {
          // Ignore render loop errors safely
        }
      };

      render();

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
      };
    } catch {
      // Safe fallback if canvas fails
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  );
};
