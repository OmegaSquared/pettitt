import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AccountValueChart = ({ data, theme, currentBalance, hideHeader = false }) => {
    const isDark = theme === 'dark-mode';
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Merge history with current if applicable
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            if (currentBalance) {
                return [{
                    date: 'Current',
                    totalMarketValue: currentBalance
                }];
            }
            return [];
        }

        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

        // If current balance exists and is newer than last history point, append it
        if (currentBalance) {
            const lastPoint = sorted[sorted.length - 1];
            if (currentBalance !== lastPoint.totalMarketValue) {
                sorted.push({
                    date: 'Now',
                    totalMarketValue: currentBalance
                });
            }
        }
        return sorted;
    }, [data, currentBalance]);

    if (chartData.length === 0) {
        return (
            <div className={`card border-0 rounded-4 p-4 text-center opacity-50 italic small ${isDark ? 'bg-black bg-opacity-20' : 'bg-light border'}`}>
                <span className="material-icons d-block mb-2">query_stats</span>
                No balance history available yet.
            </div>
        );
    }

    const values = chartData.map(d => d.totalMarketValue);
    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values) * 1.05;
    const range = Math.max(1, maxVal - minVal);

    const width = 500;
    const height = 180;
    const padding = { top: 30, right: 30, bottom: 40, left: 30 };

    const getX = (index) => {
        if (chartData.length === 1) return width / 2;
        return padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    };

    const getY = (value) => {
        return height - padding.bottom - ((value - minVal) / range) * (height - padding.top - padding.bottom);
    };

    const points = chartData.map((d, i) => `${getX(i)},${getY(d.totalMarketValue)}`).join(' ');

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val);

    const latestValue = values[values.length - 1];
    const firstValue = values[0];
    const change = latestValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;

    return (
        <div className="account-value-chart">
            <div className="d-flex justify-content-between align-items-end mb-3 px-1">
                {!hideHeader && (
                    <div>
                        <div className="tiny fw-bold text-muted text-uppercase tracking-widest mb-1">Total Market Value</div>
                        <h3 className="fw-black m-0 tracking-tight" style={{ color: isDark ? '#fff' : '#000' }}>
                            {formatCurrency(latestValue)}
                        </h3>
                    </div>
                )}
                {chartData.length > 1 && (
                    <div className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 ${change >= 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        <span className="material-icons tiny">{change >= 0 ? 'trending_up' : 'trending_down'}</span>
                        <span className="fw-black small">{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%</span>
                    </div>
                )}
            </div>

            <div className={`chart-container rounded-4 p-0 shadow-inner position-relative ${isDark ? 'bg-black bg-opacity-40' : 'bg-white border'}`} style={{ height: `${height}px` }}>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-100 h-100">
                    <defs>
                        <linearGradient id="premiumGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#F4C366" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#F4C366" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#7C8BB0" />
                            <stop offset="100%" stopColor="#F4C366" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* WealthPort Watermark */}
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isDark ? 'white' : 'black'}
                        fillOpacity="0.03"
                        fontSize="40"
                        fontWeight="900"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                        WEALTHPORT
                    </text>

                    {/* Horizontal Grid lines */}
                    {[0, 0.5, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding.left}
                            y1={getY(minVal + (maxVal - minVal) * p)}
                            x2={width - padding.right}
                            y2={getY(minVal + (maxVal - minVal) * p)}
                            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Horizontal Grid lines */}
                    {[0, 0.5, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding.left}
                            y1={getY(minVal + (maxVal - minVal) * p)}
                            x2={width - padding.right}
                            y2={getY(minVal + (maxVal - minVal) * p)}
                            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Single Point Baseline */}
                    {chartData.length === 1 && (
                        <motion.line
                            initial={{ x2: padding.left }}
                            animate={{ x2: width - padding.right }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            x1={padding.left}
                            y1={getY(chartData[0].totalMarketValue)}
                            y2={getY(chartData[0].totalMarketValue)}
                            stroke="#F4C366"
                            strokeWidth="2"
                            strokeDasharray="8 4"
                            opacity="0.3"
                        />
                    )}

                    {/* Area fill */}
                    {chartData.length > 1 && (
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            d={`M ${getX(0)} ${height - padding.bottom} L ${points} L ${getX(chartData.length - 1)} ${height - padding.bottom} Z`}
                            fill="url(#premiumGradient)"
                        />
                    )}

                    {/* The Path */}
                    {chartData.length > 1 && (
                        <motion.polyline
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                            style={{ filter: 'url(#glow)' }}
                        />
                    )}

                    {/* Interactive Areas for tooltip */}
                    {chartData.map((d, i) => (
                        <rect
                            key={`hitbox-${i}`}
                            x={chartData.length === 1 ? 0 : (i === 0 ? 0 : getX(i) - (getX(i) - getX(i - 1)) / 2)}
                            y={0}
                            width={chartData.length === 1 ? width : (i === 0 ? getX(1) / 2 : (i === chartData.length - 1 ? width - getX(i) + (getX(i) - getX(i - 1)) / 2 : (getX(i + 1) - getX(i - 1)) / 2))}
                            height={height}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}

                    {/* Dots */}
                    {chartData.map((d, i) => (
                        <motion.g
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                                x: getX(i),
                                y: getY(d.totalMarketValue)
                            }}
                        >
                            <motion.circle
                                animate={{
                                    r: hoveredIndex === i ? 7 : (i === chartData.length - 1 ? 5 : 3),
                                    fill: hoveredIndex === i ? '#fff' : (i === chartData.length - 1 ? '#F4C366' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'))
                                }}
                                stroke={hoveredIndex === i ? '#F4C366' : 'none'}
                                strokeWidth="2"
                                style={{ vectorEffect: 'non-scaling-stroke' }}
                            />
                        </motion.g>
                    ))}
                </svg>

                {/* X-Axis Labels */}
                <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-between px-3 pb-2 opacity-50" style={{ fontSize: '0.6rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    <span>{chartData[0].date}</span>
                    {chartData.length > 2 && <span>{chartData[Math.floor(chartData.length / 2)].date}</span>}
                    {chartData.length > 1 && <span>{chartData[chartData.length - 1].date}</span>}
                </div>

                {/* Custom Tooltip */}
                <AnimatePresence>
                    {hoveredIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="position-absolute shadow-lg rounded-3 p-2 pointer-events-none"
                            style={{
                                left: `${getX(hoveredIndex)}px`,
                                top: `${getY(chartData[hoveredIndex].totalMarketValue) - 12}px`,
                                x: hoveredIndex === chartData.length - 1 ? '-90%' : (hoveredIndex === 0 ? '-10%' : '-50%'),
                                y: '-100%',
                                background: isDark ? '#111' : '#fff',
                                color: isDark ? '#fff' : '#000',
                                border: `1px solid ${isDark ? '#F4C366' : 'rgba(0,0,0,0.1)'}`,
                                zIndex: 100,
                                minWidth: '140px',
                                boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 10px rgba(244, 195, 102, 0.2)' : '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div className={`tiny mb-1 ${isDark ? 'text-white-50' : 'text-muted'}`}>{chartData[hoveredIndex].date} {chartData.length === 1 && '(Initial)'}</div>
                            <div className="h6 fw-black mb-0">{formatCurrency(chartData[hoveredIndex].totalMarketValue)}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-2 d-flex align-items-center gap-2 px-1">
                <span className="material-icons text-muted tiny">{chartData.length > 1 ? 'history' : 'info'}</span>
                <span className="tiny text-muted fw-bold">
                    {chartData.length > 1
                        ? `Showing last ${chartData.length} data points from WealthPort Sync`
                        : 'Historical baseline established. History will build as you sync monthly.'}
                </span>
            </div>

            <style jsx>{`
                .account-value-chart {
                    font-family: 'Inter', sans-serif;
                }
                .tracking-tight { letter-spacing: -0.5px; }
                .fw-black { font-weight: 900; }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
            `}</style>
        </div>
    );
};

export default AccountValueChart;


