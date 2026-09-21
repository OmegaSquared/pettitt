// Lightweight bundle for the marketing pages: mounts the Clock, Compass and
// Seven-Step wheel into any <div data-widget="..."> without pulling in
// Bootstrap or the full tool stylesheet.
import React from 'react';
import { createRoot } from 'react-dom/client';
import './widgets.css';
import Clock from './components/Visuals/Clock';
import Compass from './components/Visuals/Compass';
import PlanningProcessWheel from './components/Visuals/PlanningProcessWheel';
import SixStagesCanvas from './components/Visuals/SixStagesCanvas';

const REGISTRY = { clock: Clock, compass: Compass, 'planning-wheel': PlanningProcessWheel, 'six-stages': SixStagesCanvas };

document.querySelectorAll('[data-widget]').forEach((el) => {
    const Cmp = REGISTRY[el.dataset.widget];
    if (!Cmp) return;
    const theme = el.dataset.theme === 'light' ? 'flare-mode' : 'dark-mode';
    el.classList.add('pw-widget', theme);
    createRoot(el).render(<Cmp theme={theme} />);
});
