import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PlanningLifecycleCanvas = ({ theme, inputs, onUpdate, isDiagnosticMode, hideOverlay = false }) => {
    const canvasRef = useRef(null);
    const [hoveredPhase, setHoveredPhase] = useState(0);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const isDark = theme === 'dark-mode';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Default inputs if not provided or missing fields
    const defaultInputs = {
        age: 35,
        retirement: 65,
        capital: 400000,
        target: 2000000,
        contribution: 500,
        returnRate: 9,
        stdDev: 19
    };
    const displayInputs = { ...defaultInputs, ...inputs };

    const handleUpdate = (newInputs) => {
        setHasInteracted(true);
        onUpdate(newInputs);
    };

    // --- Dynamic Phase & Assumption Logic ---
    const calculatePhase = () => {
        const { age, retirement, capital, target } = displayInputs;
        const wealthProgress = target > 0 ? (capital / target) : 0;
        const ageProgress = (age - 20) / (retirement - 20);

        // 1. Distribution: Age meets retirement AND wealth meets target
        if (age >= retirement && capital >= target) return 2;

        // 2. Protection: Logic "Greater of" age/amount situation
        // We move to protection if we hit 100% of our target OR are 80% through the accumulation window
        if (wealthProgress >= 1.0 || ageProgress >= 0.8) return 1;

        // 3. Accumulation (Default)
        return 0;
    };

    const autoPhase = calculatePhase();
    // Prioritize hover state first, then fallback to autoPhase if diagnostic or overlay is active
    const activeVisualPhase = isHovering ? hoveredPhase : ((isOverlayOpen || isDiagnosticMode) ? autoPhase : hoveredPhase);

    useEffect(() => {
        if (!hasInteracted) return;
        const { returnRate, stdDev } = displayInputs;
        let tR = returnRate, tS = stdDev;

        if (autoPhase === 0) { tR = 9; tS = 19; }
        else if (autoPhase === 1) { tR = 7; tS = 14; }
        else if (autoPhase === 2) { tR = 4; tS = 6; }

        if (tR !== returnRate || tS !== stdDev) {
            onUpdate({ ...displayInputs, returnRate: tR, stdDev: tS });
        }
    }, [autoPhase, hasInteracted, displayInputs.age, displayInputs.capital, displayInputs.target]);

    const phases = [
        {
            label: "Accumulation",
            subtitle: "STRATEGIC GROWTH",
            desc: "Focus on maximum capital efficiency and systematic wealth creation. Identifying high-asymmetry opportunities while time is the primary leverage.",
            focus: "Compound Growth",
            tactics: ["Tax-Efficient Saving", "Aggressive Reinvestment", "Risk-Aware Allocation"],
            color: '#C9D3EA', // Light Blue
            colorGlow: 'rgba(169, 197, 230, 0.4)'
        },
        {
            label: "Protection",
            subtitle: "ASSET DEFENSE",
            desc: "The critical pivot where protecting capital becomes as important as growing it. Locking in gains and insulating legacy from cyclical volatility.",
            focus: "Capital Protection",
            tactics: ["Defensive Layering", "Estate Architecture", "Volatility Dampening"],
            color: '#F4C366', // PETTITT WEALTH Orange
            colorGlow: 'rgba(244, 195, 102, 0.4)'
        },
        {
            label: "Distribution",
            subtitle: "LEGACY GOAL",
            desc: "Converting wealth into a sustainable, tax-optimized engine for lifestyle and legacy. Ensuring capital is treated best as it transitions to the next generation.",
            focus: "Income & Impact",
            tactics: ["Tax Arbitrage", "Philanthropic Strategy", "Multi-Gen Transfer"],
            color: '#7C8BB0', // PETTITT WEALTH Blue
            colorGlow: 'rgba(124, 139, 176, 0.4)'
        }
    ];

    const colors = {
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        white: '#ffffff',
        cyan: '#00ffff'
    };

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const isMobile = width < 768;
        const padding = isMobile ? 40 : 80;
        const curveWidth = width - padding * 2;
        const curveHeight = height * 0.45;
        const curveYBase = height * (isMobile ? 0.82 : 0.75);

        // --- 1. Draw Background Grid ---
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = curveYBase - (i * (curveHeight / 5));
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // --- 2. Define the Wealth Curve (S-Curve) ---
        const p0 = { x: padding, y: curveYBase };
        const p1 = { x: padding + curveWidth * 0.3, y: curveYBase - curveHeight * (isMobile ? 0.8 : 1.2) };
        const p2 = { x: padding + curveWidth * 0.7, y: curveYBase - curveHeight * (isMobile ? 1.0 : 1.5) };
        const p3 = { x: width - padding, y: curveYBase - curveHeight * 0.6 };

        const getBezierPoint = (t) => {
            const cx = 3 * (p1.x - p0.x);
            const bx = 3 * (p2.x - p1.x) - cx;
            const ax = p3.x - p0.x - cx - bx;
            const cy = 3 * (p1.y - p0.y);
            const by = 3 * (p2.y - p1.y) - cy;
            const ay = p3.y - p0.y - cy - by;
            const x = (ax * Math.pow(t, 3)) + (bx * Math.pow(t, 2)) + (cx * t) + p0.x;
            const y = (ay * Math.pow(t, 3)) + (by * Math.pow(t, 2)) + (cy * t) + p0.y;
            return { x, y };
        };

        // --- 3. Draw the Main Curve ---
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.01) {
            const pt = getBezierPoint(t);
            if (t === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = isMobile ? 8 : 12;
        ctx.lineCap = 'round';
        ctx.stroke();

        const currentPhase = phases[activeVisualPhase] || phases[0];

        ctx.save();
        ctx.shadowBlur = isMobile ? 15 : 30;
        ctx.shadowColor = currentPhase.colorGlow;
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.01) {
            const pt = getBezierPoint(t);
            if (t === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = currentPhase.color;
        ctx.lineWidth = isMobile ? 3 : 4;
        ctx.stroke();
        ctx.restore();

        // --- 4. Draw Phase Markers ---
        const phaseTs = [0.12, 0.42, 0.82];
        phaseTs.forEach((t, i) => {
            const pt = getBezierPoint(t);
            const isHighlighted = i === activeVisualPhase;
            const phase = phases[i];

            // Marker Background
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isHighlighted ? (isMobile ? 8 : 12) : (isMobile ? 5 : 8), 0, Math.PI * 2);
            ctx.fillStyle = phase.color;
            ctx.fill();

            if (isHighlighted) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = isMobile ? 2 : 3;
                ctx.stroke();
                ctx.shadowBlur = isMobile ? 20 : 40;
                ctx.shadowColor = phase.color;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, isMobile ? 12 : 20, 0, Math.PI * 2);
                ctx.strokeStyle = phase.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Phase Labels on Curve (DESKTOP ONLY to prevent overlap)
            if (!isMobile) {
                ctx.textAlign = 'center';
                ctx.font = `bold ${isMobile ? '14px' : '18px'} "Outfit", sans-serif`;
                ctx.fillStyle = colors.white;
                ctx.fillText(phase.label.toUpperCase(), pt.x, pt.y - (isMobile ? 25 : 35));
            }

            if (!isMobile) {
                ctx.font = '8px font-monospace';
                ctx.fillStyle = colors.muted;
                ctx.fillText(`COORD: ${pt.x.toFixed(1)} / ${pt.y.toFixed(1)}`, pt.x, pt.y + 25);
            }
        });

        // --- 5. Draw Tactical Detail Overlay (Top Left - DESKTOP ONLY) ---
        const detailX = padding + (isMobile ? 10 : 20);
        const detailY = isMobile ? 100 : 70;
        const activePhase = phases[activeVisualPhase] || phases[0];

        if (!isMobile) {
            ctx.textAlign = 'left';
            ctx.fillStyle = activePhase.color;
            ctx.font = `800 ${isMobile ? '12px' : '14px'} "Outfit", sans-serif`;
            ctx.fillText(activePhase.subtitle, detailX, detailY);

            ctx.fillStyle = colors.text;
            ctx.font = `700 ${isMobile ? '22px' : '32px'} "Outfit", sans-serif`;
            ctx.fillText(activePhase.label, detailX, detailY + (isMobile ? 25 : 45));

            ctx.fillStyle = colors.muted;
            ctx.font = `400 ${isMobile ? '14px' : '17px'} "Outfit", sans-serif`;
            const words = activePhase.desc.split(' ');
            let line = '';
            let lineCount = 0;
            const maxWidth = isMobile ? width - padding * 3 : 400;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, detailX, detailY + (isMobile ? 40 : 75) + (lineCount * (isMobile ? 15 : 24)));
                    line = words[n] + ' ';
                    lineCount++;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, detailX, detailY + (isMobile ? 40 : 75) + (lineCount * (isMobile ? 15 : 24)));
        }

        // --- 6. Draw Tactical Priorities (Bottom Left - DESKTOP ONLY) ---
        if (!isMobile) {
            const prioY = height - (isMobile ? 120 : 80);
            ctx.fillStyle = colors.text;
            ctx.font = `700 ${isMobile ? '13px' : '16px'} "Outfit", sans-serif`;
            ctx.fillText("TACTICAL PRIORITIES:", detailX, isMobile ? prioY - 10 : prioY);

            activePhase.tactics.forEach((tactic, i) => {
                const tx = isMobile ? detailX : detailX + (i * 250);
                const ty = isMobile ? prioY + 10 + (i * 22) : prioY + 35;
                ctx.beginPath();
                ctx.arc(tx + 5, ty - 4, isMobile ? 3 : 4, 0, Math.PI * 2);
                ctx.fillStyle = activePhase.color;
                ctx.fill();
                ctx.fillStyle = colors.text;
                ctx.font = `500 ${isMobile ? '13px' : '17px'} "Outfit", sans-serif`;
                ctx.fillText(tactic, tx + 18, ty);
            });
        }

        // --- 7. AXIS LABELS ---
        if (!isMobile) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 12px "Outfit", sans-serif';
            ctx.fillStyle = colors.muted;
            ctx.save();
            ctx.translate(30, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText("ASSET MAGNITUDE (NAV)", 0, 0);
            ctx.restore();
            // Axis label at very bottom
            ctx.fillText("THE WEALTH LIFE CYCLE JOURNEY", width / 2, height - 12);
        }

        // --- 8. Personalized Coordinate Dot (If Diagnostic Mode) ---
        if (isDiagnosticMode && (hasInteracted || displayInputs.age !== 35)) {
            const journeyAgeProgress = (displayInputs.age - 20) / (85 - 20);
            // Wealth progress caps at ~75% of curve space to align with Distribution marker
            const journeyWealthProgress = displayInputs.target > 0 ? (displayInputs.capital / displayInputs.target) * 0.5 : 0;
            const t = Math.min(Math.max(Math.max(journeyAgeProgress, journeyWealthProgress), 0.1), 0.9);
            const pt = getBezierPoint(t);

            ctx.save();
            ctx.shadowBlur = isMobile ? 20 : 40;
            ctx.shadowColor = '#00ffff';
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isMobile ? 10 : 18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.fill();

            const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, (isMobile ? 14 : 25) + pulse * (isMobile ? 5 : 10), 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Coordinate Label
            ctx.textAlign = 'left';
            ctx.font = `bold ${isMobile ? '9px' : '14px'} "Outfit"`;
            ctx.fillStyle = '#00ffff';
            ctx.fillText("CURRENT POSITION", pt.x + (isMobile ? 15 : 30), pt.y - (isMobile ? 5 : 10));

            if (!isMobile) {
                ctx.font = '10px font-monospace';
                ctx.fillText(`AGE: ${displayInputs.age} // CAP_DENSITY: ${(displayInputs.capital / 1000000).toFixed(1)}M`, pt.x + 30, pt.y + 10);
            }
        }
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = canvas.offsetWidth;
        const padding = 80;
        if (x < padding || x > width - padding) return;
        const stageWidth = (width - padding * 2) / phases.length;
        const phaseIdx = Math.floor((x - padding) / stageWidth);
        if (phaseIdx >= 0 && phaseIdx < phases.length && phaseIdx !== hoveredPhase) {
            setHoveredPhase(phaseIdx);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        let animationFrame;
        let isVisible = false;

        const renderLoop = () => {
            if (!isVisible) return;
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const dpr = window.devicePixelRatio || 1;
            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
                ctx.resetTransform();
                ctx.scale(dpr, dpr);
            }
            draw(ctx, width, height);
            animationFrame = requestAnimationFrame(renderLoop);
        };

        const resizeObserver = new ResizeObserver(() => { });
        resizeObserver.observe(container);

        const intersectionObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isVisible = entry.isIntersecting;
            if (isVisible) {
                cancelAnimationFrame(animationFrame);
                animationFrame = requestAnimationFrame(renderLoop);
            } else {
                cancelAnimationFrame(animationFrame);
            }
        }, { threshold: 0.01 });

        intersectionObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [activeVisualPhase, theme, inputs, isDiagnosticMode, hasInteracted]);

    return (
        <div className="mx-auto mb-5 ps-lg-4" style={{ width: '100%' }} data-aos="fade-up">
            <div
                className="lifecycle-visual-container position-relative overflow-hidden p-3 p-lg-4"
                style={{
                    width: '100%',
                    height: isMobile ? '520px' : 'clamp(600px, 85vh, 900px)',
                    background: isDark ? 'rgba(13, 22, 41, 0.4)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '40px',
                    border: '1px solid ' + colors.border,
                    backdropFilter: 'blur(30px)',
                    cursor: 'crosshair',
                    boxShadow: isDark ? '0 30px 100px -20px rgba(0,0,0,0.6)' : '0 15px 40px rgba(0,0,0,0.03)'
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onTouchMove={(e) => {
                    const touch = e.touches[0];
                    handleMouseMove({ clientX: touch.clientX });
                }}
            >
                {/* Canvas */}
                <canvas ref={canvasRef} style={{ display: 'block' }} />

                {/* Mobile-Only Header Overlay */}
                {isMobile && (
                    <div className="position-absolute top-0 start-0 w-100 p-4 text-start" style={{ zIndex: 1, pointerEvents: 'none' }}>
                        <div className="text-orange fw-bold x-small font-monospace mb-1 uppercase tracking-widest" style={{ opacity: 0.8 }}>
                            {phases[activeVisualPhase]?.subtitle}
                        </div>
                        <h3 className="text-white fw-900 mb-1" style={{ fontSize: '1.4rem' }}>
                            {phases[activeVisualPhase]?.label}
                        </h3>
                        <p className="text-white-50 x-small mb-0" style={{ lineHeight: '1.4', maxWidth: '90%' }}>
                            {phases[activeVisualPhase]?.desc}
                        </p>
                    </div>
                )}

                {/* Overlay Control Panel */}
                <AnimatePresence>
                    {isOverlayOpen && !hideOverlay && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className="position-absolute top-0 end-0 h-100 p-3 p-lg-4"
                            style={{ zIndex: 10, width: 'clamp(320px, 40%, 450px)' }}
                        >
                            <div className="glass-premium-dark h-100 rounded-4 border-white-10 p-4 shadow-2xl d-flex flex-column overflow-auto">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="nav-label text-gradient-orange mb-0" style={{ fontSize: 'var(--font-size-small)', letterSpacing: '2px' }}>COORDINATE DIAGNOSTIC</div>
                                    <button onClick={() => setIsOverlayOpen(false)} className="btn btn-sm btn-link text-white-50 p-0 hover-rotate">
                                        <span className="material-icons">close</span>
                                    </button>
                                </div>

                                <div className="diagnostic-inputs-scroll flex-grow-1 pr-2">
                                    <div className="mb-5">
                                        <div className="text-white-70 fw-bold tracking-widest mb-3" style={{ fontSize: 'var(--font-size-tiny)' }}>I. PERSONAL TRAJECTORY</div>
                                        <DiagnosticSlider
                                            label="CURRENT AGE"
                                            value={displayInputs.age}
                                            min={20} max={85}
                                            unit=""
                                            onChange={(v) => handleUpdate({ ...displayInputs, age: v })}
                                        />
                                        <DiagnosticSlider
                                            label="RETIREMENT TARGET"
                                            value={displayInputs.retirement}
                                            min={40} max={85}
                                            unit=""
                                            onChange={(v) => handleUpdate({ ...displayInputs, retirement: v })}
                                        />
                                        <DiagnosticSlider
                                            label="LIQUID CAPITAL"
                                            value={displayInputs.capital}
                                            min={0} max={5000000} step={100000}
                                            unit="M" unitScale={1000000}
                                            onChange={(v) => handleUpdate({ ...displayInputs, capital: v })}
                                        />
                                        <DiagnosticSlider
                                            label="IDEAL RETIREMENT"
                                            value={displayInputs.target}
                                            min={500000} max={50000000} step={500000}
                                            unit="M" unitScale={1000000}
                                            onChange={(v) => handleUpdate({ ...displayInputs, target: v })}
                                        />
                                        <DiagnosticSlider
                                            label="MONTHLY CONTRIBUTION"
                                            value={displayInputs.contribution}
                                            min={0} max={10000} step={100}
                                            unit=""
                                            isCurrency={true}
                                            onChange={(v) => handleUpdate({ ...displayInputs, contribution: v })}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-white-70 fw-bold tracking-widest mb-3" style={{ fontSize: 'var(--font-size-tiny)' }}>II. MARKET ASSUMPTIONS</div>
                                        <DiagnosticSlider
                                            label="ESTIMATED RETURN"
                                            value={displayInputs.returnRate}
                                            min={1} max={15} step={0.5}
                                            unit="%"
                                            onChange={(v) => handleUpdate({ ...displayInputs, returnRate: v })}
                                        />
                                        <DiagnosticSlider
                                            label="STD DEVIATION"
                                            value={displayInputs.stdDev}
                                            min={5} max={30}
                                            unit="%"
                                            onChange={(v) => handleUpdate({ ...displayInputs, stdDev: v })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-top border-white-5">
                                    <div className="glass-vibrant p-3 rounded-3 mb-3" style={{ background: 'rgba(244, 195, 102,0.05)' }}>
                                        <div className="d-flex align-items-center gap-2 text-orange mb-1">
                                            <span className="material-icons" style={{ fontSize: '1rem' }}>auto_awesome</span>
                                            <span className="fw-bold small font-monospace tracking-widest">PROJECTION SYNC</span>
                                        </div>
                                        <p className="text-white-70 mb-0" style={{ fontSize: 'var(--font-size-tiny)', lineHeight: '1.6' }}>
                                            This data calibrates your current trajectory and can be used in future planning assessments.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsOverlayOpen(false)}
                                        className="btn btn-premium w-100 rounded-pill py-3 fw-bold font-monospace shadow-lg d-flex align-items-center justify-content-center gap-2 hover-scale transition-all btn-pulse"
                                        style={{
                                            fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                                            letterSpacing: '3px',
                                            background: 'linear-gradient(135deg, #F4C366 0%, #FFB200 100%)',
                                            border: 'none',
                                            boxShadow: '0 0 30px rgba(244, 195, 102, 0.4)'
                                        }}
                                    >
                                        <span>CONTINUE</span>
                                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="position-absolute bottom-0 end-0 p-2 p-lg-4 opacity-30 small font-monospace tracking-widest text-muted" style={{ fontSize: '0.55rem' }}>
                    INTERACTIVE LIFE CYCLE PLATFORM // v2.4.0
                </div>
            </div>

            <style jsx>{`
                .accent-orange { accent-color: #F4C366; }
                .diagnostic-active { border-color: rgba(0, 255, 255, 0.4) !important; box-shadow: 0 0 50px rgba(0, 255, 255, 0.1) !important; }
                .glass-premium-dark { background: rgba(10, 15, 25, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
                .shadow-2xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8); }
                .hover-scale:hover { transform: scale(1.02); }
                .hover-rotate:hover .material-icons { transform: rotate(90deg); transition: transform 0.3s ease; }
                .btn-pulse { animation: pulse-glow 2s infinite; }
                .btn-start-flash { animation: start-flash 2.5s infinite; }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(244, 195, 102, 0.6); transform: scale(1); }
                    50% { box-shadow: 0 0 20px 10px rgba(244, 195, 102, 0); transform: scale(1.02); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 195, 102, 0.6); transform: scale(1); }
                }
                @keyframes start-flash {
                    0% { box-shadow: 0 0 0 0 rgba(244, 195, 102, 0.4); background: rgba(244, 195, 102, 0.1); }
                    50% { box-shadow: 0 0 50px 15px rgba(244, 195, 102, 0.6); background: rgba(244, 195, 102, 0.4); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 195, 102, 0); background: rgba(244, 195, 102, 0.1); }
                }
            `}</style>

            <div className="text-center mt-4 opacity-50 small font-monospace" style={{ color: colors.muted, fontSize: '0.7rem' }}>
                — ANALYZE STRATEGIC ADAPTATION ACROSS THE WEALTH CURVE —
            </div>
        </div>
    );
};

export const DiagnosticSlider = ({ label, value, min, max, step = 1, unit, unitScale = 1, isCurrency = false, onChange }) => (
    <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
            <span className="text-white-70 fw-bold tracking-widest" style={{ fontSize: 'var(--font-size-tiny)' }}>{label}</span>
            <span className="text-white font-monospace fw-bold" style={{ fontSize: 'var(--font-size-small)' }}>
                {isCurrency ? '$' + value?.toLocaleString() : (unit === 'M' ? '$' + (value / unitScale).toFixed(1) + 'M' : value + unit)}
            </span>
        </div>
        <div className="position-relative d-flex align-items-center py-2">
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={(e) => onChange(unitScale === 1000000 ? parseInt(e.target.value) : parseFloat(e.target.value))}
                className="w-100 custom-diag-range"
            />
        </div>

        <style jsx>{`
            .custom-diag-range { 
                -webkit-appearance: none;
                width: 100%;
                height: 6px;
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
                outline: none;
                cursor: pointer;
            }
            .custom-diag-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                background: #FFFFFF;
                border: 3px solid #F4C366;
                border-radius: 50%;
                box-sizing: border-box;
                margin-top: -5px;
                box-shadow: 0 0 10px rgba(244, 195, 102,0.5);
                transition: transform 0.2s ease;
            }
            .custom-diag-range::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }
        `}</style>
    </div>
);

export default PlanningLifecycleCanvas;
