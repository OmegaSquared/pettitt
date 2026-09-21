import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    {
        id: 1,
        title: "Understanding",
        fullTitle: "Understanding Your Circumstances",
        description: "Gathering quantitative and qualitative data to build a diagnostic foundation.",
        insight: "Beyond the numbers, we must understand health, values, and life expectancy to architect a plan that survives reality.",
        details: {
            qualitative: ["Values & Attitudes", "Family Dynamics", "Risk Tolerance", "Expectations"],
            quantitative: ["Cash Flow Analysis", "Asset Inventory", "Liability Structure", "Tax Landscape"]
        },
        icon: "person_search",
        color: "#F4C366"
    },
    {
        id: 2,
        title: "Goals",
        fullTitle: "Identifying and Selecting Goals",
        description: "Defining and prioritizing objectives while acknowledging necessary trade-offs.",
        insight: "Goals are often competing. We must weigh the 'Lake Cabin' against 'Legacy' to find the optimal mathematical balance.",
        details: {
            process: ["Potential Goal Identification", "Selection & Prioritization", "Impact Analysis", "Feasibility Testing"]
        },
        icon: "track_changes",
        color: "#F4C366"
    },
    {
        id: 3,
        title: "Analyzing",
        fullTitle: "Analyzing Current & Alternative Paths",
        description: "Evaluating your current course against calculated probabilities of success.",
        insight: "We identify the 'Advantages' and 'Fatal Flaws' in your current trajectory before architecting alternatives.",
        details: {
            analysis: ["Current Path Evaluation", "Alternative Course Modeling", "Efficiency Audits", "Constraint Identification"]
        },
        icon: "analytics",
        color: "#F4C366"
    },
    {
        id: 4,
        title: "Developing",
        fullTitle: "Developing Recommendations",
        description: "Architecting specific strategies to maximize your probability of success.",
        insight: "Every recommendation must be independent yet synchronized, measured by its contribution to lifestyle goals.",
        details: {
            criteria: ["Assumptions & Estimates", "Timing & Priority", "Basis for Recommendation", "Inter-dependency Check"]
        },
        icon: "architecture",
        color: "#F4C366"
    },
    {
        id: 5,
        title: "Presenting",
        fullTitle: "Presenting the Roadmap",
        description: "A granular, technical review of your proposed strategic financial roadmap.",
        insight: "Interactive presentation is key. We move from abstract numbers to a visual roadmap of your financial future.",
        details: {
            delivery: ["Granular Technical Reports", "Probability Graphs", "Assumption Modeling", "Interactive Q&A"]
        },
        icon: "present_to_all",
        color: "#F4C366"
    },
    {
        id: 6,
        title: "Implementing",
        fullTitle: "Implementing the Recommendations",
        description: "Executing the strategy through shared responsibility and professional coordination.",
        insight: "Planning is only as good as its execution. We coordinate with specialists to ensure every brick is laid correctly.",
        details: {
            action: ["Responsibility Assignment", "Product & Service Selection", "Brokerage Coordination", "Legal/Tax Integration"]
        },
        icon: "construction",
        color: "#FFCC00"
    },
    {
        id: 7,
        title: "Monitoring",
        fullTitle: "Monitoring Progress & Updating",
        description: "The perpetual feedback loop—adjusting for life events and market dynamics.",
        insight: "Life is dynamic. We conduct periodic reviews to ensure the 'engine' is still performing according to the blueprint.",
        details: {
            oversight: ["Periodic Performance Review", "Goal Re-calibration", "Life Event Monitoring", "Decision Updating"]
        },
        icon: "sync_alt",
        color: "#FFD700"
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
                                    const angleStep = (Math.PI * 2) / 7;
                                    const startAngle = i * angleStep - Math.PI / 2 - 0.05;
                                    const endAngle = (i + 1) * angleStep - Math.PI / 2 + 0.05;
                                    const rPath = 265;

                                    const xS = 300 + rPath * Math.cos(startAngle);
                                    const yS = 300 + rPath * Math.sin(startAngle);
                                    const xE = 300 + rPath * Math.cos(endAngle);
                                    const yE = 300 + rPath * Math.sin(endAngle);

                                    return (
                                        <path
                                            key={`path-${step.id}`}
                                            id={`textPath-${step.id}`}
                                            d={`M ${xS} ${yS} A ${rPath} ${rPath} 0 0 1 ${xE} ${yE}`}
                                            fill="none"
                                        />
                                    );
                                })}
                            </defs>

                            {/* Background Rings */}
                            <circle cx="300" cy="300" r="350" fill="url(#innerGlow)" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} strokeWidth="1" />
                            <circle cx="300" cy="300" r="210" fill="transparent" stroke={isDark ? "rgba(244, 195, 102,0.2)" : "rgba(244, 195, 102,0.1)"} strokeWidth="1" strokeDasharray="5 15" />

                            {STEPS.map((step, i) => {
                                const angleStep = (Math.PI * 2) / 7;
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
                                                <div style={{ color: '#F4C366', fontSize: '14px', fontWeight: '900', letterSpacing: '5px', marginBottom: '8px', textShadow: '0 0 10px rgba(244, 195, 102,0.3)' }}>
                                                    PHASE 0{currentStep.id}
                                                </div>
                                                <div style={{ fontSize: '22px', fontWeight: '900', marginBottom: '12px', textTransform: 'uppercase', lineHeight: '1.1', color: isDark ? '#fff' : '#000' }}>
                                                    {currentStep.fullTitle}
                                                </div>
                                                <div style={{ fontSize: '15px', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)', lineHeight: '1.45', fontWeight: '400', marginBottom: '15px' }}>
                                                    {currentStep.description}
                                                </div>
                                                <div style={{
                                                    padding: '12px',
                                                    background: isDark ? 'rgba(244, 195, 102,0.08)' : 'rgba(244, 195, 102,0.04)',
                                                    borderRadius: '12px',
                                                    borderLeft: '4px solid #F4C366',
                                                    fontSize: '13.5px',
                                                    fontStyle: 'italic',
                                                    textAlign: 'left',
                                                    maxWidth: '280px',
                                                    marginBottom: '15px',
                                                    color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.85)',
                                                    lineHeight: '1.4'
                                                }}>
                                                    "{currentStep.insight}"
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                                                    {Object.values(currentStep.details).flat().slice(0, 4).map((item, i) => (
                                                        <span key={i} style={{
                                                            fontSize: '10px',
                                                            padding: '3px 10px',
                                                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                                            borderRadius: '20px',
                                                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                                            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)',
                                                            fontWeight: '600'
                                                        }}>
                                                            {item.toUpperCase()}
                                                        </span>
                                                    ))}
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
