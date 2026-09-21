import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';

const RiskReturnCurve = ({ riskLevel, onRiskChange, isDark = true }) => {
    const svgRef = useRef(null);

    const generatePath = () => {
        const points = [];
        const numPoints = 60;
        for (let i = 0; i <= numPoints; i++) {
            const x = (i / numPoints) * 300;
            const y = 200 - (Math.sqrt(x) * 12 + x * 0.1);
            points.push(`${x},${y}`);
        }
        return `M ${points.join(' L ')}`;
    };

    const pathData = useMemo(() => generatePath(), []);

    const currentX = (riskLevel / 100) * 300;
    const currentY = 200 - (Math.sqrt(currentX) * 12 + currentX * 0.1);

    const returnVal = (3 + (riskLevel / 100) * 9).toFixed(1);
    const riskVal = (5 + (riskLevel / 100) * 25).toFixed(1);

    const handleDrag = (clientX) => {
        if (!svgRef.current) return;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
        // Map x=0 to 0% and x=300 to 100%. 
        // We use Math.round to help snapping to integers if needed, but float is fine for smoothness.
        const newLevel = Math.max(0, Math.min(100, (transformed.x / 300) * 100));
        onRiskChange(newLevel);
    };

    const onMouseDown = (e) => {
        handleDrag(e.clientX);
        const onMouseMove = (ev) => handleDrag(ev.clientX);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const onTouchStart = (e) => {
        handleDrag(e.touches[0].clientX);
        const onTouchMove = (ev) => handleDrag(ev.touches[0].clientX);
        const onTouchEnd = () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);
    };

    return (
        <div className="risk-return-container p-3 rounded-4 border border-white-5 overflow-hidden position-relative" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="d-flex justify-content-between mb-2">
                <div className="d-flex flex-column">
                    <span className="tiny text-white-50 uppercase tracking-widest fw-bold" style={{ fontSize: '0.6rem' }}>Risk / Return Profile</span>
                    <div className="d-flex align-items-baseline gap-2 mt-1">
                        <span className="h5 fw-900 text-white mb-0">{returnVal}%</span>
                        <span className="tiny text-white-30 uppercase tracking-tighter" style={{ fontSize: '0.6rem' }}>Expected Return</span>
                    </div>
                </div>
                <div className="d-flex flex-column text-end">
                    <span className="tiny text-white-50 uppercase tracking-widest fw-bold" style={{ fontSize: '0.6rem' }}>Portfolio Risk (σ)</span>
                    <div className="d-flex align-items-baseline gap-2 mt-1 justify-content-end">
                        <span className="h5 fw-900 text-omega-orange mb-0">{riskVal}</span>
                    </div>
                </div>
            </div>

            <div className="chart-area position-relative" style={{ height: '220px', marginTop: '10px' }}>
                <svg
                    ref={svgRef}
                    viewBox="-60 0 370 230"
                    className="w-100 h-100 overflow-visible cursor-crosshair"
                    style={{ touchAction: 'none' }}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                >
                    {/* Axis Labels - Moved further left (y value in rotated space) */}
                    <text x="-110" y="-45" fill="rgba(255,255,255,0.4)" transform="rotate(-90)" style={{ fontSize: '10px', fontWeight: 'bold', textAnchor: 'middle', letterSpacing: '1px' }}>EXPECTED RETURN ↑</text>
                    <text x="150" y="225" fill="rgba(255,255,255,0.4)" textAnchor="middle" style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>EXPECTED RISK →</text>

                    {/* Grid lines */}
                    <g className="grid-lines" stroke="rgba(255,255,255,0.05)" strokeWidth="1">
                        {[0, 50, 100, 150, 200].map(y => (
                            <line key={y} x1="0" y1={y} x2="300" y2={y} />
                        ))}
                        {[0, 60, 120, 180, 240, 300].map(x => (
                            <line key={x} x1={x} y1="0" x2={x} y2="200" />
                        ))}
                    </g>

                    {/* Indicator Lines */}
                    <g>
                        <motion.line
                            animate={{ x1: currentX, x2: currentX, y1: currentY, y2: 200 }}
                            transition={{ duration: 0 }}
                            stroke="rgba(244, 195, 102, 0.4)"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                        />
                        <motion.line
                            animate={{ x1: 0, x2: currentX, y1: currentY, y2: currentY }}
                            transition={{ duration: 0 }}
                            stroke="rgba(244, 195, 102, 0.4)"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                        />
                    </g>

                    {/* The Base Curve */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    {/* Active part of the curve */}
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke="url(#curveGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        animate={{ pathLength: riskLevel / 100 }}
                        transition={{ duration: 0 }}
                    />

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F4C366" />
                            <stop offset="100%" stopColor="#F4C366" />
                        </linearGradient>
                        <filter id="handleGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Handle */}
                    <motion.circle
                        animate={{ cx: currentX, cy: currentY }}
                        transition={{ duration: 0 }}
                        r="12"
                        fill="rgba(244, 195, 102, 0.3)"
                    />
                    <motion.circle
                        animate={{ cx: currentX, cy: currentY }}
                        transition={{ duration: 0 }}
                        r="6"
                        fill="#F4C366"
                        filter="url(#handleGlow)"
                    />
                    <motion.circle
                        animate={{ cx: currentX, cy: currentY }}
                        transition={{ duration: 0 }}
                        r="3"
                        fill="white"
                    />
                </svg>
            </div>

            <style jsx>{`
                .text-omega-orange { color: #F4C366 !important; }
                .fw-900 { font-weight: 950; }
                .cursor-crosshair { cursor: crosshair; }
            `}</style>
        </div>
    );
};

export default RiskReturnCurve;
