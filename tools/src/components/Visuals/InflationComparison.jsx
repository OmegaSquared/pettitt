import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const InflationComparison = ({ theme, inputs, onUpdateInput }) => {
    const [years, setYears] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [hasAutoRun, setHasAutoRun] = useState(false);
    const containerRef = React.useRef(null);

    const {
        age = 35,
        retirement = 65,
        target = 2500000,
        inflationRate = 2.5
    } = inputs || {};

    const yearsToRetirement = Math.max(0, retirement - age);

    // Calculations
    const nominalTarget = Number(target);
    const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const suggestedTarget = Math.round((nominalTarget * inflationFactor) / 10000) * 10000;
    const todayValue = Math.round(nominalTarget / inflationFactor);

    // Animation progress (0 to 1)
    const progress = years / yearsToRetirement;

    useEffect(() => {
        let timer;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAutoRun) {
                    // 5 second delay before auto-run
                    timer = setTimeout(() => {
                        setIsRunning(true);
                        setHasAutoRun(true);
                    }, 5000);
                }
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
            if (timer) clearTimeout(timer);
        };
    }, [hasAutoRun]);

    useEffect(() => {
        let interval;
        if (isRunning && years < yearsToRetirement) {
            interval = setInterval(() => {
                setYears(prev => {
                    const next = prev + 0.2;
                    if (next >= yearsToRetirement) {
                        setIsRunning(false);
                        return yearsToRetirement;
                    }
                    return next;
                });
            }, 30);
        }
        return () => clearInterval(interval);
    }, [isRunning, years, yearsToRetirement]);

    const handleRun = () => {
        setYears(0);
        setIsRunning(false);
        // Pause for 2 seconds at start values before running
        setTimeout(() => {
            setIsRunning(true);
        }, 2000);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Dynamic values based on animation - Showing purchasing power DECAY
    const animatedDecayFactor = Math.pow(1 + inflationRate / 100, years);
    const currentNominalRealValue = nominalTarget / animatedDecayFactor;
    const currentAdjustedRealValue = suggestedTarget / animatedDecayFactor;

    return (
        <div ref={containerRef} className="inflation-comparison-container w-100 py-4">
            <div className="row g-5 align-items-center">
                {/* Left Side: Text Content */}
                <div className="col-lg-6" data-aos="fade-right">
                    <div className="p-0 ps-lg-4 d-flex flex-column justify-content-center">
                        <h3 className="display-4 fw-bold mb-4 text-white ls-tight" style={{ lineHeight: '1.1', fontWeight: '900' }}>
                            Did you know that your retirement goal of <span className="text-omega-orange">{formatCurrency(nominalTarget)}</span> at retirement age <span className="text-omega-blue">{retirement}</span> is only worth <span className="text-danger">{formatCurrency(todayValue)}</span> in today's value?
                        </h3>
                        <p className="lead text-white-50 mb-5" style={{ fontSize: '1.7rem', lineHeight: '1.5', fontWeight: '400', maxWidth: '90%' }}>
                            To maintain your idea of retirement we suggest <span className="text-success fw-bold" style={{ textShadow: '0 0 25px rgba(40, 199, 111, 0.4)' }}>{formatCurrency(suggestedTarget)}</span>, which is your retirement goal today adjusted for inflation.
                        </p>


                    </div>
                </div>

                {/* Right Side: Circle Graphics + Strategic Calibration */}
                <div className="col-lg-6 position-relative" data-aos="fade-left">
                    <div className="d-flex justify-content-between align-items-end mb-3 px-2">
                        <div className="tiny font-monospace text-white-30 uppercase tracking-widest">
                            Assumed Inflation Rate: <span className="text-danger fw-bold">{inflationRate}%</span> / ANNUM
                        </div>
                    </div>
                    <div className="row g-3">
                        {/* Circle 1 */}
                        <div className="col-sm-6">
                            <div className="glass-premium p-4 rounded-5 border-white-5 text-center position-relative overflow-hidden h-100 d-flex flex-column justify-content-center"
                                style={{ transition: 'all 0.5s ease', background: 'rgba(10, 25, 47, 0.4)' }}>
                                <div className="mb-3">
                                    <div className="tiny font-monospace text-white-30 uppercase tracking-widest mb-1" style={{ fontSize: '0.65rem' }}>POWER OF {formatCurrency(nominalTarget)}</div>
                                    <div className="h4 fw-900 text-white mb-0 font-monospace">{formatCurrency(currentNominalRealValue)}</div>
                                </div>
                                <div className="position-relative d-flex justify-content-center align-items-center" style={{ height: '140px' }}>
                                    <motion.div
                                        className="rounded-circle position-absolute"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            border: '1px dashed rgba(169, 197, 230, 0.3)',
                                            background: 'radial-gradient(circle, rgba(169, 197, 230, 0.05) 0%, transparent 70%)'
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <div className="rounded-circle bg-omega-blue-10 d-flex align-items-center justify-content-center shadow-lg"
                                        style={{ width: '80px', height: '80px', border: '1px solid rgba(169, 197, 230, 0.2)', background: 'rgba(169, 197, 230, 0.1)' }}>
                                        <span className="material-icons text-omega-blue" style={{ fontSize: '2.5rem' }}>account_balance</span>
                                    </div>
                                </div>
                                <div className="mt-3 tiny font-monospace text-white-20 uppercase" style={{ fontSize: '0.6rem' }}>Stage: INITIAL</div>
                            </div>
                        </div>

                        {/* Circle 2 */}
                        <div className="col-sm-6 position-relative">
                            {/* Refresh Button - Now above the right simulation */}
                            <div className="position-absolute" style={{ top: '-35px', right: '10px', zIndex: 10 }}>
                                <motion.button
                                    onClick={handleRun}
                                    disabled={isRunning}
                                    whileHover={{ scale: 1.1, rotate: 180 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="btn btn-link text-white-20 hover-text-orange p-1 d-flex align-items-center justify-content-center text-decoration-none shadow-none"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <span className={`material-icons ${isRunning ? 'spin' : ''}`} style={{ fontSize: '1.2rem' }}>refresh</span>
                                </motion.button>
                            </div>

                            <div className="glass-premium p-4 rounded-5 border-white-5 text-center position-relative overflow-hidden h-100 d-flex flex-column justify-content-center"
                                style={{
                                    border: isRunning || years === yearsToRetirement ? '1px solid rgba(244, 195, 102, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                                    background: isRunning ? 'rgba(244, 195, 102, 0.05)' : 'rgba(10, 25, 47, 0.4)',
                                    transition: 'all 0.5s ease'
                                }}>
                                <div className="mb-3">
                                    <div className="tiny font-monospace text-omega-orange fw-bold uppercase tracking-widest mb-1" style={{ fontSize: '0.65rem' }}>POWER OF {formatCurrency(suggestedTarget)}</div>
                                    <div className="h4 fw-900 text-success mb-0 font-monospace">
                                        {formatCurrency(currentAdjustedRealValue)}
                                    </div>
                                </div>
                                <div className="position-relative d-flex justify-content-center align-items-center" style={{ height: '140px' }}>
                                    <motion.div
                                        className="rounded-circle position-absolute"
                                        animate={{
                                            width: 80 + (progress * 60),
                                            height: 80 + (progress * 60),
                                            opacity: 0.1 + (progress * 0.2)
                                        }}
                                        style={{
                                            background: 'rgba(40, 199, 111, 0.4)',
                                            border: '1px solid #28c76f',
                                            boxShadow: '0 0 40px rgba(40, 199, 111, 0.2)'
                                        }}
                                    />
                                    <div className="rounded-circle d-flex align-items-center justify-content-center position-relative shadow-2xl"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'rgba(40, 199, 111, 0.2)',
                                            border: '1px solid #28c76f',
                                            zIndex: 2
                                        }}>
                                        <span className="material-icons text-success" style={{ fontSize: '2.5rem' }}>insights</span>
                                        {!isRunning && years >= yearsToRetirement && (
                                            <motion.div
                                                className="position-absolute rounded-circle"
                                                initial={{ scale: 1, opacity: 0.6 }}
                                                animate={{ scale: 1.8, opacity: 0 }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                style={{ width: '100%', height: '100%', border: '2px solid #28c76f' }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3 tiny font-monospace text-white-20 uppercase d-flex justify-content-center align-items-center gap-2" style={{ fontSize: '0.6rem' }}>
                                    <span className="material-icons" style={{ fontSize: '0.7rem' }}>schedule</span>
                                    AGE {Math.floor(age + years)}
                                </div>
                            </div>
                        </div>

                        {/* Strategic Calibration - Moved here */}
                        <div className="col-12 mt-2">
                            <div className="glass-premium p-3 rounded-4 border-white-5 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3"
                                style={{ background: 'rgba(244, 195, 102, 0.05)', border: '1px solid rgba(244, 195, 102, 0.15)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-omega-orange-10 p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                        <span className="material-icons text-omega-orange" style={{ fontSize: '1.4rem' }}>settings_suggest</span>
                                    </div>
                                    <div className="text-start">
                                        <h6 className="text-white fw-900 mb-0 uppercase tracking-wider small">Strategic Calibration</h6>
                                        <p className="text-white-30 mb-0" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                                            Use inflation adjusted numbers in the simulation?
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-2 bg-black-20 p-1.5 rounded-pill border border-white-10 flex-shrink-0" style={{ minWidth: '160px' }}>
                                    <button
                                        onClick={() => {
                                            onUpdateInput('useInflationAdjusted', false);
                                            onUpdateInput('inflationAdjustedDistributions', false);
                                        }}
                                        className={`flex-grow-1 btn btn-sm rounded-pill fw-bold uppercase tracking-widest transition-all py-1.5 ${!inputs.useInflationAdjusted ? 'bg-danger text-white shadow-lg' : 'text-white-30 hover-text-white'}`}
                                        style={{ fontSize: '0.65rem' }}
                                    >
                                        NO
                                    </button>
                                    <button
                                        onClick={() => {
                                            onUpdateInput('useInflationAdjusted', true);
                                            onUpdateInput('inflationAdjustedDistributions', true);
                                        }}
                                        className={`flex-grow-1 btn btn-sm rounded-pill fw-bold uppercase tracking-widest transition-all py-1.5 ${inputs.useInflationAdjusted ? 'bg-success text-white shadow-lg' : 'text-white-30 hover-text-white'}`}
                                        style={{ fontSize: '0.65rem' }}
                                    >
                                        YES
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            <style jsx>{`
                .text-omega-orange { color: #F4C366; }
                .text-omega-blue { color: #C9D3EA; }
                .bg-omega-blue-10 { background: rgba(169, 197, 230, 0.1); }
                .bg-omega-orange-10 { background: rgba(244, 195, 102, 0.1); }
                .bg-black-20 { background: rgba(0, 0, 0, 0.2); }
                .border-white-10 { border: 1px solid rgba(255,255,255,0.1); }
                .border-white-5 { border: 1px solid rgba(255,255,255,0.05); }
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .hover-text-orange:hover {
                    color: #F4C366 !important;
                }
                .hover-text-white:hover {
                    color: white !important;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default InflationComparison;
