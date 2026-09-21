import React, { useEffect, useRef, useState } from 'react';
import { captureIntent } from '../../utils/captureIntent';

const TaxAlphaBridge = ({ theme }) => {
    const canvasRef = useRef(null);
    const [strategyActive, setStrategyActive] = useState(false);
    const [isAuto, setIsAuto] = useState(true);
    const [progress, setProgress] = useState(0);
    const isDark = theme === 'dark-mode';

    const colors = {
        pillar: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        pillarActive: '#7C8BB0', // PETTITT WEALTH Blue
        leak: '#ff4444',
        shield: '#C9D3EA', // Light Blue
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        accent: '#F4C366' // PETTITT WEALTH Orange
    };

    const particles = useRef([]);

    // Auto-Toggle logic
    useEffect(() => {
        if (!isAuto) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setStrategyActive(s => !s);
                    return 0;
                }
                return prev + 1.25; // Cycles every ~5 seconds
            });
        }, 60);
        return () => clearInterval(interval);
    }, [isAuto]);

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const padding = 140;
        const pWidth = 140;
        const pHeightStart = height * 0.45; // Reduced ratio to push down
        const pHeightEndNoStrategy = height * 0.25;
        const pHeightEndWithStrategy = height * 0.6;

        const leftPillarX = padding;
        const rightPillarX = width - padding - pWidth;
        const baselineY = height - 100;

        // --- 1. Draw Pillars ---
        const drawPillar = (x, h, label, value, isActive) => {
            const grad = ctx.createLinearGradient(x, baselineY - h, x, baselineY);
            grad.addColorStop(0, isActive ? colors.pillarActive : colors.pillar);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, baselineY - h, pWidth, h, [20, 20, 0, 0]);
            ctx.fill();

            // Label
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 18px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + pWidth / 2, baselineY + 40);

            ctx.fillStyle = isActive ? colors.accent : colors.muted;
            ctx.font = 'bold 28px "Outfit", sans-serif';
            ctx.fillText(value, x + pWidth / 2, baselineY - h - 25);
        };

        drawPillar(leftPillarX, pHeightStart, "GROSS CAPITAL", "$10.0M", false);

        const currentRightHeight = strategyActive ? pHeightEndWithStrategy : pHeightEndNoStrategy;
        drawPillar(rightPillarX, currentRightHeight, "NET LEGACY", strategyActive ? "$12.4M" : "$8.2M", strategyActive);

        // --- 2. Draw The "Bridge" ---
        const cp1x = leftPillarX + pWidth + (rightPillarX - (leftPillarX + pWidth)) / 2;
        ctx.beginPath();
        ctx.moveTo(leftPillarX + pWidth, baselineY - pHeightStart / 2);
        ctx.bezierCurveTo(cp1x, baselineY - pHeightStart / 2, cp1x, baselineY - currentRightHeight / 2, rightPillarX, baselineY - currentRightHeight / 2);

        // Narrative Coloring: Orange for Friction/Friction, Blue for Strategy
        ctx.strokeStyle = strategyActive ? colors.pillarActive : colors.accent;
        ctx.lineWidth = strategyActive ? 60 : 45;
        ctx.globalAlpha = strategyActive ? 0.3 : 0.15; // Increased visibility for orange state
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // --- 3. The Leaks / Defense Shield ---
        if (!strategyActive) {
            // Leaks
            if (Math.random() > 0.7) {
                particles.current.push({
                    x: cp1x + (Math.random() - 0.5) * 80,
                    y: baselineY - pHeightStart / 2 + 30,
                    vy: 3 + Math.random() * 2,
                    alpha: 1
                });
            }

            particles.current.forEach((p, i) => {
                p.y += p.vy;
                p.alpha -= 0.015;
                ctx.fillStyle = colors.accent; // Heat/Friction Orange
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
            particles.current = particles.current.filter(p => p.alpha > 0);
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = colors.leak;
            ctx.font = '900 13px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("TAX FRICTION LEAK", cp1x, baselineY - 20);
        } else {
            // Shield
            ctx.save();
            ctx.shadowBlur = 30;
            ctx.shadowColor = colors.shield;
            ctx.beginPath();
            ctx.arc(cp1x, baselineY - pHeightStart / 2 + 50, 70, Math.PI, 0);
            ctx.strokeStyle = colors.shield;
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.fillStyle = colors.shield;
            ctx.globalAlpha = 0.15;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.restore();

            ctx.fillStyle = colors.shield;
            ctx.font = 'bold 15px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("TAX ALPHA PROTOCOL ACTIVE", cp1x, baselineY - pHeightStart / 2 + 20);
        }

        // --- 4. Narrative Punchline ---
        ctx.textAlign = 'left';
        if (!strategyActive) {
            ctx.fillStyle = colors.leak;
            ctx.font = '900 28px "Outfit", sans-serif';
            ctx.fillText("PROBLEM: UNPROTECTED VELOCITY.", padding, 200);
        } else {
            ctx.fillStyle = colors.pillarActive;
            ctx.font = '900 28px "Outfit", sans-serif';
            ctx.fillText("SOLUTION: TAX EFFICIENCY.", padding, 200);
        }

        ctx.fillStyle = colors.muted;
        ctx.font = '400 16px "Outfit", sans-serif';
        ctx.fillText(strategyActive
            ? "PETTITT WEALTH capture of friction redirects leakage back into the estate architecture."
            : "Without proactive defense, secondary and tertiary taxes erode your compounding base.", padding, 230);
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
    }, [strategyActive, theme]);

    return (
        <div className="mx-auto mb-5" style={{ maxWidth: '1250px' }} data-aos="fade-up">
            <div
                className="tax-alpha-visual-container position-relative overflow-hidden"
                style={{
                    width: '100%',
                    height: '750px',
                    background: isDark ? 'rgba(13, 22, 41, 0.4)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '40px',
                    border: `1px solid ${colors.border}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: isDark ? '0 15px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.03)'
                }}
            >
                {/* Progress Bar */}
                <div className="position-absolute top-0 start-0 w-100 h-1 bg-white bg-opacity-5">
                    <div
                        className="h-100 transition-all"
                        style={{
                            width: `${progress}%`,
                            background: strategyActive ? colors.pillarActive : colors.accent,
                            transition: 'width 0.1s linear'
                        }}
                    ></div>
                </div>

                <canvas ref={canvasRef} style={{ display: 'block' }} />

                {/* Control Toggle at TOP */}
                <div className="position-absolute top-0 start-50 translate-middle-x mt-5 pt-2" style={{ zIndex: 10 }}>
                    <button
                        onClick={() => { 
                            setStrategyActive(!strategyActive); 
                            setIsAuto(false); 
                            if (!strategyActive) captureIntent('Tax Alpha Calculator');
                        }}
                        className={`btn btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg transition-all ${strategyActive ? 'btn-premium' : 'btn-outline-light'}`}
                        style={{ minWidth: '320px', fontSize: '1.1rem', letterSpacing: '1px' }}
                    >
                        {strategyActive ? "PROTOCOL ENGAGED ✓" : "ACTIVATE TAX ALPHA PROTOCOL"}
                    </button>
                    {isAuto && (
                        <div className="text-center mt-3 small font-monospace text-muted opacity-50 tracking-widest">
                            AUTO-DIAGNOSTIC ACTIVE
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-4 opacity-50 small font-monospace" style={{ color: colors.muted }}>
                — ARCHITECTING NET-SPENDABLE WEALTH: NET LEGACY CALCULATOR —
            </div>
        </div>
    );
};

export default TaxAlphaBridge;
