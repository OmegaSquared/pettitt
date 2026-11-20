import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Karin's five-step PETTITT WEALTH planning process (Nov 20 handoff). The wheel divides itself by STEPS.length.
const STEPS = [
    {
        id: 1,
        title: "Understand",
        fullTitle: "Understand Your Situation",
        description: "Start with a conversation about your financial circumstances, goals, priorities, concerns, and the timing of important decisions.",
        color: "#F4C366"
    },
    {
        id: 2,
        title: "Examine",
        fullTitle: "Examine the Details",
        description: "Review relevant financial information, identify planning considerations, and evaluate different scenarios and assumptions.",
        color: "#F4C366"
    },
    {
        id: 3,
        title: "Develop",
        fullTitle: "Develop a Personalized Strategy",
        description: "Build recommendations around your individual situation, objectives, time horizon, and risk considerations.",
        color: "#F4C366"
    },
    {
        id: 4,
        title: "Coordinate",
        fullTitle: "Coordinate the Moving Pieces",
        description: "When appropriate, work with your accountant, estate-planning attorney, or other professional advisors to coordinate related financial decisions.",
        color: "#F4C366"
    },
    {
        id: 5,
        title: "Review",
        fullTitle: "Review as Life Changes",
        description: "Financial plans need to account for changing circumstances, goals, and market conditions. Ongoing reviews help determine whether adjustments may be appropriate.",
        color: "#F4C366"
    }
];

