import React from 'react';
import { useDevToolsDetection } from '../hooks/useDevToolsDetection';

/**
 * Shows a polite full-screen message whenever browser DevTools / inspect panel
 * is detected to be open. All page content is hidden behind this overlay so
 * nothing is inspectable while it is visible.
 */
const DevToolsOverlay: React.FC = () => {
    const devToolsOpen = useDevToolsDetection();

    if (!devToolsOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                color: '#fff',
                textAlign: 'center',
                padding: '2rem',
                userSelect: 'none',
                overflow: 'hidden',
                touchAction: 'none'
            }}
        >
            {/* Decorative dot */}
            <div
                style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#fff',
                    marginBottom: '2.5rem',
                    opacity: 0.6,
                }}
            />

            <p
                style={{
                    fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: '1.25rem',
                    fontWeight: 700,
                }}
            >
                Hey, curious one 👀
            </p>

            <h1
                style={{
                    fontSize: 'clamp(1.4rem, 4vw, 2.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    maxWidth: 640,
                    margin: '0 0 1.5rem',
                }}
            >
                Thanks for coming here.
            </h1>

            <p
                style={{
                    fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                    color: 'rgba(255,255,255,0.55)',
                    maxWidth: 480,
                    lineHeight: 1.7,
                    margin: '0 0 2.5rem',
                }}
            >
                <style>
                    {`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}
                </style>
                This work is crafted by{' '}
                <span style={{
                    fontFamily: "'Great Vibes', cursive",
                    color: '#fff',
                    fontSize: '2em',
                    fontWeight: 400,
                    letterSpacing: '1px',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    transform: 'translateY(-2px)'
                }}>
                    <span style={{ fontSize: '1.2em', marginLeft: '-2px', display: 'inline-block', transform: 'translateY(2px)' }}>K</span>uma<span style={{ fontSize: '1.2em', marginLeft: '-2px', display: 'inline-block', transform: 'translateY(6px)' }}>R</span>
                </span>.
                <br />
                Contact the main page for more details.
            </p>

            <a
                href="https://wa.me/919620020041?text=Hi%2C%20I%20am%20interested%20in%20your%20work."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-block',
                    padding: '0.75rem 2rem',
                    borderRadius: 9999,
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'background 0.3s, border-color 0.3s',
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)';
                }}
            >
                Go to main page
            </a>
        </div>
    );
};

export default DevToolsOverlay;
