import React from 'react';
import { Activity, Gauge, Navigation } from 'lucide-react';

const TacticalSignalDashboard = () => {
    return (
        <section className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-12">
                    <div className="glass-card p-5 rounded-5 border-blue-glow shadow-lg text-center position-relative overflow-hidden" data-aos="zoom-in">
                        {/* Atmospheric Background Glow */}
                        <div className="position-absolute top-50 start-50 translate-middle w-100 h-100"
                            style={{
                                background: 'radial-gradient(circle, rgba(142, 148, 168, 0.15) 0%, rgba(15, 31, 53, 0) 70%)',
                                zIndex: 0
                            }}></div>

                        <div className="position-relative" style={{ zIndex: 1 }}>
                            <div className="nav-label text-gradient-orange mb-3 fs-5" style={{ letterSpacing: '4px' }}>A QUESTION WORTH ASKING</div>
                            <h2 className="display-4 fw-bold mb-4 text-white">Where Is the Economy in the Cycle?</h2>

                            <div className="row justify-content-center mt-5 g-4 text-start">
                                <div className="col-md-5 col-lg-4">
                                    <div className="glass-card p-4 h-100 border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <Gauge className="text-omega-light-blue" size={28} />
                                            <div className="nav-label text-muted mb-0 small uppercase">The Stage</div>
                                        </div>
                                        <div className="h4 fw-bold text-white mb-3">Six stages, one cycle</div>
                                        <p className="small text-light-muted mb-0">
                                            The Clock estimates which of the six stages the economy is in. That estimate can change as new economic data is released.
                                        </p>
                                    </div>
                                </div>

                                <div className="col-md-5 col-lg-4">
                                    <div className="glass-card p-4 h-100 border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <Activity className="text-omega-orange" size={28} />
                                            <div className="nav-label text-muted mb-0 small uppercase">The Signals</div>
                                        </div>
                                        <div className="h4 fw-bold text-white mb-3">Feedback loops</div>
                                        <p className="small text-light-muted mb-0">
                                            It watches the income, consumption, production and employment loop for signs that momentum may be shifting.
                                        </p>
                                    </div>
                                </div>

                                <div className="col-md-10 col-lg-4">
                                    <div className="glass-card p-4 h-100 border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <Navigation className="text-white" size={28} />
                                            <div className="nav-label text-muted mb-0 small uppercase">Your Portfolio</div>
                                        </div>
                                        <div className="h4 fw-bold text-white mb-3">What it means for you</div>
                                        <p className="small text-light-muted mb-0">
                                            The more important question is how the stage of the cycle could affect your goals, time horizon and comfort with risk.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-5 text-muted small italic opacity-50 mx-auto" style={{ maxWidth: '640px' }}>
                                *The Clock is an educational framework. It relies on historical data, which is not a guarantee of future results, and does not predict market movements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TacticalSignalDashboard;
