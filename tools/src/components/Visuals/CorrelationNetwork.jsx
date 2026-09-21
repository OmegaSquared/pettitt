import React, { useEffect, useRef, useState } from 'react';

const CorrelationNetwork = ({ theme }) => {
    const canvasRef = useRef(null);
    const [mode, setMode] = useState('retail'); // 'retail' or 'institutional'
    const [isAuto, setIsAuto] = useState(true);
    const [progress, setProgress] = useState(0);
    const isDark = theme === 'dark-mode';

    const colors = {
        equities: '#F4C366', // PETTITT WEALTH Orange
        fixedIncome: '#C9D3EA', // Light Blue
        alternative: '#7C8BB0', // PETTITT WEALTH Blue
        alpha: '#F9A36C', // Light Orange
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        danger: '#ff4444',
        success: '#44ff44'
    };

    const nodes = [
        { id: 'US_EQ', label: 'US Equities', color: colors.equities, x: 0.3, y: 0.3 },
        { id: 'INTL_EQ', label: 'Intl Equities', color: colors.equities, x: 0.4, y: 0.2 },
        { id: 'TECH', label: 'Tech Growth', color: colors.equities, x: 0.5, y: 0.35 },
        { id: 'CORP_BD', label: 'Corp Bonds', color: colors.fixedIncome, x: 0.2, y: 0.5 },
        { id: 'PVT_CR', label: 'Private Credit', color: colors.alternative, x: 0.7, y: 0.6 },
        { id: 'ALPH_1', label: 'Long/Short Alpha', color: colors.alpha, x: 0.8, y: 0.3 },
        { id: 'ALPH_2', label: 'Macro Overlay', color: colors.alpha, x: 0.6, y: 0.15 },
        { id: 'RE_ST', label: 'Alternative RE', color: colors.alternative, x: 0.15, y: 0.2 }
    ];

    // Auto-Toggle Logic
    useEffect(() => {
        if (!isAuto) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setMode(m => m === 'retail' ? 'institutional' : 'retail');
                    return 0;
                }
                return prev + 1;
            });
        }, 60); // Roughly 6 seconds per mode
        return () => clearInterval(interval);
    }, [isAuto]);

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const padding = 120;
        const chartW = width - padding * 2;
        const chartH = height - padding * 2;

        const getPos = (node) => {
            let nx = node.x;
            let ny = node.y;

            if (mode === 'retail') {
                // Nodes collapse towards center (Systemic Correlation)
                const targetX = 0.5;
                const targetY = 0.4;
                nx = nx + (targetX - nx) * 0.7;
                ny = ny + (targetY - ny) * 0.7;
            }

            return {
                x: padding + nx * chartW,
                y: padding + ny * chartH
            };
        };

        // --- 1. Draw Connection Lines ---
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const p1 = getPos(nodes[i]);
                const p2 = getPos(nodes[j]);
                const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

                let alpha = 0.1;
                if (mode === 'retail') {
                    alpha = 0.8;
                    ctx.strokeStyle = colors.danger;
                } else {
                    alpha = 0.15;
                    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
                }

                ctx.globalAlpha = Math.min(alpha, 0.6);
                ctx.lineWidth = mode === 'retail' ? 3 : 1;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1.0;

        // --- 2. Draw Nodes ---
        nodes.forEach(node => {
            const p = getPos(node);

            // Glow
            ctx.shadowBlur = mode === 'retail' ? 25 : 10;
            ctx.shadowColor = node.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, mode === 'retail' ? 14 : 10, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Simple Label
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 11px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, p.x, p.y + (mode === 'retail' ? 30 : 25));
        });

        // --- 3. Retail Problem / Institutional Solution Text ---
        const legX = padding;
        const legY = height - 70;
        ctx.textAlign = 'left';

        if (mode === 'retail') {
            ctx.fillStyle = colors.danger;
            ctx.font = '900 24px "Outfit", sans-serif';
            ctx.fillText("PROBLEM: NOT AS DIVERSIFIED AS YOU THINK.", legX, legY - 30);

            ctx.fillStyle = colors.text;
            ctx.font = '800 16px "Outfit", sans-serif';
            ctx.fillText("Retail models fail when correlation hits 1.0. Everything collapses together.", legX, legY);
        } else {
            ctx.fillStyle = colors.alternative;
            ctx.font = '900 24px "Outfit", sans-serif';
            ctx.fillText("SOLUTION: TRUE INSTITUTIONAL DIVERSIFICATION.", legX, legY - 30);

            ctx.fillStyle = colors.text;
            ctx.font = '800 16px "Outfit", sans-serif';
            ctx.fillText("Active diversification ensures your capital stays protected across the cycle.", legX, legY);
        }

        ctx.fillStyle = colors.muted;
        ctx.font = '400 14px "Outfit", sans-serif';
        ctx.fillText(mode === 'retail'
            ? "Mainstream portfolios are built for 'fair weather'—they fail exactly when you need them most."
            : "PETTITT WEALTH architects asset independence, ensuring that a storm in one sector doesn't sink the entire estate.", legX, legY + 25);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        let animationFrame;
        let isVisible = false;

        const render = () => {
            if (!isVisible) return;
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== width * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                ctx.scale(dpr, dpr);
            }

            draw(ctx, width, height);
            animationFrame = requestAnimationFrame(render);
        };

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (!isVisible) {
                    isVisible = true;
                    render();
                }
            } else {
                isVisible = false;
                if (animationFrame) cancelAnimationFrame(animationFrame);
            }
        }, { threshold: 0.05 });
        
        observer.observe(canvas);

        return () => {
            observer.disconnect();
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [mode, theme]);

    return (
        <div className="mx-auto mb-5" style={{ maxWidth: '1250px' }} data-aos="fade-up">
            <div
                className="correlation-network-container position-relative overflow-hidden"
                style={{
                    width: '100%',
                    height: '650px',
                    background: isDark ? 'rgba(13, 22, 41, 0.4)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '40px',
                    border: `1px solid ${colors.border}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: isDark ? '0 15px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.03)'
                }}
            >
                <canvas ref={canvasRef} style={{ display: 'block' }} />

                {/* Progress Bar (Auto-Indicator) */}
                <div className="position-absolute top-0 start-0 w-100 h-1 bg-white bg-opacity-5">
                    <div
                        className="h-100 transition-all"
                        style={{
                            width: `${progress}%`,
                            background: mode === 'retail' ? colors.danger : colors.alternative,
                            transition: 'width 0.1s linear'
                        }}
                    ></div>
                </div>

                {/* Mode Selector & Status */}
                <div className="position-absolute top-0 start-50 translate-middle-x mt-5 d-flex flex-column align-items-center gap-3">
                    <div className="d-flex gap-2 p-2 rounded-pill bg-black bg-opacity-20 backdrop-blur">
                        <button
                            onClick={() => { setMode('retail'); setIsAuto(false); }}
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${mode === 'retail' ? 'btn-danger' : 'text-white-50'}`}
                        >
                            RETAIL RISK
                        </button>
                        <button
                            onClick={() => { setMode('institutional'); setIsAuto(false); }}
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${mode === 'institutional' ? 'btn-premium' : 'text-white-50'}`}
                        >
                            THE SOLUTION
                        </button>
                    </div>
                    {isAuto && (
                        <div className="small font-monospace text-muted opacity-50 tracking-widest">
                            AUTO-DIAGNOSTIC IN PROGRESS
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-4 opacity-50 small font-monospace" style={{ color: colors.muted }}>
                — ANALYZE ASSET CLASS DEPENDENCY: NETWORK COLLAPSE DIAGNOSTIC —
            </div>
        </div>
    );
};

export default CorrelationNetwork;
