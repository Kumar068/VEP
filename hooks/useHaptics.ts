import { useCallback, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// iOS detection
// ─────────────────────────────────────────────────────────────────────────────
const isIOS = () =>
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

// ─────────────────────────────────────────────────────────────────────────────
// iOS Haptic Fallback
//
// iOS Safari has no Vibration API. However, on iOS 18+ a
// <input type="checkbox" switch> fires the Taptic Engine when toggled.
// We create a hidden switch + label and programmatically click the label
// each time we need a haptic pulse.
//
// For older iOS versions, we fall back to a short AudioContext buzz so the
// user still gets *some* tactile feedback through the speakers.
// ─────────────────────────────────────────────────────────────────────────────

let iosSwitchEl: HTMLInputElement | null = null;
let iosLabelEl: HTMLLabelElement | null = null;
let iosAudioCtx: AudioContext | null = null;

function ensureIOSSwitch() {
    if (iosSwitchEl) return;

    // Hidden checkbox with the non-standard `switch` attribute
    iosSwitchEl = document.createElement("input");
    iosSwitchEl.type = "checkbox";
    iosSwitchEl.setAttribute("switch", "");
    iosSwitchEl.id = "__ios_haptic_switch";
    iosSwitchEl.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;";

    iosLabelEl = document.createElement("label");
    iosLabelEl.htmlFor = "__ios_haptic_switch";
    iosLabelEl.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;";

    document.body.appendChild(iosSwitchEl);
    document.body.appendChild(iosLabelEl);
}

/** Trigger iOS Taptic Engine via the switch-checkbox trick (iOS 18+). */
function triggerIOSSwitch() {
    ensureIOSSwitch();
    iosLabelEl?.click();
}

/**
 * Audio-based fallback for older iOS (<18) or if the switch trick fails.
 * Plays a very short, low-frequency oscillator burst that creates a subtle
 * speaker "thud" on the device.
 */
function triggerIOSAudio(durationMs = 30) {
    try {
        if (!iosAudioCtx) {
            iosAudioCtx = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
        }
        const ctx = iosAudioCtx;
        if (ctx.state === "suspended") ctx.resume();

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 150; // low rumble
        gain.gain.value = 0; // muted — keeps audio pipeline alive for haptics

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + durationMs / 1000);
    } catch {
        // Silently fail — audio not available
    }
}

/** Combined iOS haptic: tries switch trick first, then audio. */
function triggerIOSHaptic(durationMs?: number) {
    triggerIOSSwitch();
    triggerIOSAudio(durationMs);
}

function cleanupIOS() {
    iosSwitchEl?.remove();
    iosLabelEl?.remove();
    iosSwitchEl = null;
    iosLabelEl = null;
    if (iosAudioCtx) {
        iosAudioCtx.close().catch(() => { });
        iosAudioCtx = null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset → duration mapping for iOS
// ─────────────────────────────────────────────────────────────────────────────
const IOS_PRESET_DURATION: Record<string, number> = {
    success: 40,
    nudge: 25,
    error: 50,
    buzz: 80,
};

// ─────────────────────────────────────────────────────────────────────────────
// Exported hook
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Preset → duration mapping for Android/Desktop (navigator.vibrate)
// ─────────────────────────────────────────────────────────────────────────────
const ANDROID_PRESET_PATTERN: Record<string, number | number[]> = {
    success: [10, 30, 20], // short double buzz for success
    nudge: 15,             // single light tap
    error: [30, 40, 30],   // heavier double buzz
    buzz: 80,              // longer single buzz
};

/**
 * Centralised haptics wrapper.
 * - Android / desktop: uses native navigator.vibrate() API.
 * - iOS: uses the switch-checkbox Taptic Engine trick (iOS 18+) combined
 *   with a short AudioContext buzz as an additional fallback.
 */
export function useHaptics() {
    const onIOS = useRef(false);

    useEffect(() => {
        onIOS.current = isIOS();
        if (onIOS.current) ensureIOSSwitch();
        return () => {
            if (onIOS.current) cleanupIOS();
        };
    }, []);

    const triggerAndroidHaptic = useCallback((input?: any) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            let pattern: number | number[] = 20; // default conservative tap

            if (typeof input === 'string' && ANDROID_PRESET_PATTERN[input]) {
                pattern = ANDROID_PRESET_PATTERN[input];
            } else if (typeof input === 'number' || Array.isArray(input)) {
                pattern = input;
            }

            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Ignore DOMExceptions if user hasn't interacted with page yet
            }
        }
    }, []);

    const trigger = useCallback(
        (input?: any) => {
            if (onIOS.current) {
                // Resolve iOS duration
                let duration: number | undefined;
                if (typeof input === "string") {
                    duration = IOS_PRESET_DURATION[input];
                } else if (typeof input === "number") {
                    duration = input;
                }
                triggerIOSHaptic(duration);
            } else {
                // Trigger Android vibration
                triggerAndroidHaptic(input);
            }
        },
        [triggerAndroidHaptic]
    );

    const cancel = useCallback(() => {
        if (!onIOS.current && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(0);
        }
    }, []);

    return { trigger, cancel };
}
