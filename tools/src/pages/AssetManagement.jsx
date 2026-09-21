import React, { useEffect } from 'react';
import AOS from 'aos';
import Clock from '../components/Visuals/Clock';
import IntertwinedLoopCanvas from '../components/Visuals/IntertwinedLoopCanvas';
import ExecutionRealityCard from '../components/Visuals/ExecutionRealityCard';
import TacticalSignalDashboard from '../components/Visuals/TacticalSignalDashboard';
import SixStagesCanvas from '../components/Visuals/SixStagesCanvas';
import TrustSignals from '../components/Visuals/TrustSignals';
import { useTilt } from '../hooks/useTilt';

const AssetManagement = ({ theme, userProfile, onOpenScheduling, onOpenAuth, onOpenMessage }) => {
    const tiltRef = useTilt({ max: 5 });

    useEffect(() => {
        window.scrollTo(0, 0);
        AOS.refresh();
    }, []);

    const drawdowns = [
        { start: "1929-09-17", trough: "1932-06-01", end: "1954-09-22", loss: "-86.19%", recovery: "5,571", needed: "+624.1%", recession: "The Depression" },
        { start: "2007-10-10", trough: "2009-03-09", end: "2013-03-28", loss: "-56.78%", recovery: "1,021", needed: "+131.4%", recession: "Financial Crisis" },
        { start: "2000-03-27", trough: "2002-10-09", end: "2007-05-30", loss: "-49.15%", recovery: "1,166", needed: "+96.7%", recession: "Tech Bubble" },
        { start: "1973-01-12", trough: "1974-10-03", end: "1980-07-17", loss: "-48.2%", recovery: "1,462", needed: "+93.1%", recession: "Oil Crisis" },
        { start: "1968-12-02", trough: "1970-05-26", end: "1972-03-06", loss: "-36.06%", recovery: "451", needed: "+56.4%", recession: "Nixon" },
        { start: "2020-02-20", trough: "2020-03-23", end: "2020-08-18", loss: "-33.92%", recovery: "103", needed: "+51.3%", recession: "Pandemic" },
        { start: "1987-08-26", trough: "1987-12-04", end: "1989-07-26", loss: "-33.51%", recovery: "414", needed: "+50.4%", recession: "Black Monday" },
        { start: "1961-12-13", trough: "1962-06-26", end: "1963-09-03", loss: "-27.97%", recovery: "299", needed: "+38.8%", recession: "Kennedy Slide" },
        { start: "1980-12-01", trough: "1982-08-12", end: "1982-11-03", loss: "-27.11%", recovery: "58", needed: "+37.2%", recession: "Iran Crisis" },
        { start: "2022-01-04", trough: "2022-10-12", end: "2024-01-19", loss: "-25.43%", recovery: "318", needed: "+34.1%", recession: "Inflation Shock" }
    ];

    const asymmetryData = [
        { loss: -80, gain: 400 },
        { loss: -70, gain: 233 },
        { loss: -60, gain: 150 },
        { loss: -50, gain: 100 },
        { loss: -40, gain: 67 },
        { loss: -30, gain: 45 },
        { loss: -20, gain: 25 },
        { loss: -10, gain: 11 }
    ];

    return (
        <div className="asset-management-page pb-5" style={{
            paddingTop: '24px'
        }}>

            {/* Hero Section */}
            <section className="container py-5 mb-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-8 order-2 order-lg-1" data-aos="zoom-in" data-aos-duration="1500">
                        <div className="visual-frame-dark p-0 w-100 d-flex justify-content-center">
                            <Clock theme="dark-mode" />
                        </div>
                    </div>
                    <div className="col-lg-4 order-1 order-lg-2 text-center text-lg-start" data-aos="fade-left">
                        <div className="nav-label text-gradient-orange mb-2" style={{ letterSpacing: '4px' }}>ACTIVE NAVIGATION</div>
                        <h1 className="display-1 fw-bold mb-4">The <span className="text-gradient-orange">Clock.</span></h1>
                        <p className="lead fs-4 text-muted mb-5">
                            Buy-and-hold is a static model subject to the whims of the market. We manage capital through the lens of the <strong>Mathematical Business Cycle</strong>—we strive to shift your trajectory before the market forces your hand.
                        </p>
                        <div className="d-flex flex-column align-items-center align-items-lg-start gap-3 mb-5">
                            <button
                                className="btn btn-premium px-5 py-3 fs-5 shadow-lg transition-all"
                                onClick={onOpenScheduling}>
                                INITIATE STRATEGY SESSION
                            </button>
                        </div>

                        <div className="glass-vibrant p-4 rounded-4 border-blue-glow shadow-lg d-flex align-items-start gap-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                                <span className="material-icons text-warning blink-warning" style={{ fontSize: '2rem' }}>warning_amber</span>
                            </div>
                            <div>
                                <div className="small fw-bold text-uppercase text-gradient-orange mb-1" style={{ letterSpacing: '2px' }}>Live Stance:</div>
                                <h3 className="fw-bold mb-2">Approaching Recession</h3>
                                <div className="small text-white-50">Industrial production and employment levels currently offset leading recession indicators.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-5" data-aos="fade-up">
                    <div className="col-12">
                        <div className="p-4 p-lg-5 rounded-4 shadow-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="small fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '2px' }}>Clock Methodology</div>
                            <p className="small text-white-75 mb-0" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                                The Economic Indicator Clock utilizes a bootstrapped decision tree model trained on historical business cycle data to estimate the current economic stage. It evaluates a confluence of macroeconomic indicators rather than relying on a single metric. For example, a historical pattern often preceding an economic downturn is the steepening of the yield curve (10-year minus 2-year Treasury yields) following a period of inversion. However, categorizing a stage as a "recession" requires corresponding deterioration in actual economic output, such as consecutive declines in industrial production, a contraction in consumer spending and personal income, and a rapid increase in unemployment. Additionally, these periods are typically accompanied by a shift toward accommodative monetary policy (e.g., the Federal Reserve lowering interest rates). At present, while some leading indicators may show warning signs, sustained industrial production and employment levels prevent the model from triggering a recessionary signal.
                                <br/><br/>
                                <em className="text-white-50">Please note: This model is for illustrative purposes only, relies on historical data which is not a guarantee of future results, and should not be construed as a promise to predict market movements or time the market.</em>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recovering from large losses */}
            <section className="container-fluid py-5 mt-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(124, 139, 176,0.03) 100%)' }}>
                <div className="bg-glow-radial" style={{ opacity: 0.2 }}></div>
                <div className="container position-relative" style={{ zIndex: 1 }}>
                    <div className="row g-5 align-items-center mb-5">
                        <div className="col-lg-12 text-start mb-4">
                            <h2 className="display-2 fw-bold mb-4" data-aos="fade-right">Recovering from large losses <br /><span className="text-gradient-light-blue">is harder than most investors think.</span></h2>
                            <hr className="border-white opacity-10 mb-5" />
                            <p className="lead text-muted fs-4" style={{ maxWidth: '900px' }} data-aos="fade-up">
                                Conventional wisdom says "stay the course." Math says otherwise. Avoiding catastrophic losses is the single most important factor in long-term wealth compounding.
                            </p>
                        </div>

                        <div className="col-lg-12" data-aos="fade-up">
                            <div className="glass-card p-5 rounded-5 border-blue-glow shadow-lg mb-5" style={{ background: 'rgba(124, 139, 176, 0.05)' }}>
                                <div className="mb-4">
                                    <h4 className="fw-bold text-gradient-light-blue mb-3">The Asymmetry of Risk</h4>
                                    <p className="fs-5 text-white-50">A <strong>50% loss</strong> requires a <strong>100% gain</strong> just to break even. We shift your stance to ensure you aren't digging out of a hole for years.</p>
                                </div>

                                <div className="mt-5">
                                    <h5 className="small fw-bold text-uppercase text-muted mb-4">Returns Needed to Recoup Losses</h5>
                                    <div className="asymmetry-chart d-flex align-items-end justify-content-between pt-5 px-3 mb-5" style={{ height: '650px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        {asymmetryData.map((d, i) => (
                                            <div key={i} className="chart-bar-container text-center d-flex flex-column align-items-center" style={{ width: '10%' }}>
                                                <div className="gain-value small fw-bold text-white mb-2" style={{ visibility: d.gain > 10 ? 'visible' : 'hidden' }}>{d.gain}%</div>
                                                <div className="bar-gain rounded-top-2 shadow-lg" style={{ width: '100%', height: `${d.gain * 1.2}px`, background: 'var(--primary-light-gradient)', transition: 'height 1.5s ease' }}></div>
                                                <div className="bar-loss rounded-bottom-2" style={{ width: '100%', height: `${Math.abs(d.loss) * 1.2}px`, background: 'var(--accent-gradient)', opacity: 0.8 }}></div>
                                                <div className="loss-label mt-3 small text-muted fw-bold">{d.loss}%</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-center gap-4 mt-5 pt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-1" style={{ width: '15px', height: '15px', background: 'var(--accent-gradient)' }}></div>
                                            <span className="small text-muted">Loss</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-1" style={{ width: '15px', height: '15px', background: 'var(--primary-light-gradient)' }}></div>
                                            <span className="small text-muted">Required Gain</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONVERSION BRIDGE 1: The Math Proof */}
                <div className="row justify-content-center mt-5" data-aos="fade-up">
                    <div className="col-lg-8">
                        <div className="glass-card p-4 rounded-5 border-orange-glow shadow-lg text-center" style={{ background: 'rgba(244, 195, 102, 0.05)' }}>
                            <h3 className="h4 fw-bold text-white mb-3">Math Doesn't Argue.</h3>
                            <p className="text-muted mb-4 small">Stop fighting the geometry of loss. Establish your institutional perspective today.</p>
                            <button
                                className="btn btn-premium px-5 py-2 shadow-sm mb-4"
                                onClick={() => onOpenAuth('register')}>
                                Schedule an Appointment
                            </button>


                        </div>
                    </div>
                </div>
            </section>

            {/* The Gravity of Recessions */}
            <section className="container-fluid py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(13, 22, 41, 0.4) 100%)' }}>
                <div className="bg-glow-radial" style={{ opacity: 0.3 }}></div>
                <div className="container text-center py-5 position-relative" style={{ zIndex: 1 }}>
                    <h2 className="display-3 fw-bold mb-4" data-aos="fade-up">The Gravity of Recessions.</h2>
                    <hr className="mx-auto border-white opacity-10 mb-4" style={{ width: '100px' }} />
                    <p className="lead text-white-50 fs-4 mx-auto mb-5" style={{ maxWidth: '1000px' }} data-aos="fade-up" data-aos-delay="100">
                        Catastrophic market losses are not random events&mdash;they are historically concentrated within <strong>economic recessions</strong>. This is why identifying the business cycle stage is the ultimate priority: because avoiding a recessionary drawdown is the difference between consistent wealth compounding and spending decades merely trying to break even.
                    </p>



                    <div className="p-0 border-0 mt-5 mx-auto" style={{ maxWidth: '1320px' }} data-aos="zoom-in">
                        <div className="table-responsive p-0">
                            <table className="table table-dark recession-table-zebra table-hover mb-0 align-middle text-start border-0">
                                <thead>
                                    <tr className="border-bottom border-white border-opacity-10 text-muted small text-uppercase">
                                        <th className="py-4 border-0" style={{ width: '15%', fontSize: '0.85rem' }}>Event</th>
                                        <th className="py-4 border-0" style={{ width: '10%', fontSize: '0.85rem' }}>Start</th>
                                        <th className="py-4 border-0 text-center" style={{ width: '10%', fontSize: '0.85rem' }}>Trough</th>
                                        <th className="py-4 border-0 text-end" style={{ width: '22%', fontSize: '0.85rem' }}>Peak Loss</th>
                                        <th className="py-4 border-0 text-start" style={{ width: '22%', fontSize: '0.85rem' }}>Required Gain</th>
                                        <th className="py-4 border-0 text-center" style={{ width: '12%', fontSize: '0.85rem' }}>Recovery Date</th>
                                        <th className="py-4 border-0 text-center" style={{ width: '9%', fontSize: '0.85rem' }}>Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drawdowns.map((d, i) => {
                                        const lossValue = Math.abs(parseFloat(d.loss.replace('%', '')));
                                        const neededValue = parseFloat(d.needed.replace('+', '').replace('%', ''));
                                        // Normalize: Max loss ~90%, Max needed ~650%
                                        const commonMax = 650; // Normalize both based on the highest recovery target (+624%)
                                        const lossWidth = (lossValue / commonMax) * 100;
                                        const neededWidth = (neededValue / commonMax) * 100;

                                        return (
                                            <tr key={i} className="hover-highlight-subtle transition-all">
                                                <td className="py-4 border-0 text-gradient-orange fw-bold fs-5">{d.recession}</td>
                                                <td className="py-4 border-0 text-white-50 fs-6">{d.start}</td>
                                                <td className="py-4 border-0 text-center text-white-50 fs-6">{d.trough}</td>

                                                {/* Peak Loss Bar (Right Aligned) */}
                                                <td className="py-4 border-0 text-end pe-0">
                                                    <div className="d-flex align-items-center justify-content-end gap-3">
                                                        <span className="fw-bold text-danger fs-5">{d.loss}</span>
                                                        <div className="bg-danger bg-opacity-25 rounded-start-pill rounded-end-1"
                                                            style={{ width: `${lossWidth}%`, height: '10px', minWidth: '2px', maxWidth: '180px' }}>
                                                            <div className="bg-danger h-100 rounded-start-pill rounded-end-1 shadow-sm" style={{ width: '100%' }}></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Recovery Needed Bar (Left Aligned) */}
                                                <td className="py-4 border-0 text-start ps-0">
                                                    <div className="d-flex align-items-center justify-content-start gap-4">
                                                        <div className="bg-gradient-orange bg-opacity-25 rounded-end-pill rounded-start-1"
                                                            style={{ width: `${neededWidth}%`, height: '10px', minWidth: '2px', maxWidth: '250px' }}>
                                                            <div className="bg-gradient-orange h-100 rounded-end-pill rounded-start-1 shadow-sm" style={{ width: '100%', background: 'var(--accent-gradient)' }}></div>
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-bold text-gradient-orange fs-5">{d.needed}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 border-0 text-center text-white-50 fs-6">{d.end}</td>
                                                <td className="py-4 border-0 text-center text-white-50 fs-6">{d.recovery}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 text-start text-muted small opacity-50 border-top border-white border-opacity-5">
                            <div className="mb-2">
                                <strong>Market Data Source:</strong> Quotes Delayed 15m. Source: Interactive Brokers / Morningstar.
                            </div>
                            <div>
                                Source: S&P 500 Index (^GSPC) price history. Drawdowns represent the peak-to-trough decline during the specified period. Analysis performed using PerformanceAnalytics package.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Magnitude of The Depression - Standalone Cinematic Section */}
            <section className="container py-5 my-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10" data-aos="zoom-in">
                        <div className="p-5 rounded-5 shadow-2xl border-orange-glow d-flex flex-column" style={{ background: 'rgba(13, 22, 41, 0.4)', minHeight: '450px' }}>
                            <div className="row g-5 align-items-center">
                                <div className="col-lg-7">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <span className="material-icons text-gradient-orange" style={{ fontSize: '3rem' }}>analytics</span>
                                        <h3 className="display-5 fw-bold mb-0">The Magnitude of <span className="text-gradient-orange">The Depression.</span></h3>
                                    </div>
                                    <p className="lead text-white-50 mb-5 fs-4">After riding through the Great Depression, you would have needed a <strong>624% return</strong> just to recoup the losses occurred. A recovery that took 25 years of compounding effort.</p>

                                    <div className="row g-4 mt-4">
                                        <div className="col-md-4">
                                            <div className="small text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Peak Loss</div>
                                            <div className="display-6 fw-bold text-danger">-86.19%</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="small text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Recovery Time</div>
                                            <div className="display-6 fw-bold text-white">25 Years</div>
                                            <div className="text-muted tiny">5,571 Market Days</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="small text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Full Cycle</div>
                                            <div className="display-6 fw-bold text-white">1929 — 1954</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-5">
                                    <div className="p-5 rounded-5 text-center d-flex flex-column justify-content-center h-100 shadow-lg mb-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(244, 195, 102, 0.3)' }}>
                                        <div className="small fw-bold text-uppercase text-muted mb-3" style={{ fontSize: '0.8rem', letterSpacing: '3px' }}>Break-Even Target</div>
                                        <div className="display-2 fw-bold text-gradient-orange mb-2">+624.11%</div>
                                        <div className="fw-bold text-white-50" style={{ letterSpacing: '1px' }}>REQUIRED RECOVERY GAIN</div>
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Navigating the Cycle methodology section */}
            <section className="container-fluid py-5 position-relative overflow-hidden">
                <div className="bg-glow-radial" style={{ opacity: 0.15 }}></div>
                <div className="container text-center py-5 position-relative" style={{ zIndex: 1 }}>
                    <div className="nav-label text-gradient-orange mb-3" style={{ letterSpacing: '3px' }}>OUR METHODOLOGY</div>
                    <h2 className="display-2 fw-bold mb-5" data-aos="fade-up">Navigating the Cycle.</h2>
                    <hr className="mx-auto border-white opacity-10 mb-5" style={{ width: '100px' }} />
                    <p className="lead text-muted fs-4 mx-auto mb-5" style={{ maxWidth: '900px' }} data-aos="fade-up">
                        Wealth isn't just about capturing the upside&mdash;it's about surviving the downside. Our adaptive framework re-architects your portfolio based on real-time economic stage transitions.
                    </p>



                    <div className="mb-5 py-5" data-aos="zoom-in">
                        <SixStagesCanvas theme={theme} />
                    </div>

                    <div className="row g-4 mt-5">
                        <div className="col-lg-6" data-aos="fade-right">
                            <div className="glass-card p-5 rounded-5 border-blue-glow shadow-lg text-start h-100" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className="d-flex align-items-center gap-4 mb-4">
                                    <div className="bg-gradient-orange p-3 rounded-4 shadow-sm">
                                        <span className="material-icons text-white" style={{ fontSize: '2.5rem' }}>autorenew</span>
                                    </div>
                                    <h3 className="fw-bold mb-0">Dynamic Shifting</h3>
                                </div>
                                <p className="fs-5 text-white-50 leading-relaxed">
                                    We don't wait for market corrections to act. Our proprietary <strong>Cycle Sensor</strong> identifies early-warning signals in labor, production, and consumption, allowing us to pivot from offense to defense with mathematical confidence.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-6" data-aos="fade-left">
                            <div className="glass-card p-5 rounded-5 border-blue-glow shadow-lg text-start h-100" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className="d-flex align-items-center gap-4 mb-4">
                                    <div className="bg-primary bg-opacity-75 p-3 rounded-4 shadow-sm" style={{ background: 'var(--primary-gradient)' }}>
                                        <span className="material-icons text-white" style={{ fontSize: '2.5rem' }}>analytics</span>
                                    </div>
                                    <h3 className="fw-bold mb-0">Institutional Precision</h3>
                                </div>
                                <p className="fs-5 text-white-50 leading-relaxed">
                                    By quantifying the business cycle, we strip emotion out of the investment process. Every allocation decision is rooted in institutional-grade data analysis, ensuring your legacy is protected by discipline, not hope.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cinematic Intertwined Logic Visualization */}
            <section className="container-fluid py-5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                <div className="container-fluid text-center py-5 position-relative" style={{ zIndex: 1 }}>
                    <div className="nav-label text-gradient-orange mb-3" style={{ letterSpacing: '3px' }}>FOUNDATIONAL LOGIC</div>
                    <h2 className="display-2 fw-bold mb-5" data-aos="fade-up">The Intertwined Feedback Loop.</h2>
                    <hr className="mx-auto border-white opacity-10 mb-5" style={{ width: '100px' }} />
                    <p className="lead text-muted fs-4 mx-auto mb-5" style={{ maxWidth: '900px' }} data-aos="fade-up">
                        Economic stability is driven by a self-reinforcing, institutional loop of Income, Consumption, Production, and Employment.
                        Our framework identifies the precise points where momentum shifts from expansionary growth to cyclical inflection.
                    </p>

                </div>
                <div className="container-fluid px-lg-5 pb-5">
                    {/* Visual Row: Expansion & Inflection Stages */}
                    <div className="row justify-content-center mb-5" data-aos="zoom-in">
                        <div className="col-lg-12">
                            <div className="glass-card p-3 p-md-5 rounded-5 border-blue-glow shadow-lg mx-auto" style={{ maxWidth: '1400px', background: 'rgba(13, 22, 41, 0.4)' }}>
                                <IntertwinedLoopCanvas />
                            </div>
                        </div>
                    </div>

                    {/* Narrative Row: Logic Breakdown - Centered and Tightened */}
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="row g-4">
                                {/* Positive Loop Analysis */}
                                <div className="col-lg-6" data-aos="fade-right">
                                    <div className="glass-card p-5 rounded-4 border-blue-glow shadow-lg h-100" style={{ background: 'rgba(13, 22, 41, 0.4)' }}>
                                        <h3 className="h4 text-omega-light-blue fw-bold mb-4 uppercase tracking-wider">Positive Feedback Loop</h3>
                                        <ul className="list-unstyled text-light-muted mb-0" style={{ lineHeight: '2.2', fontSize: '1.1rem' }}>
                                            <li className="mb-3 d-flex align-items-center gap-2">
                                                <span className="text-omega-light-blue">•</span>
                                                <span><strong className="text-white fw-bold">More Income</strong> → <strong className="text-white fw-bold">More Consumption</strong></span>
                                            </li>
                                            <li className="mb-3 d-flex align-items-center gap-2">
                                                <span className="text-omega-light-blue">•</span>
                                                <span><strong className="text-white fw-bold">More Consumption</strong> → <strong className="text-white fw-bold">More Production</strong></span>
                                            </li>
                                            <li className="mb-3 d-flex align-items-center gap-2">
                                                <span className="text-omega-light-blue">•</span>
                                                <span><strong className="text-white fw-bold">More Production</strong> → <strong className="text-white fw-bold">More Employment</strong></span>
                                            </li>
                                            <li className="d-flex align-items-center gap-2">
                                                <span className="text-omega-light-blue">•</span>
                                                <span><strong className="text-white fw-bold">More Employment</strong> → <strong className="text-white fw-bold">More Income</strong></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Negative Loop Analysis */}
                                <div className="col-lg-6" data-aos="fade-left">
                                    <div className="glass-card p-5 rounded-4 border-blue-glow shadow-lg h-100" style={{ background: 'rgba(13, 22, 41, 0.4)' }}>
                                        <h3 className="h4 text-omega-orange fw-bold mb-4 uppercase tracking-wider">Negative Feedback Loop</h3>
                                        <ul className="list-unstyled text-light-muted mb-0" style={{ lineHeight: '2.2', fontSize: '1.1rem' }}>
                                            <li className="mb-3 d-flex align-items-center gap-2">
                                                <span className="text-omega-orange">•</span>
                                                <span><strong className="text-white fw-bold">Lower Income</strong> → Lower <strong className="text-white fw-bold">Consumption</strong></span>
                                            </li>
                                            <li className="mb-3 d-flex align-items-center gap-2">
                                                <span className="text-omega-orange">•</span>
                                                <span><strong className="text-white fw-bold">Lower Consumption</strong> → Lower <strong className="text-white fw-bold">Production</strong></span>
                                            </li>
                                            <li className="mb-3 d-flex align-items-center gap-2">
                                                <span className="text-omega-orange">•</span>
                                                <span><strong className="text-white fw-bold">Lower Production</strong> → Lower <strong className="text-white fw-bold">Employment</strong></span>
                                            </li>
                                            <li className="d-flex align-items-center gap-2">
                                                <span className="text-omega-orange">•</span>
                                                <span><strong className="text-white fw-bold">Lower Employment</strong> → Lower <strong className="text-white fw-bold">Income</strong></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONVERSION BRIDGE 2: The Logic Breakdown */}
                    <div className="row justify-content-center my-5" data-aos="fade-up">
                        <div className="col-lg-10">
                            <div className="glass-vibrant p-5 rounded-5 border-blue-glow shadow-lg text-center" style={{ background: 'rgba(124, 139, 176, 0.05)' }}>
                                <h2 className="display-6 fw-bold text-white mb-3">Does your current portfolio account for these loops?</h2>
                                <p className="lead text-muted mb-5">Don't wait for the inflection. Speak to a specialist about your tactical exposure.</p>
                                <div className="d-flex flex-column align-items-center gap-3">
                                    <div className="d-flex justify-content-center gap-3">
                                        <button
                                            className="btn btn-premium px-5 py-3 shadow-lg"
                                            onClick={onOpenScheduling}>
                                            Schedule an Appointment
                                        </button>
                                        <button className="btn btn-outline-light px-5 py-3 shadow-sm" onClick={onOpenMessage}>Email Eric</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Execution Strategy Components */}
                    <div className="row mb-5">
                        <div className="col-12" data-aos="fade-up">
                            <ExecutionRealityCard theme={theme} />
                        </div>
                    </div>

                    <div className="row mb-5">
                        <div className="col-12" data-aos="zoom-in">

                            <TacticalSignalDashboard theme={theme} />
                        </div>
                    </div>

                    {/* CONVERSION BRIDGE 3: Tactical Inquiry - NOW INTEGRATED AUDIT SCORE */}
                    <div className="row justify-content-center mb-5" data-aos="fade-up">
                        <div className="col-lg-8 text-center">

                            <p className="text-muted mb-4 opacity-50">Priority inquiry regarding current tactical stance?</p>
                            <button className="btn btn-link text-omega-orange fw-bold text-decoration-none" onClick={onOpenMessage}>
                                Email Eric →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section: Data Reduced to Decision */}
            <section className="container-fluid py-5">
                <div className="row justify-content-center py-5">
                    <div className="col-lg-10">
                        <TrustSignals />
                        <div className="glass-card p-5 rounded-5 border-orange-glow shadow-lg text-center position-relative overflow-hidden mt-5"
                            style={{ background: 'rgba(13, 22, 41, 0.6)' }}
                            data-aos="fade-up">

                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(45deg, rgba(244, 195, 102, 0.05) 0%, rgba(124, 139, 176, 0.05) 100%)', zIndex: 0 }}></div>

                            <div className="position-relative" style={{ zIndex: 1 }}>
                                <div className="nav-label text-gradient-orange mb-3" style={{ letterSpacing: '4px' }}>CONVERSION POINT</div>
                                <h2 className="display-3 fw-bold mb-4 text-white">Data Reduced to Decision.</h2>

                                <div className="d-flex flex-column align-items-center gap-4">
                                    <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
                                        <button
                                            onClick={() => onOpenAuth('register')}
                                            className="btn btn-outline-light px-5 py-3 rounded-pill fw-bold uppercase tracking-wider"
                                            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                        >
                                            Schedule an Appointment
                                        </button>
                                        <button
                                            onClick={onOpenScheduling}
                                            className="btn btn-link text-omega-light-blue fw-bold text-decoration-none d-flex align-items-center justify-content-center gap-2"
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            Schedule an Appointment →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default AssetManagement;
