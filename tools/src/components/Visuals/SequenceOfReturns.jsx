import React, { useEffect, useRef, useState } from 'react';

const SequenceOfReturns = ({ theme }) => {
    const canvasRef = useRef(null);
    const isDark = theme === 'dark-mode';

    const colors = {
        badStart: '#ff4444',
        goodStart: '#7C8BB0',
        lowRisk: '#10b981', // Low Risk Green
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
    };

    // Data: Two paths with same average return but different sequences
    // Path A: -20, -10, 5, 5, 12, 12 (Early Bear)
    // Path B: 12, 12, 5, 5, -10, -20 (Late Bear)
    const YEARS = 25;
    const START_VALUE = 4000000;
    const WITHDRAWAL = 200000; // 5% withdrawal

    const generatePaths = () => {
        const pathA = [START_VALUE]; // Bad Start
        const pathB = [START_VALUE]; // Good Start
        const pathC = [START_VALUE]; // Low Risk / Stable

        // Simplified sequence: first 5 years are different, then same avg
        const earlyBear = [-0.15, -0.10, -0.05, 0.08, 0.12];
        const lateBear = [0.12, 0.08, -0.05, -0.10, -0.15];

        let valA = START_VALUE;
        let valB = START_VALUE;
        let valC = START_VALUE;

        for (let i = 1; i <= YEARS; i++) {
            let retA = 0.06; // Default
            let retB = 0.06;
            let retC = 0.045; // Stable low risk

            if (i <= 5) {
                retA = earlyBear[i - 1];
                retB = lateBear[i - 1];
            } else if (i > YEARS - 5) {
                retA = lateBear[YEARS - i];
                retB = earlyBear[YEARS - i];
            }

            valA = (valA * (1 + retA)) - WITHDRAWAL;
            valB = (valB * (1 + retB)) - WITHDRAWAL;
            valC = (valC * (1 + retC)) - WITHDRAWAL;

            pathA.push(Math.max(0, valA));
            pathB.push(Math.max(0, valB));
            pathC.push(Math.max(0, valC));
        }

        return { pathA, pathB, pathC };
    };

    const data = generatePaths();

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const isMobileLocal = width < 768;
        const padding = isMobileLocal ? 40 : 80;
        const chartWidth = width - (isMobileLocal ? padding * 2.5 : padding * 2.5); // Leave space for labels
        const chartHeight = height - padding * 2;

        // Font scaling
        const fontScale = isMobileLocal ? Math.max(0.7, width / 450) : 1;
        const labelFontSize = Math.round(12 * fontScale);
        const amountFontSize = Math.round(10 * fontScale);

        const maxVal = START_VALUE * 1.5;
        const getX = (y) => padding + (y / YEARS) * chartWidth;
        const getY = (v) => height - padding - (v / maxVal) * chartHeight;

        // Draw Grid
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const v = (i / 5) * maxVal;
            const y = getY(v);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            ctx.fillStyle = colors.muted;
            ctx.font = '10px font-monospace';
            ctx.fillText(`$${(v / 1000000).toFixed(1)}M`, padding - 45, y + 4);
        }

        // Draw Paths
        const drawLine = (path, color, label, finalVal) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.moveTo(getX(0), getY(path[0]));
            for (let i = 1; i <= YEARS; i++) {
                ctx.lineTo(getX(i), getY(path[i]));
            }
            ctx.stroke();

            // Label
            ctx.fillStyle = color;
            ctx.font = `bold ${labelFontSize}px "Outfit"`;
            ctx.textAlign = 'left';
            const labelX = getX(YEARS) + (isMobileLocal ? 5 : 10);
            ctx.fillText(isMobileLocal ? label.split(' (')[0] : label, labelX, getY(finalVal));
            ctx.font = `${amountFontSize}px "Outfit"`;
            ctx.fillText(`Final: $${(finalVal / 1000000).toFixed(2)}M`, labelX, getY(finalVal) + (isMobileLocal ? 12 : 15));
        };

        drawLine(data.pathB, colors.goodStart, "OPTIMAL SEQUENCE (Late Volatility)", data.pathB[YEARS]);
        drawLine(data.pathA, colors.badStart, "SUB-OPTIMAL SEQUENCE (Early Bear)", data.pathA[YEARS]);
        drawLine(data.pathC, colors.lowRisk, "LOW-RISK STABLE MODEL", data.pathC[YEARS]);

        // Axis
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 14px "Outfit"';
        ctx.textAlign = 'center';
        ctx.fillText("DISTRIBUTION HORIZON (YEARS 0-25)", width / 2, height - 30);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        const resize = () => {
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
            draw(ctx, width, height);
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [theme]);

    return (
        <div className="mx-auto mb-5 ps-lg-4" style={{ width: '100%' }}>
            <div className="container-glass p-3 p-md-4 rounded-5" style={{ height: window.innerWidth < 768 ? '500px' : '800px', background: isDark ? 'rgba(13, 22, 41, 0.4)' : 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}` }}>
                <div className="d-flex justify-content-between mb-4 flex-wrap gap-2">
                    <div>
                        <h3 className="text-white h5 fw-bold mb-1" style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem' }}>SEQUENCE OF RETURN RISK</h3>
                        <p className="text-white-50 small mb-0">Same average return. Two entirely different outcomes.</p>
                    </div>
                    <div className="text-end">
                        <div className="text-gradient-orange fw-bold" style={{ fontSize: window.innerWidth < 768 ? '0.8rem' : '1rem' }}>FRAGILE DECADE ANALYSIS</div>
                        <div className="text-white-50 small">Withdrawal Rate: 5% Fixed</div>
                    </div>
                </div>
                <canvas ref={canvasRef} style={{ width: '100%', height: 'calc(100% - 100px)' }} />
            </div>
        </div>
    );
};

export default SequenceOfReturns;
