import React from 'react';

const AnimatedBackground = ({ height }) => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden" style={{ background: '#070f09' }}>
            {/* Primary blob */}
            <div className="absolute w-[45%] h-[45%] -top-20 -left-16 rounded-full opacity-40 blur-3xl animate-mesh-1" />
            {/* Secondary blob */}
            <div className="absolute w-[35%] h-[35%] top-1/2 -right-16 rounded-full opacity-35 blur-3xl animate-mesh-2" />
            {/* Tertiary accent */}
            <div className="absolute w-[25%] h-[25%] bottom-0 left-1/2 rounded-full opacity-20 blur-2xl animate-mesh-3" />

            {/* Dot-grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #05AF2B 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            {/* Subtle top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#05AF2B]/40 to-transparent" />
        </div>
    );
};

export default AnimatedBackground;