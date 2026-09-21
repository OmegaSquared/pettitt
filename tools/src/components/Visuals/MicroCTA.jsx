import React from 'react';
import { motion } from 'framer-motion';

const MicroCTA = ({ title, subtext, buttonText, onClick, color = '#F4C366' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="micro-cta glass-vibrant p-4 rounded-4 border-white-5 shadow-2xl d-flex flex-wrap align-items-center justify-content-between gap-4 my-5"
            style={{
                background: 'rgba(255,255,255,0.02)',
                borderLeft: `4px solid ${color}`
            }}
        >
            <div className="flex-grow-1">
                <div className="nav-label mb-1" style={{ color: color, fontSize: '0.7rem', letterSpacing: '2px' }}>STRATEGIC INSIGHT</div>
                <h4 className="text-white fw-bold mb-1">{title}</h4>
                <p className="text-white-50 small mb-0">{subtext}</p>
            </div>
            <button
                onClick={onClick}
                className="btn btn-premium rounded-pill px-4 py-2 fw-bold whitespace-nowrap"
                style={{ fontSize: '0.8rem', background: color, borderColor: color }}
            >
                {buttonText}
            </button>
        </motion.div>
    );
};

export default MicroCTA;
