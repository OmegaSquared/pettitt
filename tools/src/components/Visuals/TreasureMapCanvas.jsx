import React, { useEffect, useRef } from 'react';

const TreasureMapCanvas = ({ theme }) => {
    const canvasRef = useRef(null);
    const progressRef = useRef(0);
    const requestRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        let isVisible = false;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isVisible = entry.isIntersecting;
            if (isVisible) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(drawMap);
            } else {
                cancelAnimationFrame(requestRef.current);
                progressRef.current = 0; // Reset progress when leaving to re-trigger animation on return
            }
        }, { threshold: 0.01 });

        if (canvas) observer.observe(canvas);

        const isDark = theme === 'dark' || theme === 'dark-mode';
        const strokeColor = isDark ? 'rgba(244, 195, 102, 0.3)' : 'rgba(244, 195, 102, 0.2)';
        const accentColor = '#F4C366';

        const drawMap = () => {
            if (!isVisible) return;
            const { width, height } = canvas;
            const isMobile = width < 768;
            ctx.clearRect(0, 0, width, height);

            // 1. Compass Position (bottom-left, so the trail climbs toward the 'X')
            const compassX = 64;
            const compassY = height - 96;

            // 2. REFINED & SMOOTHED TRAJECTORY — starts low on the left and rises to the
            // 'X' near the top right, with one dip along the way (Catmull-Rom smoothed).
            const points = [
                { x: compassX + 56, y: compassY - 44 },                 // P0: Start dot, just above the compass
                { x: width * 0.28, y: height * 0.72 },                  // P1: Gentle first climb
                { x: width * 0.48, y: height * 0.80 },                  // P2: A dip (the "detour")
                { x: width * 0.70, y: height * 0.42 },                  // P3: Strong climb
                { x: width * 0.92, y: Math.max(140, height * 0.18) }    // P4: The 'X', high on the right
            ];

            // 3. Draw the 'X'
            const targetX = points[points.length - 1].x;
            const targetY = points[points.length - 1].y;

            ctx.save();
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 10;
            ctx.shadowColor = accentColor;

            const xSize = 20;
            ctx.beginPath();
            ctx.moveTo(targetX - xSize, targetY - xSize);
            ctx.lineTo(targetX + xSize, targetY + xSize);
            ctx.moveTo(targetX + xSize, targetY - xSize);
            ctx.lineTo(targetX - xSize, targetY + xSize);
            ctx.stroke();
            ctx.restore();

            // 4. Draw the Start Dot
            ctx.save();
            ctx.beginPath();
            ctx.arc(points[0].x, points[0].y, 6, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.shadowBlur = 10;
            ctx.shadowColor = accentColor;
            ctx.fill();
            ctx.restore();

            const getPointOnPath = (t) => {
                if (t <= 0) return points[0];
                if (t >= 1) return points[points.length - 1];

                const segmentCount = points.length - 1;
                const scaledT = t * segmentCount;
                const index = Math.floor(scaledT);
                const localT = scaledT - index;

                const p0 = points[Math.max(0, index - 1)];
                const p1 = points[index];
                const p2 = points[Math.min(points.length - 1, index + 1)];
                const p3 = points[Math.min(points.length - 1, index + 2)];

                // Hermite interpolation (Catmull-Rom)
                const f1 = 2 * Math.pow(localT, 3) - 3 * Math.pow(localT, 2) + 1;
                const f2 = -2 * Math.pow(localT, 3) + 3 * Math.pow(localT, 2);
                const f3 = Math.pow(localT, 3) - 2 * Math.pow(localT, 2) + localT;
                const f4 = Math.pow(localT, 3) - Math.pow(localT, 2);

                const tx1 = (p2.x - p0.x) / 2;
                const ty1 = (p2.y - p0.y) / 2;
                const tx2 = (p3.x - p1.x) / 2;
                const ty2 = (p3.y - p1.y) / 2;

                return {
                    x: p1.x * f1 + p2.x * f2 + tx1 * f3 + tx2 * f4,
                    y: p1.y * f1 + p2.y * f2 + ty1 * f3 + ty2 * f4
                };
            };

            // 5. Draw the Compass
            if (!isMobile) {
                ctx.save();
                ctx.translate(compassX, compassY);

                ctx.beginPath();
                ctx.arc(0, 0, 30, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? 'rgba(5, 8, 12, 0.98)' : 'rgba(255, 255, 255, 0.98)';
                ctx.fill();
                ctx.strokeStyle = accentColor;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
                for (let i = 0; i < 12; i++) {
                    ctx.rotate(Math.PI / 6);
                    ctx.beginPath();
                    ctx.moveTo(22, 0);
                    ctx.lineTo(27, 0);
                    ctx.stroke();
                }

                const currentPoint = getPointOnPath(progressRef.current);
                const needleAngle = Math.atan2(currentPoint.y - compassY, currentPoint.x - compassX);
                ctx.rotate(needleAngle);

                ctx.beginPath();
                ctx.moveTo(-20, 0);
                ctx.lineTo(20, 0);
                ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(20, 0);
                ctx.strokeStyle = accentColor;
                ctx.lineWidth = 4;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fillStyle = accentColor;
                ctx.fill();
                ctx.restore();
            }

            // 7. Draw the Path
            ctx.save();
            ctx.setLineDash([18, 18]);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 0; i <= progressRef.current; i += 0.001) {
                const p = getPointOnPath(i);
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.restore();

            if (progressRef.current < 1) {
                progressRef.current += 0.0012;
                if (progressRef.current > 1) progressRef.current = 1;
            }

            requestRef.current = requestAnimationFrame(drawMap);
        };

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current);
            observer.disconnect();
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="w-100 h-100 d-block"
            style={{ opacity: 1 }}
        />
    );
};

export default TreasureMapCanvas;
