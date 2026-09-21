import React, { useEffect, useRef } from 'react';

const MatrixBackground = ({ theme }) => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: 0, y: 0, active: false });

    const isDark = theme === 'dark-mode';
    const colorPrimary = isDark ? '37, 94, 168' : '37, 94, 168'; // PETTITT WEALTH Blue
    const colorAccent = isDark ? '232, 122, 48' : '232, 122, 48'; // PETTITT WEALTH Orange

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles.current = [];
            const count = Math.min(window.innerWidth / 10, 100);
            for (let i = 0; i < count; i++) {
                particles.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: Math.random() > 0.5 ? colorPrimary : colorAccent
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.current.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                if (mouse.current.active) {
                    const dx = mouse.current.x - p.x;
                    const dy = mouse.current.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        p.x += dx * 0.01;
                        p.y += dy * 0.01;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                const opacity = isDark ? 0.3 : 0.15;
                ctx.fillStyle = `rgba(${p.color}, ${opacity})`;
                ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < particles.current.length; j++) {
                    const p2 = particles.current[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const lineOpacity = (1 - dist / 150) * (isDark ? 0.15 : 0.08);
                        ctx.strokeStyle = `rgba(${p.color}, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            animationFrame = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, [isDark]);

    return (
        <canvas
            ref={canvasRef}
            onMouseMove={(e) => {
                mouse.current = { x: e.clientX, y: e.clientY, active: true };
            }}
            onMouseLeave={() => {
                mouse.current.active = false;
            }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0.8
            }}
        />
    );
};

export default MatrixBackground;
