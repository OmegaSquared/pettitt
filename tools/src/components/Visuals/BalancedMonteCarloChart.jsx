import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BalancedMonteCarloChart = ({
    theme, startingCapitals, age, retirement, target,
    totalThreshold, recalibratedThreshold, useInflation,
    pivotLeadTime = 10,
    contribution: initialContribution = 500,
    bridgeProbability = 100,
    returnRate: externalReturnRate,
    stdDev: externalStdDev,
    onSimComplete,
    onUpdate
}) => {
    const canvasRef = useRef(null);
    const isDark = theme === 'dark-mode';

    const [selectedScenario, setSelectedScenario] = useState('95%');

    const returnRate = externalReturnRate !== undefined ? externalReturnRate : 7;
    const stdDev = externalStdDev !== undefined ? externalStdDev : 14;
    const [contribution, setContribution] = useState(initialContribution);

    useEffect(() => {
        if (initialContribution !== undefined && initialContribution !== contribution) {
            setContribution(initialContribution);
        }
    }, [initialContribution]);

    const startAge = Math.max(age, retirement - pivotLeadTime);
    const YEARS = retirement - startAge;
    const MONTHS = Math.max(1, YEARS * 12);
    const NUM_ITERATIONS = 1000;

    const colors = {
        mean: '#F4C366', // PETTITT WEALTH Orange for the balanced path
        path: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        band1: isDark ? 'rgba(244, 195, 102, 0.15)' : 'rgba(244, 195, 102, 0.08)',
        band2: isDark ? 'rgba(244, 195, 102, 0.08)' : 'rgba(244, 195, 102, 0.04)',
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        success: '#00ff64',
        warning: '#ff4444',
        threshold: '#C9D3EA' // Blue for total threshold
    };

    const activeThreshold = useInflation ? recalibratedThreshold : totalThreshold;

    const mensalMean = (returnRate / 100) / 12;
    const mensalVol = (stdDev / 100) / Math.sqrt(12);

    const startingCapital = useMemo(() => {
        if (!startingCapitals) return 0;
        if (selectedScenario === '68%') return startingCapitals.sd1;
        if (selectedScenario === '95%') return startingCapitals.sd2;
        return startingCapitals.mean;
    }, [startingCapitals, selectedScenario]);

    // 1. Visibility tracking
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const observer = new IntersectionObserver((entries) => {
            setIsVisible(entries[0].isIntersecting);
        }, { threshold: 0.05 });
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    // 2. Input Debouncing
    const [debouncedInputs, setDebouncedInputs] = useState({
        startingCapital, age, retirement, target, activeThreshold, returnRate, stdDev, contribution, selectedScenario
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInputs({
                startingCapital, age, retirement, target, activeThreshold, returnRate, stdDev, contribution, selectedScenario
            });
        }, 250);
        return () => clearTimeout(handler);
    }, [startingCapital, age, retirement, target, activeThreshold, returnRate, stdDev, contribution, selectedScenario]);

    const simData = useMemo(() => {
        // Only run simulation if visible and we have valid data
        if (!isVisible || !age || !retirement || !startingCapitals || startingCapital === 0) return null;

        const {
            startingCapital: dCap,
            age: dAge,
            retirement: dRet,
            target: dTarget,
            activeThreshold: dThreshold,
            returnRate: dRate,
            stdDev: dVol,
            contribution: dCont
        } = debouncedInputs;

        console.log(`[Simulation] Running Balanced Monte Carlo for age ${dAge} to ${dRet}`);

        const randNormal = () => {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        const dMensalMean = (dRate / 100) / 12;
        const dMensalVol = (dVol / 100) / Math.sqrt(12);

        const runSim = (startValue) => {
            let successCount = 0;
            const iterations = [];
            for (let i = 0; i < NUM_ITERATIONS; i++) {
                let current = startValue;
                const path = [current];
                for (let m = 1; m <= MONTHS; m++) {
                    const drift = dMensalMean - 0.5 * Math.pow(dMensalVol, 2);
                    const shock = dMensalVol * randNormal();
                    current = (current + dCont) * Math.exp(drift + shock);
                    if (m % 12 === 0) path.push(current);
                }
                if (MONTHS % 12 !== 0) path.push(current);
                iterations.push(path);
                if (current >= dThreshold) successCount++;
            }
            return {
                iterations,
                probability: Math.round((successCount / NUM_ITERATIONS) * 100)
            };
        };

        const mainSim = runSim(dCap);

        const meanPath = [];
        const sdUpper1 = [];
        const sdLower1 = [];
        const sdUpper2 = [];
        const sdLower2 = [];

        const numSteps = mainSim.iterations[0].length;
        for (let s = 0; s < numSteps; s++) {
            const values = mainSim.iterations.map(it => it[s]).sort((a, b) => a - b);
            meanPath.push(values.reduce((a, b) => a + b, 0) / NUM_ITERATIONS);
            sdUpper1.push(values[Math.floor(NUM_ITERATIONS * 0.68)]);
            sdLower1.push(values[Math.floor(NUM_ITERATIONS * 0.32)]);
            sdUpper2.push(values[Math.floor(NUM_ITERATIONS * 0.95)]);
            sdLower2.push(values[Math.floor(NUM_ITERATIONS * 0.05)]);
        }

        // Local mapping for active starting probability
        const activeAccProb = selectedScenario === '95%' ? 95 : (selectedScenario === '68%' ? 68 : 50);

        const jointMetrics = [
            {
                id: 'joint_mean',
                label: '50% MEAN (JOINT)',
                accProb: activeAccProb,
                phaseProb: 50,
                value: meanPath[numSteps - 1],
                jointProb: ((activeAccProb * 50) / 100).toFixed(1),
                color: '#C9D3EA'
            },
            {
                id: 'joint_68',
                label: '68% (-1SD) (JOINT)',
                accProb: activeAccProb,
                phaseProb: 68,
                value: sdLower1[numSteps - 1],
                jointProb: ((activeAccProb * 68) / 100).toFixed(1),
                color: '#FFFFFF'
            },
            {
                id: 'joint_95',
                label: '95% (-2SD) (JOINT)',
                accProb: activeAccProb,
                phaseProb: 95,
                value: sdLower2[numSteps - 1],
                jointProb: ((activeAccProb * 95) / 100).toFixed(1),
                color: '#F4C366'
            }
        ];

        return {
            iterations: mainSim.iterations,
            meanPath,
            sdUpper1, sdLower1, sdUpper2, sdLower2,
            probability: mainSim.probability,
            jointMetrics
        };
    }, [isVisible, debouncedInputs, NUM_ITERATIONS, MONTHS, startingCapitals]);

    const jointProbability = Math.round((bridgeProbability / 100) * (simData?.probability || 0));

    const draw = (ctx, width, height) => {
        if (!simData) return;
        ctx.clearRect(0, 0, width, height);

        const padding = 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const allValues = simData.iterations.flat();
        const maxVal = Math.max(...simData.sdUpper2, 100000) * 1.1;
        const minVal = Math.min(...allValues) * 0.9;
        const valRange = maxVal - minVal;

        const numSteps = simData.meanPath.length - 1;
        const getX = (s) => padding + (s / numSteps) * chartWidth;
        const getY = (v) => height - padding - ((v - minVal) / valRange) * chartHeight;

        // --- Joint Probability Widgets ---
        const metricsX = padding + 10;
        const metricsY = padding + 35;
        const allMetrics = simData.jointMetrics;
        const spacing = Math.min(180, (width - padding * 2) / Math.max(1, allMetrics.length));

        allMetrics.forEach((t, i) => {
            const x = metricsX + (i * spacing);
            const y = metricsY;

            // Joint Probability Label
            ctx.fillStyle = t.color;
            ctx.font = '800 11px "Outfit"';
            ctx.textAlign = 'left';
            ctx.fillText(`${t.jointProb}% JOINT PROBABILITY`, x, y);

            // Amount/Value (Primary)
            ctx.fillStyle = t.color;
            ctx.font = '800 32px "Outfit"';
            const formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
                notation: 'compact'
            }).format(t.value);
            ctx.fillText(formattedValue, x, y + 32);

            // Sub-label (Components / Calculation)
            ctx.fillStyle = colors.muted;
            ctx.font = '700 9px "Outfit"';
            ctx.fillText(`${t.accProb}% \u00D7 ${t.phaseProb}% BY AGE ${retirement}`, x, y + 48);
        });

        const numStepsRaw = simData.meanPath.length - 1;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = getY(minVal + valRange * (i / 4));
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
            ctx.fillStyle = colors.muted;
            ctx.font = '10px font-monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`$${((minVal + valRange * (i / 4)) / 1000000).toFixed(1)}M`, padding - 10, y + 4);
        }

        // --- SD Bands ---
        const drawBand = (upper, lower, color) => {
            ctx.beginPath();
            ctx.moveTo(getX(0), getY(upper[0]));
            upper.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
            for (let s = lower.length - 1; s >= 0; s--) ctx.lineTo(getX(s), getY(lower[s]));
            ctx.fillStyle = color; ctx.fill();
        };
        drawBand(simData.sdUpper2, simData.sdLower2, colors.band2);
        drawBand(simData.sdUpper1, simData.sdLower1, colors.band1);

        // --- Paths ---
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.path;
        simData.iterations.forEach(path => {
            ctx.beginPath();
            ctx.moveTo(getX(0), getY(path[0]));
            path.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
            ctx.stroke();
        });

        // --- Target Lines ---

        // 1. Protection Target (Retirement Goal)
        const ty = getY(target);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = colors.success;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padding, ty); ctx.lineTo(width - padding, ty); ctx.stroke();

        ctx.fillStyle = colors.success;
        ctx.font = 'bold 9px "Outfit"';
        ctx.textAlign = 'left';
        ctx.fillText(`PROTECTION TARGET (RETIREMENT): $${(target / 1000000).toFixed(1)}M`, padding + 10, ty - 8);

        // 2. Total Threshold (Comprehensive Requirement)
        const tuy = getY(activeThreshold);
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = colors.threshold;
        ctx.beginPath(); ctx.moveTo(padding, tuy); ctx.lineTo(width - padding, tuy); ctx.stroke();

        ctx.fillStyle = colors.threshold;
        ctx.font = 'bold 10px "Outfit"';
        ctx.textAlign = 'right';
        ctx.fillText(`TOTAL THRESHOLD: $${(activeThreshold / 1000000).toFixed(2)}M ${useInflation ? '(ADJUSTED)' : ''}`, width - padding - 10, tuy - 8);

        ctx.setLineDash([]);

        // --- Mean Path ---
        ctx.lineWidth = 4;
        ctx.strokeStyle = colors.mean;
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(simData.meanPath[0]));
        simData.meanPath.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
        ctx.stroke();

        // --- Confidence Floor Lines ---
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);

        // 95% Floor
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(simData.sdLower2[0]));
        simData.sdLower2.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
        ctx.stroke();

        // 68% Floor
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(simData.sdLower1[0]));
        simData.sdLower1.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
        ctx.stroke();

        ctx.setLineDash([]);

        // --- Start/End Markers ---
        const drawMarker = (s, v, label, secondaryLabel = null) => {
            const x = getX(s);
            const y = getY(v);
            ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = colors.mean; ctx.fill();
            ctx.strokeStyle = colors.text; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = colors.text;
            ctx.font = 'bold 10px "Outfit"';
            ctx.textAlign = s === 0 ? 'left' : 'right';
            ctx.fillText(label, x + (s === 0 ? 12 : -12), y + 4);

            if (secondaryLabel) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '9px font-monospace';
                ctx.fillText(secondaryLabel, x + (s === 0 ? 12 : -12), y + 16);
            }
        };

        drawMarker(0, simData.meanPath[0], `START AGE ${startAge}`);
        drawMarker(numSteps, simData.meanPath[numSteps], `EXPECTED: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }).format(simData.meanPath[numSteps])}`);

        // Final SD Floor Markers
        const finalSd1 = simData.sdLower1[numSteps];
        const finalSd2 = simData.sdLower2[numSteps];
        const fx = getX(numSteps);
        const fy1 = getY(finalSd1);
        const fy2 = getY(finalSd2);

        const formatCompact = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }).format(v);

        // 68% Label
        const label1 = `68% (-1SD) CONFIDENCE FLOOR: ${formatCompact(finalSd1)}`;
        ctx.font = 'bold 9px "Outfit"';
        const tw1 = ctx.measureText(label1).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(fx - tw1 - 22, fy1 - 10, tw1 + 15, 20, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText(label1, fx - 12, fy1 + 4);

        // 95% Label
        const label2 = `95% (-2SD) CONFIDENCE FLOOR: ${formatCompact(finalSd2)}`;
        const tw2 = ctx.measureText(label2).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(fx - tw2 - 22, fy2 - 10, tw2 + 15, 20, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(label2, fx - 12, fy2 + 4);

        ctx.beginPath(); ctx.arc(fx, fy2, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#C8D9ED'; ctx.fill();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        const handleResize = () => {
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            const ctx = canvas.getContext('2d');
            ctx.resetTransform();
            ctx.scale(dpr, dpr);
            draw(ctx, w, h);
        };
        handleResize();
        const ro = new ResizeObserver(handleResize);
        ro.observe(container);

        if (onSimComplete && simData) {
            onSimComplete(simData);
        }

        return () => ro.disconnect();
    }, [simData, theme, activeThreshold, onSimComplete]);

    if (!startingCapitals || !simData) return (
        <div className="glass-premium p-5 rounded-5 text-center border-white-5" style={{ minHeight: '300px' }}>
            <div className="text-white-30 mb-3">
                <span className="material-icons" style={{ fontSize: '3rem' }}>analytics</span>
            </div>
            <h5 className="text-white mb-2">Awaiting Accumulation Results</h5>
            <p className="small text-white-50">Please complete the Stage 2 calibration to bridge the data into the Protection Phase.</p>
        </div>
    );

    const formattedCapital = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(startingCapital);

    return (
        <div className="balanced-monte-carlo w-100">
            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                {[
                    { id: '95%', label: '95% STRESS START', desc: 'Conservative transition (-2SD Floor)' },
                    { id: '68%', label: '68% CONSERVATIVE START', desc: 'Mid-risk transition (-1SD Floor)' },
                    { id: 'mean', label: '50% EXPECTED START', desc: 'Expected transition path (Mean)' }
                ].map(scen => (
                    <button
                        key={scen.id}
                        onClick={() => setSelectedScenario(scen.id)}
                        className={`btn btn-sm rounded-4 px-4 py-3 transition-all d-flex flex-column align-items-start ${selectedScenario === scen.id ? 'glass-premium border-orange' : 'glass-vibrant border-white-5 opacity-40 hover-opacity-100'}`}
                        style={{ border: '1px solid', textAlign: 'left', minWidth: '220px', background: selectedScenario === scen.id ? 'rgba(244, 195, 102, 0.1)' : 'rgba(255,255,255,0.02)' }}
                    >
                        <span className={`fw-900 font-monospace uppercase mb-1 ${selectedScenario === scen.id ? 'text-orange' : 'text-white'}`} style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{scen.label}</span>
                        <span className="text-white-30 font-monospace uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>{scen.desc}</span>
                    </button>
                ))}
            </div>

            <div className="mb-4 text-start font-monospace tracking-widest uppercase opacity-80">
                <div className="h5 fw-900 text-white mb-1" style={{ letterSpacing: '2px' }}>
                    PHASE 2 // PROTECTION EQUILIBRIUM
                </div>
                <div className="text-orange small fw-bold d-flex flex-wrap align-items-center gap-3" style={{ maxWidth: '800px', lineHeight: '1.4' }}>
                    <div className="glass-premium px-3 py-1 rounded-pill border-white-10 text-white">
                        <span className="material-icons align-middle me-1" style={{ fontSize: '0.9rem' }}>shortcut</span>
                        STARTING BALANCE: <span className="text-orange">{formattedCapital}</span>
                    </div>
                    <div>
                        PHASE SUCCESS PROBABILITY: <span className="text-orange">{simData.probability}%</span>
                    </div>
                    <div className="text-white border-start border-white-20 ps-3 d-none">
                        <div className="x-small text-white-50 font-monospace uppercase mb-1" style={{ letterSpacing: '1px' }}>Total Strategic Confidence (Joint)</div>
                        <div className="text-success d-flex flex-wrap gap-x-4 gap-y-1 align-items-center">
                            {selectedScenario === '95%' ? (
                                <>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="opacity-50 small">95% (-2SD) BRIDGE:</span>
                                        <span className="fw-900">{Math.round(0.95 * simData.probability)}%</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="opacity-50 small">68% (-1SD) BRIDGE:</span>
                                        <span className="fw-900">{Math.round(0.68 * simData.probability)}%</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="opacity-50 small">50% (MEAN) BRIDGE:</span>
                                        <span className="fw-900">{Math.round(0.50 * simData.probability)}%</span>
                                    </div>
                                    <div className="ms-auto x-small opacity-50 font-monospace border-start border-white-10 ps-3 d-none d-xl-block">
                                        95% FLOOR: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1, notation: 'compact' }).format(simData.sdLower2[simData.sdLower2.length - 1])}
                                    </div>
                                </>
                            ) : (
                                <span className="fw-900">{jointProbability}%</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-vibrant rounded-5 overflow-hidden border-white-10 shadow-2xl mc-chart-container position-relative"
                style={{ background: '#050a18' }}>
                <canvas ref={canvasRef} style={{ display: 'block' }} />

                <div className="position-absolute top-0 end-0 p-4 d-none">
                    <div className="glass-premium p-3 rounded-4 border-white-5 text-center" style={{ minWidth: '180px' }}>
                        {selectedScenario === '95%' ? (
                            <>
                                <div className="x-small text-muted font-monospace uppercase mb-2">Joint Strategic Confidence</div>
                                <div className="d-flex flex-column gap-2 text-start">
                                    <div className="d-flex justify-content-between align-items-center border-bottom border-white-10 pb-1">
                                        <span className="tiny text-white-50 font-monospace">95 * 95 (-2SD)</span>
                                        <span className="h6 mb-0 text-success fw-900">{Math.round(0.95 * simData.probability)}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center border-bottom border-white-10 pb-1">
                                        <span className="tiny text-white-50 font-monospace">95 * 68 (-1SD)</span>
                                        <span className="h6 mb-0 text-success fw-900">{Math.round(0.68 * simData.probability)}%</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="tiny text-white-50 font-monospace">95 * 50 (MEAN)</span>
                                        <span className="h6 mb-0 text-success fw-900">{Math.round(0.50 * simData.probability)}%</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="x-small text-muted font-monospace uppercase mb-1">SUCCESS PROBABILITY</div>
                                <div className={`display-6 fw-900 ${simData.probability >= 80 ? 'text-success' : 'text-orange'} mb-0`} style={{ lineHeight: 1 }}>
                                    {simData.probability}%
                                </div>
                                <div className="x-small text-muted font-monospace uppercase mt-1">
                                    of reaching ${(activeThreshold / 1000000).toFixed(1)}M
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-orange-range { accent-color: #F4C366; }
                .x-small { font-size: 0.65rem; }
                .fw-900 { font-weight: 950; }
                .mc-chart-container {
                    height: 520px;
                }
                @media (min-width: 992px) {
                    .mc-chart-container {
                        height: 720px;
                    }
                }
            `}</style>
        </div>
    );
};

export default BalancedMonteCarloChart;
