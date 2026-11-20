import React from 'react';
import { AlertTriangle, ShieldCheck, TrendingDown, Zap } from 'lucide-react';

const ExecutionRealityCard = () => {
    return (
        <section className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="glass-card p-0 rounded-5 overflow-hidden border-blue-glow shadow-lg" data-aos="fade-up">
                        <div className="row g-0">
                            {/* Left Side: disciplined process */}
                            <div className="col-md-6 p-5 border-end border-white border-opacity-10" style={{ background: 'rgba(142, 148, 168, 0.05)' }}>
                                <div className="d-flex align-items-center gap-3 mb-4 text-omega-light-blue">
                                    <ShieldCheck size={32} />
                                    <h3 className="h4 fw-bold mb-0 uppercase tracking-wider">A Disciplined Process</h3>
                                </div>
                                <div className="mb-4">
                                    <div className="nav-label text-muted mb-2 small uppercase">How Decisions Are Made</div>
                                    <p className="h5 fw-bold text-white mb-0">Business-cycle analysis</p>
                                </div>
                                <ul className="list-unstyled space-y-4">
                                    <li className="d-flex gap-3 mb-3">
                                        <Zap className="text-omega-light-blue flex-shrink-0" />
                                        <p className="text-light-muted mb-0">
                                            <strong>Cycle Awareness</strong>: Monitoring production and economic trends as potential indicators for changing conditions.
                                        </p>
                                    </li>
                                    <li className="d-flex gap-3">
                                        <Zap className="text-omega-light-blue flex-shrink-0" />
                                        <p className="text-light-muted mb-0">
                                            <strong>Risk Management Focus</strong>: Emphasizing the analysis of economic environments to inform portfolio positioning.
                                        </p>
                                    </li>
                                </ul>
                                <div className="mt-5 pt-3 border-top border-white border-opacity-10 text-omega-light-blue fw-bold small uppercase tracking-widest">
                                    Goal: a consistent, disciplined process
                                </div>
                            </div>

                            {/* Right Side: emotional reactions */}
                            <div className="col-md-6 p-5" style={{ background: 'rgba(201, 150, 46, 0.05)' }}>
                                <div className="d-flex align-items-center gap-3 mb-4 text-omega-orange">
                                    <AlertTriangle size={32} />
                                    <h3 className="h4 fw-bold mb-0 uppercase tracking-wider">Emotional Reactions</h3>
                                </div>
                                <div className="mb-4">
                                    <div className="nav-label text-muted mb-2 small uppercase">How Decisions Are Made</div>
                                    <p className="h5 fw-bold text-white mb-0">Reacting to Headlines</p>
                                </div>
                                <ul className="list-unstyled space-y-4">
                                    <li className="d-flex gap-3 mb-3">
                                        <TrendingDown className="text-danger flex-shrink-0" />
                                        <p className="text-light-muted mb-0">
                                            <strong>Trend Following</strong>: Potentially misinterpreting late-cycle market movements without broader economic context.
                                        </p>
                                    </li>
                                    <li className="d-flex gap-3">
                                        <TrendingDown className="text-danger flex-shrink-0" />
                                        <p className="text-light-muted mb-0">
                                            <strong>Delayed Adjustments</strong>: Waiting for lagging economic indicators before considering strategic adjustments.
                                        </p>
                                    </li>
                                </ul>
                                <div className="mt-5 pt-3 border-top border-white border-opacity-10 opacity-50 italic small">
                                    *Emotionally driven decision making.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExecutionRealityCard;
