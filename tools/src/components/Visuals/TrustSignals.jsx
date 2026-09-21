import React from 'react';

const TrustSignals = () => {
    const signals = [
        { icon: 'gavel', title: 'Fiduciary Duty', text: 'A legal commitment to act in your best interest, always.' },
        { icon: 'verified_user', title: 'Institutional Grade', text: 'Engineered for the complexity of private wealth legacies.' },
        { icon: 'history_edu', title: 'Cycle Proven', text: 'Proprietary framework tested across multiple economic inflections.' }
    ];

    return (
        <div className="trust-signals-section py-5 my-5" data-aos="fade-up">
            <div className="container">
                <div className="glass-vibrant p-5 rounded-5 border-white border-opacity-5 shadow-2xl position-relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>

                    <div className="row g-0 justify-content-center align-items-center">
                        {signals.map((signal, index) => (
                            <div key={index} className={`col-lg-4 px-4 py-3 ${index < signals.length - 1 ? 'border-end border-white border-opacity-10' : ''}`}>
                                <div className="d-flex align-items-center gap-4 text-start">
                                    <div className="p-3 rounded-circle bg-white bg-opacity-5 flex-shrink-0 shadow-sm">
                                        <span className="material-icons text-gradient-orange" style={{ fontSize: '2.5rem' }}>{signal.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="fw-bold text-white mb-2 fs-5" style={{ letterSpacing: '1px' }}>{signal.title}</h4>
                                        <p className="small text-muted mb-0 leading-relaxed opacity-75">{signal.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-5 pt-4 text-center">
                    <div className="d-inline-flex flex-wrap align-items-center justify-content-center gap-5 opacity-40 mb-4">
                        <div className="bg-white p-2 rounded-2 d-flex align-items-center" style={{ height: '36px' }}>
                            <img src="assets/img/FINRA_Logo.png" alt="FINRA" style={{ height: '22px', width: 'auto' }} />
                        </div>
                        <div className="bg-white p-2 rounded-2 d-flex align-items-center" style={{ height: '36px' }}>
                            <img src="assets/img/sipic_litemode.png" alt="SIPC" style={{ height: '22px', width: 'auto' }} />
                        </div>
                        <div className="d-flex align-items-center gap-2 grayscale invert">
                            <span className="material-icons text-white-50" style={{ fontSize: '1.2rem' }}>account_balance</span>
                            <span className="fw-bold text-white-50 small" style={{ letterSpacing: '3px' }}>REGULATED IAR</span>
                        </div>
                    </div>

                    <div className="mx-auto mt-2" style={{ maxWidth: '850px' }}>
                        <p className="tiny text-muted opacity-40 leading-relaxed mb-0">
                            Advisory Services offered through Cambridge Investment Research Advisors, Inc., a Registered Investment Adviser. <br />
                            Securities offered through Cambridge Investment Research, Inc., a broker-dealer, member FINRA/SIPC. <br />
                            PETTITT WEALTH and Cambridge Investment Research are not affiliated.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustSignals;
