import { useEffect, useState } from 'react';

/**
 * Detects whether the browser DevTools panel is currently open.
 *
 * Strategy 1 – window size delta (works for docked DevTools):
 *   When DevTools is docked to the side, window.outerWidth - window.innerWidth
 *   grows significantly. When docked to the bottom, outerHeight - innerHeight grows.
 *
 * Strategy 2 – console timing trick (works for detached/undocked DevTools):
 *   DevTools intercepts console.log calls and formats objects. toString() on a
 *   custom object with a getter is called immediately in devtools but not in normal
 *   execution, so we can measure the time delta to detect it.
 *
 * Both strategies are polled every 500 ms so the overlay appears/disappears in
 * near-real-time as the user opens or closes DevTools.
 */
export function useDevToolsDetection(): boolean {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const THRESHOLD = 160; // px — typical DevTools panel minimum width/height

        function checkBySize(): boolean {
            return (
                window.outerWidth - window.innerWidth > THRESHOLD ||
                window.outerHeight - window.innerHeight > THRESHOLD
            );
        }

        function checkByConsole(): boolean {
            let detected = false;
            const obj = new Proxy(
                {},
                {
                    has() {
                        detected = true;
                        return false;
                    },
                }
            );
            // DevTools auto-calls toString/toPrimitive on objects logged via console
            // eslint-disable-next-line no-console
            console.log('%c', obj);
            return detected;
        }

        function detect() {
            const open = checkBySize() || checkByConsole();
            setIsOpen(open);
        }

        detect(); // run immediately on mount
        const id = setInterval(detect, 500);
        window.addEventListener('resize', detect);

        return () => {
            clearInterval(id);
            window.removeEventListener('resize', detect);
        };
    }, []);

    return isOpen;
}
