import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import TreasureMapCanvas from '../components/Visuals/TreasureMapCanvas';
import PlanningLifecycleCanvas from '../components/Visuals/PlanningLifecycleCanvas';
import InflationSensor from '../components/Visuals/InflationSensor';
import InflationComparison from '../components/Visuals/InflationComparison';
import MonteCarloChart from '../components/Visuals/MonteCarloChart';
import DistributionMonteCarlo from '../components/Visuals/DistributionMonteCarlo';
import Compass from '../components/Visuals/Compass';
import BlueprintSketch from '../components/Visuals/BlueprintSketch';
import GoalStrategicBlueprint from '../components/Visuals/GoalStrategicBlueprint';
import { captureIntent } from '../utils/captureIntent';

const CompassPage = ({ theme, onOpenScheduling, onOpenControlCenter, isControlCenterOpen, inputs = {}, onUpdateInput }) => {
    const [bridgeResults, setBridgeResults] = React.useState(null);
    const [sustainabilityResults, setSustainabilityResults] = React.useState(null);
    const [volatilityModifier, setVolatilityModifier] = React.useState(1);
    const [showVolatilitySlider, setShowVolatilitySlider] = React.useState(false);
    const [showUglyTruth, setShowUglyTruth] = React.useState(false);

    // Commit inputs only when the control center is closed to prevent excessive simulation runs
    const [committedInputs, setCommittedInputs] = React.useState(inputs);
    const startSectionRef = React.useRef(null);
    const hasAutoOpened = React.useRef(false);

    React.useEffect(() => {
        if (!isControlCenterOpen) {
            setCommittedInputs(inputs);
        }
    }, [isControlCenterOpen, inputs]);

    // Auto-open control center when scrolling past "Start Here" section
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If the section is scrolled past (above the viewport)
                // and we haven't auto-opened it yet, and it's not currently open
                if (
                    !entry.isIntersecting &&
                    entry.boundingClientRect.top < 0 &&
                    !hasAutoOpened.current &&
                    !isControlCenterOpen
                ) {
                    onOpenControlCenter();
                    hasAutoOpened.current = true;
                }
            },
            { threshold: 0 }
        );

        if (startSectionRef.current) {
            observer.observe(startSectionRef.current);
        }

        return () => {
            if (startSectionRef.current) {
                observer.unobserve(startSectionRef.current);
            }
        };
    }, [onOpenControlCenter, isControlCenterOpen]);

    // Also mark as opened if the user opens it manually
    React.useEffect(() => {
        if (isControlCenterOpen) {
            hasAutoOpened.current = true;
        }
    }, [isControlCenterOpen]);

    // Safety Fallback for inputs
    const safeInputs = React.useMemo(() => ({
        age: 35,
        retirement: 65,
        capital: 400000,
        monthlyContribution: 500,
        target: 2500000,
        inflationRate: 2.0,
        useInflationAdjusted: false,
        distributionRate: 4,
        planUntilAge: 95,
        riskLevel: 66.7,
        protectionRiskLevel: 38.9,
        protectionMonthlyContribution: 500,
        distributionRiskLevel: 11.1,
        deriskingAge: 55,
        omegaAdvantage: false,
        inflationAdjustedDistributions: false,
        managementFee: 1.5,
        ...committedInputs
    }), [committedInputs]);

    // Calculate effective target to match Control Center's "Basis"
    const yearsToRetirement = React.useMemo(() =>
        Math.max(1, (Number(safeInputs.retirement) || 65) - (Number(safeInputs.age) || 35)),
        [safeInputs.retirement, safeInputs.age]);

    const effectiveTarget = React.useMemo(() => {
        const isPast = (Number(safeInputs.age) || 35) >= (Number(safeInputs.retirement) || 65);
        if (isPast) return (Number(safeInputs.capital) || 400000);

        return safeInputs.useInflationAdjusted
            ? Math.round((Number(safeInputs.target) || 2500000) * Math.pow(1 + (Number(safeInputs.inflationRate) || 2.5) / 100, yearsToRetirement) / 10000) * 10000
            : (Number(safeInputs.target) || 2500000);
    }, [safeInputs.useInflationAdjusted, safeInputs.target, safeInputs.inflationRate, yearsToRetirement, safeInputs.age, safeInputs.retirement, safeInputs.capital]);

    // Risk mapping logic (from RiskReturnCurve.jsx)
    const mapRisk = (level) => ({
        returnRate: 3 + (level / 100) * 9,
        stdDev: 5 + (level / 100) * 25
    });

    const accumulationProfile = React.useMemo(() => mapRisk(safeInputs.riskLevel), [safeInputs.riskLevel]);
    const protectionProfile = React.useMemo(() => mapRisk(safeInputs.protectionRiskLevel), [safeInputs.protectionRiskLevel]);
    const distributionProfile = React.useMemo(() => mapRisk(safeInputs.distributionRiskLevel), [safeInputs.distributionRiskLevel]);

    // Mapping for MonteCarloChart and other synchronized visuals
    const diagnosticInputs = React.useMemo(() => ({
        ...safeInputs,
        contribution: Number(safeInputs.monthlyContribution) || 500,
        age: Number(safeInputs.age),
        retirement: Number(safeInputs.retirement),
        capital: Number(safeInputs.capital),
        target: effectiveTarget, // Important: use the basis matching the Control Center
        inflationRate: Number(safeInputs.inflationRate || 2.5),
        distributionRate: Number(safeInputs.distributionRate || 4),
        planUntilAge: Number(safeInputs.planUntilAge || 95),
        returnRate: accumulationProfile.returnRate,
        stdDev: accumulationProfile.stdDev,
        // Protection Regime Inputs (passed as defenseInputs)
        defenseInputs: {
            returnRate: protectionProfile.returnRate,
            stdDev: protectionProfile.stdDev,
            contribution: Number(safeInputs.protectionMonthlyContribution) || 500,
            deriskingAge: Number(safeInputs.deriskingAge) || (Number(safeInputs.retirement) - 10)
        },
        distributionProfile, // For passing to DistributionMonteCarlo
        volatilityModifier // Pass the active state
    }), [safeInputs, effectiveTarget, accumulationProfile, protectionProfile, distributionProfile, volatilityModifier]);

    const isPastRetirement = diagnosticInputs.age >= diagnosticInputs.retirement;
    const bridgeProbRaw = bridgeResults?.thresholds?.find(t => t.id === 'sovereignty')?.probability || 0;
    const bridgeProb = isPastRetirement ? 100 : bridgeProbRaw;
    const sustainabilityProb = sustainabilityResults?.probability || 0;
    const jointProb = Math.round((bridgeProb / 100) * (sustainabilityProb / 100) * 100);

    // Tail Outcome Data (95% / -2SD)
    const tailStartingCapital = bridgeResults?.sdLower2[bridgeResults.sdLower2.length - 1] || 0;
    const tailEndingWealth = sustainabilityResults?.worstCase?.end || 0;

    const discoveryCategories = [
        { title: "RETIREMENT", icon: "event_repeat", text: "Architecting the transition from accumulation to sustainable distribution." },
        { title: "LIFESTYLE", icon: "home_work", text: "Defining the required capital density to maintain your desired standard of living." },
        { title: "LEGACY", icon: "account_tree", text: "Structuring generational wealth transfer to ensure your impact outlasts your lifespan." },
        { title: "PROTECTION", icon: "security", text: "Insulating your core assets from market volatility and unforeseen liabilities." },
        { title: "IMPACT", icon: "public", text: "Aligning your capital with the causes and organizations that matter most." },
        { title: "TRAVEL", icon: "flight_takeoff", text: "Budgeting for life's greatest experiences without compromising long-term stability." }
    ];

    const annualIncomeTarget = (diagnosticInputs.target * (diagnosticInputs.distributionRate / 100));
    const monthlyIncomeTarget = annualIncomeTarget / 12;

    const milestones = React.useMemo(() => [
        {
            milestone: "Retirement Target Reach",
            age: diagnosticInputs.retirement,
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(diagnosticInputs.target),
            status: isPastRetirement ? "ACHIEVED" : "PROJECTED",
            probability: `${bridgeProb}%`,
            details: "Total Capital Requirement"
        },
        {
            milestone: "Sustain Lifestyle Until 95",
            age: 95,
            value: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(monthlyIncomeTarget)}/mo`,
            status: "SUSTAINED",
            probability: `${sustainabilityProb}%`,
            details: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(annualIncomeTarget)} Annual Income`
        }
    ], [diagnosticInputs, bridgeProb, sustainabilityProb, monthlyIncomeTarget, annualIncomeTarget]);

    return (
        <main className="compass-page bg-transparent text-white min-vh-100 overflow-hidden">
            {/* Background Roadmap */}
            <div className="position-fixed top-0 start-0 w-100 h-100 opacity-40 pointer-events-none" style={{ zIndex: 0 }}>
                <TreasureMapCanvas theme={theme} />
            </div>

            <div className="position-relative" style={{ zIndex: 1 }}>
                {/* Hero Section */}
                <section className="container min-vh-100 d-flex align-items-center pt-5">
                    <div className="row align-items-center g-5 w-100">
                        {/* Left Side: Compass Visual */}
                        <div className="col-lg-8 order-2 order-lg-1 d-flex align-items-center justify-content-center" data-aos="fade-right">
                            <div className="visual-frame-dark w-100">
                                <Compass theme="dark-mode" />
                            </div>
                        </div>

                        {/* Right Side: Hero Content */}
                        <div className="col-lg-4 ps-lg-5 order-1 order-lg-2 text-center text-lg-start" data-aos="fade-left">
                            <div className="mb-2">
                                <span className="text-omega-orange fw-bold tracking-widest uppercase" style={{ fontSize: '0.9rem', letterSpacing: '8px' }}>THE COMPASS</span>
                            </div>
                            <div className="mb-4">
                                <span className="text-white-50 fw-bold tracking-widest uppercase" style={{ fontSize: '0.7rem', letterSpacing: '4px' }}>INSTITUTIONAL STRATEGIC PLANNING PROTOCOL</span>
                            </div>

                            <h1 className="display-1 fw-bold mb-4 ls-tight">
                                <span style={{ color: '#C9D3EA' }}>Architecting Wealth.</span><br />
                                <span className="text-omega-orange">Navigating the Wealth Life Cycle.</span>
                            </h1>

                            <p className="lead text-white-50 mb-5 mx-auto mx-lg-0" style={{ fontSize: '1.25rem', maxWidth: '600px', lineHeight: '1.6' }}>
                                Wealth is a sequence of critical transitions. <span className="text-white fw-bold">The Compass</span> synchronizes your trajectory across the entire wealth life cycle.
                            </p>

                            <button
                                onClick={() => {
                                    captureIntent('Requested Strategic Roadmap Consultation // The Compass Hero');
                                    onOpenScheduling();
                                }}
                                className="btn btn-premium px-5 py-3 rounded-pill fw-bold uppercase tracking-widest shadow-lg"
                                style={{
                                    background: '#F4C366',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                REQUEST YOUR STRATEGIC ROADMAP
                            </button>
                        </div>
                    </div>
                </section>


                {/* Wealth Life Cycle Introduction */}
                <section className="container py-5 my-5">
                    <div className="text-start mb-5" data-aos="fade-up">
                        <div className="nav-label text-omega-orange mb-3" style={{ fontSize: '0.9rem', letterSpacing: '4px' }}>THE WEALTH LIFE CYCLE</div>
                        <h2 className="display-3 fw-bold mb-4">The Journey: <br /><span className="text-omega-blue">Architecting Your Trajectory</span></h2>
                        <p className="lead text-white-70 ms-0" style={{ maxWidth: '900px', fontSize: '1.25rem', lineHeight: '1.6' }}>
                            Wealth is not a single number, but a sequence of critical transitions. Every journey moves through three distinct phases: <span className="text-white fw-bold">Accumulation</span>, <span className="text-white fw-bold">Protection</span>, and <span className="text-white fw-bold">Distribution</span>. Understanding where you are on this curve is the first step in architecting your legacy.
                        </p>
                    </div>

                    <div className="plot-container" data-aos="fade-up">
                        <PlanningLifecycleCanvas theme={theme} inputs={diagnosticInputs} hideOverlay={true} />
                    </div>
                </section>

                <section ref={startSectionRef} className="container py-5">
                    <div className="d-flex align-items-center justify-content-center gap-5 flex-column flex-lg-row">
                        {/* Start Here Glowing Text */}
                        <motion.div
                            className="text-center text-lg-start"
                            data-aos="fade-right"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                captureIntent('Opened Compass Simulator Protocol // Start Here Anchor');
                                onOpenControlCenter();
                            }}
                            style={{ cursor: 'pointer', zIndex: 10 }}
                        >
                            <h2 className="text-omega-orange fw-900 tracking-widest uppercase mb-0"
                                style={{
                                    fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                                    lineHeight: '1.1',
                                    textShadow: '0 0 30px rgba(244, 195, 102, 0.6), 0 0 60px rgba(244, 195, 102, 0.3)',
                                    letterSpacing: '0.1em'
                                }}>
                                START<br />HERE
                            </h2>
                            <div className="d-flex justify-content-center justify-content-lg-start mt-3">
                                <motion.span
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    className="material-icons text-omega-orange d-none d-lg-block"
                                    style={{ fontSize: '2rem' }}
                                >
                                    arrow_forward
                                </motion.span>
                                <motion.span
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    className="material-icons text-omega-orange d-block d-lg-none"
                                    style={{ fontSize: '2.5rem' }}
                                >
                                    arrow_downward
                                </motion.span>
                            </div>
                        </motion.div>

                        <div className="d-flex flex-column align-items-center" style={{ maxWidth: '850px', width: '100%' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="glass-card p-4 p-lg-5 rounded-5 text-center position-relative overflow-hidden w-100"
                                style={{
                                    background: 'rgba(5, 12, 24, 0.8)',
                                    border: '1px solid rgba(255, 120, 48, 0.2)',
                                    backdropFilter: 'blur(30px)',
                                    margin: 0,
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                {/* Decorative Glow - Removed internal glow div as it was too orange */}

                                <h3 className="fw-bold tracking-widest mb-3 uppercase"
                                    style={{
                                        fontSize: 'clamp(1rem, 4vw, 1.3rem)'
                                    }}>
                                    <span style={{ color: '#F4C366' }}>OUR RETIREMENT SIMULATOR // THE COMPASS</span>
                                </h3>
                                <p className="text-white-80 mb-4" style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', lineHeight: '1.6' }}>
                                    The best way to teach you what we do is by example. Follow along by entering your information to see how <span className="text-white fw-bold">The Compass</span> answers questions unique to your circumstances.
                                </p>
                                <button
                                    onClick={() => {
                                        captureIntent('Opened Compass Simulator Protocol // Secondary CTA');
                                        onOpenControlCenter();
                                    }}
                                    className="btn btn-outline-light px-5 py-3 rounded-pill fw-bold uppercase tracking-widest border-2 hover-bg-orange shadow-lg"
                                    style={{ fontSize: '0.9rem', transition: 'all 0.3s ease' }}
                                >
                                    <span className="d-flex align-items-center gap-2">
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>settings_input_component</span>
                                        Open Simulator
                                    </span>
                                </button>
                            </motion.div>
                            <div className="mt-4 text-center">
                                <span className="text-omega-orange fw-bold italic uppercase tracking-tighter technical-disclosure" style={{ opacity: 0.9, fontSize: '0.75rem' }}>
                                    * PLEASE NOTE: THIS IS A SIMPLIFIED SIMULATOR FOR EDUCATIONAL PURPOSES. AN ACTUAL FINANCIAL PLAN REQUIRES A MORE ROBUST, RIGOROUSLY CALIBRATED SYSTEM.
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step One // Discovery Section */}
                <section className="container py-5 my-5">
                    <div className="text-center text-lg-start mb-5" data-aos="fade-up">
                        <div className="nav-label text-omega-orange mb-3" style={{ fontSize: '0.9rem', letterSpacing: '8px' }}>STEP ONE // DESIGNING YOUR BLUEPRINT</div>
                        <h2 className="display-2 fw-bold mb-4 ls-tight">
                            Defining Your Goals: <br />
                            <span className="text-omega-blue">The Blueprints of Your Wealth Lifecycle</span>
                        </h2>
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-4">
                            <p className="lead text-white-70 mb-0" style={{ maxWidth: '800px', fontSize: '1.25rem', lineHeight: '1.6' }}>
                                The first step in planning is the Discovery Phase, where we define your goals and understand your current situation. <span className="text-white fw-bold">Select the blueprint parameters below</span> to architect your roadmap.
                            </p>
                            <div className="vr d-none d-lg-block opacity-20" style={{ height: '60px' }}></div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="material-icons text-omega-orange" style={{ fontSize: '1.5rem' }}>Architecture</span>
                                <span className="tiny font-monospace text-white-30 uppercase tracking-widest">PHASE_01 // DISCOVERY</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-lg-0" data-aos="fade-up">
                        <GoalStrategicBlueprint
                            theme={theme}
                            selectedGoals={inputs.goals || {}}
                            onToggleGoal={(goalId, val) => {
                                const newGoals = { ...(inputs.goals || {}), [goalId]: val };
                                onUpdateInput('goals', newGoals);
                                if (val) captureIntent('Strategic Blueprint Selection', {}, `Selected Phase 01 Goal: ${goalId}`);
                                else captureIntent('Strategic Blueprint Selection', {}, `Deselected Phase 01 Goal: ${goalId}`);
                            }}
                        />
                    </div>
                </section>

                {/* Strategy Overview Table */}
                <section className="container py-5" data-aos="fade-up">
                    <div className="glass-card p-0 rounded-5 overflow-hidden shadow-2xl"
                        style={{
                            background: 'rgba(10, 20, 40, 0.4)',
                            border: '1px solid rgba(169, 197, 230, 0.2)',
                            backdropFilter: 'blur(40px)',
                            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.6)'
                        }}>
                        <div className="p-0">
                            {/* Table Header - Desktop Only */}
                            <div className="d-none d-lg-flex border-bottom border-white-10 px-5 py-4 op-70">
                                <div className="flex-grow-1 tiny font-monospace uppercase tracking-widest fw-bold">STRATEGIC_PARAMETER</div>
                                <div className="tiny font-monospace uppercase tracking-widest fw-bold text-end" style={{ width: '300px' }}>CURRENT_CALIBRATION</div>
                            </div>

                            {/* Simulation Starting Value */}
                            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between border-bottom border-white-5 transition-all hover-bg-white-5 px-4 px-lg-5 py-4">
                                <div className="d-flex align-items-center gap-3 mb-3 mb-lg-0">
                                    <div className="bg-omega-blue-10 p-2 rounded-3">
                                        <span className="material-icons text-omega-blue" style={{ fontSize: '1.4rem' }}>account_balance_wallet</span>
                                    </div>
                                    <div>
                                        <div className="text-white fw-bold tracking-tight mb-0" style={{ fontSize: '1.1rem' }}>Simulation Starting Value</div>
                                        <div className="tiny text-white-30 uppercase font-monospace">LIQUID_CAPITAL_BASE</div>
                                    </div>
                                </div>
                                <div className="w-100 w-lg-auto text-end">
                                    <motion.span
                                        initial={{ scale: 0.9 }}
                                        whileInView={{ scale: 1 }}
                                        className="fw-900 text-white mb-0 font-monospace"
                                        style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
                                    >
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(diagnosticInputs.capital)}
                                    </motion.span>
                                </div>
                            </div>

                            {/* Current Age */}
                            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between border-bottom border-white-5 transition-all hover-bg-white-5 px-4 px-lg-5 py-4">
                                <div className="d-flex align-items-center gap-3 mb-3 mb-lg-0">
                                    <div className="bg-omega-blue-10 p-2 rounded-3">
                                        <span className="material-icons text-omega-blue" style={{ fontSize: '1.4rem' }}>person</span>
                                    </div>
                                    <div>
                                        <div className="text-white fw-bold tracking-tight mb-0" style={{ fontSize: '1.1rem' }}>Current Age</div>
                                        <div className="tiny text-white-30 uppercase font-monospace">TEMPORAL_ANCHOR</div>
                                    </div>
                                </div>
                                <div className="w-100 w-lg-auto text-end">
                                    <span className="fw-900 text-white mb-0 font-monospace" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>{diagnosticInputs.age}</span>
                                </div>
                            </div>

                            {/* Protection Phase Initiation */}
                            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between border-bottom border-white-5 transition-all hover-bg-white-5 px-4 px-lg-5 py-4">
                                <div className="d-flex align-items-center gap-3 mb-3 mb-lg-0">
                                    <div className="bg-omega-orange-10 p-2 rounded-3">
                                        <span className="material-icons text-omega-orange" style={{ fontSize: '1.4rem' }}>shield</span>
                                    </div>
                                    <div>
                                        <div className="text-omega-orange fw-bold tracking-tight mb-0" style={{ fontSize: '1.1rem' }}>Protection Phase Initiation</div>
                                        <div className="tiny text-white-30 uppercase font-monospace">DERISKING_THRESHOLD</div>
                                    </div>
                                </div>
                                <div className="w-100 w-lg-auto text-end">
                                    <div className="d-inline-block px-3 py-1 rounded-pill bg-omega-orange-10 border border-omega-orange-20">
                                        <span className="fw-900 text-omega-orange mb-0 font-monospace" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.25rem)' }}>AGE {diagnosticInputs.defenseInputs.deriskingAge}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Retirement Age */}
                            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between border-bottom border-white-5 transition-all hover-bg-white-5 px-4 px-lg-5 py-4">
                                <div className="d-flex align-items-center gap-3 mb-3 mb-lg-0">
                                    <div className="bg-omega-blue-10 p-2 rounded-3">
                                        <span className="material-icons text-omega-blue" style={{ fontSize: '1.4rem' }}>event</span>
                                    </div>
                                    <div>
                                        <div className="text-white fw-bold tracking-tight mb-0" style={{ fontSize: '1.1rem' }}>Retirement Age</div>
                                        <div className="tiny text-white-30 uppercase font-monospace">DEPLOYMENT_WINDOW</div>
                                    </div>
                                </div>
                                <div className="w-100 w-lg-auto text-end">
                                    <span className="fw-900 text-white mb-0 font-monospace" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>AGE {diagnosticInputs.retirement}</span>
                                </div>
                            </div>

                            {/* Retirement Capital Target */}
                            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between border-bottom border-white-5 transition-all hover-bg-white-5 px-4 px-lg-5 py-4">
                                <div className="d-flex align-items-center gap-3 mb-3 mb-lg-0">
                                    <div className="bg-success-10 p-2 rounded-3">
                                        <span className="material-icons text-success" style={{ fontSize: '1.4rem' }}>flag</span>
                                    </div>
                                    <div>
                                        <div className="text-success fw-bold tracking-tight mb-0" style={{ fontSize: '1.1rem' }}>Retirement Capital Target</div>
                                        <div className="tiny text-white-30 uppercase font-monospace">STRATEGIC_OBJECTIVE</div>
                                    </div>
                                </div>
                                <div className="w-100 w-lg-auto text-end">
                                    <span className="fw-900 text-success mb-0 font-monospace" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.75rem)' }}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(diagnosticInputs.target)}
                                    </span>
                                </div>
                            </div>

                            {/* Investment Time Horizon */}
                            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between transition-all hover-bg-white-5 px-4 px-lg-5 py-4">
                                <div className="d-flex align-items-center gap-3 mb-3 mb-lg-0">
                                    <div className="bg-omega-orange-10 p-2 rounded-3">
                                        <span className="material-icons text-omega-orange" style={{ fontSize: '1.4rem' }}>hourglass_empty</span>
                                    </div>
                                    <div>
                                        <div className="text-white fw-bold tracking-tight mb-0" style={{ fontSize: '1.1rem' }}>Investment Time Horizon</div>
                                        <div className="tiny text-white-30 uppercase font-monospace">ACCUMULATION_RUNWAY</div>
                                    </div>
                                </div>
                                <div className="w-100 w-lg-auto text-end">
                                    <div className="d-inline-block px-4 py-2 rounded-4 bg-white-5 border border-white-10">
                                        <span className="fw-900 text-white mb-0 font-monospace" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>{diagnosticInputs.retirement - diagnosticInputs.age} <span className="small fw-bold op-50">YRS</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Inflation Comparison Section */}
                <section className="container py-4 pt-0">
                    <div
                        className="glass-premium p-2 p-lg-3 rounded-4 border-white-10 d-flex align-items-center justify-content-center cursor-pointer transition-all hover-bg-white-5 mb-3 position-relative"
                        onClick={() => {
                            const newState = !showUglyTruth;
                            setShowUglyTruth(newState);
                            if (newState) captureIntent('Expanded The Ugly Truth // Inflation Analysis Module');
                        }}
                        style={{
                            background: showUglyTruth ? 'rgba(235, 64, 52, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            border: showUglyTruth ? '1px solid rgba(235, 64, 52, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            maxWidth: '100%'
                        }}
                    >
                        <div className="d-flex align-items-center gap-2 gap-lg-3 overflow-hidden">
                            <div className="bg-danger d-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style={{ background: '#EB4034', width: '38px', height: '38px' }}>
                                <span className="material-icons text-white" style={{ fontSize: '1.4rem' }}>warning</span>
                            </div>
                            <div className="overflow-hidden text-center text-lg-start">
                                <div className="mb-0 fw-bold text-white tracking-widest uppercase d-flex align-items-center justify-content-center justify-content-lg-start gap-2" style={{ fontSize: 'clamp(0.7rem, 3vw, 1.1rem)', whiteSpace: 'nowrap' }}>
                                    THE UGLY TRUTH // THE INFLATION TAX
                                </div>
                                <div className="tiny text-white-30 font-monospace uppercase tracking-widest" style={{ fontSize: 'clamp(0.45rem, 1.8vw, 0.65rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {showUglyTruth ? 'ACTIVE ANALYSIS // DEPRECIATION' : 'CLICK TO VIEW // PURCHASING POWER RISK'}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white-10 p-1.5 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-2 position-absolute end-0 me-3">
                            <span className="material-icons text-white transition-all" style={{ transform: showUglyTruth ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '1rem' }}>
                                expand_more
                            </span>
                        </div>
                    </div>

                    <motion.div
                        initial={false}
                        animate={{
                            height: showUglyTruth ? 'auto' : 0,
                            opacity: showUglyTruth ? 1 : 0
                        }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="py-2">
                            <InflationComparison
                                theme={theme}
                                inputs={{
                                    ...diagnosticInputs,
                                    target: safeInputs.target
                                }}
                                onUpdateInput={onUpdateInput}
                            />
                        </div>
                    </motion.div>
                </section>

                {/* Step Two // Planning Section */}
                <section className="container py-5 mt-5">
                    <div className="text-center text-lg-start mb-5" data-aos="fade-up">
                        <div className="nav-label text-omega-orange mb-3" style={{ fontSize: '0.9rem', letterSpacing: '8px' }}>STEP TWO // PLANNING</div>
                        <h2 className="display-2 fw-bold mb-4 ls-tight">
                            Navigation Protocol: <br />
                            <span className="text-omega-blue">Calculating Your Probable Path</span>
                        </h2>
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-4">
                            <p className="lead text-white-70 mb-0" style={{ maxWidth: '800px', fontSize: '1.25rem', lineHeight: '1.6' }}>
                                Using <span className="text-white fw-bold">The Compass</span> to calculate the most probable path to your goals, synchronizing your trajectory across the entire wealth life cycle.
                            </p>
                            <div className="vr d-none d-lg-block opacity-20" style={{ height: '60px' }}></div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="material-icons text-omega-orange" style={{ fontSize: '1.5rem' }}>explore</span>
                                <span className="tiny font-monospace text-white-30 uppercase tracking-widest">PHASE_02 // PLANNING</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Volatility & Risk Analysis Section */}
                <section className="container py-4 pt-0">
                    <div
                        className="glass-premium p-2 p-lg-3 rounded-4 border-white-10 d-flex align-items-center justify-content-between cursor-pointer transition-all hover-bg-white-5 mb-3"
                        onClick={() => {
                            const newState = !showVolatilitySlider;
                            setShowVolatilitySlider(newState);
                            if (newState) captureIntent('Expanded Volatility & Risk Analysis Module');
                        }}
                        style={{
                            background: showVolatilitySlider ? 'rgba(124, 139, 176, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            border: showVolatilitySlider ? '1px solid rgba(124, 139, 176, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            maxWidth: '100%'
                        }}
                    >
                        <div className="d-flex align-items-center gap-2 gap-lg-3 overflow-hidden">
                            <div className="bg-omega-blue p-1.5 rounded-2 flex-shrink-0" style={{ background: '#7C8BB0' }}>
                                <span className="material-icons text-white">tune</span>
                            </div>
                            <div className="overflow-hidden">
                                <div className="mb-0 fw-bold text-white tracking-widest uppercase d-flex align-items-center gap-2" style={{ fontSize: 'clamp(0.7rem, 3vw, 1.1rem)', whiteSpace: 'nowrap' }}>
                                    VOLATILITY & RISK ANALYSIS
                                </div>
                                <div className="tiny text-white-30 font-monospace uppercase tracking-widest" style={{ fontSize: 'clamp(0.45rem, 1.8vw, 0.65rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {showVolatilitySlider ? 'ACTIVE PROTOCOL // ADJUSTING' : 'CLICK TO VIEW // RISK SLIDER'}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white-10 p-1.5 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-2">
                            <span className="material-icons text-white transition-all" style={{ transform: showVolatilitySlider ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '1rem' }}>
                                expand_more
                            </span>
                        </div>
                    </div>

                    <motion.div
                        initial={false}
                        animate={{
                            height: showVolatilitySlider ? 'auto' : 0,
                            opacity: showVolatilitySlider ? 1 : 0
                        }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-3 p-lg-4 rounded-4 position-relative overflow-hidden"
                            style={{
                                background: 'rgba(124, 139, 176, 0.05)',
                                border: '1px solid rgba(169, 197, 230, 0.2)',
                                backdropFilter: 'blur(30px)'
                            }}>
                            <div className="row align-items-center g-2 g-lg-4">
                                <div className="col-lg-6">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div className="bg-omega-blue px-2 py-0.5 rounded text-white fw-bold tracking-widest uppercase" style={{ background: '#7C8BB0', fontSize: '10px' }}>INTERACTIVE</div>
                                    </div>
                                    <h4 className="text-white fw-bold mb-1 d-flex align-items-center" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)' }}>
                                        <span className="material-icons text-omega-blue me-2" style={{ fontSize: '1.3rem' }}>tune</span>
                                        STRESS TEST
                                    </h4>
                                    <p className="text-white-50 mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
                                        Adjust market volatility to simulate different risk environments and observe structural plan resilience.
                                    </p>
                                </div>
                                <div className="col-lg-6 mt-3 mt-lg-0">
                                    <div className="d-flex flex-column gap-2 p-3 bg-black-20 rounded-4 border border-white-10 w-100">
                                        <div className="d-flex justify-content-between align-items-center w-100">
                                            <span className="fw-bold tracking-widest uppercase text-white-50 font-monospace" style={{ fontSize: '10px' }}>VOLATILITY MULTIPLIER</span>
                                            <span className="text-omega-orange fw-bold">{Math.round((volatilityModifier - 1) * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            className="form-range custom-orange-range w-100" 
                                            min="0.5" max="1.5" step="0.05" 
                                            value={volatilityModifier} 
                                            onChange={(e) => setVolatilityModifier(parseFloat(e.target.value))} 
                                        />
                                        <div className="d-flex justify-content-between w-100 mt-1 px-1">
                                            <span className="text-white-30" style={{ fontSize: '10px' }}>LOW RISK</span>
                                            <span className="text-white-30" style={{ fontSize: '10px' }}>BASELINE</span>
                                            <span className="text-white-30" style={{ fontSize: '10px' }}>HIGH RISK</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-top border-white-10 technical-disclosure">
                                <p className="text-white-50 font-monospace mb-0" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                                    TECHNICAL DISCLOSURE: THIS SLIDER PROPORTIONALLY INCREASES OR DECREASES ASSUMED MARKET VOLATILITY AND RETURNS TO DEMONSTRATE THE MATHEMATICAL EFFECTS OF HEIGHTENED RISK ENVIRONMENTS. 
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Interactive Life Cycle Platform */}
                <section className="container py-5 my-5">
                    <div className="text-center mb-5 d-none d-lg-block" data-aos="fade-up">
                        <div className="nav-label text-omega-blue mb-3" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>INTERACTIVE LIFE CYCLE PLATFORM // v2.4.0</div>
                        <h2 className="text-white-50 font-monospace tracking-widest" style={{ fontSize: '0.9rem' }}>— ANALYZE STRATEGIC ADAPTATION ACROSS THE WEALTH CURVE —</h2>
                    </div>
                    <div className="plot-container" data-aos="fade-up">
                        <MonteCarloChart
                            theme={theme}
                            diagnosticInputs={diagnosticInputs}
                            defenseInputs={diagnosticInputs.defenseInputs}
                            volatilityModifier={volatilityModifier}
                            onSimComplete={setBridgeResults}
                        />
                    </div>
                </section>

                {/* Ready to Architect Section */}
                <section className="container py-4 my-2" data-aos="fade-up">
                    <div className="glass-card p-5 rounded-5 text-start shadow-2xl overflow-hidden position-relative" style={{ background: 'linear-gradient(135deg, rgba(244, 195, 102, 0.1) 0%, rgba(124, 139, 176, 0.1) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 className="display-2 fw-bold mb-4">Ready to Architect Your Legacy?</h2>
                        <p className="lead text-white-50 mb-5 ms-0" style={{ maxWidth: '700px' }}>
                            Schedule a high-delta strategic review with an PETTITT WEALTH advisor to finalize your Roadmap.
                        </p>
                        <div className="d-flex flex-wrap justify-content-start align-items-center gap-4">
                            <button 
                                onClick={() => {
                                    captureIntent('Requested Strategic Roadmap Consultation // Lower CTA');
                                    onOpenScheduling();
                                }} 
                                className="btn btn-premium px-5 py-3 rounded-pill fw-bold uppercase tracking-widest shadow-lg" 
                                style={{ background: '#F4C366', color: 'white', border: 'none' }}
                            >
                                SCHEDULE A CONSULTATION
                            </button>
                            <a 
                                href="clock.html" 
                                onClick={() => captureIntent('Clicked Transition to The Clock / Asset Management')}
                                className="text-white-50 text-decoration-none hover-white transition-all d-flex align-items-center gap-2" 
                                style={{ fontSize: '1rem' }}
                            >
                                <span className="border-bottom border-white-30 pb-1">Learn more about our Asset Management & our difference</span>
                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </section>


                {/* Sustainability Compass */}
                <section className="container py-5 my-5">

                    <div className="plot-container" data-aos="fade-up">
                        <DistributionMonteCarlo
                            theme={theme}
                            startingCapital={diagnosticInputs.target}
                            retirementAge={isPastRetirement ? diagnosticInputs.age : diagnosticInputs.retirement}
                            target={diagnosticInputs.target}
                            distributionRate={diagnosticInputs.distributionRate}
                            inflationRate={diagnosticInputs.inflationRate}
                            longevity={diagnosticInputs.planUntilAge}
                            returnRate={diagnosticInputs.distributionProfile.returnRate}
                            stdDev={diagnosticInputs.distributionProfile.stdDev}
                            volatilityModifier={volatilityModifier}
                            managementFee={diagnosticInputs.managementFee}
                            inflationAdjustedDistributions={safeInputs.inflationAdjustedDistributions}
                            onSimComplete={setSustainabilityResults}
                            bridgeProbability={bridgeProb}
                            capitalOptions={React.useMemo(() => {
                                if (isPastRetirement) {
                                    return {
                                        goal: diagnosticInputs.target,
                                        mean: diagnosticInputs.target,
                                        sd1: diagnosticInputs.target,
                                        sd2: diagnosticInputs.target
                                    };
                                }
                                return {
                                    goal: diagnosticInputs.target,
                                    mean: bridgeResults?.meanPath[bridgeResults.meanPath.length - 1] || diagnosticInputs.target * 1.2,
                                    sd1: bridgeResults?.sdLower1[bridgeResults.sdLower1.length - 1] || diagnosticInputs.target * 0.9,
                                    sd2: bridgeResults?.sdLower2[bridgeResults.sdLower2.length - 1] || diagnosticInputs.target * 0.7
                                };
                            }, [diagnosticInputs.target, bridgeResults, isPastRetirement])}
                        />
                    </div>
                </section>

                {/* Compass Analysis */}
                <section className="container py-3 py-lg-5 my-0 my-lg-5 compass-analysis">
                    <div className="glass-card p-3 p-lg-5 rounded-5 border-white-10" data-aos="fade-up">
                        <div className="row g-4 g-lg-5">
                            <div className="col-lg-6">
                                <div className="nav-label text-success mb-3" style={{ fontSize: '0.8rem', letterSpacing: '4px' }}>COMPASS ANALYSIS</div>
                                <h2 className="fw-bold mb-4 text-white" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', lineHeight: '1.2' }}>Optimism is <br /><span className="text-success">Mathematically Justified.</span></h2>
                                <p className="lead text-white-50 mb-4 mb-lg-5" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                                    Your results are mixed but promising. With minor tactical adjustments to your volatility exposure or distribution rate, we can significantly tighten these corridors to meet your institutional standards.
                                </p>


                            </div>
                            <div className="col-lg-6">
                                <div className="row g-2 g-lg-3 mb-4 mb-lg-5">
                                    {[
                                        { label: "LIQUID ASSETS", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(diagnosticInputs.capital), icon: "account_balance_wallet" },
                                        { label: "ACCUMULATION", value: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(diagnosticInputs.contribution)}/mo`, icon: "trending_up" },
                                        { label: "PROTECTION", value: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(diagnosticInputs.defenseInputs.contribution)}/mo`, icon: "shield" },
                                        { label: "AGE / HORIZON", value: `${diagnosticInputs.age} / ${diagnosticInputs.planUntilAge - diagnosticInputs.age}YR`, icon: "history" }
                                    ].map((stat, i) => (
                                        <div key={i} className="col-6">
                                            <div className="glass-premium p-2 p-lg-3 rounded-4 h-100 border-white-5">
                                                <div className="d-flex align-items-center gap-1 gap-lg-2 mb-1 mb-lg-2 opacity-50">
                                                    <span className="material-icons" style={{ fontSize: '0.8rem' }}>{stat.icon}</span>
                                                    <span className="tiny font-monospace tracking-widest uppercase" style={{ fontSize: '0.55rem' }}>{stat.label}</span>
                                                </div>
                                                <div className="fw-bold mb-0 text-white" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)' }}>{stat.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-0">
                                    {/* Milestone Header - Desktop Only */}
                                    <div className="d-none d-lg-flex border-bottom border-white-10 pb-3 op-50">
                                        <div className="col-4 tiny uppercase tracking-widest">Strategic Milestone</div>
                                        <div className="col-2 tiny uppercase tracking-widest text-center">Age</div>
                                        <div className="col-3 tiny uppercase tracking-widest text-end">Target Value</div>
                                        <div className="col-3 tiny uppercase tracking-widest text-end">Probability</div>
                                    </div>

                                    <div className="milestone-rows">
                                        {milestones.map((m, i) => (
                                            <div key={i} className="row g-0 align-items-start align-items-lg-center border-bottom border-white-5 py-3 py-lg-4 transition-all hover-bg-white-5">
                                                <div className="col-12 col-lg-4 mb-2 mb-lg-0 pe-lg-3">
                                                    <div className="fw-bold text-white mb-0" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>{m.milestone}</div>
                                                    <div className="tiny text-white-30 uppercase font-monospace" style={{ fontSize: '0.6rem' }}>{m.details}</div>
                                                </div>
                                                <div className="col-3 col-lg-2 text-start text-lg-center">
                                                    <div className="d-lg-none tiny text-white-30 uppercase mb-1" style={{ fontSize: '0.55rem' }}>Age</div>
                                                    <div className="fw-bold text-white-50 small">{m.age}</div>
                                                </div>
                                                <div className="col-5 col-lg-3 text-start text-lg-end">
                                                    <div className="d-lg-none tiny text-white-30 uppercase mb-1" style={{ fontSize: '0.55rem' }}>Value</div>
                                                    <div className="fw-bold text-white small">{m.value}</div>
                                                    <div className="tiny text-white-30 uppercase font-monospace shadow-text" style={{ fontSize: '0.55rem' }}>{m.status}</div>
                                                </div>
                                                <div className="col-4 col-lg-3 text-end">
                                                    <div className="d-lg-none tiny text-white-30 uppercase mb-1" style={{ fontSize: '0.55rem' }}>Prob.</div>
                                                    <span className={`fw-900 ${parseInt(m.probability) > 50 ? 'text-success' : 'text-omega-orange'}`} style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                                                        {m.probability}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Blocks */}
                        <div className="mt-5 d-flex flex-column gap-4">
                            {/* Lifecycle Confidence Card */}
                            <div className="d-flex flex-column flex-lg-row align-items-center justify-content-lg-between p-3 p-lg-4 px-lg-5 rounded-4 gap-3 gap-lg-4" style={{ background: '#0A1322', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="d-flex flex-column flex-lg-row align-items-center gap-3 gap-lg-4 text-center text-lg-start">
                                    <span className="material-icons text-omega-orange" style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)' }}>shield</span>
                                    <div className="vr opacity-20 mx-2 d-none d-lg-block" style={{ height: '40px' }}></div>
                                    <div>
                                        <div className="tiny font-monospace text-white-30 uppercase tracking-widest mb-1" style={{ fontSize: '0.6rem' }}>TOTAL PROBABILITY OF MEETING ALL OBJECTIVES</div>
                                        <div className="h5 fw-bold text-white mb-0">Lifecycle Confidence Across Entire Plan</div>
                                    </div>
                                </div>
                                <div className="fw-900 text-omega-orange" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)' }}>{jointProb}%</div>
                            </div>

                            {/* Ugly Truth Card */}
                            <div className="p-3 p-lg-5 rounded-4 position-relative overflow-hidden" style={{ background: 'rgba(255,50,50,0.02)', border: '1px dashed rgba(255,50,50,0.2)' }}>
                                <div className="row align-items-center g-4">
                                    <div className="col-lg-6 text-center text-lg-start">
                                        <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 mb-3">
                                            <span className="material-icons text-danger" style={{ fontSize: '1.2rem' }}>warning</span>
                                            <span className="small fw-900 text-danger uppercase tracking-widest" style={{ fontSize: '0.7rem' }}>90% PROBABLE TAIL OUTCOME</span>
                                        </div>
                                        <p className="small text-white-50 mb-0 mx-auto mx-lg-0" style={{ maxWidth: '400px', lineHeight: '1.6', fontSize: '0.85rem' }}>
                                            The "Ugly Truth" Scenario: This illustrates the joint probability of experiencing lower-bound (-2SD) performance across both your remaining accumulation years and your entire distribution lifecycle.
                                        </p>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="p-3 p-lg-4 rounded-4 d-flex align-items-center justify-content-between text-center" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                                            <div className="flex-grow-1">
                                                <div className="tiny text-white-30 uppercase font-monospace mb-2" style={{ fontSize: '0.55rem' }}>Starting Capital (-2SD)</div>
                                                <div className="fw-bold mb-0 text-white" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.25rem)' }}>
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tailStartingCapital)}
                                                </div>
                                            </div>
                                            <div className="px-2 px-lg-3">
                                                <span className="material-icons text-white-20" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="tiny text-white-30 uppercase font-monospace mb-2" style={{ fontSize: '0.55rem' }}>Ending Wealth (Age 95)</div>
                                                <div className={`fw-bold mb-0 ${tailEndingWealth <= 0 ? 'text-danger' : 'text-white'}`} style={{ fontSize: 'clamp(0.9rem, 3vw, 1.25rem)' }}>
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tailEndingWealth)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Compliance & Legal Disclosures */}
                <section className="container py-4 my-2">
                    <div className="glass-card p-4 p-lg-5 rounded-5 border-white-10" style={{ background: 'rgba(5, 12, 24, 0.4)' }}>
                        <div className="nav-label text-omega-orange mb-4" style={{ fontSize: '0.75rem', letterSpacing: '4px', fontWeight: 'bold' }}>COMPLIANCE & LEGAL DISCLOSURES</div>

                        <div className="row g-4 mb-5">
                            <div className="col-12">
                                <h4 className="fw-bold text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '1px' }}>EDUCATIONAL & HYPOTHETICAL ILLUSTRATION:</h4>
                                <p className="text-white-50" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    All strategies, projections, and calculations presented on this page are for information and educational purposes only. This tool is designed to provide a probabilistic view of potential financial trajectories based on user-defined inputs and historical market data approximations. It is not intended as a guarantee of future performance, nor should it be construed as specific investment, legal, or tax advice.
                                </p>
                            </div>

                            <div className="col-lg-6">
                                <h4 className="fw-bold text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '1px' }}>MONTE CARLO STATISTICAL RISK:</h4>
                                <p className="text-white-50" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    The probability modeling utilized in our interactive charts (1,000 iterations) provides a mathematical projection of potential outcomes. Users must acknowledge that statistical variance and market volatility can lead to results significantly different from those illustrated. Institutional-grade planning typically requires more rigorous, continuous monitoring and higher-density modeling (1,000+ iterations) to achieve professional confidence standards.
                                </p>
                            </div>

                            <div className="col-lg-6">
                                <h4 className="fw-bold text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '1px' }}>PROFESSIONAL PLANNING REQUIREMENT:</h4>
                                <p className="text-white-50" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    Accuracy and tracking of a real-world financial plan require coordination with licensed professionals, updated data feeds, and adjustment for specific tax, insurance, and estate circumstances. No automated tool can replace the strategic oversight provided by a dedicated advisor. We recommend a full strategic Roadmap review twice annually to recalibrate for life-event delta and market shifts.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-top border-white-10">
                            <p className="tiny font-monospace text-white-30 mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                                Securities offered through Cambridge Investment Research, Inc., a Broker/Dealer, member FINRA/SIPC. Advisory services offered through Cambridge Investment Research Advisers, Inc., a Registered Investment Adviser. PETTITT WEALTH and Cambridge are not affiliated. All investments involve risk, including the possible loss of principal. Past performance is no guarantee of future results. Projections are based on mathematical simulations and do not represent actual client accounts or realized returns.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Step Three // Execution */}
                <section className="container py-5 my-5 strategic-modeling">
                    <div className="text-start mb-5" data-aos="fade-up">
                        <div className="nav-label text-omega-orange mb-3" style={{ fontSize: '0.9rem', letterSpacing: '4px' }}>STEP THREE // EXECUTION</div>
                        <h2 className="display-3 fw-bold mb-4">From Probabilistic Modeling <br /><span className="text-omega-blue">to Execution</span></h2>
                        <p className="lead text-white-50 ms-0 mb-4" style={{ maxWidth: '800px', fontSize: '1.2rem' }}>
                            The final step is the Execution phase. Modeling provides the coordinates, but professional implementation secures the trajectory. Contacting our firm to finalize your strategic roadmap is the definitive move to better your odds.
                        </p>
                        <div className="d-flex align-items-center gap-4 flex-wrap">
                            <button onClick={onOpenScheduling} className="btn btn-premium px-5 py-3 rounded-pill fw-bold uppercase tracking-widest shadow-lg" style={{ background: '#F4C366', color: 'white', border: 'none' }}>
                                GET STARTED
                            </button>
                            <a href="clock.html" className="text-white-50 text-decoration-none hover-white transition-all d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                                <span className="border-bottom border-white-30 pb-1">Learn more about our Asset Management & our difference</span>
                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>arrow_forward</span>
                            </a>
                        </div>
                    </div>

                    <div className="glass-card p-5 rounded-4 text-center border-white-10 shadow-lg" style={{ background: 'rgba(244, 195, 102, 0.05)', border: '1px dashed #F4C366' }}>
                        <h4 className="text-omega-orange fw-900 tracking-widest mb-4 uppercase">STRATEGIC ANALYSIS</h4>
                        <h3 className="display-6 text-white fw-bold mb-5">Find the Portfolio to Better the Odds.</h3>
                        <div className="row g-4 justify-content-center">
                            {[
                                { icon: "gavel", label: "FIDUCIARY DUTY", text: "Legally bound to act in your best interest." },
                                { icon: "account_balance", label: "INSTITUTIONAL GRADE", text: "Access to private markets and sovereign strategies." },
                                { icon: "restart_alt", label: "CYCLE PROVEN", text: "Tested across multiple economic regimes." }
                            ].map((item, i) => (
                                <div key={i} className="col-md-4">
                                    <span className="material-icons text-white-50 mb-3" style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                                    <div className="fw-bold text-white small mb-2 tracking-widest uppercase">{item.label}</div>
                                    <p className="text-white-30 x-small mb-0">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


            </div>

            <style jsx>{`
                .text-omega-orange { color: #F4C366 !important; }
                .text-omega-blue { color: #C9D3EA !important; }
                .tracking-widest { letter-spacing: 0.2em; }
                .hover-bg-orange:hover {
                    background: #F4C366 !important;
                    border-color: #F4C366 !important;
                    color: white !important;
                    box-shadow: 0 10px 30px rgba(244, 195, 102, 0.3);
                }
                .ls-tight { letter-spacing: -1px; }
                .hover-translate-y:hover {
                    transform: translateY(-10px);
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(244, 195, 102, 0.3) !important;
                }
                .transition-all { transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); }
                .btn-premium:hover { filter: brightness(1.1); transform: scale(1.02); }
                .glass-card { backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
                .plot-container {
                    background: transparent;
                    border: none;
                    border-radius: 40px;
                    padding: 0;
                    position: relative;
                    z-index: 10;
                    box-shadow: none;
                }
                .tiny { font-size: 0.7rem; }
                .fw-900 { font-weight: 950 !important; }
                .x-small { font-size: 0.75rem; }
                .shadow-2xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8); }
                .border-white-5 { border-color: rgba(255,255,255,0.05) !important; }
                .border-white-10 { border-color: rgba(255,255,255,0.1) !important; }
                .text-white-30 { color: rgba(255,255,255,0.3) !important; }
                .text-white-50 { color: rgba(255,255,255,0.5) !important; }
                .text-white-70 { color: rgba(255,255,255,0.7) !important; }
                .text-white-90 { color: rgba(255,255,255,0.9) !important; }
                .bg-white-5 { background: rgba(255,255,255,0.05) !important; }
                .hover-white:hover { color: white !important; }
                .hover-white:hover .border-white-30 { border-color: white !important; }

                .blueprint-card-target:hover {
                    background: rgba(0, 43, 91, 0.6) !important;
                    border-color: rgba(244, 195, 102, 0.5) !important;
                    box-shadow: 0 0 30px rgba(244, 195, 102, 0.1);
                }
                .blueprint-marker {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    border: 1px solid rgba(169, 197, 230, 0.3);
                    z-index: 2;
                }
                .marker-tl { top: 12px; left: 12px; border-right: 0; border-bottom: 0; }
                .marker-br { bottom: 12px; right: 12px; border-left: 0; border-top: 0; }

                @media (max-width: 768px) {
                    .blueprint-grid-overlay, 
                    .blueprint-marker {
                        display: none !important;
                    }
                    .blueprint-card-target {
                        background: rgba(255,255,255,0.03) !important;
                        min-height: auto !important;
                    }
                    .blueprint-icon-container {
                        width: 60px !important;
                        height: 60px !important;
                    }
                }
            `}</style>
        </main>
    );
};

export default CompassPage;
