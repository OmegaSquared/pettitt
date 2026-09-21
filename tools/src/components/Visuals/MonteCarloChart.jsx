import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MonteCarloDisclosure from './MonteCarloDisclosure';

const MonteCarloChart = ({ theme, diagnosticInputs, selectedGoals = {}, goalFunding = {}, onOpenScheduling, onSimComplete, volatilityModifier, doesNotApply, defenseInputs }) => {
    const canvasRef = useRef(null);
    const visibilityRef = useRef(null);
    const lastSimResultsRef = useRef(null);
    const isDark = theme === 'dark-mode';

    const { age, retirement, capital, contribution, returnRate, stdDev, target, inflationAdjustedTarget } = diagnosticInputs || {
        age: 35, retirement: 65, capital: 400000, contribution: 500, returnRate: 7, stdDev: 18, target: 2000000, inflationAdjustedTarget: null
    };

    const defenseReturnRate = defenseInputs?.returnRate ?? 6;
    const defenseStdDev = defenseInputs?.stdDev ?? 12;
    const defenseContribution = defenseInputs?.contribution ?? contribution;

    // Safety: Ensure we have valid numbers to prevent crashes
    const safeTarget = Number(target) || 1000000;
    const safeInflationTarget = inflationAdjustedTarget ? Number(inflationAdjustedTarget) : null;
    const safeAge = doesNotApply ? 35 : (Number(age) || 35);
    const safeRetirement = doesNotApply ? 65 : (Number(retirement) || 65);

    // Calculate Simulation Timeframe
    const yearsToRetirement = Math.max(1, safeRetirement - safeAge);
    const pivotAge = 55;
    const yearsToPivot = Math.max(0, pivotAge - safeAge);

    // Total YEARS to show: full path to retirement
    const YEARS = yearsToRetirement;
    const MONTHS = YEARS * 12;
    const NUM_ITERATIONS = 1000;

    // Monthly Math (Continuous compounding approximation)
    const mensalMean = (returnRate / 100) / 12;
    const mensalVol = (stdDev / 100) / Math.sqrt(12);

    const colors = {
        mean: '#38BDF8',
        path: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
        band1: isDark ? 'rgba(124, 139, 176, 0.15)' : 'rgba(124, 139, 176, 0.08)',
        band2: isDark ? 'rgba(244, 195, 102, 0.1)' : 'rgba(244, 195, 102, 0.05)',
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        goal: '#F4C366'
    };


    // 4. Visibility tracking for simulation efficiency
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const target = visibilityRef.current;
        if (!target) return;
        const observer = new IntersectionObserver((entries) => {
            setIsVisible(entries[0].isIntersecting);
        }, { threshold: 0.1 });
        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    const [simData, setSimData] = useState(null);

    useEffect(() => {
        if (!isVisible) return;
        
        // Use diagnosticInputs directly now that they are gated by the control center state in CompassPage
        const { capital, contribution, returnRate, stdDev, target, age: dAge, retirement: dRet } = diagnosticInputs;

        if (!dAge || !dRet || !capital) return;

        const timerId = setTimeout(() => {
            console.log(`[Simulation] Running Monte Carlo Accumulation Simulation for age ${dAge} to ${dRet}`);

            const yearsToRetirementDebounced = Math.max(1, Number(dRet) - Number(dAge));
            const monthsDebounced = yearsToRetirementDebounced * 12;

            const randNormal = () => {
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            };

            const iterations = [];
            const totalRequirement = Number(target) || 1000000;
            const thresholds = [{ id: 'sovereignty', label: 'GOAL', value: totalRequirement, success: 0 }];

            const pivotAgeLocal = defenseInputs?.deriskingAge || 55;
            const pivotMonth = Math.max(0, pivotAgeLocal - Number(dAge)) * 12;

            for (let i = 0; i < NUM_ITERATIONS; i++) {
                const path = [capital];
                let current = capital;
                for (let m = 1; m <= monthsDebounced; m++) {
                    const isDefensive = m > pivotMonth;
                    let activeReturn = isDefensive ? defenseReturnRate : returnRate;
                    let activeStdDev = isDefensive ? defenseStdDev : stdDev;
                    const activeContribution = isDefensive ? defenseContribution : contribution;

                    // Apply Volatility Modifier
                    if (volatilityModifier !== undefined) {
                        activeReturn *= volatilityModifier;
                        activeStdDev *= volatilityModifier;
                    }

                    const netReturn = activeReturn - (diagnosticInputs.managementFee || 1.5);
                    const mMean = (netReturn / 100) / 12;
                    const mVol = (activeStdDev / 100) / Math.sqrt(12);

                    const drift = mMean - 0.5 * Math.pow(mVol, 2);
                    const shock = mVol * randNormal();
                    current = (current + activeContribution) * Math.exp(drift + shock);

                    if (m % 12 === 0) path.push(current);

                    if (m === monthsDebounced) {
                        thresholds.forEach(t => {
                            if (current >= t.value) t.success++;
                        });
                    }
                }
                iterations.push(path);
            }

            const meanPath = [];
            const sdUpper1 = [];
            const sdLower1 = [];
            const sdUpper2 = [];
            const sdLower2 = [];

            for (let y = 0; y <= yearsToRetirementDebounced; y++) {
                const values = iterations.map(it => it[y]).sort((a, b) => a - b);
                meanPath.push(values.reduce((a, b) => a + b, 0) / NUM_ITERATIONS);
                sdUpper1.push(values[Math.floor(NUM_ITERATIONS * 0.68)]);
                sdLower1.push(values[Math.floor(NUM_ITERATIONS * 0.32)]);
                sdUpper2.push(values[Math.floor(NUM_ITERATIONS * 0.95)]);
                sdLower2.push(values[Math.floor(NUM_ITERATIONS * 0.05)]);
            }

            const retirementIndex = yearsToRetirementDebounced;
            const retirementMetrics = [
                { id: 'ret_mean', label: '50% PROBABILITY', value: meanPath[retirementIndex] || 0, isValue: true, color: '#A1A1AA' },
                { id: 'ret_68', label: '68% PROBABILITY', value: sdLower1[retirementIndex] || 0, isValue: true, color: '#FFFFFF' },
                { id: 'ret_95', label: '95% PROBABILITY', value: sdLower2[retirementIndex] || 0, isValue: true, color: '#F4C366' }
            ];

            const yearsToPivotLocal = Math.max(0, pivotAgeLocal - Number(dAge));
            const pivotIndex = Math.min(Math.floor(yearsToPivotLocal), yearsToRetirementDebounced);
            const pivotMetrics = (yearsToPivotLocal > 0 && yearsToPivotLocal < yearsToRetirementDebounced) ? [
                { id: 'pivot_mean', label: '50% PROBABILITY', value: meanPath[pivotIndex] || 0, isValue: true, color: '#A1A1AA' },
                { id: 'pivot_68', label: '68% PROBABILITY', value: sdLower1[pivotIndex] || 0, isValue: true, color: '#FFFFFF' },
                { id: 'pivot_95', label: '95% PROBABILITY', value: sdLower2[pivotIndex] || 0, isValue: true, color: '#F4C366' }
            ] : [];

            setSimData({
                iterations, meanPath, sdUpper1, sdLower1, sdUpper2, sdLower2,
                yearsToPivot: yearsToPivotLocal,
                pivotMetrics,
                retirementMetrics,
                thresholds: thresholds.map(t => ({ ...t, probability: Math.round((t.success / NUM_ITERATIONS) * 100) }))
            });
        }, 50);

        return () => clearTimeout(timerId);
    }, [
        isVisible,
        diagnosticInputs.capital,
        diagnosticInputs.contribution,
        diagnosticInputs.returnRate,
        diagnosticInputs.stdDev,
        diagnosticInputs.target,
        diagnosticInputs.age,
        diagnosticInputs.retirement,
        NUM_ITERATIONS,
        defenseReturnRate,
        defenseStdDev,
        defenseContribution,
        defenseInputs?.deriskingAge,
        volatilityModifier,
        diagnosticInputs.managementFee
    ]);

    const pivotAgeVal = (safeAge || 35) + (simData?.yearsToPivot || 0);
    const pivotMeanValue = simData?.pivotMetrics?.find(m => m.id === 'pivot_mean')?.value || 0;
    const pivot68Value = simData?.pivotMetrics?.find(m => m.id === 'pivot_68')?.value || 0;

    const draw = (ctx, width, height) => {
        if (!simData) return;
        const isMobileLocal = width < 768;
        const padding = isMobileLocal ? 25 : 80;
        const chartWidth = width - padding * 2;
        const chartHeight = height - (isMobileLocal ? 180 : 250);

        // Font scaling factors
        const fontScale = isMobileLocal ? Math.max(0.7, width / 450) : 1;
        const labelFontSize = Math.round(10 * fontScale);
        const amountFontSize = Math.round(22 * fontScale);

        const allValues = simData.iterations.flat();
        const maxVal = isMobileLocal
            ? Math.max(simData.sdUpper2[YEARS], 1000000) * 1.05
            : Math.max(...simData.sdUpper2, 1000000) * 1.1;
        const getX = (y) => padding + (y / YEARS) * chartWidth;
        const getY = (v) => height - padding - 40 - ((v / maxVal) * chartHeight);

        // --- Grid ---
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;

        // Y-Axis Grid & Labels
        for (let i = 0; i <= 4; i++) {
            const y = getY(maxVal * (i / 4));
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();

            if (!doesNotApply) {
                ctx.fillStyle = colors.muted;
                ctx.font = isMobileLocal ? '8px font-monospace' : '10px font-monospace';
                ctx.textAlign = 'right';
                ctx.fillText(`$${(maxVal * (i / 4) / 1000000).toFixed(1)}M`, padding - 5, y + 4);
            }
        }

        // X-Axis Grid & Labels (Ages)
        if (!doesNotApply) {
            const step = YEARS > 20 ? 10 : 5;
            ctx.textAlign = 'center';
            ctx.font = 'bold 10px font-monospace';

            for (let y = 0; y <= YEARS; y += step) {
                const x = getX(y);
                const currentAge = safeAge + y;

                // Vertical Grid Line
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding - 40);
                ctx.stroke();

                // Age Label
                ctx.fillStyle = colors.muted;
                ctx.fillText(`${currentAge}`, x, height - padding - (isMobileLocal ? 10 : 20));
            }
        }

        // --- SD Bands ---
        const drawBand = (upper, lower, color) => {
            ctx.beginPath();
            ctx.moveTo(getX(0), getY(upper[0]));
            for (let y = 1; y <= YEARS; y++) ctx.lineTo(getX(y), getY(upper[y]));
            for (let y = YEARS; y >= 0; y--) ctx.lineTo(getX(y), getY(lower[y]));
            ctx.fillStyle = color; ctx.fill();
        };
        drawBand(simData.sdUpper2, simData.sdLower2, colors.band2);
        drawBand(simData.sdUpper1, simData.sdLower1, colors.band1);

        // --- Iteration Paths ---
        ctx.lineWidth = 1; ctx.strokeStyle = colors.path;
        simData.iterations.slice(0, 100).forEach(path => {
            ctx.beginPath(); ctx.moveTo(getX(0), getY(path[0]));
            for (let y = 1; y <= YEARS; y++) ctx.lineTo(getX(y), getY(path[y]));
            ctx.stroke();
        });

        // Helper to draw vertical milestone line
        const drawMilestoneLine = (x, label) => {
            ctx.setLineDash([10, 5]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding - 40);
            ctx.stroke();

            ctx.save();
            ctx.translate(x - 5, padding + 10);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = colors.muted;
            ctx.font = '800 10px "Outfit"';
            ctx.textAlign = 'right';
            ctx.fillText(label, 0, 0);
            ctx.restore();
            ctx.setLineDash([]);
        };

        // Draw Pivot Line
        if (simData.yearsToPivot > 0 && simData.yearsToPivot < YEARS) {
            drawMilestoneLine(getX(simData.yearsToPivot), `DEFENSIVE PIVOT (AGE ${pivotAge})`);
        }

        // Draw Retirement Line
        drawMilestoneLine(getX(YEARS), `RETIREMENT (AGE ${safeRetirement})`);

        // --- Probabilities Rendering with Collision Detection ---
        const drawMilestoneMetrics = (metrics, xPos, align = 'right') => {
            let entries = metrics.map(t => ({ ...t, y: getY(t.value) }));
            entries.sort((a, b) => a.y - b.y);

            const MIN_GAP = isMobileLocal ? 35 : 45;
            for (let i = 1; i < entries.length; i++) {
                if (entries[i].y - entries[i - 1].y < MIN_GAP) {
                    entries[i].y = entries[i - 1].y + MIN_GAP;
                }
            }

            // Cap within chart bounds
            const maxY = height - padding - 60;
            const minY = padding + 60;
            const lastY = entries[entries.length - 1].y;
            if (lastY > maxY) {
                const shift = lastY - maxY;
                entries.forEach(e => e.y -= shift);
            }
            if (entries[0].y < minY) {
                const shift = minY - entries[0].y;
                entries.forEach(e => e.y += shift);
            }

            entries.forEach((t) => {
                const metricColor = t.color || colors.text;
                const offset = align === 'right' ? -15 : 15;

                // Probability Label
                ctx.fillStyle = metricColor;
                ctx.font = `800 ${labelFontSize}px "Outfit"`;
                ctx.textAlign = align;
                ctx.fillText(t.label.toUpperCase(), xPos + offset, t.y - 4);

                // Amount/Value
                ctx.fillStyle = metricColor;
                ctx.font = `800 ${amountFontSize}px "Outfit"`;
                ctx.textAlign = align;
                const formattedValue = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 1,
                    notation: 'compact'
                }).format(t.value);
                ctx.fillText(formattedValue, xPos + offset, t.y + (isMobileLocal ? 14 : 18));

                // Connector line
                ctx.setLineDash([]);
                ctx.strokeStyle = metricColor;
                ctx.globalAlpha = isMobileLocal ? 0.1 : 0.3;
                ctx.beginPath();
                ctx.moveTo(xPos + (align === 'right' ? -12 : 12), getY(t.value));
                ctx.lineTo(xPos, getY(t.value));
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            });
        };

        // Draw metrics for Pivot - Hidden on mobile per request
        const pivotX = getX(simData.yearsToPivot);
        const retirementX = getX(YEARS);
        const horizontalGap = retirementX - pivotX;

        if (!isMobileLocal) {
            if (simData.yearsToPivot > 0 && simData.yearsToPivot < YEARS) {
                drawMilestoneMetrics(simData.pivotMetrics, pivotX, 'right');
            }
            // Draw metrics for Retirement
            drawMilestoneMetrics(simData.retirementMetrics, retirementX, 'right');
        }

        // --- 68% Floor (Dashed White Line) ---
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(simData.sdLower1[0]));
        for (let y = 1; y <= YEARS; y++) ctx.lineTo(getX(y), getY(simData.sdLower1[y]));
        ctx.stroke();
        ctx.setLineDash([]);

        // --- Thresholds (Target Lines) ---
        simData.thresholds.forEach(t => {
            const y = getY(t.value);
            ctx.setLineDash([5, 10]);
            ctx.strokeStyle = colors.goal;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            ctx.setLineDash([]);

            // Label on the left side of the chart
            ctx.fillStyle = colors.goal;
            ctx.font = '800 10px "Outfit"';
            ctx.textAlign = 'left';
            const labelText = t.label.toUpperCase();
            const probText = t.probability !== undefined ? ` // ${t.probability}% PROBABILITY` : '';
            ctx.fillText(`${labelText}${probText}`, padding + 15, y - 6);

            const formattedVal = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 1,
                notation: 'compact'
            }).format(t.value);
            ctx.font = isMobileLocal ? '800 12px "Outfit"' : '800 14px "Outfit"';
            ctx.fillText(formattedVal, padding + 15, y + 14);
        });

        // --- Time Horizon Label ---
        if (!isMobileLocal) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 12px "Outfit"';
            ctx.fillStyle = colors.muted;
            const footerLabel = doesNotApply ? 'SAMPLE SIMULATION (REFERENCE ONLY)' : `ROADMAP TO RETIREMENT: ${YEARS} YEARS (TWO-REGIME PROBABILITY MODEL)`;
            ctx.fillText(footerLabel, width / 2, height - padding / 2);
        }
    };

    useEffect(() => {
        const update = () => {
            if (!canvasRef.current || !canvasRef.current.parentElement || !simData) return;
            const container = canvasRef.current.parentElement;
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            const dpr = window.devicePixelRatio || 1;
            canvasRef.current.width = w * dpr;
            canvasRef.current.height = h * dpr;
            canvasRef.current.style.width = `${w}px`;
            canvasRef.current.style.height = `${h}px`;
            const ctx = canvasRef.current.getContext('2d');
            ctx.resetTransform(); ctx.scale(dpr, dpr);
            draw(ctx, w, h);
        };
        const ro = new ResizeObserver(update);
        if (canvasRef.current && canvasRef.current.parentElement) {
            ro.observe(canvasRef.current.parentElement);
        }
        update();

        if (!simData) return () => ro.disconnect();

        const currentSimData = simData;
        const resultStr = JSON.stringify({
            pivot68: pivot68Value,
            meanPath: currentSimData?.meanPath?.slice(-1)[0]
        });

        if (onSimComplete && lastSimResultsRef.current !== resultStr) {
            lastSimResultsRef.current = resultStr;
            onSimComplete(currentSimData);
        }

        return () => ro.disconnect();
    }, [theme, simData, onSimComplete, pivot68Value]);

    if (!simData) {
        return (
            <div ref={visibilityRef} className="mx-auto" style={{ width: '100%', height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '30px', border: '1px solid var(--omega-border)' }}>
                <div className="w-100 text-center text-muted font-monospace opacity-50 uppercase tracking-widest">
                    Initializing Compass Simulation...
                </div>
            </div>
        );
    }


    return (
        <div ref={visibilityRef} className="mx-auto" style={{ width: '100%' }}>
            <div className="mb-4 text-start font-monospace tracking-widest uppercase opacity-80">
                <div className="h5 fw-900 text-white mb-1" style={{ letterSpacing: '2px' }}>
                    THE COMPASS ACCUMULATION & DEFENSE SIMULATION
                </div>
                {!doesNotApply && (
                    <div className="d-none d-md-block d-flex flex-column gap-2">
                        <div className="text-orange small fw-bold d-flex flex-wrap align-items-center gap-3">
                            <span className="text-white">AT AGE {pivotAge} (PROTECTION)</span>
                            <div className="d-flex align-items-center gap-4">
                                <span className="d-flex align-items-center gap-2">
                                    <span className="opacity-50">50%:</span>
                                    <span style={{ color: '#A1A1AA' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(pivotMeanValue)}</span>
                                </span>
                                <span className="opacity-50">|</span>
                                <span className="d-flex align-items-center gap-2">
                                    <span className="opacity-50">68%:</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(simData.pivotMetrics.find(m => m.id === 'pivot_68')?.value || 0)}</span>
                                </span>
                                <span className="opacity-50">|</span>
                                <span className="d-flex align-items-center gap-2">
                                    <span className="opacity-50">95%:</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(simData.pivotMetrics.find(m => m.id === 'pivot_95')?.value || 0)}</span>
                                </span>
                            </div>
                        </div>
                        <div className="text-orange small fw-bold d-flex flex-wrap align-items-center gap-3">
                            <span className="text-white">AT AGE {safeRetirement} (RETIREMENT)</span>
                            <div className="d-flex align-items-center gap-4">
                                <span className="d-flex align-items-center gap-2">
                                    <span className="opacity-50">50%:</span>
                                    <span style={{ color: '#A1A1AA' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(simData.retirementMetrics.find(m => m.id === 'ret_mean')?.value || 0)}</span>
                                </span>
                                <span className="opacity-50">|</span>
                                <span className="d-flex align-items-center gap-2">
                                    <span className="opacity-50">68%:</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(simData.retirementMetrics.find(m => m.id === 'ret_68')?.value || 0)}</span>
                                </span>
                                <span className="opacity-50">|</span>
                                <span className="d-flex align-items-center gap-2">
                                    <span className="opacity-50">95%:</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(simData.retirementMetrics.find(m => m.id === 'ret_95')?.value || 0)}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="glass-vibrant rounded-5 overflow-hidden border-white-10 shadow-2xl mc-chart-container position-relative"
                style={{ background: '#050a18' }}>
                <canvas ref={canvasRef} style={{ display: 'block' }} />
            </div>
            <div className="text-center mt-3 small text-white-30 font-monospace">
                — PROBABILITY SIMULATION // {NUM_ITERATIONS} ITERATIONS // {YEARS}Y HORIZON —
            </div>
            <div className="text-center mt-2 mx-auto text-white-20 px-3" style={{ maxWidth: '800px', fontSize: '0.75rem', lineHeight: '1.6', letterSpacing: '0.5px' }}>
                TECHNICAL DISCLOSURE: 1,000 iterations provide a probabilistic projection but carry inherent statistical risk and variance.
                This simulation is for educational purposes only and should not be considered a guarantee of actual results.
                Institutional-grade modeling typically requires 1,000+ iterations for precise calibration.
            </div>
            <div className="text-center mt-2">
                <MonteCarloDisclosure />
            </div>
            <style jsx>{`
                .mc-chart-container {
                    height: 520px;
                }
                .bg-orange-soft { background: rgba(244, 195, 102,0.1); }
                .border-omega-orange { border-color: rgba(244, 195, 102,0.3) !important; }
                @media (min-width: 992px) {
                    .mc-chart-container {
                        height: 720px;
                    }
                }
            `}</style>
        </div>
    );
};

export default MonteCarloChart;
