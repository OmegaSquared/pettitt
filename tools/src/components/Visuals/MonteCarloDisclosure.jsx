import React, { useState } from 'react';

const MonteCarloDisclosure = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="position-relative d-inline-block mt-3 mc-disclosure-container" 
             onMouseEnter={() => setIsHovered(true)} 
             onMouseLeave={() => setIsHovered(false)}>
            <span className="text-omega-light-blue fw-bold font-monospace" style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}>
                Important Monte Carlo Disclosures
            </span>
            
            {isHovered && (
                <div className="position-absolute bg-black text-white p-4 rounded shadow-lg border border-secondary text-start" 
                     style={{ 
                         bottom: '100%', 
                         left: '50%', 
                         transform: 'translateX(-50%)', 
                         width: 'min(90vw, 600px)', 
                         zIndex: 1050,
                         fontSize: '0.75rem',
                         lineHeight: '1.6',
                         marginBottom: '10px'
                     }}>
                    <p className="fw-bold text-orange mb-2">IMPORTANT: The projections or other information generated regarding the likelihood of various investment outcomes are hypothetical in nature, do not reflect actual investment results and are not guarantees of future results. Results are based on the assumptions input by the user.</p>

                    <p className="mb-2">This analysis is hypothetical and for illustrative purposes only. The results shown are based on simulated performance generated through Monte Carlo analysis and do not represent actual investment results or the performance of any specific client account.</p>

                    <p className="mb-2">Monte Carlo simulations use randomized market returns based on assumptions selected by the user, including rates of return, volatility, withdrawal amounts, time horizon, and portfolio allocation. Results are highly dependent on these assumptions, and small changes may produce materially different outcomes. Simulated results are not guarantees of future performance and cannot predict actual market behavior or future investment results.</p>

                    <p className="mb-2">The projected outcomes shown (including expected, worst-case, and best-case scenarios) represent a range of possible outcomes and should not be viewed as forecasts or guarantees. Actual results may be materially different, and there is no assurance that any investment strategy will achieve its intended results.</p>

                    <p className="mb-2">Investing involves risk, including the potential loss of principal. This strategy may not perform as intended in all market environments, particularly during prolonged market downturns or periods of poor performance in growth-oriented investments.</p>

                    <p className="mb-0">This analysis reflects an estimated management fee and assumes specific inflation rates where applicable. It does not reflect the impact of transaction costs or taxes, which would reduce actual returns. This information is provided for general informational purposes only and does not constitute investment advice or a recommendation. It does not take into account any individual investor’s financial situation, objectives, or risk tolerance.</p>
                </div>
            )}
        </div>
    );
};

export default MonteCarloDisclosure;
