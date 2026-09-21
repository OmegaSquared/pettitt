import React, { useEffect, useRef, useState } from 'react';

const SixStagesCanvas = ({ theme }) => {
    const canvasRef = useRef(null);
    const [hoveredStage, setHoveredStage] = useState(5); // Recession default focal point
    const isDark = theme === 'dark-mode';

    const stages = [
        {
            label: "Recovery",
            desc: "Economy stabilizes after a recession. Corporate earnings and consumer confidence begin a slow climb.",
            static: { eq: 60, bd: 40, cs: 0 },
            dynamic: { eq: 80, bd: 20, cs: 0 },
            color: '#F4C366', // Orange
            colorLight: 'rgba(244, 195, 102, 0.6)'
        },
        {
            label: "Early Expansion",
            desc: "Growth accelerates as credit expands and production increases. A strong environment for risk-on assets.",
            static: { eq: 60, bd: 40, cs: 0 },
            dynamic: { eq: 70, bd: 30, cs: 0 },
            color: '#C9D3EA', // Light Blue
            colorLight: 'rgba(169, 197, 230, 0.6)'
        },
        {
            label: "Mid Expansion",
            desc: "The economy reaches full stride. Corporate profitability is high, and credit is widely available.",
            static: { eq: 60, bd: 40, cs: 0 },
            dynamic: { eq: 60, bd: 40, cs: 0 },
            color: '#7C8BB0', // PETTITT WEALTH Blue
            colorLight: 'rgba(124, 139, 176, 0.6)'
        },
        {
            label: "Late Expansion",
            desc: "Growth slows and inflation begins to rise. Risks shift as the cycle nears its historical peak.",
            static: { eq: 60, bd: 40, cs: 0 },
            dynamic: { eq: 50, bd: 50, cs: 0 },
            color: '#64748b', // Slate
            colorLight: 'rgba(100, 116, 139, 0.6)'
        },
        {
            label: "Approaching Recession",
            desc: "Indicators reach their zenith and begin to roll over. Transitioning to defensive layering is critical.",
            static: { eq: 60, bd: 40, cs: 0 },
            dynamic: { eq: 40, bd: 40, cs: 20 },
            color: '#F9A36C', // Light Orange
            colorLight: 'rgba(249, 163, 108, 0.6)'
        },
        {
            label: "Recession",
            desc: "A period of contraction and peak uncertainty. Focus shifts entirely to capital preservation and liquidity.",
            static: { eq: 60, bd: 40, cs: 0 },
            dynamic: { eq: 0, bd: 50, cs: 50 },
            color: '#D36B2C', // Deep Orange
            colorLight: 'rgba(211, 107, 44, 0.6)'
        }
    ];

    const colors = {
        equities: '#F4C366',
        bonds: isDark ? '#3B82F6' : '#7C8BB0',
        cash: isDark ? '#94a3b8' : '#64748b',
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#475569',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        canvasBg: isDark ? '#030a16' : '#ffffff'
    };

    const drawPie = (ctx, x, y, radius, data, title) => {
        let startAngle = -Math.PI / 2;
        const entries = [
            { val: data.eq, color: colors.equities, label: 'Equities' },
            { val: data.bd, color: colors.bonds, label: 'Bonds' },
            { val: data.cs, color: colors.cash, label: 'Cash' }
        ].filter(e => e.val > 0);

        // Shadow/Glow
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
        ctx.fill();
        ctx.restore();

        entries.forEach(entry => {
            const sliceAngle = (entry.val / 100) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.arc(x, y, radius, startAngle, startAngle + sliceAngle);
            ctx.fillStyle = entry.color;
            ctx.fill();

            // Subtle slice separation
            ctx.strokeStyle = isDark ? '#0F1F35' : '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            startAngle += sliceAngle;
        });

        // Inner circle for donut-ish look
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = colors.canvasBg;
        ctx.fill();

        // Title
        ctx.font = `700 14px "Outfit", sans-serif`;
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.fillText(title.toUpperCase(), x, y + radius + 35);
    };

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const isMobile = width < 768;
        const padding = isMobile ? 30 : 80;
        const chartY = isMobile ? 180 : 140;
        const chartRadius = isMobile ? 45 : 60;
        const stageAreaHeight = height * (isMobile ? 0.45 : 0.55);
        const stageAreaY = height - stageAreaHeight - (isMobile ? 60 : 80);

        // --- 1. Pie Charts ---
        if (isMobile) {
            drawPie(ctx, padding + 55, chartY, chartRadius, stages[hoveredStage].static, "Static");
            drawPie(ctx, padding + 165, chartY, chartRadius, stages[hoveredStage].dynamic, "PETTITT WEALTH");
        } else {
            drawPie(ctx, padding + 70, chartY, chartRadius, stages[hoveredStage].static, "Static Portfolio");
            drawPie(ctx, padding + 240, chartY, chartRadius, stages[hoveredStage].dynamic, "PETTITT WEALTH Strategy");
        }

        // --- 2. Legend / Distribution Info ---
        const current = stages[hoveredStage].dynamic;
        ctx.textAlign = 'left';
        ctx.font = `600 ${isMobile ? '12px' : '14px'} "Outfit", sans-serif`;
        const legendX = isMobile ? padding : padding + 360;
        const legendYBase = isMobile ? chartY + 100 : chartY - 30;

        const drawLegendItem = (index, color, label, val) => {
            const ly = legendYBase + (index * (isMobile ? 24 : 30));
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(legendX, ly - (isMobile ? 8 : 10), isMobile ? 12 : 16, isMobile ? 12 : 16, 4);
            ctx.fill();
            ctx.fillStyle = colors.text;
            ctx.fillText(`${label}: ${val}%`, legendX + (isMobile ? 20 : 30), ly + (isMobile ? 2 : 4));
        };

        drawLegendItem(0, colors.equities, "Equities", current.eq);
        drawLegendItem(1, colors.bonds, "Bonds", current.bd);
        if (current.cs > 0) drawLegendItem(2, colors.cash, "Cash", current.cs);

        // --- 3. Stage Description ---
        const descX = width - padding;
        const descY = isMobile ? 60 : chartY - 30;
        ctx.textAlign = isMobile ? 'left' : 'right';
        const finalDescX = isMobile ? padding : descX;

        ctx.fillStyle = colors.equities;
        ctx.font = `700 ${isMobile ? '20px' : '28px'} "Outfit", sans-serif`;
        ctx.fillText(stages[hoveredStage].label, finalDescX, descY);

        ctx.fillStyle = colors.muted;
        ctx.font = `400 ${isMobile ? '13px' : '16px'} "Outfit", sans-serif`;
        const words = stages[hoveredStage].desc.split(' ');
        let line = '';
        let lineCount = 0;
        const maxWidth = isMobile ? width - padding * 2 : 450;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, finalDescX, descY + (isMobile ? 25 : 50) + (lineCount * (isMobile ? 20 : 24)));
                line = words[n] + ' ';
                lineCount++;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, finalDescX, descY + (isMobile ? 25 : 50) + (lineCount * (isMobile ? 20 : 24)));

        // --- 4. Curve Stage Map (Bottom) ---
        const stageWidth = (width - padding * 2) / 6;

        const getCurveY = (x) => {
            const normalizedX = (x - padding) / (width - padding * 2);
            return stageAreaY + stageAreaHeight * (0.6 - 0.4 * Math.sin(normalizedX * Math.PI - Math.PI / 2.5));
        };

        stages.forEach((stage, i) => {
            const sx = padding + i * stageWidth;
            const h = i === hoveredStage;

            ctx.beginPath();
            ctx.moveTo(sx, height - 60);
            for (let x = sx; x <= sx + stageWidth; x += 2) {
                ctx.lineTo(x, getCurveY(x));
            }
            ctx.lineTo(sx + stageWidth, height - 60);
            ctx.closePath();

            const grad = ctx.createLinearGradient(0, getCurveY(sx + stageWidth / 2), 0, height);
            if (h) {
                grad.addColorStop(0, stage.color);
                grad.addColorStop(1, stage.color + '44');
            } else {
                grad.addColorStop(0, isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
                grad.addColorStop(1, 'transparent');
            }
            ctx.fillStyle = grad;
            ctx.fill();

            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(sx, height - 120);
                ctx.lineTo(sx, getCurveY(sx));
                ctx.strokeStyle = colors.border;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.textAlign = 'center';
            ctx.font = `700 ${h ? '18px' : '15px'} "Outfit", sans-serif`;
            ctx.fillStyle = h ? colors.text : colors.muted;

            const labelY = height - 20;
            const labelLines = stage.label.split(' ');
            if (labelLines.length > 1) {
                ctx.fillText(labelLines[0], sx + stageWidth / 2, labelY - 18);
                ctx.fillText(labelLines[1], sx + stageWidth / 2, labelY);
            } else {
                ctx.fillText(stage.label, sx + stageWidth / 2, labelY - 10);
            }
        });

        ctx.beginPath();
        for (let x = padding; x <= width - padding; x += 1) {
            if (x === padding) ctx.moveTo(x, getCurveY(x));
            else ctx.lineTo(x, getCurveY(x));
        }
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(124, 139, 176, 0.4)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Allocation Disclosure (Bottom Center)
        ctx.textAlign = 'center';
        ctx.font = 'italic 400 12px "Outfit", sans-serif';
        ctx.fillStyle = colors.muted;
        ctx.fillText("* Allocations are illustrative of strategy philosophy and not actual portfolio holdings.", width / 2, height - 70);
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = canvas.offsetWidth;
        const padding = 80;

        if (x < padding || x > width - padding) return;

        const stageWidth = (width - padding * 2) / 6;
        const stageIdx = Math.floor((x - padding) / stageWidth);
        if (stageIdx >= 0 && stageIdx < 6 && stageIdx !== hoveredStage) {
            setHoveredStage(stageIdx);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        const updateSize = () => {
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.resetTransform();
            ctx.scale(dpr, dpr);
            draw(ctx, width, height);
        };

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);
        updateSize();

        return () => resizeObserver.disconnect();
    }, [hoveredStage, theme]);

    return (
        <div className="mx-auto mb-5" style={{ width: '100%', maxWidth: '1250px' }}>
            <div
                className="six-stages-visual-container position-relative overflow-hidden"
                style={{
                    width: '100%',
                    height: 'clamp(500px, 85vh, 850px)',
                    background: colors.canvasBg,
                    borderRadius: '30px',
                    border: `1px solid ${colors.border}`,
                    backdropFilter: 'blur(20px)',
                    cursor: 'crosshair',
                    boxShadow: isDark ? '0 25px 80px -20px rgba(0,0,0,0.6)' : '0 20px 50px rgba(0,0,0,0.08)'
                }}
                onMouseMove={handleMouseMove}
                onTouchMove={(e) => {
                    const touch = e.touches[0];
                    handleMouseMove({ clientX: touch.clientX });
                }}
            >
                <canvas ref={canvasRef} style={{ display: 'block' }} />
            </div>

            <div className="text-center mt-4 opacity-50 small font-monospace px-4" style={{ color: colors.muted, fontSize: '0.7rem' }}>
                — ANALYZE PORTFOLIO ADAPTATION ACROSS THE ECONOMIC CYCLE —
            </div>
        </div>
    );
};

export default SixStagesCanvas;
