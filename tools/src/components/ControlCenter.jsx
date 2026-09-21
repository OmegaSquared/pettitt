import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskReturnCurve from './Visuals/RiskReturnCurve';
import { captureIntent } from '../utils/captureIntent';

const ControlCenter = ({
    isOpen,
    onClose,
    inputs = { age: 35, retirement: 65, capital: 400000, monthlyContribution: 500, riskLevel: 66.7, target: 2500000 },
    onUpdate,
    theme = 'dark-mode'
}) => {
    const [activeTab, setActiveTab] = useState('COMPASS');
    const contentPanelRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

    useEffect(() => {
        if (contentPanelRef.current) {
            contentPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab]);

    React.useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth <= 576;
    const sidebarWidth = isMobile ? '100%' : '25vw';

    const tabs = [
        { id: 'COMPASS', icon: 'architecture' },
        { id: 'ACCUMULATION', icon: 'trending_up', locked: !inputs.isAccumulationUnlocked },
        { id: 'DEFENSE', icon: 'shield', locked: !inputs.isDefenseUnlocked },
        { id: 'DISTRIBUTION', icon: 'wallet', locked: !inputs.isDistributionUnlocked }
    ];

    const getProgress = () => {
        let progress = 0;
        if (inputs.isAccumulationUnlocked) progress = 25;
        if (inputs.isDefenseUnlocked) progress = 50;
        if (inputs.isDistributionUnlocked) progress = 75;
        if (inputs.isComplete) progress = 100;
        return progress;
    };

    const currentProgress = getProgress();

    const renderCompass = () => {
        const yearsToRetirement = Math.max(1, (inputs.retirement || 65) - (inputs.age || 35));
        const inflationRate = inputs.inflationRate || 2.0;
        const inflationAdjustedGoal = Math.round((inputs.target || 2500000) * Math.pow(1 + inflationRate / 100, yearsToRetirement) / 10000) * 10000;

        return (
            <div className="d-flex flex-column gap-5 mt-4">
                {/* Age Slider */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Current Age</label>
                    <div className="h4 text-white fw-bold mb-3">{inputs.age || 35} Years</div>
                    <input
                        type="range"
                        min="18"
                        max="80"
                        step="1"
                        value={inputs.age || 35}
                        onChange={(e) => onUpdate('age', parseInt(e.target.value))}
                        className="form-range custom-orange-range"
                    />
                </div>

                {/* Liquid Capital */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Liquid Capital</label>
                    <div className="h4 text-white fw-bold mb-3">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(inputs.capital || 400000)}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="50000"
                        value={inputs.capital || 400000}
                        onChange={(e) => onUpdate('capital', parseInt(e.target.value))}
                        className="form-range custom-orange-range"
                    />
                </div>

                {/* Retirement Age */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Target Retirement Age</label>
                    <div className="h4 text-white fw-bold mb-3">{inputs.retirement || 65} Years</div>
                    <input
                        type="range"
                        min="40"
                        max="90"
                        step="1"
                        value={inputs.retirement || 65}
                        onChange={(e) => onUpdate('retirement', parseInt(e.target.value))}
                        className="form-range custom-orange-range"
                    />
                </div>

                {/* Retirement Amount */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Target Portfolio Value</label>
                    <div className="h4 text-white fw-bold mb-3">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(inputs.target || 2500000)}
                    </div>
                    <input
                        type="range"
                        min="100000"
                        max="50000000"
                        step="250000"
                        value={inputs.target || 2500000}
                        onChange={(e) => onUpdate('target', parseInt(e.target.value))}
                        className="form-range custom-orange-range"
                    />

                    {/* Inflation Adjustment Logic */}
                    <div className="mt-4 p-4 rounded-4" style={{ background: 'rgba(255, 50, 50, 0.05)', border: '1px solid rgba(255, 50, 50, 0.2)' }}>
                        <div className="mb-3 text-center">
                            <div className="text-danger h3 fw-900 tracking-tighter uppercase mb-0" style={{ letterSpacing: '-1px' }}>The Ugly Truth</div>
                        </div>

                        <div className="text-white-50 mb-4" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                            Based on an average inflation rate of <span className="text-white fw-bold">{inflationRate}%</span>, your purchasing power for your retirement target decreases.
                            The amount you will need in today's living standard is <span className="text-white fw-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(inputs.target || 2500000)}</span>, but the future living standard of retirement is <span className="text-white fw-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(inflationAdjustedGoal)}</span>.
                        </div>

                        <div className="mb-4 text-center">
                            <div className="text-white-30 small uppercase tracking-widest mb-1">Inflation Adjusted Goal</div>
                            <div className="h1 text-white fw-900 mb-0" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>
                                {inflationAdjustedGoal >= 1000000
                                    ? `$${(inflationAdjustedGoal / 1000000).toFixed(2)}M`
                                    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(inflationAdjustedGoal)
                                }
                            </div>
                        </div>

                        <div className="text-center mb-3 pt-3 border-top border-white-10">
                            <div className="text-white-50 tiny uppercase tracking-widest mb-3">Would you like to use the inflation adjusted target in the modeling?</div>
                            <button
                                onClick={() => {
                                    const nextVal = !inputs.useInflationAdjusted;
                                    onUpdate('useInflationAdjusted', nextVal);
                                    onUpdate('inflationAdjustedDistributions', nextVal);
                                }}
                                className={`btn w-100 py-3 rounded-pill fw-900 uppercase tracking-widest transition-all ${inputs.useInflationAdjusted ? 'btn-danger shadow-lg' : 'btn-outline-danger'}`}
                                style={{ fontSize: '0.9rem' }}
                            >
                                {inputs.useInflationAdjusted ? 'NO' : 'YES'}
                            </button>
                        </div>
                        <div className="mt-4 pt-3">
                            <div className="d-flex justify-content-between align-items-center mb-0">
                                <label className="text-white-30 tiny uppercase tracking-widest mb-0">Inflation Rate</label>
                                <div className="text-white fw-bold small">{inflationRate}%</div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={inflationRate}
                                onChange={(e) => onUpdate('inflationRate', parseFloat(e.target.value))}
                                className="form-range custom-orange-range"
                            />
                        </div>
                    </div>
                </div>

                {/* Management Fee Slider */}
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="text-white-50 tiny uppercase tracking-widest mb-0">Management Fee</label>
                        <div className="text-white fw-bold">{inputs.managementFee || 1.5}%</div>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={inputs.managementFee || 1.5}
                        onChange={(e) => onUpdate('managementFee', parseFloat(e.target.value))}
                        className="form-range custom-orange-range"
                    />
                    <div className="tiny text-white-30 font-monospace uppercase mt-1">
                        Applied annually to total assets
                    </div>
                </div>
            </div>
        );
    };

    const renderAccumulation = () => (
        <div className="d-flex flex-column gap-5 mt-4">
            <div className="text-white-50 tiny uppercase tracking-widest mb-2" style={{ lineHeight: '1.6', fontSize: '0.65rem' }}>
                THE BUILDING PHASE: GROWING YOUR WEALTH BY COMBINING REGULAR SAVINGS WITH THE RIGHT INVESTMENT STRATEGY TO REACH YOUR GOALS FASTER.
            </div>
            {/* Contribution Inputs */}
            <div>
                <label className="font-monospace text-white-50 tiny uppercase tracking-widest mb-3 d-block text-center">CONTRIBUTION CALIBRATION</label>
                <div className="row g-3 mb-4">
                    <div className="col-6">
                        <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Monthly</label>
                        <div className="d-flex align-items-center p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="text-white-30 me-1 h4 mb-0">$</span>
                            <input
                                type="text"
                                className="bg-transparent border-0 text-white h4 fw-bold mb-0 w-100 outline-none"
                                value={new Intl.NumberFormat('en-US').format(inputs.monthlyContribution || 0)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, ''));
                                    if (!isNaN(val)) onUpdate('monthlyContribution', val);
                                    else if (e.target.value === '') onUpdate('monthlyContribution', 0);
                                }}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Annual</label>
                        <div className="d-flex align-items-center p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="text-white-30 me-1 h4 mb-0">$</span>
                            <input
                                type="text"
                                className="bg-transparent border-0 text-white h4 fw-bold mb-0 w-100 outline-none"
                                value={new Intl.NumberFormat('en-US').format((inputs.monthlyContribution || 0) * 12)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, ''));
                                    if (!isNaN(val)) onUpdate('monthlyContribution', Math.round(val / 12));
                                    else if (e.target.value === '') onUpdate('monthlyContribution', 0);
                                }}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="px-1">
                    <input
                        type="range"
                        min="0"
                        max="20000"
                        step="100"
                        value={inputs.monthlyContribution || 500}
                        onChange={(e) => onUpdate('monthlyContribution', parseInt(e.target.value))}
                        className="form-range custom-accumulation-range"
                    />
                </div>
            </div>

            {/* Risk / Return Profile */}
            <div>
                <RiskReturnCurve
                    riskLevel={inputs.riskLevel || 66.7}
                    onRiskChange={(val) => onUpdate('riskLevel', val)}
                />
            </div>

            {/* De-risking Age */}
            <div>
                <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">At what age should we start getting less risky?</label>
                <div className="h4 text-white fw-bold mb-3">{inputs.deriskingAge || (inputs.retirement - 10)} Years</div>
                <input
                    type="range"
                    min={inputs.age || 35}
                    max={inputs.retirement || 65}
                    step="1"
                    value={inputs.deriskingAge || (inputs.retirement - 10)}
                    onChange={(e) => onUpdate('deriskingAge', parseInt(e.target.value))}
                    className="form-range custom-accumulation-range"
                />
            </div>
        </div>
    );

    const renderDefense = () => ( // Renamed from renderProtection
        <div className="d-flex flex-column gap-5 mt-4">
            <div className="text-white-50 tiny uppercase tracking-widest mb-2" style={{ lineHeight: '1.6', fontSize: '0.65rem' }}>
                PROTECTION PHASE: ENSURING YOUR WEALTH IS PRESERVED AND PROTECTED AGAINST MARKET VOLATILITY WHILE MAINTAINING GROWTH.
            </div>
            {/* Contribution Inputs */}
            <div>
                <label className="font-monospace text-white-50 tiny uppercase tracking-widest mb-3 d-block text-center">CONTRIBUTION CALIBRATION</label>
                <div className="row g-3 mb-4">
                    <div className="col-6">
                        <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Monthly</label>
                        <div className="d-flex align-items-center p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="text-white-30 me-1 h4 mb-0">$</span>
                            <input
                                type="text"
                                className="bg-transparent border-0 text-white h4 fw-bold mb-0 w-100 outline-none"
                                value={new Intl.NumberFormat('en-US').format(inputs.protectionMonthlyContribution || 0)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, ''));
                                    if (!isNaN(val)) onUpdate('protectionMonthlyContribution', val);
                                    else if (e.target.value === '') onUpdate('protectionMonthlyContribution', 0);
                                }}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Annual</label>
                        <div className="d-flex align-items-center p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="text-white-30 me-1 h4 mb-0">$</span>
                            <input
                                type="text"
                                className="bg-transparent border-0 text-white h4 fw-bold mb-0 w-100 outline-none"
                                value={new Intl.NumberFormat('en-US').format((inputs.protectionMonthlyContribution || 0) * 12)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, ''));
                                    if (!isNaN(val)) onUpdate('protectionMonthlyContribution', Math.round(val / 12));
                                    else if (e.target.value === '') onUpdate('protectionMonthlyContribution', 0);
                                }}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="px-1">
                    <input
                        type="range"
                        min="0"
                        max="20000"
                        step="100"
                        value={inputs.protectionMonthlyContribution || 500}
                        onChange={(e) => onUpdate('protectionMonthlyContribution', parseInt(e.target.value))}
                        className="form-range custom-accumulation-range"
                    />
                </div>
            </div>

            {/* Risk / Return Profile */}
            <div>
                <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">PROTECTION RISK PROFILE</label>
                <RiskReturnCurve
                    riskLevel={inputs.protectionRiskLevel || 38.9}
                    onRiskChange={(val) => onUpdate('protectionRiskLevel', val)}
                />
            </div>
        </div>
    );

    const renderDistribution = () => {
        const yearsToRetirement = Math.max(1, (inputs.retirement || 65) - (inputs.age || 35));
        const isPastRetirement = (inputs.age || 35) >= (inputs.retirement || 65);
        const basis = isPastRetirement
            ? (inputs.capital || 400000)
            : (inputs.useInflationAdjusted
                ? Math.round((inputs.target || 2500000) * Math.pow(1 + (inputs.inflationRate || 2.0) / 100, yearsToRetirement) / 10000) * 10000
                : (inputs.target || 2500000));

        const annualAmount = (basis * (inputs.distributionRate || 4)) / 100;

        // Today's living standard amount
        const inflationFactor = Math.pow(1 + (inputs.inflationRate || 2.0) / 100, yearsToRetirement);
        const todaysLivingStandardAnnual = annualAmount / inflationFactor;

        return (
            <div className="d-flex flex-column gap-5 mt-4">
                <div className="text-white-50 tiny uppercase tracking-widest mb-2" style={{ lineHeight: '1.6', fontSize: '0.65rem' }}>
                    DISTRIBUTION PHASE: MANAGING YOUR CASH FLOW IN RETIREMENT TO ENSURE YOUR CAPITAL LASTS AS LONG AS YOU NEED IT.
                </div>

                {/* Planning Horizon */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Plan Distribution Until Age</label>
                    <div className="h4 text-white fw-bold mb-3">{inputs.planUntilAge || 95} Years</div>
                    <input
                        type="range"
                        min={inputs.retirement || 65}
                        max="100"
                        step="1"
                        value={inputs.planUntilAge || 95}
                        onChange={(e) => onUpdate('planUntilAge', parseInt(e.target.value))}
                        className="form-range custom-orange-range"
                    />
                </div>

                {/* Annual Distribution Amount */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block text-omega-orange">
                        {inputs.inflationAdjustedDistributions ? "Annual Distribution (Today's Purchasing Power)" : "Annual Distribution Amount (At Retirement)"}
                    </label>
                    <div className="position-relative">
                        <div className="d-flex align-items-center p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="h4 text-white-50 mb-0 me-2">$</span>
                            <input
                                type="text"
                                className="bg-transparent border-0 text-white h2 fw-bold mb-0 w-100 outline-none"
                                value={new Intl.NumberFormat('en-US').format(Math.round(inputs.inflationAdjustedDistributions ? todaysLivingStandardAnnual : annualAmount))}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value.replace(/,/g, ''));
                                    if (!isNaN(val)) {
                                        // If adj is on, the user is typing 'Today's dollars'
                                        // Nominal at retirement = Today's * InflationFactor
                                        const nominalAtRetirement = inputs.inflationAdjustedDistributions ? val * inflationFactor : val;
                                        const newRate = (nominalAtRetirement / basis) * 100;
                                        onUpdate('distributionRate', newRate);
                                    }
                                }}
                                style={{ boxShadow: 'none', outline: 'none' }}
                            />
                        </div>
                    </div>
                    {inputs.inflationAdjustedDistributions && (
                        <div className="text-white-50 x-small mt-2 font-monospace uppercase">
                            Actual Withdrawal at Retirement: <span className="text-white fw-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(annualAmount)}</span>
                        </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-white-30 font-monospace uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                            BASIS: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(basis)}
                            <span className="text-omega-orange fw-bold italic uppercase tracking-tighter technical-disclosure" style={{ opacity: 0.8 }}>
                                * PLEASE NOTE: THIS IS A SIMPLIFIED SIMULATOR FOR EDUCATIONAL PURPOSES. AN ACTUAL FINANCIAL PLAN REQUIRES A MORE ROBUST, RIGOROUSLY CALIBRATED SYSTEM.
                            </span>
                        </div>
                        <div className="text-omega-orange font-monospace uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                            {(inputs.distributionRate || 4).toFixed(1)}% RATE
                        </div>
                    </div>
                </div>

                {/* Inflation Adjusted distributions Logic */}
                <div className="p-4 rounded-4 position-relative overflow-hidden" style={{ background: 'rgba(244, 195, 102, 0.03)', border: '1px solid rgba(244, 195, 102, 0.15)' }}>
                    <div className="position-absolute top-0 end-0 p-3 opacity-10">
                        <span className="material-icons" style={{ fontSize: '4rem' }}>auto_graph</span>
                    </div>

                    <div className="mb-4 position-relative">
                        <div className="text-omega-orange tiny uppercase fw-900 tracking-widest mb-2" style={{ letterSpacing: '2px' }}>Standard of Living</div>
                        <div className="d-flex align-items-baseline gap-2">
                            <div className="h2 text-white fw-900 mb-0">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(todaysLivingStandardAnnual)}
                            </div>
                            <div className="text-white-50 small font-monospace">/ YEAR</div>
                        </div>
                        <div className="text-white-30 x-small mt-2 fw-bold uppercase tracking-tighter" style={{ lineHeight: '1.4' }}>
                            Equivalent purchasing power in <span className="text-white">TODAY'S</span> economy.
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-top border-white-10">
                        <label className="d-flex align-items-center gap-3 cursor-pointer group">
                            <div className="flex-grow-1">
                                <div className="text-white small fw-900 uppercase tracking-wider mb-1">Maintain Buying Power</div>
                                <div className="text-white-30 x-small" style={{ lineHeight: '1.4' }}>
                                    Adjust every distribution by <span className="text-omega-orange fw-bold">{inputs.inflationRate || 2.0}%</span> annually to combat the "Ugly Truth."
                                </div>
                            </div>
                            <div
                                onClick={() => {
                                    const nextValue = !inputs.inflationAdjustedDistributions;
                                    const currentInBox = inputs.inflationAdjustedDistributions ? todaysLivingStandardAnnual : annualAmount;

                                    // When switching, we treat the number currently in the box as the new anchor.
                                    // If turning ON: the number in box becomes "Today's Dollars", so Nominal = val * factor
                                    // If turning OFF: the number in box becomes "Nominal Dollars", so Nominal = val
                                    const newNominal = nextValue ? currentInBox * inflationFactor : currentInBox;
                                    const newRate = (newNominal / basis) * 100;

                                    onUpdate('inflationAdjustedDistributions', nextValue);
                                    onUpdate('distributionRate', newRate);
                                }}
                                className={`position-relative flex-shrink-0 transition-all ${inputs.inflationAdjustedDistributions ? 'shadow-orange-glow' : ''}`}
                                style={{
                                    width: '56px',
                                    height: '30px',
                                    background: inputs.inflationAdjustedDistributions ? '#F4C366' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '15px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <div
                                    className="transition-all"
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        left: inputs.inflationAdjustedDistributions ? '30px' : '4px',
                                        width: '20px',
                                        height: '20px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                        transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
                                    }}
                                />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Annual Distribution Percent Slider */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">Adjust Distribution Percent</label>
                    <input
                        type="range"
                        min="0"
                        max="15"
                        step="0.1"
                        value={inputs.distributionRate || 4}
                        onChange={(e) => {
                            const rate = parseFloat(e.target.value);
                            onUpdate('distributionRate', rate);
                        }}
                        className="form-range custom-accumulation-range"
                    />
                </div>

                {/* Risk / Return Profile */}
                <div>
                    <label className="text-white-50 tiny uppercase tracking-widest mb-2 d-block">DISTRIBUTION RISK PROFILE</label>
                    <RiskReturnCurve
                        riskLevel={inputs.distributionRiskLevel || 11.1}
                        onRiskChange={(val) => onUpdate('distributionRiskLevel', val)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="control-center-wrapper">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="position-fixed top-0 start-0 w-100 h-100"
                        style={{ zIndex: 1999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar + Tab Container */}
            <motion.div
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="position-fixed top-0 start-0 h-100 d-flex flex-column control-center-sidebar shadow-2xl"
                style={{
                    zIndex: 2000,
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    pointerEvents: 'auto',
                    width: sidebarWidth,
                    maxWidth: sidebarWidth,
                    background: '#050E1E'
                }}
            >
                <motion.button
                    drag="y"
                    dragConstraints={{
                        top: -windowHeight / 2 + (isMobile ? 24 : 110),
                        bottom: windowHeight / 2 - (isMobile ? 24 : 110)
                    }}
                    dragElastic={0.05}
                    dragMomentum={false}
                    onClick={isOpen ? onClose : () => onUpdate('open', true)}
                    className="control-center-tab d-flex flex-column align-items-center justify-content-center position-absolute"
                    style={{
                        top: `calc(50% - ${isMobile ? '24px' : '110px'})`,
                        left: '100%',
                        zIndex: 2001,
                        cursor: 'grab',
                        touchAction: 'none',
                        background: '#050E1E',
                        borderRadius: isMobile ? '0 6px 6px 0' : '0 10px 10px 0',
                        padding: 0,
                        border: 'none',
                        outline: 'none',
                        width: isMobile ? '32px' : '52px',
                        height: isMobile ? '48px' : '220px'
                    }}
                    title={isOpen ? "Close Simulator" : "Open Simulator"}
                    whileTap={{ cursor: 'grabbing' }}
                >
                    <span className="material-icons text-omega-orange" style={{
                        fontSize: isMobile ? '20px' : '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        lineHeight: 1,
                        margin: 0
                    }}>
                        {isOpen ? 'chevron_left' : 'chevron_right'}
                    </span>
                    {!isMobile && (
                        <span className="tab-text fw-900 tracking-widest text-white uppercase mt-2">
                            SIMULATOR
                        </span>
                    )}
                </motion.button>

                {/* Sidebar Content */}
                <div className="h-100 d-flex flex-column overflow-hidden">
                    {/* Header */}
                    <div className="p-4 pt-5 pb-3 d-flex align-items-center justify-content-between position-relative">
                        <div className="d-flex align-items-center gap-3">
                            <div className="milestone-circle position-relative d-flex align-items-center justify-content-center"
                                style={{ width: '64px', height: '64px' }}>
                                <svg viewBox="0 0 36 36" className="w-100 h-100">
                                    <path
                                        className="circle-bg"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.05)"
                                        strokeWidth="2"
                                    />
                                    <path
                                        className="circle"
                                        strokeDasharray={`${currentProgress}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#F4C366"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                    />
                                </svg>
                                <span className="position-absolute text-white tiny fw-900" style={{ fontSize: '0.65rem' }}>{currentProgress}%</span>
                            </div>
                            <div className="d-flex flex-column">
                                <span className="tiny text-omega-orange uppercase fw-bold tracking-widest" style={{ letterSpacing: '2px' }}>PROGRESS</span>
                                <span className="h4 text-white fw-bold mb-0">Simulator</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-link text-white-50 hover-text-white p-0">
                            <span className="material-icons" style={{ fontSize: '24px' }}>close</span>
                        </button>
                    </div>

                    {/* Top Navigation Bar */}
                    <div
                        className="d-flex flex-nowrap border-top border-bottom bg-black-40 overflow-hidden milestone-tab-container"
                        style={{
                            width: '100%',
                            borderColor: 'rgba(120, 130, 120, 0.3) !important'
                        }}
                    >
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <div
                                    key={tab.id}
                                    onClick={() => {
                                        if (tab.locked) return;
                                        setActiveTab(tab.id);
                                    }}
                                    className={`flex-grow-1 cursor-pointer transition-all d-flex flex-column align-items-center justify-content-center milestone-tab ${isActive ? 'active' : ''} ${tab.locked ? 'cursor-not-allowed opacity-40' : ''}`}
                                    title={tab.locked ? 'Complete Compass Analysis first' : ''}
                                >
                                    <span className={`material-icons ${isActive ? 'text-omega-orange' : 'text-blue-grey'}`} style={{ fontSize: '32px' }}>
                                        {tab.locked ? 'lock' : tab.icon}
                                    </span>
                                    <span className={`tiny fw-950 tracking-widest ${isActive ? 'text-omega-orange' : 'text-blue-grey'}`} style={{ fontSize: '0.65rem' }}>
                                        {tab.id}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Content Panel */}
                    <div
                        ref={contentPanelRef}
                        className="flex-grow-1 overflow-auto p-4 control-center-panel"
                        style={{ width: '100%' }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'COMPASS' && renderCompass()}
                                {activeTab === 'ACCUMULATION' && renderAccumulation()}
                                {activeTab === 'DEFENSE' && renderDefense()}
                                {activeTab === 'DISTRIBUTION' && renderDistribution()}

                                {/* Action Buttons - Now part of scrollable content */}
                                <div className="mt-5 pt-5 d-flex gap-3">
                                    {activeTab !== 'COMPASS' && (
                                        <button
                                            onClick={() => {
                                                const currIdx = tabs.findIndex(t => t.id === activeTab);
                                                setActiveTab(tabs[currIdx - 1].id);
                                            }}
                                            className="btn btn-outline-white flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3 fw-bold uppercase tiny"
                                        >
                                            <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
                                            BACK
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (activeTab === 'COMPASS') {
                                                captureIntent('Compass Simulator Engine', {}, `Configured Base Assumptions: Retiring at ${inputs.retirement} with $${new Intl.NumberFormat('en-US').format(inputs.target)} and $${new Intl.NumberFormat('en-US').format(inputs.capital)} capital.`);
                                                onUpdate('isAccumulationUnlocked', true);
                                                setActiveTab('ACCUMULATION');
                                            } else if (activeTab === 'ACCUMULATION') {
                                                captureIntent('Compass Simulator Engine', {}, `Calibrated Accumulation: Saving $${new Intl.NumberFormat('en-US').format(inputs.monthlyContribution)}/mo at Risk Level ${inputs.riskLevel}.`);
                                                onUpdate('isDefenseUnlocked', true);
                                                setActiveTab('DEFENSE');
                                            } else if (activeTab === 'DEFENSE') {
                                                captureIntent('Compass Simulator Engine', {}, `Calibrated Protection: Saving $${new Intl.NumberFormat('en-US').format(inputs.protectionMonthlyContribution)}/mo at Risk Level ${inputs.protectionRiskLevel}.`);
                                                onUpdate('isDistributionUnlocked', true);
                                                setActiveTab('DISTRIBUTION');
                                            } else {
                                                captureIntent('Compass Simulator Engine', {}, `Finalized Compass Simulator: Planning until Age ${inputs.planUntilAge} at a ${(inputs.distributionRate || 4).toFixed(1)}% withdrawal rate. Risk Level ${inputs.distributionRiskLevel}.`);
                                                onUpdate('isComplete', true);
                                                setTimeout(onClose, 500); // Close after a brief delay to show 100%
                                            }
                                        }}
                                        className="btn btn-omega-orange flex-grow-1 fw-900 tracking-widest py-3 uppercase tiny"
                                    >
                                        {activeTab === 'COMPASS' ? 'SAVE & CONTINUE' : (activeTab === 'DISTRIBUTION' ? 'FINISH' : 'SAVE & NEXT')}
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Branding */}
                    <div className="px-4 py-3 bg-black border-top border-white-5 text-start">
                        <div className="d-flex align-items-center gap-2 opacity-40">
                            <span className="fw-bold text-white small" style={{ letterSpacing: '1px' }}>PETTITT WEALTH</span>
                            <span className="tiny text-white uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>PLANNING SIMULATOR V2.4</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                .control-center-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 100vw;
                    overflow-x: hidden;
                }
                .control-center-panel {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE and Edge */
                }
                .control-center-panel::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
                .control-center-sidebar {
                    height: 100% !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                }
                .milestone-tab-container {
                    height: 140px !important;
                    min-height: 140px !important;
                }
                .milestone-tab {
                    width: 25% !important;
                    flex: 0 0 25% !important;
                    height: 100% !important;
                    min-width: 0 !important;
                    border: none !important;
                    border-bottom: 2px solid transparent !important; /* Fixed baseline for alignment */
                    transition: all 0.3s ease;
                    padding: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center;
                    box-sizing: border-box !important;
                }
                .milestone-tab.active {
                    background: rgba(255,255,255,0.05) !important;
                    border-bottom: 2px solid #F4C366 !important;
                }
                .milestone-tab .material-icons {
                    transition: all 0.3s ease;
                    margin-bottom: 12px !important; /* Consistent margin */
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .milestone-tab span.tiny {
                    width: 100%;
                    padding: 0 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .form-range {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 1rem 0 !important;
                }
                @media (max-width: 576px) {
                    .control-center-sidebar {
                        width: 100vw !important;
                        min-width: 100vw !important;
                        max-width: 100vw !important;
                        left: 0;
                        right: 0;
                    }
                    .control-center-panel {
                        padding: 1.5rem !important;
                        width: 100% !important;
                        max-width: 100vw !important;
                    }
                    .milestone-tab-container {
                        height: 80px !important;
                        min-height: 80px !important;
                    }
                    .milestone-tab {
                        height: 80px !important;
                        padding: 0 !important;
                    }
                    .milestone-tab .material-icons {
                        font-size: 22px !important;
                        height: 22px !important;
                        margin-bottom: 6px !important;
                    }
                    .milestone-tab .tiny {
                        font-size: 0.5rem !important;
                        letter-spacing: 0 !important;
                        line-height: 1 !important;
                        height: auto !important;
                    }
                    .h4 {
                        font-size: 1.1rem !important;
                    }
                    .tiny {
                        font-size: 0.6rem !important;
                    }
                    .milestone-circle {
                        width: 48px !important;
                        height: 48px !important;
                    }
                }
                .control-center-tab {
                    background: #050E1E;
                    border-radius: 0 10px 10px 0;
                    box-shadow: 10px 0 30px rgba(0,0,0,0.5);
                    user-select: none;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                @media (max-width: 576px) {
                    .control-center-tab {
                        display: ${isOpen ? 'none' : 'flex'} !important;
                    }
                    .tab-text {
                        display: none !important;
                    }
                    .control-center-tab .material-icons {
                        font-size: 24px !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
                .control-center-tab:hover {
                    background: #111;
                    border-color: rgba(255,255,255,0.2);
                }
                .tab-text {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    font-size: 0.65rem;
                    letter-spacing: 4px;
                    text-align: center;
                    opacity: 0.8;
                }
                .text-omega-orange { color: #F4C366 !important; }
                .bg-omega-orange { background-color: #F4C366 !important; }
                .text-blue-grey { color: #94A3B8 !important; }
                .bg-black-40 { background-color: rgba(0,0,0,0.4) !important; }
                .bg-black-60 { background-color: rgba(0,0,0,0.6) !important; }
                .tiny { font-size: 0.7rem; }
                .fw-900 { font-weight: 950 !important; }
                .custom-accumulation-range {
                    accent-color: #A855F7;
                    height: 8px;
                }
                .custom-accumulation-range::-webkit-slider-runnable-track {
                    background: white;
                    border-radius: 10px;
                }
                .custom-accumulation-range::-webkit-slider-thumb {
                    width: 24px;
                    height: 24px;
                    background: #A855F7;
                    border: 4px solid white;
                    border-radius: 50%;
                    -webkit-appearance: none;
                    margin-top: -8px;
                    box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 195, 102, 0.2); border-radius: 10px; }
                .shadow-2xl { box-shadow: 50px 0 100px -20px rgba(0,0,0,0.9); }
                .shadow-orange-glow { box-shadow: 0 10px 20px rgba(244, 195, 102, 0.3); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .z-max { z-index: 2100 !important; }
                .cursor-not-allowed { cursor: not-allowed !important; }
                .custom-orange-range {
                    accent-color: #F4C366;
                }
                .custom-orange-range::-webkit-slider-runnable-track {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    height: 6px;
                }
                .custom-orange-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #F4C366;
                    border: 3px solid #fff;
                    border-radius: 50%;
                    margin-top: -7px;
                    box-shadow: 0 0 10px rgba(244, 195, 102, 0.5);
                }
            `}</style>
        </div >
    );
};

export default ControlCenter;
