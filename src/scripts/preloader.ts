import { reduceMotion } from './smooth-scroll';

/**
 * Shows the coconut mark just long enough to feel intentional, never long enough to feel like
 * a gate: a fixed minimum so it isn't an imperceptible flash, a fixed maximum so a slow font/video
 * load can never strand it, and it prefers whichever of (fonts ready, minimum time) finishes last.
 */
const MIN_MS = reduceMotion ? 0 : 550;
const MAX_MS = 1400;

export function initPreloader() {
	const el = document.getElementById('preloader');
	if (!el) return;

	const start = performance.now();
	let done = false;

	const hide = () => {
		if (done) return;
		done = true;
		el.classList.add('is-hidden');
		el.addEventListener('transitionend', () => el.remove(), { once: true });
		// Belt and suspenders: guarantee removal even if the transition never fires (e.g. display:none elsewhere).
		setTimeout(() => el.remove(), 500);
	};

	const ready = Promise.race([
		document.fonts?.ready ?? Promise.resolve(),
		new Promise((resolve) => setTimeout(resolve, MAX_MS)),
	]);

	ready.then(() => {
		const elapsed = performance.now() - start;
		setTimeout(hide, Math.max(0, MIN_MS - elapsed));
	});

	// Absolute ceiling regardless of what `ready` is waiting on.
	setTimeout(hide, MAX_MS);
}
