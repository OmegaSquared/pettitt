import React, { useEffect, useRef, useState } from 'react';

const LegacyWaterfall = ({ theme, allocations, bridgedWealth = 0 }) => {
    const canvasRef = useRef(null);
    const [isTransferring, setIsTransferring] = useState(false);
    const [isAuto, setIsAuto] = useState(true);
    const [isWaiting, setIsWaiting] = useState(false);

    // Track dynamic wealth amounts using a ref to prevent 60fps React re-renders
    const currentWealth = useRef({
        engine: bridgedWealth,
        skip: 0,
        llc: 0,
        phila: 0,
        liquid: 0
    });

    const fillsRef = useRef({
        engine: bridgedWealth > 0 ? 0.9 : 0,
        skip: 0.1,
        llc: 0.1,
        phila: 0.1,
        liquid: 0.1
    });

    const isZeroBalance = bridgedWealth <= 0;

    const defaultAllocations = { skip: 25, phila: 25, llc: 25, liquid: 25 };
    const displayAllocations = { ...defaultAllocations, ...allocations };
    const isDark = theme === 'dark-mode';

    const colors = {
        water: '#7C8BB0', // PETTITT WEALTH Blue
        mist: '#C9D3EA', // Light Blue
        reservoir: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        accent: '#F4C366', // PETTITT WEALTH Orange
        danger: '#ff3b3b'
    };

    // Organized layout for reservoirs
    const reservoirs = [
        { id: 'engine', label: "Core Wealth Engine", x: 0.5, y: 0.15, size: 85 },
        { id: 'skip', label: "Generation Skip Trust", x: 0.2, y: 0.5, size: 55 },
        { id: 'phila', label: "Philanthropic Foundation", x: 0.8, y: 0.5, size: 55 },
        { id: 'llc', label: "Family LLC", x: 0.35, y: 0.8, size: 55 },
        { id: 'liquid', label: "Next-Gen Liquidity", x: 0.65, y: 0.8, size: 55 }
    ];

    const particles = useRef([]);

    const initiateTransfer = () => {
        if (isZeroBalance) return;
        setIsTransferring(true);
        currentWealth.current = {
            engine: bridgedWealth,
            skip: 0,
            llc: 0,
            phila: 0,
            liquid: 0
        };
        fillsRef.current = { engine: 0.9, skip: 0.1, llc: 0.1, phila: 0.1, liquid: 0.1 };
        particles.current = [];
    };

    const resetArchitecture = () => {
        setIsTransferring(false);
        currentWealth.current = {
            engine: bridgedWealth,
            skip: 0,
            llc: 0,
            phila: 0,
            liquid: 0
        };
        fillsRef.current = { engine: bridgedWealth > 0 ? 0.9 : 0, skip: 0.1, llc: 0.1, phila: 0.1, liquid: 0.1 };
        particles.current = [];
    };

    useEffect(() => {
        resetArchitecture();
    }, [bridgedWealth]);

    // Logic transitions now handled inside draw loop for perfect sync with fillsRef
    useEffect(() => {
        if (!isAuto || isTransferring || isWaiting || isZeroBalance) return;
        initiateTransfer();
    }, [isAuto, isTransferring, isWaiting, isZeroBalance]);

    useEffect(() => {
        if (isWaiting) {
            const timeout = setTimeout(() => {
                resetArchitecture();
                setIsWaiting(false);
            }, 5000); // 5 second pause at the end
            return () => clearTimeout(timeout);
        }
    }, [isWaiting]);

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const isMobile = width < 768;
        const padding = isMobile ? 30 : 80;

        // Define dynamic layout based on screen size
        const layout = isMobile ? {
            engine: { x: 0.5, y: 0.22, size: 60 },
            skip: { x: 0.3, y: 0.48, size: 45 },
            phila: { x: 0.7, y: 0.48, size: 45 },
            llc: { x: 0.3, y: 0.74, size: 45 },
            liquid: { x: 0.7, y: 0.74, size: 45 }
        } : {
            engine: { x: 0.5, y: 0.15, size: 85 },
            skip: { x: 0.2, y: 0.5, size: 55 },
            phila: { x: 0.8, y: 0.5, size: 55 },
            llc: { x: 0.35, y: 0.8, size: 55 },
            liquid: { x: 0.65, y: 0.8, size: 55 }
        };

        const getX = (v) => padding + v * (width - padding * 2);
        const getY = (v) => padding + v * (height - padding * 2);

        // --- 1. Draw "Pipes" ---
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        reservoirs.slice(1).forEach(res => {
            const startX = getX(layout.engine.x);
            const startY = getY(layout.engine.y) + layout.engine.size / 2;
            const endX = getX(layout[res.id].x);
            const endY = getY(layout[res.id].y) - layout[res.id].size / 2;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            const midY = startY + (endY - startY) * 0.4;
            ctx.bezierCurveTo(startX, midY, endX, midY, endX, endY);

            ctx.strokeStyle = colors.border;
            ctx.lineWidth = isMobile ? 8 : 14;
            ctx.stroke();

            if (!isZeroBalance) {
                ctx.strokeStyle = colors.water;
                ctx.lineWidth = isMobile ? 2 : 4;
                ctx.globalAlpha = isTransferring ? 0.4 : 0.1;
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        });

        // --- 2. Update Particles ---
        if (isTransferring && fillsRef.current.engine > 0.05) {
            if (Math.random() > 0.4) {
                // Determine target based on weighted allocations
                const targets = reservoirs.slice(1);
                const totalWeights = targets.reduce((acc, t) => acc + (displayAllocations[t.id] || 0), 0);
                let random = Math.random() * totalWeights;
                let targetRes = targets[targets.length - 1];

                for (let t of targets) {
                    random -= (displayAllocations[t.id] || 0);
                    if (random <= 0) {
                        targetRes = t;
                        break;
                    }
                }

                particles.current.push({
                    x: getX(layout.engine.x),
                    y: getY(layout.engine.y) + 30,
                    progress: 0,
                    speed: isMobile ? 0.012 : 0.015 + Math.random() * 0.005,
                    target: targetRes,
                    alpha: 1,
                    value: (bridgedWealth * 0.005) // value per drop
                });
                fillsRef.current.engine = Math.max(0, fillsRef.current.engine - 0.005);
                currentWealth.current.engine = Math.max(0, currentWealth.current.engine - (bridgedWealth * 0.005));
            }
        }

        // Completion Guard
        if (isTransferring && fillsRef.current.engine <= 0.06) {
            setIsTransferring(false);
            setIsWaiting(true);
        }

        particles.current.forEach((p) => {
            p.progress += p.speed;

            const startX = getX(layout.engine.x);
            const startY = getY(layout.engine.y) + layout.engine.size / 2;
            const endX = getX(layout[p.target.id].x);
            const endY = getY(layout[p.target.id].y) - layout[p.target.id].size / 2;
            const midY = startY + (endY - startY) * 0.4;

            const t = p.progress;
            const cx1 = startX;
            const cy1 = midY;
            const cx2 = endX;
            const cy2 = midY;

            p.x = Math.pow(1 - t, 3) * startX + 3 * Math.pow(1 - t, 2) * t * cx1 + 3 * (1 - t) * Math.pow(t, 2) * cx2 + Math.pow(t, 3) * endX;
            p.y = Math.pow(1 - t, 3) * startY + 3 * Math.pow(1 - t, 2) * t * cy1 + 3 * (1 - t) * Math.pow(t, 2) * cy2 + Math.pow(t, 3) * endY;

            if (p.progress >= 1) {
                p.alpha = 0;
                const tid = p.target.id;
                fillsRef.current[tid] = Math.min(0.9, fillsRef.current[tid] + 0.008);
                currentWealth.current[tid] += p.value;
            }

            ctx.fillStyle = colors.mist;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, isMobile ? 2 : 4, 0, Math.PI * 2);
            ctx.fill();
        });
        particles.current = particles.current.filter(p => p.alpha > 0);
        ctx.globalAlpha = 1.0;

        // --- 3. Draw Reservoirs ---
        reservoirs.forEach((res, i) => {
            const rx = getX(layout[res.id].x);
            const ry = getY(layout[res.id].y);
            const rSize = layout[res.id].size;
            const fillLevel = fillsRef.current[res.id];

            ctx.save();
            ctx.shadowBlur = isMobile ? 10 : 20;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.roundRect(rx - rSize, ry - rSize / 2, rSize * 2, rSize, isMobile ? 8 : 15);
            ctx.fillStyle = colors.reservoir;
            ctx.fill();
            ctx.restore();

            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Zero State Warning
            if (isZeroBalance && res.id === 'engine') {
                ctx.fillStyle = colors.accent;
                ctx.font = '900 32px "Material Icons"';
                ctx.textAlign = 'center';
                ctx.fillText("warning", rx, ry + 12);

                ctx.fillStyle = colors.accent;
                ctx.font = 'bold 10px "Outfit", sans-serif';
                ctx.fillText("DEPLETED", rx, ry - 15);
            }

            if (!isZeroBalance) {
                const fillH = rSize * fillLevel;
                const osc = isTransferring ? Math.sin(Date.now() / 200 + i) * 2 : 0;

                ctx.beginPath();
                ctx.roundRect(rx - rSize + 2, ry + rSize / 2 - fillH + osc, rSize * 2 - 4, fillH - osc - 2, [0, 0, isMobile ? 6 : 12, isMobile ? 6 : 12]);
                ctx.fillStyle = colors.water;
                ctx.globalAlpha = 0.6;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Label
            ctx.fillStyle = colors.text;
            ctx.font = `bold ${isMobile ? '8px' : '12px'} "Outfit", sans-serif`;
            ctx.textAlign = 'center';

            const labelLines = isMobile && res.label.length > 15 ? res.label.split(' ') : [res.label];
            if (labelLines.length > 1) {
                ctx.fillText(labelLines[0].toUpperCase(), rx, ry + rSize / 2 + (isMobile ? 12 : 30));
                ctx.fillText(labelLines.slice(1).join(' ').toUpperCase(), rx, ry + rSize / 2 + (isMobile ? 20 : 45));
            } else {
                ctx.fillText(res.label.toUpperCase(), rx, ry + rSize / 2 + (isMobile ? 15 : 30));
            }

            const amount = currentWealth.current[res.id];
            const allocationText = amount > 0 ? `$${(amount / 1000000).toFixed(2)}M` : (res.id === 'engine' ? (isZeroBalance ? 'INSUFFICIENT CAPITAL' : '$0.00M') : 'WAITING FOR FLOW');

            ctx.fillStyle = colors.muted;
            ctx.font = '500 10px "Outfit", sans-serif';
            ctx.fillText(allocationText, rx, ry + rSize / 2 + (isMobile ? 32 : 60));
        });

        // --- Narrative Punchline ---
        ctx.textAlign = isMobile ? 'center' : 'left';
        ctx.fillStyle = colors.text;
        ctx.font = `800 ${isMobile ? '18px' : '32px'} "Outfit", sans-serif`;
        ctx.fillText("Physics of Wealth Transfer.", isMobile ? width / 2 : padding, isMobile ? 35 : 80);

        if (!isMobile) {
            ctx.fillStyle = colors.muted;
            ctx.font = '400 16px "Outfit", sans-serif';
            ctx.fillText("Watch your core engine fuel multi-generational legacy in real-time.", padding, 110);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        const updateSize = () => {
            if (!container) return;
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

        let animationFrame;
        let isVisible = false;

        const render = () => {
            if (!isVisible) return;
            const width = container.offsetWidth;
            const height = container.offsetHeight;
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
            resizeObserver.disconnect();
        };
    }, [isTransferring, theme, bridgedWealth, displayAllocations]);

    return (
        <div className="mx-auto mb-5 ps-lg-4" style={{ width: '100%' }} data-aos="fade-up">
            <div
                className="legacy-waterfall-visual-container position-relative overflow-hidden p-3 p-lg-4"
                style={{
                    width: '100%',
                    height: 'clamp(500px, 80vh, 800px)',
                    background: isDark ? 'rgba(13, 22, 41, 0.4)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '30px',
                    border: `1px solid ${colors.border}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.03)'
                }}
            >
                <canvas ref={canvasRef} style={{ display: 'block' }} />

                {/* Simulation Controls */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 mb-lg-5 d-flex flex-column flex-lg-row gap-2 gap-lg-3 w-100 px-4 px-lg-0" style={{ maxWidth: '400px' }}>
                    <button
                        onClick={initiateTransfer}
                        disabled={isZeroBalance}
                        className={`btn btn-premium rounded-pill py-3 fw-bold shadow-lg transition-all ${isTransferring || isZeroBalance ? 'disabled opacity-50' : ''}`}
                        style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
                    >
                        {isZeroBalance ? "INSUFFICIENT CAPITAL" : (isTransferring ? "TRANSFERRING..." : "INITIATE TRANSFER")}
                    </button>
                    {(isTransferring || isWaiting) && !isZeroBalance && (
                        <button
                            onClick={resetArchitecture}
                            className="btn btn-outline-light rounded-pill py-2 fw-bold"
                            style={{ fontSize: '0.65rem' }}
                        >
                            <span className="material-icons align-middle me-1" style={{ fontSize: '1rem' }}>refresh</span>
                            RESET
                        </button>
                    )}
                </div>

                <div className="position-absolute bottom-0 end-0 p-3 p-lg-4 opacity-30 font-monospace tracking-widest text-muted" style={{ fontSize: '0.55rem' }}>
                    DYNAMIC ESTATE SYSTEM
                </div>
            </div>

            <div className="text-center mt-4 opacity-50 small font-monospace" style={{ color: colors.muted }}>
                — ARCHITECTING THE FLOW OF SOVEREIGN CAPITAL: GENERATIONAL FILL RATES —
            </div>
        </div>
    );
};

export default LegacyWaterfall;