const PlanningProcessWheel = ({ theme }) => {
    const [hoveredStep, setHoveredStep] = useState(null);
    const [activeStep, setActiveStep] = useState(null);
    const isDark = theme === 'dark-mode';

    const currentStep = activeStep || hoveredStep || STEPS[0];

    return (
        <div className="planning-process-wheel-container py-5">
            <div className="row justify-content-center">
                <div className="col-12 d-flex justify-content-center">
                    <div className="position-relative" style={{ width: '100%', maxWidth: '900px' }}>
                        <svg viewBox="-100 -100 800 800" className="w-100 h-100 drop-shadow-2xl">
                            <defs>
                                <filter id="glow-heavy" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="8" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" style={{ stopColor: '#F4C366', stopOpacity: 0.1 }} />
                                    <stop offset="100%" style={{ stopColor: '#F4C366', stopOpacity: 0 }} />
                                </radialGradient>
                                <linearGradient id="activeStepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#F4C366', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#F4C366', stopOpacity: 1 }} />
                                </linearGradient>

                                {STEPS.map((step, i) => {
                                    const angleStep = (Math.PI * 2) / STEPS.length;
                                    const startAngle = i * angleStep - Math.PI / 2 - 0.05;
                                    const endAngle = (i + 1) * angleStep - Math.PI / 2 + 0.05;
                                    // Labels on the bottom of the wheel run right-to-left along the arc so they read upright.
                                    const flip = Math.sin(midAngle(startAngle, endAngle)) > 0.5;
                                    const rPath = flip ? 277 : 265;

                                    const xS = 300 + rPath * Math.cos(startAngle);
                                    const yS = 300 + rPath * Math.sin(startAngle);
                                    const xE = 300 + rPath * Math.cos(endAngle);
                                    const yE = 300 + rPath * Math.sin(endAngle);

                                    return (
                                        <path
                                            key={`path-${step.id}`}
                                            id={`textPath-${step.id}`}
                                            d={flip
                                                ? `M ${xE} ${yE} A ${rPath} ${rPath} 0 0 0 ${xS} ${yS}`
                                                : `M ${xS} ${yS} A ${rPath} ${rPath} 0 0 1 ${xE} ${yE}`}
                                            fill="none"
                                        />
                                    );
                                })}
                            </defs>

                            {/* Background Rings */}
                            <circle cx="300" cy="300" r="350" fill="url(#innerGlow)" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} strokeWidth="1" />
                            <circle cx="300" cy="300" r="210" fill="transparent" stroke={isDark ? "rgba(244, 195, 102,0.2)" : "rgba(244, 195, 102,0.1)"} strokeWidth="1" strokeDasharray="5 15" />

                            {STEPS.map((step, i) => {
                                const angleStep = (Math.PI * 2) / STEPS.length;
                                const startAngle = i * angleStep - Math.PI / 2;
                                const endAngle = (i + 1) * angleStep - Math.PI / 2;
                                const mid = midAngle(startAngle, endAngle);

                                const rOuter = 330;
                                const rInner = 205;
                                const rNum = 375;

                                const x1 = 300 + rOuter * Math.cos(startAngle);
                                const y1 = 300 + rOuter * Math.sin(startAngle);
                                const x2 = 300 + rOuter * Math.cos(endAngle);
                                const y2 = 300 + rOuter * Math.sin(endAngle);

                                const xi1 = 300 + rInner * Math.cos(startAngle);
                                const yi1 = 300 + rInner * Math.sin(startAngle);
                                const xi2 = 300 + rInner * Math.cos(endAngle);
                                const yi2 = 300 + rInner * Math.sin(endAngle);

                                const isActive = activeStep?.id === step.id;
                                const isHovered = hoveredStep?.id === step.id;

                                return (
                                    <g key={step.id}
                                        className="step-segment cursor-pointer"
                                        onMouseEnter={() => setHoveredStep(step)}
                                        onMouseLeave={() => setHoveredStep(null)}
                                        onClick={() => setActiveStep(isActive ? null : step)}
                                        style={{ transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)' }}>

                                        {/* Segment Path */}
                                        <path
                                            d={`M ${xi1} ${yi1} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${rInner} ${rInner} 0 0 0 ${xi1} ${yi1}`}
                                            fill={isActive || isHovered ? "rgba(244, 195, 102, 0.15)" : "transparent"}
                                            stroke={isActive ? "#F4C366" : isHovered ? "rgba(244, 195, 102,0.6)" : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                                            strokeWidth={isActive ? "5" : "1.5"}
                                            filter={isActive ? "url(#glow-heavy)" : "none"}
                                            style={{ transition: 'all 0.4s ease' }}
                                        />

                                        {/* Step Title (Curved) */}
                                        <text
                                            fill={isActive || isHovered ? "#F4C366" : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: '900',
                                                letterSpacing: '3px',
                                                pointerEvents: 'none',
                                                textShadow: isActive ? '0 0 15px rgba(244, 195, 102,0.6)' : 'none'
                                            }}>
                                            <textPath href={`#textPath-${step.id}`} startOffset="50%" textAnchor="middle">
                                                {step.title.toUpperCase()}
                                            </textPath>
                                        </text>

                                        {/* Step Number Badge */}
                                        <g transform={`translate(${300 + rNum * Math.cos(mid)}, ${300 + rNum * Math.sin(mid)})`}>
                                            <circle r="24" fill={isActive ? "#F4C366" : isDark ? "#162C49" : "#fff"} stroke={isActive ? "#F4C366" : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} strokeWidth="2.5" />
                                            <text dy="8" textAnchor="middle" fill={isActive ? "#fff" : isDark ? "#F4C366" : "#000"} style={{ fontSize: '22px', fontWeight: '900', fontFamily: "'Book Antiqua', 'Palatino Linotype', Palatino, 'Playfair Display', Georgia, serif" }}>{step.id}</text>
                                        </g>
                                    </g>
                                );
                            })}

                            {/* Center Logo/Step Indicator */}
                            <g transform="translate(300, 300)">
                                <circle r="200" fill={isDark ? "#0F1F35" : "#fff"} stroke={isDark ? "rgba(244, 195, 102,0.3)" : "rgba(0,0,0,0.1)"} strokeWidth="2" />
                                <circle r="185" fill="transparent" stroke="#F4C366" strokeWidth="1" strokeDasharray="2 10" className="decor-ring" />

                                <AnimatePresence mode="wait">
                                    <motion.g
                                        key={currentStep.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <foreignObject x="-160" y="-160" width="320" height="320">
                                            <div xmlns="http://www.w3.org/1999/xhtml" style={{
                                                textAlign: 'center',
                                                color: isDark ? '#fff' : '#000',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '10px',
                                                fontFamily: 'Raleway, sans-serif'
                                            }}>
                                                <div style={{ color: '#F4C366', fontSize: '14px', fontWeight: '900', letterSpacing: '5px', marginBottom: '10px', textShadow: '0 0 10px rgba(244, 195, 102,0.3)' }}>
                                                    STEP 0{currentStep.id}
                                                </div>
                                                <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '16px', textTransform: 'uppercase', lineHeight: '1.15', color: isDark ? '#fff' : '#000' }}>
                                                    {currentStep.fullTitle}
                                                </div>
                                                <div style={{ fontSize: '17px', color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)', lineHeight: '1.5', fontWeight: '500', maxWidth: '290px' }}>
                                                    {currentStep.description}
                                                </div>
                                            </div>
                                        </foreignObject>
                                    </motion.g>
                                </AnimatePresence>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .bg-white-5 { background: rgba(255,255,255,0.05); }
                .bg-white-3 { background: rgba(255,255,255,0.03); }
                .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5); }
                .hover-translate-y:hover { transform: translateY(-2px); border-color: rgba(244, 195, 102,0.4); background: rgba(244, 195, 102,0.05); color: #fff; }
                .decor-ring { transform-origin: center; opacity: 0.3; }
                .step-segment:hover text { filter: drop-shadow(0 0 5px rgba(244, 195, 102,0.3)); }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.4; transform: scale(1); } }
            `}</style>
        </div>
    );
};

const midAngle = (start, end) => start + (end - start) / 2;

export default PlanningProcessWheel;
