import React, { useEffect, useRef, useState } from 'react';

const Compass = ({ theme }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const isDark = theme === 'dark-mode';

    const state = useRef({
        angle: 0,
        targetAngle: 0,
        lastInputTime: Date.now(),
        isIdle: false,
        isLocked: false
    });

    const services = [
        "Estate Planning",
        "Retirement Analysis",
        "Retirement Planning",
        "Investments",
        "Risk Management",
        "Special Situations"
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

    const handleInput = (x) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const centerX = rect.left + width / 2;
        const delta = x - centerX;
        const normalized = delta / (width / 2);
        state.current.targetAngle = normalized * Math.PI;
        state.current.lastInputTime = Date.now();
        state.current.isIdle = false;
    };

    const draw = (ctx, size) => {
        const cx = size / 2;
        const cy = size / 2;
        const r = (size / 2) * 0.95;

        if (Date.now() - state.current.lastInputTime > 500) {
            state.current.isIdle = true;
            state.current.targetAngle = 0;
        }

        const speed = state.current.isIdle ? 0.01 : 0.04;
        state.current.angle += (state.current.targetAngle - state.current.angle) * speed;

        const snapThreshold = 0.05;
        if (Math.abs(state.current.angle) < snapThreshold && Math.abs(state.current.targetAngle) < 0.01) {
            state.current.isLocked = true;
        } else {
            state.current.isLocked = false;
        }

        ctx.clearRect(0, 0, size, size);
        let pulse = 1;
        if (state.current.isLocked && Math.abs(state.current.angle) < 0.01) {
            pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
        }

        ctx.save();
        ctx.translate(cx, cy);

        ctx.beginPath();
        ctx.moveTo(0, -r + 5);
        ctx.lineTo(-6, -r - 15);
        ctx.lineTo(6, -r - 15);
        ctx.closePath();
        ctx.fillStyle = colors.red;
        ctx.fill();

        ctx.save();
        ctx.rotate(-state.current.angle);
        drawDegreeScale(ctx, r);
        drawDirections(ctx, r * 0.72, pulse);
        drawCompassNeedle(ctx, r * 0.55);
        drawServices(ctx, r);
        drawProcessSteps(ctx, r * 0.98);
        ctx.restore();

        if (state.current.isLocked && Math.abs(state.current.angle) < 0.01) {
            const textOffset = r * 0.12;
            ctx.textAlign = 'left';
            ctx.font = `700 ${Math.round(r * 0.06)}px "Outfit", sans-serif`;
            ctx.fillStyle = colors.trueNorth;
            ctx.fillText("TRUE NORTH", textOffset, -r * 0.02);
            ctx.font = `600 ${Math.round(r * 0.04)}px "Outfit", sans-serif`;
            ctx.fillStyle = colors.accent;
            ctx.fillText("ON TARGET", textOffset, r * 0.06);
        }
        ctx.restore();
    };

    const drawDegreeScale = (ctx, r) => {
        for (let i = 0; i < 360; i++) {
            const angle = (i * Math.PI) / 180 - Math.PI / 2;
            let len = 5;
            let width = 0.5;
            if (i % 10 === 0) { len = 10; width = 1; }
            if (i % 90 === 0) { len = 15; width = 2; }
            const x1 = Math.cos(angle) * r;
            const y1 = Math.sin(angle) * r;
            const x2 = Math.cos(angle) * (r - len);
            const y2 = Math.sin(angle) * (r - len);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = colors.lines;
            ctx.lineWidth = width;
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = colors.ring;
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    const drawDirections = (ctx, r, pulse) => {
        const dirs = ["N", "E", "S", "W"];
        ctx.font = `700 ${Math.round(r * 0.09)}px "Playfair Display", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        dirs.forEach((dir, i) => {
            const angle = (i * Math.PI / 2) - Math.PI / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            if (dir === 'N') {
                ctx.fillStyle = colors.red;
                ctx.scale(pulse, pulse);
            } else {
                ctx.fillStyle = colors.text;
            }
            ctx.fillText(dir, 0, 0);
            ctx.restore();
        });
    };

    const drawCompassNeedle = (ctx, r) => {
        const w = r * 0.04;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-w, 0); ctx.lineTo(0, -r); ctx.lineTo(w, 0);
        ctx.fillStyle = 'rgba(194, 65, 12, 0.85)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-w, 0); ctx.lineTo(0, r); ctx.lineTo(w, 0);
        ctx.fillStyle = 'rgba(30, 58, 138, 0.85)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.07, 0, Math.PI * 2);
        ctx.fillStyle = colors.needleCap;
        ctx.fill();
        ctx.restore();
    };

    const drawServices = (ctx, r) => {
        const count = services.length;
        const step = (Math.PI * 2) / count;
        const outerBandR = r * 0.93;
        const innerBandR = r * 0.83;
        const textRadius = (outerBandR + innerBandR) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, outerBandR, Math.PI / 2, 3 * Math.PI / 2);
        ctx.arc(0, 0, innerBandR, 3 * Math.PI / 2, Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, outerBandR, -Math.PI / 2, Math.PI / 2);
        ctx.arc(0, 0, innerBandR, Math.PI / 2, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(244, 195, 102, 0.2)';
        ctx.fill();
        services.forEach((service, i) => {
            const startAngle = i * step - Math.PI / 2 - step / 2;
            const midAngle = startAngle + step / 2;
            ctx.save();
            ctx.font = `700 ${Math.round(r * 0.06)}px "Outfit", sans-serif`;
            ctx.fillStyle = colors.text;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            drawTextAlongArc(ctx, service.toUpperCase(), midAngle, textRadius);
            ctx.restore();
        });
    };

    const drawProcessSteps = (ctx, r) => {
        const count = 7;
        const step = (Math.PI * 2) / count;
        ctx.font = `italic 600 ${Math.round(r * 0.04)}px "Outfit", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < count; i++) {
            const angle = i * step - Math.PI / 2 + step / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            ctx.fillStyle = isDark ? 'rgba(244, 195, 102,0.4)' : 'rgba(244, 195, 102,0.3)';
            ctx.fillText(`${i + 1}`, x, y);

            // Faint outer dash
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * (r - 10), Math.sin(angle) * (r - 10));
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            ctx.strokeStyle = 'rgba(244, 195, 102,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    };

    const drawTextAlongArc = (ctx, str, angle, radius) => {
        const len = str.length;
        const s = 1.03;
        let totalAngle = 0;
        for (let i = 0; i < len; i++) {
            totalAngle += (ctx.measureText(str[i]).width / radius) * s;
        }
        ctx.rotate(angle - totalAngle / 2);
        for (let i = 0; i < len; i++) {
            const ch = str[i];
            const w = ctx.measureText(ch).width;
            const wAngle = (w / radius) * s;
            ctx.save();
            ctx.rotate(wAngle / 2);
            ctx.translate(0, -radius);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
            ctx.rotate(wAngle);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        let isVisible = false;

        const updateSize = () => {
            let size = container.offsetWidth;
            if (size === 0) size = 480;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            ctx.resetTransform();
            ctx.scale(dpr, dpr);
            draw(ctx, size);
        };

        const animate = () => {
            if (!isVisible) return;
            let size = container.offsetWidth || 480;
            draw(ctx, size);
            requestRef.current = requestAnimationFrame(animate);
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);

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

        intersectionObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(requestRef.current);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [theme]);

    return (
        <div id="compass-container" className="mx-auto position-relative"
            onMouseMove={(e) => handleInput(e.clientX)}
            onTouchMove={(e) => handleInput(e.touches[0].clientX)}
            style={{
                width: '100%',
                height: 'auto',
                maxWidth: '950px',
                aspectRatio: '1/1',
                filter: 'drop-shadow(0 0 120px rgba(124, 139, 176,0.4)) drop-shadow(0 0 40px rgba(124, 139, 176,0.2))'
            }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
        </div>
    );
};

export default Compass;
