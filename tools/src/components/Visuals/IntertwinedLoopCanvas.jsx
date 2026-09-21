import React, { useRef, useEffect, useState } from 'react';

const QuadrantDisk = ({ size = 400, direction = 1, color = '#64b4ff', prefix = "More ", onHover }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const hoveredRef = useRef(null);
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const onHoverRef = useRef(onHover);

    useEffect(() => {
        onHoverRef.current = onHover;
    }, [onHover]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        let isVisible = false;

        const padding = size * 0.15;
        const totalSize = size + padding;

        canvas.width = totalSize * dpr;
        canvas.height = totalSize * dpr;
        canvas.style.width = `${totalSize}px`;
        canvas.style.height = `${totalSize}px`;
        ctx.scale(dpr, dpr);

        const cx = totalSize / 2;
        const cy = totalSize / 2;
        const r_disk = size / 2;
        const r_orbit = r_disk + (size * 0.055);

        const drawQuadrant = (idx, startAngle, endAngle, baseColor, label, currentHover) => {
            const isHovered = currentHover === idx;
            const isFocusMode = currentHover !== null;
            const opacity = isHovered ? 1 : (isFocusMode ? 0.35 : 0.9);

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r_disk, startAngle, endAngle);
            ctx.closePath();

            // Apply dynamic opacity for "Focus Mode"
            const fillColor = baseColor.replace('0.95', opacity).replace('0.85', opacity).replace('0.9', opacity);
            ctx.fillStyle = fillColor;
            ctx.fill();

            ctx.strokeStyle = `rgba(255,255,255,${isHovered ? 0.6 : 0.2})`;
            ctx.lineWidth = isHovered ? Math.max(1, size * 0.005) : Math.max(0.5, size * 0.0025);
            ctx.stroke();

            const fontSize = Math.max(10, Math.floor(size * 0.045));
            ctx.fillStyle = `rgba(255,255,255,${isHovered ? 1 : 0.7})`;
            ctx.font = `${isHovered ? 700 : 600} ${fontSize}px "Inter", sans-serif`;
            ctx.textAlign = 'center';
            const textAngle = startAngle + (endAngle - startAngle) / 2;
            const textR = r_disk * 0.55;
            ctx.fillText(label, cx + Math.cos(textAngle) * textR, cy + Math.sin(textAngle) * textR + (fontSize * 0.33));
        };

        const drawArrow = (angle, currentHover) => {
            const isFocusMode = currentHover !== null;
            const tailSegments = 70;
            const intensity = isFocusMode ? 1.0 : 0.0; // Ignite ONLY on hover

            if (!isFocusMode) return; // Skip drawing entirely if not active for extra performance and perfect invisibility

            for (let i = 0; i < tailSegments; i++) {
                const segmentAngle = angle - (i * 0.02 * direction);
                const opacity = Math.max(0, 1 - (i / tailSegments)) * intensity;
                ctx.beginPath();
                ctx.arc(cx, cy, r_orbit, segmentAngle - (0.02 * direction), segmentAngle, direction === -1);
                ctx.strokeStyle = `${color}${Math.floor(opacity * 200).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = (size * 0.00875) - (i * (size * 0.0001));
                if (isFocusMode) ctx.lineWidth *= 1.2;
                ctx.stroke();
            }

            const ax = cx + Math.cos(angle) * r_orbit;
            const ay = cy + Math.sin(angle) * r_orbit;
            const headSize = size * 0.0225 * (isFocusMode ? 1.2 : 1.0);

            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(angle + (Math.PI / 2) * direction);
            ctx.beginPath();
            ctx.moveTo(-headSize * 0.9, -headSize * 0.8);
            ctx.lineTo(headSize, 0);
            ctx.lineTo(-headSize * 0.9, headSize * 0.8);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.shadowBlur = size * (isFocusMode ? 0.05 : 0.03);
            ctx.shadowColor = color;
            ctx.fill();
            ctx.restore();
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) - cx;
            const y = (e.clientY - rect.top) - cy;
            const dist = Math.sqrt(x * x + y * y);

            if (dist <= r_disk) {
                let angle = Math.atan2(y, x);
                let idx = -1;
                let label = "";

                if (angle >= -Math.PI && angle < -Math.PI / 2) {
                    idx = 0;
                    label = `Cause: ${prefix}Employment → Effect: ${prefix}Income`;
                } else if (angle >= -Math.PI / 2 && angle < 0) {
                    idx = 1;
                    label = `Cause: ${prefix}Income → Effect: ${prefix}Consumption`;
                } else if (angle >= 0 && angle < Math.PI / 2) {
                    idx = 2;
                    label = `Cause: ${prefix}Consumption → Effect: ${prefix}Production`;
                } else {
                    idx = 3;
                    label = `Cause: ${prefix}Production → Effect: ${prefix}Employment`;
                }

                if (hoveredRef.current !== idx) {
                    hoveredRef.current = idx;
                    setHoveredIdx(idx);
                    if (onHoverRef.current) onHoverRef.current({ label, color });
                }
            } else {
                if (hoveredRef.current !== null) {
                    hoveredRef.current = null;
                    setHoveredIdx(null);
                    if (onHoverRef.current) onHoverRef.current({ label: null, color: null });
                }
            }
        };

        const handleMouseLeave = () => {
            hoveredRef.current = null;
            setHoveredIdx(null);
            if (onHoverRef.current) onHoverRef.current({ label: null, color: null });
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const animate = (time) => {
            if (!isVisible) return;
            ctx.clearRect(0, 0, totalSize, totalSize);

            // Draw Quadrants with updated focus logic
            const currentHover = hoveredRef.current;
            drawQuadrant(0, -Math.PI, -Math.PI / 2, 'rgba(120, 120, 120, 0.85)', 'Income', currentHover);
            drawQuadrant(1, -Math.PI / 2, 0, 'rgba(45, 95, 150, 0.95)', 'Consumption', currentHover);
            drawQuadrant(2, 0, Math.PI / 2, 'rgba(215, 105, 50, 0.95)', 'Production', currentHover);
            drawQuadrant(3, Math.PI / 2, Math.PI, 'rgba(80, 80, 80, 0.85)', 'Employment', currentHover);

            // Directional Pulse: Velocity boost on hover
            const speed = currentHover !== null ? 1.4 : 0.8;
            const angleByTime = (time * 0.001 * speed * direction) % (Math.PI * 2);

            drawArrow(angleByTime, currentHover);
            requestRef.current = requestAnimationFrame(animate);
        };

        const intersectionObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isVisible = entry.isIntersecting;
            if (isVisible) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(requestRef.current);
            }
        }, { threshold: 0.1 });

        intersectionObserver.observe(canvas);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            intersectionObserver.disconnect();
        };
    }, [size, direction, color, prefix]);

    return <canvas ref={canvasRef} className="rounded-circle" style={{ overflow: 'visible', cursor: 'pointer' }} />;
};

const IntertwinedLoopCanvas = () => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [activeInfo, setActiveInfo] = useState({ label: null, color: '#64b4ff' });
    const [dynamicTitle, setDynamicTitle] = useState('Economic Feedback Loops');

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setScale(width / 1100);
            }
        };
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) observer.observe(containerRef.current);
        updateScale();
        return () => observer.disconnect();
    }, []);

    const diskSize = 400 * scale;
    const horizontalOffset = 17.5 * scale;

    const handleHover = (info, type = null) => {
        if (info.label !== activeInfo.label) {
            setActiveInfo(info);
            if (info.label) {
                setDynamicTitle(type === 'positive' ? 'Positive Feedback Loop' : 'Negative Feedback Loop');
            } else {
                setDynamicTitle('Economic Feedback Loops');
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="intertwined-loop-wrapper mx-auto position-relative"
            style={{ maxWidth: '1100px', overflow: 'visible', paddingTop: '50px', paddingBottom: '80px' }}
        >
            {/* Contextual Dynamic Title */}
            <div
                className="position-absolute w-100 text-center transition-all duration-500"
                style={{
                    top: '10px',
                    opacity: 0.9,
                    zIndex: 20
                }}
            >
                <div
                    className="nav-label mb-0 uppercase tracking-widest fw-bold"
                    style={{
                        fontSize: '1.2rem',
                        color: activeInfo.label ? activeInfo.color : '#ffffff',
                        filter: activeInfo.label ? `drop-shadow(0 0 10px ${activeInfo.color}66)` : 'none',
                        transition: 'all 0.4s ease'
                    }}
                >
                    {dynamicTitle}
                </div>
            </div>

            {/* Anchored Image and Interactive Overlay Container */}
            <div className="position-relative w-100">
                <img
                    src="assets/img/blank_loop.png"
                    alt="Intertwined Loop"
                    className="w-100 d-block"
                    style={{ opacity: 0.9 }}
                />

                <div className="position-absolute top-0 start-0 w-100 h-100">
                    <div className="row h-100 g-0">
                        <div className="col-6 d-flex align-items-center justify-content-center">
                            <div className="transition-transform hover-scale" style={{ transform: `translateX(${horizontalOffset}px)` }}>
                                <QuadrantDisk
                                    size={diskSize}
                                    direction={1}
                                    color="#64b4ff"
                                    prefix="More "
                                    onHover={(info) => handleHover(info, 'positive')}
                                />
                            </div>
                        </div>

                        <div className="col-6 d-flex align-items-center justify-content-center">
                            <div className="transition-transform hover-scale" style={{ transform: `translateX(-${horizontalOffset}px)` }}>
                                <QuadrantDisk
                                    size={diskSize}
                                    direction={1}
                                    color="#ff9664"
                                    prefix="Lower "
                                    onHover={(info) => handleHover(info, 'negative')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Hover Label - POSITIONED BELOW CANVAS */}
            <div
                className={`position-absolute w-100 text-center transition-all duration-500`}
                style={{
                    bottom: '10px',
                    opacity: activeInfo.label ? 1 : 0,
                    transform: `translateY(${activeInfo.label ? 0 : -20}px)`,
                    zIndex: 20
                }}
            >
                <div
                    className="d-inline-block glass-card px-4 py-2 rounded-pill shadow-lg transition-all duration-300"
                    style={{
                        background: 'rgba(13, 22, 41, 0.8)',
                        border: `1px solid ${activeInfo.color || '#64b4ff'}`,
                        boxShadow: `0 0 25px ${activeInfo.color}44`
                    }}
                >
                    <span className="h4 fw-bold text-white mb-0" style={{ letterSpacing: '1px' }}>
                        {activeInfo.label}
                    </span>
                </div>
            </div>

            <style jsx>{`
                .hover-scale {
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .hover-scale:hover {
                    transform: scale(1.05) translateX(${horizontalOffset}px) !important;
                }
                .col-6:last-child .hover-scale:hover {
                    transform: scale(1.05) translateX(-${horizontalOffset}px) !important;
                }
                .transition-transform {
                    transition: transform 0.3s ease;
                }
                .duration-500 {
                    transition-duration: 0.5s;
                }
                .duration-300 {
                    transition-duration: 0.3s;
                }
            `}</style>
        </div>
    );
};

export default IntertwinedLoopCanvas;
