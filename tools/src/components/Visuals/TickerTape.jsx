import React from 'react';

const TickerTape = ({ position = 'fixed-bottom', isDark = true }) => {
    const symbols = [
        { symbol: 'SPX', price: '5,026.61', change: '+0.58%', trend: 'up' },
        { symbol: 'NDX', price: '17,804.50', change: '+1.12%', trend: 'up' },
        { symbol: 'US10Y', price: '4.24%', change: '+0.04', trend: 'down' }, // Orange for yield rising (risk)
        { symbol: 'GOLD', price: '2,024.10', change: '+0.25%', trend: 'up' },
        { symbol: 'OIL', price: '78.19', change: '-1.45%', trend: 'down' },
        { symbol: 'BTC', price: '52,140', change: '+3.20%', trend: 'up' },
        { symbol: 'CEI INDEX', price: '112.4', change: '+0.15%', trend: 'up' },
    ];

    const spxTrend = symbols.find(s => s.symbol === 'SPX')?.trend || 'up';
    const borderColor = spxTrend === 'up' ? '#156082' : '#F4C366';
    const shadowColor = spxTrend === 'up' ? 'rgba(21, 96, 130, 0.2)' : 'rgba(244, 195, 102, 0.15)';

    // Double the symbols to ensure seamless looping
    const displaySymbols = [...symbols, ...symbols];

    const getPositionStyles = () => {
        if (position === 'inline') return {
            height: '45px',
            background: 'rgba(13, 22, 41, 0.98)',
            backdropFilter: 'blur(15px)',
            borderTop: `2px solid ${borderColor}`,
            borderRadius: '8px',
            overflow: 'hidden'
        };

        return {
            height: '45px',
            background: 'rgba(13, 22, 41, 0.98)',
            backdropFilter: 'blur(15px)',
            borderTop: position === 'fixed-bottom' ? `2px solid ${borderColor}` : 'none',
            borderBottom: position === 'fixed-top' ? `2px solid ${borderColor}` : 'none',
            boxShadow: position === 'fixed-bottom' ? `0 -10px 30px ${shadowColor}` : `0 10px 30px ${shadowColor}`,
            zIndex: 2000,
            position: 'fixed',
            bottom: position === 'fixed-bottom' ? 0 : 'auto',
            top: position === 'fixed-top' ? 0 : 'auto',
            left: 0
        };
    };

    return (
        <div className="ticker-tape-wrapper w-100" style={getPositionStyles()}>
            <style>
                {`
                    @keyframes ticker-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .ticker-scroll-inner {
                        display: flex;
                        width: max-content;
                        animation: ticker-scroll 30s linear infinite;
                    }
                    .ticker-scroll-inner:hover {
                        animation-play-state: paused;
                    }
                `}
            </style>

            <div className="d-flex align-items-center h-100">
                {/* Branding Block (Left) */}
                <div className="px-3 h-100 d-flex align-items-center border-end border-white border-opacity-10" style={{
                    position: 'relative',
                    zIndex: 20,
                    background: 'rgba(13, 22, 41, 1)',
                    boxShadow: '10px 0 20px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap'
                }}>
                    <img src="assets/img/logo_white_horizontal.png" alt="PETTITT WEALTH" height="20" className="opacity-75" />
                </div>

                {/* Scrolling Ticker Area */}
                <div className="flex-grow-1 overflow-hidden h-100 position-relative">
                    <div className="ticker-scroll-inner h-100 align-items-center">
                        {displaySymbols.map((item, index) => (
                            <div key={index} className="px-4 d-flex align-items-center gap-3 border-end border-white border-opacity-5" style={{ minWidth: '220px' }}>
                                <span className="fw-bold text-white small" style={{ letterSpacing: '1px' }}>{item.symbol}</span>
                                <span className="text-white opacity-75 small font-monospace">{item.price}</span>
                                <span className={`small fw-bold ${item.trend === 'up' ? 'text-omega-blue' : item.trend === 'down' ? 'text-omega-orange' : 'text-white-50'}`}>
                                    {item.change}
                                    {item.trend !== 'neutral' && (
                                        <span className="ms-1" style={{ fontSize: '0.7rem' }}>
                                            {item.trend === 'up' ? '▲' : '▼'}
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Disclosure Block (Right) */}
                <div className="px-3 h-100 d-flex align-items-center gap-2 border-start border-white border-opacity-10" style={{
                    position: 'relative',
                    zIndex: 20,
                    background: 'rgba(13, 22, 41, 1)',
                    boxShadow: '-10px 0 20px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap'
                }}>
                    <span className="material-icons text-white-50" style={{ fontSize: '14px' }}>info</span>
                    <span className="fw-bold text-white-50 text-uppercase tracking-tighter" style={{ fontSize: '0.6rem' }}>
                        QUOTES DELAYED 15M · SOURCE: IB / MORNINGSTAR
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TickerTape;
