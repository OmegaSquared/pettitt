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
                                background: 'radial-gradient(circle, rgba(124, 139, 176, 0.15) 0%, rgba(13, 22, 41, 0) 70%)',
                                zIndex: 0
                            }}></div>

                        <div className="position-relative" style={{ zIndex: 1 }}>
                            <div className="nav-label text-gradient-orange mb-3 fs-5" style={{ letterSpacing: '4px' }}>TACTICAL SIGNAL HUB</div>
                            <h2 className="display-4 fw-bold mb-4 text-white">The Cycle Pulse.</h2>

                            <div className="row justify-content-center mt-5 g-4 text-start">
                                {/* Benchmark Gauge */}
                                <div className="col-md-5 col-lg-4">
                                    <div className="glass-card p-4 h-100 border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <Gauge className="text-omega-light-blue" size={28} />
                                            <div className="nav-label text-muted mb-0 small uppercase">Current Regime</div>
                                        </div>
                                        <div className="h3 fw-bold text-white mb-2">Approaching Recession</div>
                                        <div className="progress bg-dark" style={{ height: '8px', borderRadius: '4px' }}>
                                            <div className="progress-bar bg-omega-orange" style={{ width: '92%', boxShadow: '0 0 15px var(--omega-orange)' }}></div>
                                        </div>
                                        <div className="mt-3 d-flex justify-content-between small text-muted">
                                            <span>INFLECTION</span>
                                            <span>ACTIVE PHASE</span>
                                            <span className="text-omega-orange fw-bold">PEAK TRIGGER</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cycle Sensor Status */}
                                <div className="col-md-5 col-lg-4">
                                    <div className="glass-card p-4 h-100 border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <Activity className="text-omega-orange" size={28} />
                                            <div className="nav-label text-muted mb-0 small uppercase">Cycle Sensor</div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <div className="rounded-circle bg-danger" style={{ width: '12px', height: '12px', boxShadow: '0 0 10px #dc3545' }}></div>
                                            <h4 className="h4 fw-bold text-white mb-0">Negative Feedback</h4>
                                        </div>
                                        <p className="small text-light-muted mb-0">
                                            Production inflection detected. Consumption-Income loop is showing structural weakening across primary lead-indicators.
                                        </p>
                                    </div>
                                </div>

                                {/* Navigation Context */}
                                <div className="col-md-10 col-lg-4">
                                    <div className="glass-card p-4 h-100 border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <Navigation className="text-white" size={28} />
                                            <div className="nav-label text-muted mb-0 small uppercase">Tactical Posture</div>
                                        </div>
                                        <div className="h4 fw-bold text-white mb-3">Risk Mitigation</div>
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            <span className="badge rounded-pill border border-orange-glow px-3 py-2" style={{ background: 'rgba(244, 195, 102, 0.2)' }}>60/40 DEFENSIVE</span>
                                            <span className="badge rounded-pill border border-blue-glow px-3 py-2" style={{ background: 'rgba(124, 139, 176, 0.2)' }}>CAPITAL PRESERVATION</span>
                                        </div>
                                        <div className="text-muted italic" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                            *Illustrative only; not actual client allocations.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-5 text-muted small italic opacity-50 mx-auto" style={{ maxWidth: '600px' }}>
                                *Live illustrative benchmark based on our cyclical filters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TacticalSignalDashboard;
