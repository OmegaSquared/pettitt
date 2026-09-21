import React from 'react';

const BlueprintSketch = ({ type, color = '#fff' }) => {
    // Schematic/Drafting style SVGs for different goals
    switch (type) {
        case 'event_repeat': // Retirement
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <circle cx="50" cy="50" r="35" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 2" />
                    <path d="M50 30 V50 L65 65" fill="none" stroke={color} strokeWidth="2" />
                    <path d="M80 50 A30 30 0 1 1 50 20" fill="none" stroke={color} strokeWidth="1.5" />
                    <path d="M50 15 L50 25 M45 20 L55 20" fill="none" stroke={color} strokeWidth="1.5" />
                </svg>
            );
        case 'home_work': // Lifestyle
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <path d="M20 80 V40 L50 20 L80 40 V80 H20 Z" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 2" />
                    <path d="M35 80 V55 H65 V80" fill="none" stroke={color} strokeWidth="1.5" />
                    <line x1="20" y1="40" x2="80" y2="40" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>
            );
        case 'account_tree': // Legacy
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <rect x="40" y="15" width="20" height="20" fill="none" stroke={color} strokeWidth="1.5" />
                    <line x1="50" y1="35" x2="50" y2="55" stroke={color} strokeWidth="1" strokeDasharray="3 1" />
                    <line x1="25" y1="55" x2="75" y2="55" stroke={color} strokeWidth="1" />
                    <rect x="15" y="55" width="20" height="20" fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                    <rect x="40" y="55" width="20" height="20" fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                    <rect x="65" y="55" width="20" height="20" fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                </svg>
            );
        case 'security': // Protection
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <path d="M50 15 L20 30 V55 C20 75 50 85 50 85 C50 85 80 75 80 55 V30 L50 15 Z" fill="none" stroke={color} strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="15" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 2" />
                </svg>
            );
        case 'public': // Impact
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <circle cx="50" cy="50" r="35" fill="none" stroke={color} strokeWidth="1.5" />
                    <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 2" />
                    <ellipse cx="50" cy="50" rx="12" ry="35" fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 2" />
                </svg>
            );
        case 'flight_takeoff': // Travel
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <path d="M20 70 L40 70 L60 30 L85 30 L60 70 L80 70" fill="none" stroke={color} strokeWidth="1.5" />
                    <line x1="15" y1="75" x2="85" y2="75" stroke={color} strokeWidth="0.5" strokeDasharray="4 4" />
                </svg>
            );
        case 'school': // Education
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <path d="M20 40 L50 25 L80 40 L50 55 Z" fill="none" stroke={color} strokeWidth="1.5" />
                    <path d="M30 45 V65 C30 65 50 75 70 65 V45" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 2" />
                </svg>
            );
        case 'medical_services': // Healthcare
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <rect x="20" y="30" width="60" height="45" rx="5" fill="none" stroke={color} strokeWidth="1.5" />
                    <line x1="50" y1="38" x2="50" y2="67" stroke={color} strokeWidth="2" />
                    <line x1="36" y1="52.5" x2="64" y2="52.5" stroke={color} strokeWidth="2" />
                </svg>
            );
        case 'emergency': // Contingency
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <circle cx="50" cy="50" r="35" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 3" />
                    <path d="M50 30 L50 55 L70 55" fill="none" stroke={color} strokeWidth="1.5" />
                </svg>
            );
        case 'edit_note': // Other
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <path d="M30 70 L70 70 L70 30 L40 30 L30 40 V70" fill="none" stroke={color} strokeWidth="1.5" />
                    <path d="M30 40 L40 30" fill="none" stroke={color} strokeWidth="1" />
                    <line x1="40" y1="45" x2="60" y2="45" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="40" y1="55" x2="60" y2="55" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                </svg>
            );
        case 'apartment': // Real Estate
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <rect x="25" y="20" width="50" height="70" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
                    <rect x="35" y="30" width="10" height="10" fill="none" stroke={color} strokeWidth="1" />
                    <rect x="55" y="30" width="10" height="10" fill="none" stroke={color} strokeWidth="1" />
                    <rect x="35" y="50" width="10" height="10" fill="none" stroke={color} strokeWidth="1" />
                    <rect x="55" y="50" width="10" height="10" fill="none" stroke={color} strokeWidth="1" />
                    <rect x="42" y="75" width="16" height="15" fill="none" stroke={color} strokeWidth="1" />
                    <line x1="20" y1="90" x2="80" y2="90" stroke={color} strokeWidth="1" />
                </svg>
            );
        case 'insights': // Business Growth
            return (
                <svg viewBox="0 0 100 100" className="w-100 h-100 op-blueprint-svg">
                    <path d="M20 80 L40 60 L50 70 L80 30" fill="none" stroke={color} strokeWidth="1.5" />
                    <polyline points="70,30 80,30 80,40" fill="none" stroke={color} strokeWidth="1.5" />
                    <line x1="20" y1="80" x2="80" y2="80" stroke={color} strokeWidth="0.5" strokeDasharray="4 2" />
                    <line x1="20" y1="20" x2="20" y2="80" stroke={color} strokeWidth="0.5" strokeDasharray="4 2" />
                    <circle cx="20" cy="80" r="2" fill={color} />
                    <circle cx="40" cy="60" r="2" fill={color} />
                    <circle cx="50" cy="70" r="2" fill={color} />
                    <circle cx="80" cy="30" r="3" fill={color} />
                </svg>
            );
        default:
            return null;
    }
};

export default BlueprintSketch;
