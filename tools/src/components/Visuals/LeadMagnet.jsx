import React, { useState } from 'react';
import { captureLead } from '../../services/leadService';
import { captureIntent } from '../../utils/captureIntent';

const LeadMagnet = ({ theme }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (email) {
            captureIntent('Requested Lead Magnet: 2026 Guide', { email });
            const result = await captureLead({
                email,
                source: 'email subscription',
                details: {
                    resourceRequested: '2026 Business Cycle Survival Guide',
                    timestamp: new Date().toISOString()
                }
            });

            if (result.success) {
                setSubmitted(true);
            } else {
                console.error('Lead capture failed:', result.error);
                // Optionally handle error UI here
            }
        }
    };

    return (
        <div className="lead-magnet-section my-5 py-5 position-relative overflow-hidden" data-aos="fade-up">
            <div className="bg-glow-radial" style={{ opacity: 0.1, background: 'var(--accent-gradient)' }}></div>

            <div className="glass-vibrant p-5 rounded-5 border-orange-glow shadow-2xl position-relative mx-auto"
                style={{ maxWidth: '1100px', background: 'rgba(13, 22, 41, 0.4)' }}>

                <div className="row align-items-center g-5 text-start">
                    <div className="col-lg-7">
                        <div className="nav-label text-gradient-orange mb-3" style={{ letterSpacing: '4px' }}>FREE STRATEGIC RESOURCE</div>
                        <h2 className="display-5 fw-bold text-white mb-4">The 2026 Business Cycle Survival Guide.</h2>
                        <p className="lead text-white-50 fs-5 mb-0">
                            Our institutional briefing on navigating the current macro inflection point.
                            Understand the signals before they impact your legacy.
                        </p>
                    </div>

                    <div className="col-lg-5">
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="p-4 rounded-4 shadow-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="mb-4">
                                    <label className="small fw-bold text-muted text-uppercase mb-2 d-block" style={{ letterSpacing: '1px' }}>Priority Dispatch Email</label>
                                    <input
                                        type="email"
                                        className="form-control bg-transparent border-white border-opacity-10 text-white p-3 rounded-pill"
                                        placeholder="name@institutional.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-premium w-100 py-3 rounded-pill fw-bold uppercase tracking-wider shadow-lg">
                                    Get the Guide →
                                </button>
                                <p className="tiny text-center text-muted mt-3 mb-0">No spam. Only institutional alerts.</p>
                            </form>
                        ) : (
                            <div className="p-5 text-center rounded-4 border-blue-glow shadow-lg" style={{ background: 'rgba(124, 139, 176, 0.1)' }}>
                                <span className="material-icons text-omega-light-blue mb-3" style={{ fontSize: '3rem' }}>verified</span>
                                <h4 className="fw-bold text-white">Transmission Received</h4>
                                <p className="text-muted small mb-0">The 2026 Guide is being dispatched to your inbox.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadMagnet;
