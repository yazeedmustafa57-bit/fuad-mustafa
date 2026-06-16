import React, { useEffect, useRef } from 'react';

const Mars3DScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let mounted = true;

    const resize = () => {
      const parent = canvas.parentElement!;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      canvas.style.width = parent.clientWidth + 'px';
      canvas.style.height = parent.clientHeight + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars: { x: number; y: number; r: number; b: number; s: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 520,
        r: 0.5 + Math.random() * 1.5,
        b: 0.3 + Math.random() * 0.7,
        s: 0.2 + Math.random() * 0.5,
      });
    }

    let time = 0;

    const draw = () => {
      if (!mounted) return;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      time += 0.016;

      // === Background gradient (space) ===
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.8);
      grad.addColorStop(0, '#1a0a2e');
      grad.addColorStop(0.5, '#0d0d2b');
      grad.addColorStop(1, '#050510');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // === Stars with twinkle ===
      stars.forEach((star) => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.s * 3 + star.x);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.b * twinkle})`;
        ctx.fill();
      });

      // === Mars Surface (large arc at bottom) ===
      const marsY = h * 0.72;
      const marsR = w * 0.55;

      // Glow behind Mars
      const glowGrad = ctx.createRadialGradient(w * 0.5, marsY, 0, w * 0.5, marsY, marsR * 1.2);
      glowGrad.addColorStop(0, 'rgba(193, 68, 14, 0.15)');
      glowGrad.addColorStop(1, 'rgba(193, 68, 14, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Mars surface
      ctx.beginPath();
      ctx.arc(w * 0.5, marsY, marsR, 0, Math.PI);
      const marsGrad = ctx.createRadialGradient(w * 0.4, marsY - marsR * 0.3, 0, w * 0.5, marsY, marsR);
      marsGrad.addColorStop(0, '#e87830');
      marsGrad.addColorStop(0.3, '#c1440e');
      marsGrad.addColorStop(0.6, '#8b2e08');
      marsGrad.addColorStop(1, '#4a1a05');
      ctx.fillStyle = marsGrad;
      ctx.fill();

      // Craters on Mars
      const craters = [
        { x: 0.3, y: 1.3, r: 18 }, { x: 0.55, y: 1.25, r: 12 }, { x: 0.7, y: 1.35, r: 8 },
        { x: 0.4, y: 1.15, r: 6 }, { x: 0.6, y: 1.1, r: 10 }, { x: 0.8, y: 1.2, r: 7 },
      ];
      craters.forEach((c) => {
        const cx = w * c.x;
        const cy = marsY + marsR * (c.y - 1.4);
        ctx.beginPath();
        ctx.ellipse(cx, cy, c.r, c.r * 0.6, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy - 2, c.r * 0.8, c.r * 0.5, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,200,150,0.05)';
        ctx.fill();
      });

      // === Ground (flat area in front) ===
      ctx.beginPath();
      ctx.moveTo(0, marsY + marsR * 0.1);
      for (let x = 0; x <= w; x += 2) {
        const noise = Math.sin(x * 0.02) * 3 + Math.sin(x * 0.05) * 2 + Math.sin(x * 0.1) * 1;
        ctx.lineTo(x, marsY + marsR * 0.1 + noise + marsR * 0.05);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const groundGrad = ctx.createLinearGradient(0, marsY + marsR * 0.1, 0, h);
      groundGrad.addColorStop(0, '#5a2a10');
      groundGrad.addColorStop(1, '#2a1508');
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // Ground rocks
      for (let i = 0; i < 12; i++) {
        const rx = 40 + Math.sin(i * 1.7 + time * 0.1) * w * 0.02 + i * w * 0.08;
        const ry = marsY + marsR * 0.15 + Math.sin(i * 2.3) * 8 + 10;
        const rr = 3 + Math.sin(i * 1.1) * 2 + 3;
        ctx.beginPath();
        ctx.ellipse(rx, ry, rr, rr * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${80 + i * 5}, ${40 + i * 3}, ${20 + i * 2}, 0.6)`;
        ctx.fill();
      }

      // === Astronaut ===
      const ax = w * 0.5;
      const ay = marsY + marsR * 0.08;
      const bobY = Math.sin(time * 1.2) * 2;

      // Backpack
      ctx.fillStyle = '#888';
      ctx.fillRect(ax - 10, ay - 38 + bobY, 20, 28);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(ax - 10, ay - 38 + bobY, 20, 28);

      // Left leg
      ctx.fillStyle = '#bbb';
      ctx.beginPath();
      ctx.roundRect(ax - 14, ay - 5 + bobY, 9, 18, 3);
      ctx.fill();
      // Right leg
      ctx.beginPath();
      ctx.roundRect(ax + 5, ay - 3 + bobY, 9, 18, 3);
      ctx.fill();

      // Boots
      ctx.fillStyle = '#999';
      ctx.beginPath();
      ctx.roundRect(ax - 16, ay + 10 + bobY, 12, 5, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(ax + 4, ay + 12 + bobY, 12, 5, 2);
      ctx.fill();

      // Body (torso)
      ctx.fillStyle = '#eee';
      ctx.beginPath();
      ctx.roundRect(ax - 16, ay - 30 + bobY, 32, 30, 6);
      ctx.fill();
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Suit details
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.roundRect(ax - 10, ay - 22 + bobY, 20, 8, 3);
      ctx.fill();

      // Left arm (relaxed)
      ctx.save();
      ctx.translate(ax - 18, ay - 22 + bobY);
      ctx.rotate(0.2);
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.roundRect(0, 0, 8, 22, 3);
      ctx.fill();
      ctx.restore();

      // Right arm (waving)
      ctx.save();
      ctx.translate(ax + 16, ay - 22 + bobY);
      const waveAngle = -0.6 + Math.sin(time * 2.5) * 0.2;
      ctx.rotate(waveAngle);
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.roundRect(-3, -4, 8, 22, 3);
      ctx.fill();
      ctx.restore();

      // Glove right
      ctx.fillStyle = '#ccc';
      ctx.beginPath();
      ctx.arc(ax + 20 + Math.sin(time * 2.5) * 2, ay - 32 + bobY - Math.cos(time * 2.5) * 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Helmet
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.arc(ax, ay - 38 + bobY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Visor
      const visorGrad = ctx.createLinearGradient(ax - 6, ay - 44 + bobY, ax + 8, ay - 30 + bobY);
      visorGrad.addColorStop(0, '#4ac');
      visorGrad.addColorStop(0.5, '#6df');
      visorGrad.addColorStop(1, '#29a');
      ctx.fillStyle = visorGrad;
      ctx.beginPath();
      ctx.ellipse(ax + 2, ay - 37 + bobY, 10, 9, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Visor reflection
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(ax, ay - 40 + bobY, 6, 4, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // === Flag ===
      const flagX = w * 0.2;
      const flagBaseY = ay + 25;

      // Pole
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flagX, flagBaseY);
      ctx.lineTo(flagX, flagBaseY - 70);
      ctx.stroke();

      // Kurdistan flag
      const fw = 40, fh = 26;
      // Red stripe
      ctx.fillStyle = '#CE1126';
      ctx.fillRect(flagX, flagBaseY - 70, fw, fh / 3);
      // White stripe
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(flagX, flagBaseY - 70 + fh / 3, fw, fh / 3);
      // Green stripe
      ctx.fillStyle = '#007A3D';
      ctx.fillRect(flagX, flagBaseY - 70 + (fh / 3) * 2, fw, fh / 3);

      // Sun
      const sunCx = flagX + fw * 0.5;
      const sunCy = flagBaseY - 70 + fh * 0.5;
      const sunR = 5;

      ctx.fillStyle = '#FCD116';
      ctx.beginPath();
      ctx.arc(sunCx, sunCy, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays
      for (let i = 0; i < 21; i++) {
        const angle = (i / 21) * Math.PI * 2;
        ctx.save();
        ctx.translate(sunCx, sunCy);
        ctx.rotate(angle);
        ctx.fillStyle = '#FCD116';
        ctx.beginPath();
        ctx.moveTo(0, sunR);
        ctx.lineTo(-2, sunR + 5);
        ctx.lineTo(2, sunR + 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(draw);
    };

    // roundRect polyfill for older browsers
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      // @ts-ignore
      CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
        if (r > w / 2) r = w / 2;
        if (r > h / 2) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
      };
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      mounted = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="mars-3d-section">
      <canvas ref={canvasRef} className="mars-3d-canvas" />
      <div className="mars-3d-overlay">
        <div className="mars-3d-content">
          <div className="mars-badge">✦ 3D Experience</div>
          <h2 className="mars-title">Fuad Mustafa</h2>
          <p className="mars-subtitle">Stream & Watch Movies & TV Series</p>
        </div>
      </div>
    </section>
  );
};

export default Mars3DScene;
