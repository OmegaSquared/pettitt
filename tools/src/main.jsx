import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './pettitt-overrides.css';

import CompassPage from './pages/CompassPage';
import AssetManagement from './pages/AssetManagement';
import ControlCenter from './components/ControlCenter';

// ---------------------------------------------------------------------------
// Static-site glue. The original app kept simulator inputs in Firestore for
// logged-in users; here they live in localStorage so a visitor's scenario
// survives a reload without any back end. "Schedule" / "Message" actions open
// the visitor's email client.
// ---------------------------------------------------------------------------
const MAILTO = document.getElementById('tool-root')?.dataset.mailto || 'mailto:eric@pettittwealth.com';
const openMail = () => { window.location.href = MAILTO; };

const DEFAULT_INPUTS = {
    age: 35, retirement: 65, capital: 400000, monthlyContribution: 500, riskLevel: 66.7,
    target: 2500000, deriskingAge: 55, inflationRate: 2.5, protectionRiskLevel: 38.9,
    protectionMonthlyContribution: 500, planUntilAge: 95, distributionRate: 4,
    distributionRiskLevel: 11.1, useInflationAdjusted: false, managementFee: 1.5,
    isAccumulationUnlocked: false, isDefenseUnlocked: false, isDistributionUnlocked: false, isComplete: false,
};
const STORE_KEY = 'pettitt-compass-inputs';

function loadInputs() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        return raw ? { ...DEFAULT_INPUTS, ...JSON.parse(raw) } : DEFAULT_INPUTS;
    } catch { return DEFAULT_INPUTS; }
}

function CompassApp({ theme }) {
    const [inputs, setInputs] = useState(loadInputs);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(inputs)); } catch { /* private mode etc. */ }
    }, [inputs]);

    const onUpdate = useCallback((key, val) => {
        if (key === 'open') { setOpen(val); return; }
        setInputs(prev => ({ ...prev, [key]: val }));
    }, []);
    const openCC = useCallback(() => setOpen(true), []);

    return (
        <>
            <ControlCenter isOpen={open} onClose={() => setOpen(false)} inputs={inputs} onUpdate={onUpdate} theme={theme} />
            <CompassPage
                theme={theme}
                onOpenScheduling={openMail}
                onOpenControlCenter={openCC}
                isControlCenterOpen={open}
                inputs={inputs}
                onUpdateInput={onUpdate}
            />
        </>
    );
}

function ClockApp({ theme }) {
    return (
        <AssetManagement
            theme={theme}
            userProfile={null}
            onOpenScheduling={openMail}
            onOpenAuth={openMail}
            onOpenMessage={openMail}
        />
    );
}

const mount = document.getElementById('tool-root');
if (mount) {
    const theme = 'dark-mode';
    document.body.classList.add(theme, 'landing-page', 'tool-page');
    AOS.init({ duration: 900, once: true, easing: 'ease-out-cubic', offset: 80 });
    const page = mount.dataset.page;
    createRoot(mount).render(
        <div className={`landing-page ${theme}`}>
            {page === 'compass' ? <CompassApp theme={theme} /> : <ClockApp theme={theme} />}
        </div>
    );
}
