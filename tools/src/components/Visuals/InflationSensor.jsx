import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InflationSensor = ({ theme, inputs, externalRate, externalShock, setExternalRate, setExternalShock }) => {
    const canvasRef = useRef(null);
    const [years, setYears] = useState(0);
    const [internalRate, setInternalRate] = useState(2);
    const [internalShock, setInternalShock] = useState(false);
    const [isAuto, setIsAuto] = useState(false);
    const [phase, setPhase] = useState('initial'); // 'initial', 'running', 'paused', 'resumed', 'finished'
    const [showNominal, setShowNominal] = useState(false);
    const isDark = theme === 'dark-mode';


    const {
        age = 35,
        retirement = 65,
        target = 2000000,
        inflationRate: inputInflationRate = 2.5
    } = inputs || {};

    const inflationRate = externalRate !== undefined ? externalRate : (inputInflationRate !== undefined ? inputInflationRate : internalRate);
    const isShock = externalShock !== undefined ? externalShock : internalShock;

    const yearsToRetirement = retirement - age;

    const colors = {
        purchasingPower: '#C9D3EA', // Light Blue
        erosion: '#ff4444', // Red
        counterForce: '#F4C366', // PETTITT WEALTH Orange
        text: isDark ? '#f8f9fa' : '#0F1F35',
        white: '#ffffff',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        shock: '#ff5000'
    };

    const currentRate = isShock ? 7 : inflationRate;

    // Auto-loop logic
    useEffect(() => {
        if (!isAuto || phase === 'paused' || phase === 'finished') return;

        const interval = setInterval(() => {
            setYears(prev => {
                const next = prev + 0.1;
                const currentAge = age + next;

                if (phase === 'running' && currentAge >= retirement) {
                    setPhase('paused');
                    setIsAuto(false);
                    return retirement - age;
                }

                if (currentAge >= 100) {
                    setPhase('finished');
                    setIsAuto(false);
                    return 100 - age;
                }

                return next;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [isAuto, phase, age, retirement]);

    const handleStart = () => {
        setPhase('running');
        setIsAuto(true);
    };

    const handleResume = () => {
        setPhase('resumed');
        setIsAuto(true);
    };

    const handleReset = () => {
        setYears(0);
        setPhase('initial');
        setIsAuto(false);
    };

    const draw = (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);
        const isMobile = width < 768;
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = isMobile ? 80 : 120;

        const rateDecimal = currentRate / 100;
        const power = Math.pow(1 - rateDecimal, years);
        const currentRadius = baseRadius * Math.max(power, 0.1);
        const currentVal = target * power;

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = colors.border;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.save();
        ctx.shadowBlur = 40;
        ctx.shadowColor = isShock ? colors.shock : colors.purchasingPower;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = isShock ? colors.shock : colors.purchasingPower;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#0a192f'; // Deep navy for high contrast
        ctx.font = `bold ${isMobile ? '24px' : '36px'} "Outfit", sans-serif`;

        const displayVal = showNominal ? target : currentVal;
        const labelText = showNominal ? 'NOMINAL VALUE' : `${(power * 100).toFixed(1)}% PURCHASING POWER`;

        ctx.fillText(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(displayVal), centerX, centerY + (isMobile ? 8 : 12));

        ctx.fillStyle = 'rgba(10, 25, 47, 0.7)'; // Slightly transparent deep navy
        ctx.font = `bold ${isMobile ? '10px' : '12px'} "Outfit", sans-serif`;
        ctx.fillText(labelText, centerX, centerY + (isMobile ? 30 : 40));


        ctx.fillStyle = colors.counterForce;
        ctx.font = '800 12px "Outfit", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`CURRENT AGE: ${Math.floor(age + years)}`, 20, 30);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        const resize = () => {
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            if (!width || !height) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            draw(ctx, width, height);
        };

        resize();
        window.addEventListener('resize', resize);

        // Draw whenever relevant state changes
        draw(ctx, container.offsetWidth, container.offsetHeight);

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [years, theme, currentRate, isShock, showNominal]);

    return (
        <div className="inflation-sensor-cleanup w-100">
            <div
                className="position-relative overflow-hidden mb-4"
                style={{
                    height: '400px',
                    background: 'radial-gradient(circle at center, rgba(124, 139, 176,0.1) 0%, transparent 70%)',
                    borderRadius: '40px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <canvas ref={canvasRef} />

                <div className="position-absolute top-0 end-0 p-4 d-flex flex-column gap-2" style={{ zIndex: 10 }}>
                    <div className="glass-premium p-2 rounded-pill border-white-5 d-flex align-items-center gap-2 px-3">
                        <span className={`small fw-bold ${!showNominal ? 'text-orange' : 'text-white-50'}`} style={{ fontSize: '0.65rem' }}>REAL</span>
                        <div
                            className="position-relative bg-white-10 rounded-pill cursor-pointer"
                            style={{ width: '36px', height: '18px' }}
                            onClick={() => setShowNominal(!showNominal)}
                        >
                            <motion.div
                                animate={{ x: showNominal ? 18 : 2 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                className="bg-white rounded-circle position-absolute"
                                style={{ width: '14px', height: '14px', top: '2px' }}
                            />
                        </div>
                        <span className={`small fw-bold ${showNominal ? 'text-orange' : 'text-white-50'}`} style={{ fontSize: '0.65rem' }}>NOMINAL</span>
                    </div>

                    <div className="glass-premium p-3 rounded-4 border-white-5 text-end">
                        <div className="small text-muted font-monospace mb-2 uppercase">SIM ENGINE</div>
                        {phase === 'initial' ? (
                            <button onClick={handleStart} className="btn btn-premium btn-sm rounded-pill px-4 fw-bold">RUN</button>
                        ) : (
                            <button onClick={handleReset} className="btn btn-outline-light btn-sm rounded-pill px-4 fw-bold">RESET</button>
                        )}
                    </div>
                </div>


                <AnimatePresence>
                    {phase === 'paused' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="position-absolute bottom-0 start-50 translate-middle-x mb-4 text-center glass-premium p-3 rounded-4 border-orange w-75"
                            style={{ zIndex: 10, maxWidth: '400px', background: 'rgba(0,10,20,0.95)' }}
                        >
                            <div className="d-flex align-items-center justify-content-center gap-4">
                                <div className="text-start">
                                    <div className="x-small text-orange fw-bold uppercase tracking-widest">RETIREMENT REACHED</div>
                                    <div className="small text-white-50">Paused at age {retirement}</div>
                                </div>
                                <button onClick={handleResume} className="btn btn-premium btn-sm rounded-pill px-4 py-2">
                                    CONTINUE
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="text-center opacity-30 x-small font-monospace mb-2">
                — STAGE 1 PROTOCOL: INFLATION IMPACT SENSOR —
            </div>

            <style jsx>{`
                .border-orange { border-color: #F4C366 !important; }
                .border-white-5 { border-color: rgba(255,255,255,0.05) !important; }
                .x-small { font-size: 0.65rem; }
            `}</style>
        </div>
    );
};

export default InflationSensor;
