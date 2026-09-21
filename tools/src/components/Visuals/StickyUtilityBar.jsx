import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StickyUtilityBar = ({ onAction }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 400;

            // Only show if scrolled past threshold AND scrolling down
            // Hide if scrolling up (let Navbar show) or above threshold
            if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed-top d-none d-md-flex align-items-center py-2 px-4 shadow-2xl"
                    style={{
                        zIndex: 1045, // Slightly below Navbar (1050) just in case, but they shouldn't overlap
                        background: 'rgba(0, 21, 41, 0.95)',
                        backdropFilter: 'blur(20px)',
                        height: '65px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        // "Less rounded" - match the navbar style but keep a subtle edge if not full edge-to-edge
                        // Actually navbar is edge-to-edge fixed-top.
                    }}
                >
                    <div className="container-fluid d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <img src="assets/img/logo_white_horizontal.png" alt="OS" height="24" />
                            <div className="d-none d-lg-block h6 text-white mb-0 font-monospace" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>
                                PETTITT WEALTH // THE SCIENCE OF INVESTING
                            </div>
                        </div>
                        <button
                            onClick={onAction}
                            className="btn btn-premium rounded-3 px-4 py-2 fw-bold shadow-lg"
                            style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                        >
                            REQUEST STRATEGIC ROADMAP
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


export default StickyUtilityBar;
