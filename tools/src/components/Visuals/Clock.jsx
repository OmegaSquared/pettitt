import React, { useEffect, useRef } from 'react';

const Clock = ({ theme }) => {
    const canvasRef = useRef(null);
    const faceCanvasRef = useRef(null);
    const requestRef = useRef();

    const isDark = theme === 'dark-mode';

    const sectors = [
        { label: "RECOVERY", color: isDark ? "#C9D3EA" : "#7C8BB0" },
        { label: "EARLY EXP", color: isDark ? "#60A5FA" : "#3B82F6" },
        { label: "MID EXP", color: isDark ? "#3B82F6" : "#1D4ED8" },
        { label: "LATE EXP", color: isDark ? "#1E40AF" : "#1E3A8A" },
        { label: "IMMINENT", color: "#F4C366" },
        { label: "RECESSION", color: "#B91C1C" }
    ];

    const colors = {
        bg: isDark ? '#0F1F35' : '#ffffff',
        text: isDark ? '#f1f5f9' : '#0F1F35',
        accent: '#F4C366',
        blue: '#7C8BB0',
        ring: isDark ? '#94a3b8' : '#64748b',
        lines: isDark ? '#cbd5e1' : '#94a3b8',
        needleLine: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.15)',
        needleCap: isDark ? '#ffffff' : '#0F1F35',
        trueNorth: isDark ? '#ffffff' : '#0F1F35',
        red: '#ef4444',
        compassRing: isDark ? '#cbd5e1' : '#64748b'
    };

    const drawFace = (ctx, size) => {
        const cx = size / 2;
        const cy = size / 2;
        const r = (size / 2) * 0.95;

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(cx, cy);

        // Sectors
        const sectorAngle = (Math.PI * 2) / 6;
        const startOff = -Math.PI / 2;
        const outerR = r * 0.95;
        const innerR = r * 0.82;
        const textR = (outerR + innerR) / 2;

        const drawTextAlongArc = (text, radius, startAngle, sectorSize) => {
            const characters = text.split("");
            const fontSize = Math.round(r * 0.075);
            ctx.font = `700 ${fontSize}px "Outfit", sans-serif`;

            const totalWidth = ctx.measureText(text).width;
            const angularWidth = totalWidth / radius;
            const currentAngle = startAngle + (sectorSize / 2) - (angularWidth / 2);

            let accumulatedAngle = 0;
            characters.forEach((char) => {
                const charWidth = ctx.measureText(char).width;
                const charAngle = charWidth / radius;

                ctx.save();
                ctx.translate(
                    Math.cos(currentAngle + accumulatedAngle + charAngle / 2) * radius,
                    Math.sin(currentAngle + accumulatedAngle + charAngle / 2) * radius
                );
                ctx.rotate(currentAngle + accumulatedAngle + charAngle / 2 + Math.PI / 2);
                ctx.fillText(char, 0, 0);
                ctx.restore();

                accumulatedAngle += charAngle;
            });
        };

        sectors.forEach((sector, i) => {
            const start = startOff + i * sectorAngle;
            const end = start + sectorAngle;

            ctx.beginPath();
            ctx.arc(0, 0, outerR, start, end);
            ctx.arc(0, 0, innerR, end, start, true);
            ctx.closePath();
            ctx.fillStyle = sector.color + "33";
            ctx.fill();

            ctx.fillStyle = colors.text;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            drawTextAlongArc(sector.label, textR, start, sectorAngle);
        });

        // Clock Face
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = colors.compassRing;
        ctx.lineWidth = 1;
        ctx.stroke();

        const totalTicks = 300;
        for (let i = 0; i < totalTicks; i++) {
            const angle = (i * Math.PI * 2) / totalTicks;
            const isHour = i % 50 === 0;
            const isFiveMod = i % 25 === 0;
            const isSecond = i % 5 === 0;
            let len, width;

            if (isHour) {
                len = r * 0.10; width = 2.5; ctx.strokeStyle = colors.text;
            } else if (isFiveMod) {
                len = r * 0.08; width = 2; ctx.strokeStyle = colors.text;
            } else if (isSecond) {
                len = r * 0.07; width = 1.5; ctx.strokeStyle = colors.lines;
            } else {
                len = r * 0.03; width = 0.5; ctx.strokeStyle = colors.lines;
            }

            const x1 = Math.cos(angle) * r;
            const y1 = Math.sin(angle) * r;
            const x2 = Math.cos(angle) * (r - len);
            const y2 = Math.sin(angle) * (r - len);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            ctx.lineWidth = width; ctx.stroke();
        }

        // Labels
        const cardinals = [12, 3, 6, 9];
        ctx.font = `700 ${Math.round(r * 0.1)}px "Playfair Display", serif`;
        ctx.fillStyle = colors.compassRing;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        cardinals.forEach(num => {
            const a = (num / 12) * Math.PI * 2 - Math.PI / 2;
            const d = r * 0.60;
            ctx.fillText(num.toString(), Math.cos(a) * d, Math.sin(a) * d);
        });

        ctx.restore();
    };

    const drawHands = (ctx, size) => {
        const cx = size / 2;
        const cy = size / 2;
        const r = (size / 2) * 0.95;

        // Clear only the hands area if we want, but since it draws over the face canvas, 
        // we'll clear the whole main canvas
        ctx.clearRect(0, 0, size, size);

        // Draw the cached face first
        if (faceCanvasRef.current) {
            ctx.drawImage(faceCanvasRef.current, 0, 0, size, size);
        }

        ctx.save();
        ctx.translate(cx, cy);

        // Hands
        const minuteAngle = (49 / 60) * Math.PI * 2 - Math.PI / 2;
        drawHand(ctx, r * 0.88, minuteAngle, 4, colors.accent);

        const now = new Date();
        const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
        const secondAngle = (seconds / 60) * Math.PI * 2 - Math.PI / 2;
        drawHand(ctx, r * 0.92, secondAngle, 1, colors.red);

        // Center Cap
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.03, 0, Math.PI * 2);
        ctx.fillStyle = colors.text;
        ctx.fill();

        ctx.restore();
    };

    const drawHand = (ctx, len, angle, width, color) => {
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        // Create offscreen canvas for the face
        const faceCanvas = document.createElement('canvas');
        faceCanvasRef.current = faceCanvas;
        const faceCtx = faceCanvas.getContext('2d');

        let lastWidth = 0;

        const updateSize = () => {
            let size = container.offsetWidth;
            if (size === 0) size = 480;
            if (size === lastWidth) return;
            lastWidth = size;

            const dpr = window.devicePixelRatio || 1;

            // Set main canvas size
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            ctx.resetTransform();
            ctx.scale(dpr, dpr);

            // Set offscreen face canvas size
            faceCanvas.width = size * dpr;
            faceCanvas.height = size * dpr;
            faceCtx.resetTransform();
            faceCtx.scale(dpr, dpr);

            // Draw static face once
            drawFace(faceCtx, size);

            // Initial hands draw
            drawHands(ctx, size);
        };

        let isVisible = false;
        const animate = () => {
            if (!isVisible) return;
            let size = container.offsetWidth || 480;
            drawHands(ctx, size);
            requestRef.current = requestAnimationFrame(animate);
        };

        const intersectionObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isVisible = entry.isIntersecting;
            if (isVisible) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(requestRef.current);
            }
        }, { threshold: 0.01 });

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);
        intersectionObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(requestRef.current);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [theme]);

    return (
        <div id="clock-container" className="mx-auto position-relative"
            style={{
                width: '100%',
                height: 'auto',
                maxWidth: '950px',
                aspectRatio: '1/1',
                borderRadius: '50%',
                boxShadow: `0 0 100px ${isDark ? 'rgba(244, 195, 102,0.2)' : 'rgba(244, 195, 102,0.1)'}`,
                background: 'transparent'
            }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
            <style jsx>{`
                #clock-container::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 50%;
                    box-shadow: inset 0 0 40px rgba(0,0,0,0.1);
                    pointer-events: none;
                    z-index: 1;
                }
            `}</style>
        </div>
    );
};

export default Clock;
