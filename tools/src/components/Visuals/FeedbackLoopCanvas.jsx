import React, { useRef, useEffect } from 'react';

const FeedbackLoopCanvas = ({ theme }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, centerX, centerY, radius, innerR, loopSpacing;

        const resize = () => {
            const container = canvas.parentElement;
            width = container.clientWidth;
            height = 550;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            centerX = width / 2;
            centerY = height / 2;

            // Reverting to optimized stable dimensions (Point Tangency)
            radius = 145;
            innerR = radius * 0.78;
            // Perfectly tangent point of contact
            loopSpacing = radius * 2.0;
        };

        const drawArrow = (ax, ay, angle, color) => {
            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(-14, -12);
            ctx.lineTo(14, 0);
            ctx.lineTo(-14, 12);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        };

        const drawQuadrants = (x, y) => {
            const dq = innerR;

            const drawQuadrant = (startAngle, endAngle, color, pillarLabel) => {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.arc(x, y, dq, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = '500 12px "Inter", sans-serif';
                ctx.textAlign = 'center';
                const textAngle = startAngle + (endAngle - startAngle) / 2;
                const textR = dq * 0.55;
                ctx.fillText(pillarLabel, x + Math.cos(textAngle) * textR, y + Math.sin(textAngle) * textR + 4);
            };

            drawQuadrant(-Math.PI, -Math.PI / 2, 'rgba(160, 160, 160, 0.9)', 'Income');
            drawQuadrant(-Math.PI / 2, 0, 'rgba(45, 95, 150, 0.95)', 'Consumption');
            drawQuadrant(0, Math.PI / 2, 'rgba(215, 105, 50, 0.95)', 'Production');
            drawQuadrant(Math.PI / 2, Math.PI, 'rgba(100, 100, 100, 0.9)', 'Employment');
        };

        let isVisible = false;
        const animate = () => {
            if (!isVisible) return;
            ctx.clearRect(0, 0, width, height);

            const leftCenterX = centerX - loopSpacing / 2;
            const rightCenterX = centerX + loopSpacing / 2;

            // Z-Order: Right underneath, Left high Z-index

            // 1. Right Loop (Contraction Orange)
            drawQuadrants(rightCenterX, centerY);
            ctx.beginPath();
            ctx.arc(rightCenterX, centerY, radius, 0, Math.PI * 2, false);
            ctx.strokeStyle = 'rgba(215, 105, 50, 0.9)';
            ctx.lineWidth = 24;
            ctx.stroke();

            // 2. Left Loop (Expansion Blue)
            drawQuadrants(leftCenterX, centerY);
            ctx.beginPath();
            ctx.arc(leftCenterX, centerY, radius, 0, Math.PI * 2, false);
            ctx.strokeStyle = 'rgba(45, 95, 150, 1.0)';
            ctx.lineWidth = 24;
            ctx.stroke();

            // 3. Central Glow / Inflection Point
            ctx.beginPath();
            const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 45);
            glow.addColorStop(0, 'rgba(255,255,255,1)');
            glow.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = glow;
            ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.font = '700 15px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Inflection Point', centerX, centerY + 95);

            // 4. Headers
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '500 32px "Playfair Display", serif';
            ctx.fillText('Expansion', leftCenterX, centerY - radius - 55);
            ctx.fillText('Contraction', rightCenterX, centerY - radius - 55);

            // 5. Animated Arrows - Unified Clockwise Flow
            const time = Date.now() * 0.002;
            const currentAngle = time % (Math.PI * 2);

            // Left Arrow
            const lx = leftCenterX + Math.cos(currentAngle) * radius;
            const ly = centerY + Math.sin(currentAngle) * radius;
            drawArrow(lx, ly, currentAngle + Math.PI / 2, '#64b4ff');

            // Right Arrow
            const rx = rightCenterX + Math.cos(currentAngle) * radius;
            const ry = centerY + Math.sin(currentAngle) * radius;
            drawArrow(rx, ry, currentAngle + Math.PI / 2, '#ff9664');

            requestRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (!isVisible) {
                    isVisible = true;
                    animate();
                }
            } else {
                isVisible = false;
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
            }
        }, { threshold: 0.05 });
        
        observer.observe(canvas);

        return () => {
            window.removeEventListener('resize', resize);
            observer.disconnect();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div className="feedback-loop-canvas-wrapper w-100 position-relative py-5">
            <canvas
                ref={canvasRef}
                style={{ display: 'block', margin: '0 auto' }}
            />
        </div>
    );
};

export default FeedbackLoopCanvas;
