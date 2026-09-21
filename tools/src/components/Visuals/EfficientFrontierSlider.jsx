import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * EfficientFrontierSlider
 * A custom slider that follows a hyperbolic curve (Efficient Frontier)
 * Returns { returnRate, stdDev }
 */
const EfficientFrontierSlider = ({
    initialReturn = 9,
    initialStdDev = 19,
    onChange,
    minReturn = 3,
    maxReturn = 11,
    minStdDev = 5,
    maxStdDev = 25
}) => {
    const svgRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Internal state for the handle position (0 to 1 along the curve)
    // We'll calculate the initial t based on initialReturn
    const initialT = (initialReturn - minReturn) / (maxReturn - minReturn);
    const [t, setT] = useState(initialT);

    const width = 300;
    const height = 150;
    const padding = 20;

    // Helper to calculate Risk based on Return (t)
    // Historical markers:
    // 4% -> 5% (Conservative)
    // 7% -> 11% (Balanced)
    // 8% -> 15% (Growth)
    // 9% -> 19% (Aggressive Expansion)
    // 10% -> 23% (Aggressive)
    const calculateStdDev = (val) => {
        const ret = minReturn + val * (maxReturn - minReturn);

        // Efficient Frontier Shape: Risks increases faster at higher returns
        // We use Math.max(0, ...) to prevent NaN when val < vertexT
        const vertexT = 0.05;
        const baseStdDev = 5;
        const diff = Math.max(0, val - vertexT);
        const variance = Math.pow(diff, 1.8) * 30 + baseStdDev;
        return Math.min(maxStdDev, Math.max(minStdDev, variance));
    };

    useEffect(() => {
        if (onChange) {
            const returnRate = minReturn + t * (maxReturn - minReturn);
            const stdDev = calculateStdDev(t);
            onChange({ returnRate: parseFloat(returnRate.toFixed(1)), stdDev: parseFloat(stdDev.toFixed(1)) });
        }
    }, [t]);

    const handleUpdate = (e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();

        // Handle both mouse and touch events
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const mouseY = clientY - rect.top;
        const h = height - 2 * padding;
        const normalizedY = (height - padding - mouseY) / h;
        const newT = Math.max(0, Math.min(1, normalizedY));
        setT(newT);
    };

    const onMouseDown = (e) => {
        setIsDragging(true);
        handleUpdate(e);
    };

    const onTouchStart = (e) => {
        setIsDragging(true);
        handleUpdate(e);
    };

    const onMouseMove = (e) => {
        if (isDragging) {
            handleUpdate(e);
        }
    };

    const onTouchMove = (e) => {
        if (isDragging) {
            handleUpdate(e);
        }
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onTouchEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging]);

    const currentPoint = useMemo(() => {
        const pt = (val) => {
            const h = height - 2 * padding;
            const w = width - 2 * padding;
            const py = padding + (1 - val) * h;
            const vertexT = 0.05;
            const diff = Math.max(0, val - vertexT);
            const px = padding + Math.pow(diff, 1.8) * (w * 0.95);
            return { x: px, y: py };
        };
        return pt(t);
    }, [t, width, height, padding]);

    // Generate path points for rendering
    const fullPathData = useMemo(() => {
        let d = "";
        for (let i = 0; i <= 1; i += 0.02) {
            const pt = (val) => {
                const h = height - 2 * padding;
                const w = width - 2 * padding;
                const py = padding + (1 - val) * h;
                const vertexT = 0.05;
                const diff = Math.max(0, val - vertexT);
                const px = padding + Math.pow(diff, 1.8) * (w * 0.95);
                return { x: px, y: py };
            };
            const p = pt(i);
            d += (i === 0 ? "M " : " L ") + p.x + " " + p.y;
        }
        return d;
    }, [width, height, padding]);

    const activePathData = useMemo(() => {
        let d = "";
        for (let i = 0; i <= t; i += 0.02) {
            const pt = (val) => {
                const h = height - 2 * padding;
                const w = width - 2 * padding;
                const py = padding + (1 - val) * h;
                const vertexT = 0.05;
                const diff = Math.max(0, val - vertexT);
                const px = padding + Math.pow(diff, 1.8) * (w * 0.95);
                return { x: px, y: py };
            };
            const p = pt(i);
            d += (i === 0 ? "M " : " L ") + p.x + " " + p.y;
        }
        // Always ensure the line ends at exactly t
        const ptFinal = (val) => {
            const h = height - 2 * padding;
            const w = width - 2 * padding;
            const py = padding + (1 - val) * h;
            const vertexT = 0.05;
            const diff = Math.max(0, val - vertexT);
            const px = padding + Math.pow(diff, 1.8) * (w * 0.95);
            return { x: px, y: py };
        };
        const pFinal = ptFinal(t);
        d += (t === 0 ? "M " : " L ") + pFinal.x + " " + pFinal.y;
        return d;
    }, [t, width, height, padding]);

    return (
        <div className="efficient-frontier-slider-container mb-3">
            <div className="d-flex justify-content-between align-items-end mb-2">
                <div>
                    <div className="text-white-50 font-monospace uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Risk / Return Profile</div>
                    <div className="text-white fw-bold d-flex gap-3 mt-1">
                        <span style={{ fontSize: '0.9rem' }}>{minReturn + t * (maxReturn - minReturn) >= 10 ? '' : '\u00A0'}{(minReturn + t * (maxReturn - minReturn)).toFixed(1)}% Return</span>
                        <span className="text-white-30">|</span>
                        <span style={{ fontSize: '0.9rem' }}>{calculateStdDev(t).toFixed(1)} Risk</span>
                    </div>
                </div>
            </div>

            <div
                className="position-relative bg-black-20 rounded-3 border border-white-5 overflow-hidden"
                style={{ height: height + 'px', cursor: 'crosshair', background: 'rgba(0,0,0,0.2)' }}
                ref={svgRef}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                {/* Grid lines */}
                <div className="position-absolute w-100 h-100 opacity-10 pointer-events-none">
                    <div className="w-100 h-100" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>
                </div>

                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F4C366" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#F4C366" stopOpacity="1" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Track Background (Inactive) */}
                    <path
                        d={fullPathData}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />

                    {/* Active Path (Purple) */}
                    <path
                        d={activePathData}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />

                    {/* Handle */}
                    <circle
                        cx={currentPoint.x}
                        cy={currentPoint.y}
                        r="8"
                        fill="#A855F7"
                        style={{
                            filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.5))',
                            cursor: 'grab'
                        }}
                    />

                    {/* Invisible larger handle for easier dragging */}
                    <circle
                        cx={currentPoint.x}
                        cy={currentPoint.y}
                        r="20"
                        fill="transparent"
                        style={{ cursor: 'grab' }}
                    />
                </svg>

                {/* Axis Labels */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x p-2 text-white-30 font-monospace text-center w-100" style={{ fontSize: '0.5rem' }}>RISK (σ) →</div>
                <div className="position-absolute top-0 start-0 p-2 text-white-30 font-monospace" style={{ fontSize: '0.5rem', transform: 'rotate(-90deg) translateX(-100%)', transformOrigin: 'top left' }}>RETURN (R) →</div>
            </div>

            <style jsx>{`
                .efficient-frontier-slider-container {
                    user-select: none;
                }
            `}</style>
        </div>
    );
};

export default EfficientFrontierSlider;
