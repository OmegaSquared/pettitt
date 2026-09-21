import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stages = [
    { id: 'compass', label: 'COMPASS', icon: 'architecture', description: 'Institutional Strategic Planning Protocol' },
    { id: 'accumulation', label: 'ACCUMULATION', icon: 'trending_up', description: 'Wealth Construction & Growth Mastery' },
    { id: 'defense', label: 'DEFENSE', icon: 'shield', description: 'Capital Preservation & Risk Mitigation' },
    { id: 'distribution', label: 'DISTRIBUTION', icon: 'wallet', description: 'Sustainable Yield & Legacy Deployment' }
];

const StageSidebar = ({ state, onStateChange, theme }) => {
    const isDark = theme === 'dark-mode';
    const [activeStage, setActiveStage] = useState('compass');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Enforce desktop visibility: prevent hidden state on desktop
    useEffect(() => {
        if (!isMobile && state === 'hidden') {
            onStateChange('mini');
        }
    }, [isMobile, state, onStateChange]);

    const sidebarVariants = {
        hidden: { x: '-100%', width: 0 },
        mini: { x: 0, width: isMobile ? '64px' : '88px' },
        expanded: { x: 0, width: isMobile ? '100%' : '380px' }
    };

    const handleStageClick = (id) => {
        setActiveStage(id);
        if (state === 'mini') {
            onStateChange('expanded');
        }
    };

    return (
        <>
            {/* Mobile Fixed Trigger - only show when hidden on mobile */}
            {isMobile && state === 'hidden' && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onStateChange('mini')}
                    className="position-fixed top-50 start-0 translate-middle-y z-max p-2 rounded-end bg-omega-orange shadow-lg cursor-pointer"
                    style={{ zIndex: 2001, border: '1px solid rgba(255,255,255,0.1)', borderLeft: 'none' }}
                >
                    <span className="material-icons text-white">chevron_right</span>
                </motion.div>
            )}

            <AnimatePresence>
                {state !== 'hidden' && (
                    <motion.div
                        initial="hidden"
                        animate={state}
                        exit="hidden"
                        variants={sidebarVariants}
                        transition={{ type: 'spring', damping: 22, stiffness: 140 }}
                        drag={isMobile ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, info) => {
                            if (isMobile) {
                                if (info.offset.x > 80 && state === 'mini') {
                                    onStateChange('expanded');
                                } else if (info.offset.x < -80 && state === 'expanded') {
                                    onStateChange('mini');
                                } else if (info.offset.x < -80 && state === 'mini') {
                                    onStateChange('hidden');
                                }
                            }
                        }}
                        className={`stage-sidebar position-fixed top-0 start-0 h-100 shadow-2xl overflow-hidden`}
                        style={{
                            background: isDark ? 'rgba(13, 22, 41, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(40px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                            zIndex: 2000,
                        }}
                    >
                        <div className="d-flex flex-column h-100 py-4">
                            {/* Header Area */}
                            <div className="px-4 mb-5 d-flex align-items-center justify-content-between">
                                <motion.div
                                    onClick={() => onStateChange(state === 'expanded' ? 'mini' : 'expanded')}
                                    className="cursor-pointer d-flex align-items-center gap-3"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="material-icons text-omega-orange" style={{ fontSize: '28px' }}>
                                        {state === 'expanded' ? 'menu_open' : 'menu'}
                                    </span>
                                    {state === 'expanded' && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="fw-900 tracking-widest text-omega-orange small"
                                        >LIFE CYCLE</motion.span>
                                    )}
                                </motion.div>

                                {state === 'expanded' && (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => onStateChange('mini')}
                                        className="btn btn-link p-0 text-white-50 hover-text-white transition-all"
                                        title="Collapse Sidebar"
                                    >
                                        <span className="material-icons" style={{ fontSize: '22px' }}>keyboard_double_arrow_left</span>
                                    </motion.button>
                                )}
                            </div>

                            {/* Interactive Stages Area */}
                            <div className="flex-grow-1">
                                {stages.map((stage) => {
                                    const isActive = activeStage === stage.id;
                                    return (
                                        <div
                                            key={stage.id}
                                            onClick={() => handleStageClick(stage.id)}
                                            className={`sidebar-item d-flex align-items-center px-4 py-4 cursor-pointer transition-all position-relative overflow-hidden ${isActive ? 'active' : ''}`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeBar"
                                                    className="position-absolute start-0 h-25 bg-omega-orange rounded-end"
                                                    style={{ width: '4px', top: '37.5%' }}
                                                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                                                />
                                            )}

                                            <div className="d-flex align-items-center gap-4 w-100 position-relative z-1">
                                                <div className={`d-flex align-items-center justify-content-center rounded-circle transition-all ${isActive ? 'bg-omega-orange text-white shadow-lg shadow-orange-glow' : 'bg-white-5 text-white-50'}`}
                                                    style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                                                    <span className="material-icons" style={{ fontSize: '22px' }}>
                                                        {stage.icon}
                                                    </span>
                                                </div>

                                                {state === 'expanded' && (
                                                    <div className="d-flex flex-column truncate">
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`fw-900 tracking-widest small transition-all ${isActive ? 'text-omega-orange' : 'text-white'}`}
                                                        >
                                                            {stage.label}
                                                        </motion.span>
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: isActive ? 1 : 0.4 }}
                                                            className="text-white-50 tiny mt-1 fw-bold"
                                                            style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}
                                                        >
                                                            {stage.description}
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Detail/Diagnostic Summary Area */}
                            {state === 'expanded' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="px-4 py-4"
                                >
                                    <div className="p-4 rounded-5 bg-white-5 border border-white-10 shadow-inner">
                                        <div className="tiny text-muted uppercase tracking-widest mb-2" style={{ fontSize: '0.6rem' }}>ACTIVE STAGE</div>
                                        <div className="fw-900 text-white mb-3 h5" style={{ letterSpacing: '1px' }}>
                                            {stages.find(s => s.id === activeStage)?.label}
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="tiny text-muted uppercase fw-bold" style={{ fontSize: '0.55rem' }}>Phase Progress</span>
                                            <span className="tiny text-omega-orange fw-900" style={{ fontSize: '0.55rem' }}>STAGE 2 of 4</span>
                                        </div>
                                        <div className="progress bg-white-10 mb-4 rounded-pill" style={{ height: '6px' }}>
                                            <div className="progress-bar bg-omega-orange rounded-pill" style={{ width: '50%' }}></div>
                                        </div>

                                        <button className="btn btn-premium btn-sm w-100 py-3 rounded-pill fw-900 shadow-lg" style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}>
                                            EXPAND PROTOCOL
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {state === 'mini' && isMobile && (
                                <div className="mt-auto px-4 py-3 text-center">
                                    <button
                                        onClick={() => onStateChange('hidden')}
                                        className="btn btn-link p-0 text-white-50 opacity-25 hover-opacity-100"
                                        title="Hide Sidebar"
                                    >
                                        <span className="material-icons" style={{ fontSize: '18px' }}>visibility_off</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <style jsx>{`
                            .stage-sidebar {
                                scrollbar-width: none;
                                transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                            }
                            .stage-sidebar::-webkit-scrollbar {
                                display: none;
                            }
                            .sidebar-item {
                                padding-top: 2.25rem !important;
                                padding-bottom: 2.25rem !important;
                            }
                            .sidebar-item:hover {
                                background: rgba(255, 255, 255, 0.02);
                            }
                            .sidebar-item.active {
                                background: linear-gradient(90deg, rgba(244, 195, 102, 0.12) 0%, transparent 100%);
                            }
                            .bg-omega-orange { background-color: var(--omega-orange); }
                            .text-omega-orange { color: var(--omega-orange); }
                            .shadow-orange-glow { box-shadow: 0 0 20px rgba(244, 195, 102, 0.2); }
                            .truncate {
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                            }
                            .z-max {
                                z-index: 2100 !important;
                            }
                        `}</style>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StageSidebar;
