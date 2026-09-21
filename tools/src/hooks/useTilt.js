import { useEffect, useRef } from 'react';

export const useTilt = (options = {}) => {
    const elRef = useRef(null);
    const { max = 15, perspective = 1000, scale = 1.05 } = options;

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = x - xc;
            const dy = y - yc;

            const rotateX = (dy / yc) * -max;
            const rotateY = (dx / xc) * max;

            el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        };

        const handleMouseLeave = () => {
            el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        };

        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [max, perspective, scale]);

    return elRef;
};
