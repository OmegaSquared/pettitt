import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { captureIntent } from '../../utils/captureIntent';
import MonteCarloDisclosure from './MonteCarloDisclosure';

const DistributionMonteCarlo = ({
    theme, startingCapital, capitalOptions, retirementAge = 65, target,
    bridgeProbability = 100,
    returnRate: externalReturnRate,
    stdDev: externalStdDev,
    distributionRate: externalDistRate,
    inflationRate = 2.0,
    longevity = 95,
    volatilityModifier = 1,
    inflationAdjustedDistributions = false,
    managementFee = 1.5,
    onSimComplete,
    onUpdate
}) => {
    const canvasRef = useRef(null);
    const visibilityRef = useRef(null);
    const lastSimResultsRef = useRef(null);
    const isDark = theme === 'dark-mode';
    const [isMobileLocal, setIsMobileLocal] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobileLocal(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // State for Dynamic Controls
    const returnRate = externalReturnRate !== undefined ? externalReturnRate : 4.5;
    const stdDev = externalStdDev !== undefined ? externalStdDev : 6.5;
    const [distributionPcnt, setDistributionPcnt] = useState(externalDistRate !== undefined ? externalDistRate : 4);
    const [selectedSource, setSelectedSource] = useState('goal');

    const effectiveStartingCapital = useMemo(() => {
        if (!capitalOptions) return startingCapital;
        switch (selectedSource) {
            case 'goal': return capitalOptions.goal || startingCapital;
            case 'mean': return capitalOptions.mean || startingCapital;
            case 'sd1': return capitalOptions.sd1 || startingCapital;
            case 'sd2': return capitalOptions.sd2 || startingCapital;
            default: return startingCapital;
        }
    }, [selectedSource, capitalOptions, startingCapital]);

    useEffect(() => {
        if (externalDistRate !== undefined && externalDistRate !== distributionPcnt) {
            setDistributionPcnt(externalDistRate);
        }
    }, [externalDistRate]);

    const YEARS = Math.max(1, longevity - retirementAge);
    const MONTHS = YEARS * 12;
    const NUM_ITERATIONS = 1000;

    // Base distribution at start of retirement (age retirementAge)
    const annualDistributionBase = (effectiveStartingCapital * (distributionPcnt / 100));
    const monthlyDistributionBase = annualDistributionBase / 12;

    const colors = {
        mean: '#F4C366',
        path: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
        band1: isDark ? 'rgba(244, 195, 102, 0.15)' : 'rgba(244, 195, 102, 0.08)',
        band2: isDark ? 'rgba(124, 139, 176, 0.08)' : 'rgba(124, 139, 176, 0.04)',
        text: isDark ? '#f8f9fa' : '#0F1F35',
        muted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        success: '#00ff64',
        warning: '#ff4444'
    };


    // Visibility tracking for simulation efficiency
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
        
        const startCap = effectiveStartingCapital;
        const rRate = returnRate;
        const sDev = stdDev;
        const dPcnt = distributionPcnt;
        const rAge = retirementAge;
        const dLong = longevity;
        const iRate = inflationRate;
        const adjDist = inflationAdjustedDistributions;

        if (!startCap) return;

        const timerId = setTimeout(() => {
            console.log(`[Simulation] Running Distribution Monte Carlo for capital ${startCap} at ${dPcnt}% distribution, inflation-adjusted: ${adjDist}`);

            const dYears = dLong - rAge;
            const dMonths = Math.max(1, dYears * 12);

            let activeRet = rRate;
            let activeVol = sDev;

            if (volatilityModifier !== undefined) {
                activeRet *= volatilityModifier;
                activeVol *= volatilityModifier;
            }

            const netRet = activeRet - managementFee;
            const mMean = (netRet / 100) / 12;
            const mVol = (activeVol / 100) / Math.sqrt(12);
            const mInflation = Math.pow(1 + iRate / 100, 1 / 12);

            const randNormal = () => {
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            };

            const iterations = [];
            let successCount = 0;
            let success80 = 0;
            let success90 = 0;
            const targetAge80 = 80;
            const targetAge90 = 90;

            // Calculate base monthly withdrawal in nominal dollars at start of retirement
            const mDistStart = (target * (dPcnt / 100)) / 12;

            for (let i = 0; i < NUM_ITERATIONS; i++) {
                const path = [startCap];
                let current = startCap;
                let currentMDist = mDistStart;

                for (let m = 1; m <= dMonths; m++) {
                    // Perform withdrawal
                    current = Math.max(0, current - currentMDist);

                    // Adjust withdrawal amount for inflation if enabled
                    if (adjDist) {
                        currentMDist *= mInflation;
                    }

                    if (current > 0) {
                        const drift = mMean - 0.5 * Math.pow(mVol, 2);
                        const shock = mVol * randNormal();
                        current = current * Math.exp(drift + shock);
                    }

                    // Monthly checkpoint
                    if (m % 12 === 0) {
                        path.push(Math.max(0, current));

                        const currentAge = rAge + (m / 12);
                        if (currentAge === targetAge80 && current > 0) success80++;
                        if (currentAge === targetAge90 && current > 0) success90++;
                    }
                }

                // Ensure last month is captured for path indexing
                if (dMonths % 12 !== 0) {
                    path.push(Math.max(0, current));
                }

                iterations.push(path);
                if (current > 0) successCount++;
            }

            const meanPath = [];
            const sdUpper1 = [];
            const sdLower1 = [];
            const sdUpper2 = [];
            const sdLower2 = [];

            const pathLength = iterations[0].length;
            for (let y = 0; y < pathLength; y++) {
                const values = iterations.map(it => it[y]).sort((a, b) => a - b);
                meanPath.push(values.reduce((a, b) => a + b, 0) / NUM_ITERATIONS);
                sdUpper1.push(values[Math.floor(NUM_ITERATIONS * 0.68)]);
                sdLower1.push(values[Math.floor(NUM_ITERATIONS * 0.32)]);
                sdUpper2.push(values[Math.floor(NUM_ITERATIONS * 0.95)]);
                sdLower2.push(values[Math.floor(NUM_ITERATIONS * 0.05)]);
            }

            setSimData({
                iterations,
                meanPath,
                sdUpper1, sdLower1, sdUpper2, sdLower2,
                probability: Math.round((successCount / NUM_ITERATIONS) * 100),
                prob80: Math.round((success80 / NUM_ITERATIONS) * 100),
                prob90: Math.round((success90 / NUM_ITERATIONS) * 100)
            });
        }, 50);

        return () => clearTimeout(timerId);
    }, [
        isVisible,
        effectiveStartingCapital,
        returnRate,
        stdDev,
        distributionPcnt,
        retirementAge,
        longevity,
        inflationRate,
        NUM_ITERATIONS,
        volatilityModifier,
        managementFee,
        target,
        inflationAdjustedDistributions
    ]);

    const worstCaseData = useMemo(() => {
        if (!capitalOptions?.sd2 || !simData) return null;

        const startVal = capitalOptions.sd2;
        const iRate = inflationRate;

        // Simplified "Ugly Truth" path for the summary card
        // Note: For simplicity in the card, we just report the End value from simData's sdLower2
        // because simData already accounts for starting at goal/mean/sd1/sd2 via selectedSource.
        return {
            start: startVal,
            end: simData.sdLower2[simData.sdLower2.length - 1]
        };
    }, [capitalOptions?.sd2, simData, inflationRate]);

    const jointProbability = Math.round((bridgeProbability / 100) * (simData?.probability || 0));

    const draw = (ctx, width, height) => {
        if (!simData) return;
        const padding = isMobileLocal ? 25 : 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - (isMobileLocal ? 180 : 200);

        // Font scaling factors
        const fontScale = isMobileLocal ? Math.max(0.7, width / 450) : 1;
        const labelFontSize = Math.round(9 * fontScale);
        const amountFontSize = Math.round(11 * fontScale);

        const maxVal = Math.max(...simData.sdUpper2, 100000) * 1.1;
        const numSteps = simData.meanPath.length - 1;

        const getX = (s) => padding + (s / numSteps) * chartWidth;
        const getY = (v) => height - padding - 40 - ((v / maxVal) * chartHeight);

        // Grid
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const v = maxVal * (i / 4);
            const y = getY(v);
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
            ctx.fillStyle = colors.muted;
            ctx.font = isMobileLocal ? '8px font-monospace' : '10px font-monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`$${(v / 1000000).toFixed(1)}M`, padding - 5, y + 4);
        }

        // SD Band
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(simData.sdUpper1[0]));
        simData.sdUpper1.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
        for (let s = simData.sdLower1.length - 1; s >= 0; s--) ctx.lineTo(getX(s), getY(simData.sdLower1[s]));
        ctx.fillStyle = colors.band1; ctx.fill();

        // Iterations
        ctx.lineWidth = 1; ctx.strokeStyle = colors.path;
        simData.iterations.slice(0, 40).forEach(path => {
            ctx.beginPath(); ctx.moveTo(getX(0), getY(path[0]));
            path.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
            ctx.stroke();
        });

        // Mean
        ctx.lineWidth = 3; ctx.strokeStyle = colors.mean;
        ctx.beginPath(); ctx.moveTo(getX(0), getY(simData.meanPath[0]));
        simData.meanPath.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
        ctx.stroke();

        // 50% Mean Label (Added)
        const finalMeanLabel = `50% MEAN: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }).format(simData.meanPath[numSteps])}`;
        ctx.font = `bold ${labelFontSize}px "Outfit"`;
        const tWMean = ctx.measureText(finalMeanLabel).width;
        ctx.fillStyle = 'rgba(244, 195, 102, 0.4)';
        ctx.beginPath();
        const boxPadding = isMobileLocal ? 5 : 10;
        ctx.roundRect(getX(numSteps) - tWMean - (boxPadding * 2), getY(simData.meanPath[numSteps]) - boxPadding, tWMean + (boxPadding * 1.5), boxPadding * 2, 4);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(finalMeanLabel, getX(numSteps) - boxPadding, getY(simData.meanPath[numSteps]) + 4);

        // 68% Confidence Floor Line
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(simData.sdLower1[0]));
        simData.sdLower1.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
        ctx.stroke();
        ctx.setLineDash([]);

        // 95% Confidence Floor Line (Added)
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(simData.sdLower2[0]));
        simData.sdLower2.forEach((v, s) => ctx.lineTo(getX(s), getY(v)));
        ctx.stroke();
        ctx.setLineDash([]);

        // Lifespan Markers
        const avgMaleAge = 76;
        const avgFemaleAge = 81;

        [
            { age: avgMaleAge, label: 'AVG MALE LIFESPAN' },
            { age: avgFemaleAge, label: 'AVG FEMALE LIFESPAN' }
        ].forEach(marker => {
            if (marker.age > retirementAge && marker.age < 100) {
                const s = marker.age - retirementAge;
                const x = getX(s);

                ctx.setLineDash([10, 5]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding - 40);
                ctx.stroke();
                ctx.setLineDash([]);

                // Vertical Label
                ctx.save();
                ctx.translate(x - 5, padding + 10);
                ctx.rotate(-Math.PI / 2);
                ctx.fillStyle = colors.muted;
                ctx.font = 'bold 9px "Outfit"';
                ctx.textAlign = 'right';
                ctx.fillText(marker.label, 0, 0);
                ctx.restore();
            }
        });

        // Markers
        const drawMarker = (s, v, label, align = 'center') => {
            const x = getX(s);
            const y = getY(v);
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = colors.mean; ctx.fill();
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 10px "Outfit"';
            ctx.textAlign = align;
            ctx.fillText(label, x, y - 12);
        };
        drawMarker(0, effectiveStartingCapital, `START (AGE ${retirementAge})`, 'left');

        const finalMean = simData.meanPath[numSteps];
        drawMarker(numSteps, finalMean, `EXPECTED: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }).format(finalMean)}`, 'right');

        // Final SD Floor Marker
        const finalSd1 = simData.sdLower1[numSteps];
        const fx = getX(numSteps);
        const fy = getY(finalSd1);

        // Label Box
        const label = `68% (-1SD) FLOOR: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }).format(finalSd1)}`;
        ctx.font = `bold ${labelFontSize}px "Outfit"`;
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        const boxPaddingFloor = isMobileLocal ? 5 : 10;
        ctx.roundRect(fx - textWidth - (boxPaddingFloor * 2), fy - boxPaddingFloor, textWidth + (boxPaddingFloor * 1.5), boxPaddingFloor * 2, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(label, fx - 10, fy + 4);

        // 95% Floor Label (Added)
        const finalSd2 = simData.sdLower2[numSteps];
        const fy2 = getY(finalSd2);
        const label2 = `95% (-2SD) FLOOR: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }).format(finalSd2)}`;
        const tW2 = ctx.measureText(label2).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(fx - tW2 - 20, fy2 - 10, tW2 + 15, 20, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText(label2, fx - 10, fy2 + 4);

        // Distribution Label
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px "Outfit"';
        ctx.fillStyle = colors.muted;
        ctx.fillText(`CASH FLOW SUSTAINABILITY: ${YEARS} YEAR HORIZON (TO AGE ${longevity})`, width / 2, height - padding / 2);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !simData) return;
        const container = canvas.parentElement;
        if (!container) return;

        const handleResize = () => {
            if (!canvasRef.current || !canvasRef.current.parentElement) return;
            const w = canvasRef.current.parentElement.offsetWidth;
            const h = canvasRef.current.parentElement.offsetHeight;
            const dpr = window.devicePixelRatio || 1;
            canvasRef.current.width = w * dpr; canvas.height = h * dpr;
            canvasRef.current.style.width = `${w}px`; canvas.style.height = `${h}px`;
            const ctx = canvasRef.current.getContext('2d');
            ctx.resetTransform(); ctx.scale(dpr, dpr);
            draw(ctx, w, h);
        };
        handleResize();
        const ro = new ResizeObserver(handleResize);
        ro.observe(container);

        // Report results once per simData change
        if (onSimComplete && simData && simData.meanPath) {
            const results = {
                meanPath: simData.meanPath,
                probability: simData.probability,
                sdLower1: simData.sdLower1,
                sdLower2: simData.sdLower2,
                worstCase: worstCaseData
            };
            const resultStr = JSON.stringify(results);
            if (lastSimResultsRef.current !== resultStr) {
                lastSimResultsRef.current = resultStr;
                onSimComplete(results);
            }
        }
        return () => ro.disconnect();
    }, [simData, theme, onSimComplete]);

    if (!effectiveStartingCapital || !simData) return (
        <div ref={visibilityRef} className="glass-premium p-5 rounded-5 text-center border-white-5" style={{ minHeight: '300px' }}>
            <div className="text-white-30 mb-3">
                <span className="material-icons" style={{ fontSize: '3rem' }}>analytics</span>
            </div>
            <h5 className="text-white mb-2">Awaiting Phase 3 Data</h5>
            <p className="small text-white-50">Please complete the Stage 2 calibration to bridge the data into the Sustainability Phase.</p>
        </div>
    );

    const formattedCapital = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(effectiveStartingCapital);

    return (
        <div ref={visibilityRef} className="distribution-monte-carlo w-100 py-4">
            <div className="mb-4 text-start font-monospace tracking-widest uppercase opacity-80">
                <div className="h5 fw-900 text-white mb-2" style={{ letterSpacing: '2px' }}>
                    THE SUSTAINABILITY COMPASS
                </div>
                <div className="text-orange small fw-bold d-none d-lg-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3" style={{ maxWidth: '800px', lineHeight: '1.4' }}>
                    <div className="glass-premium px-3 py-1 rounded-pill border-white-10 text-white w-auto">
                        <span className="material-icons align-middle me-1" style={{ fontSize: '0.9rem' }}>account_balance_wallet</span>
                        BRIDGED CAPITAL: <span className="text-orange">{formattedCapital}</span>
                    </div>
                    <div className="ps-0 ps-lg-0">
                        STRATEGIC SUCCESS PROBABILITY: <span className="text-orange">{simData.probability}%</span>
                    </div>
                    <div className="text-white border-start-lg border-white-20 ps-lg-3 mt-1 mt-lg-0">
                        TOTAL STRATEGIC CONFIDENCE (LIFECYCLE): <span className={`text-${jointProbability >= 80 ? 'success' : jointProbability >= 50 ? 'orange' : 'danger'}`}>{jointProbability}%</span>
                        <div className="x-small text-white-50 mt-1 font-monospace lowercase" style={{ letterSpacing: '0.5px', maxWidth: '600px' }}>
                            While your distribution plan is <span className="text-orange">{simData.probability}%</span> solid, you only have a <span className="text-orange">{bridgeProbability}%</span> chance of reaching the "Starting Line".
                        </div>
                    </div>
                </div>
            </div>

            {/* Starting Value Selector */}
            <div className="d-none d-lg-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3 mb-4">
                <span className="tiny font-monospace text-white-50 uppercase tracking-widest flex-shrink-0" style={{ fontSize: '0.6rem' }}>Starting Value Source:</span>
                <div className="d-flex bg-black-20 p-1 rounded-pill border border-white-10 flex-wrap gap-1">
                    {[
                        { id: 'goal', label: 'GOAL AMOUNT' },
                        { id: 'mean', label: '50% (MEAN)' },
                        { id: 'sd1', label: '68% (-1SD)' },
                        { id: 'sd2', label: '95% (-2SD)' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => {
                                setSelectedSource(opt.id);
                                captureIntent(`Sustained Cash Flow Monte Carlo [Source: ${opt.label}]`);
                            }}
                            className={`btn btn-sm rounded-pill px-2 px-md-3 py-1 font-monospace transition-all border-0 ${selectedSource === opt.id ? 'bg-orange text-white shadow-orange-sm' : 'text-white-50 hover-white'}`}
                            style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-vibrant rounded-5 overflow-hidden border-white-10 shadow-2xl mc-chart-container position-relative"
                style={{ background: '#050a18' }}>
                <canvas ref={canvasRef} style={{ display: 'block' }} />

                <div className="position-absolute top-0 start-0 p-3 p-md-4">
                    <div className="glass-premium p-2 p-md-3 rounded-4 border-white-5" style={{ minWidth: isMobileLocal ? '120px' : '180px' }}>
                        <div className="x-small text-muted font-monospace uppercase mb-1">PROBABILITY OF SUCCESS</div>
                        <div className={`display-5 fw-900 ${simData.probability >= 80 ? 'text-success' : 'text-orange'} mb-0`} style={{ lineHeight: 1, fontSize: isMobileLocal ? '2rem' : '3.5rem' }}>
                            {simData.probability}%
                        </div>
                        <div className="x-small text-muted font-monospace uppercase mt-1">
                            lasting until Age {longevity}
                        </div>
                    </div>
                </div>

                <div className="position-absolute bottom-0 start-0 p-3 p-md-4">
                    <div className="glass-premium p-2 p-md-3 rounded-4 border-white-5 text-start">
                        <div className="x-small text-muted font-monospace uppercase mb-1">STRATEGIC CASH FLOW</div>
                        <div className="d-flex flex-column gap-1">
                            <div>
                                <div className="tiny text-white-30 uppercase font-monospace" style={{ fontSize: '0.55rem' }}>
                                    {inflationAdjustedDistributions ? `Start (Age ${retirementAge})` : "Fixed Annual Withdrawal"}
                                </div>
                                <div className="h4 fw-bold text-white mb-0" style={{ fontSize: isMobileLocal ? '1.1rem' : '1.4rem' }}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(target * (distributionPcnt / 100))}
                                    <span className="text-white-30 small fw-normal ms-2">/ YR</span>
                                </div>
                            </div>
                            {inflationAdjustedDistributions ? (
                                <div className="mt-2 pt-2 border-top border-white-5">
                                    <div className="tiny text-omega-orange uppercase font-monospace" style={{ fontSize: '0.55rem' }}>Peak (Age {longevity})</div>
                                    <div className="h4 fw-bold text-omega-orange mb-0" style={{ fontSize: isMobileLocal ? '1.1rem' : '1.4rem' }}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((target * (distributionPcnt / 100)) * Math.pow(1 + (inflationRate / 100), YEARS))}
                                        <span className="text-white-30 small fw-normal ms-2">/ YR</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white-30 x-small mt-1 font-monospace lowercase" style={{ fontSize: '0.6rem' }}>
                                    constant nominal dollar withdrawal
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-2">
                <MonteCarloDisclosure />
            </div>

            <style jsx>{`
                .custom-orange-range { accent-color: #F4C366; }
                .x-small { font-size: 0.65rem; }
                .fw-900 { font-weight: 950; }
                .display-5 { font-size: 3.5rem; letter-spacing: -2px; }
                .mc-chart-container {
                    height: 520px;
                }
                @media (max-width: 991px) {
                    .border-start-lg { border-left: none !important; }
                }
                @media (min-width: 992px) {
                    .mc-chart-container {
                        height: 720px;
                    }
                    .border-start-lg { border-left: 1px solid rgba(255,255,255,0.2) !important; }
                }
            `}</style>
        </div>
    );
};

export default DistributionMonteCarlo;
