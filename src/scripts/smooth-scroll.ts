import Lenis from 'lenis';

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

/* One shared scroll listener, batched to animation frames, feeds every scroll effect. */
const scrollListeners: ((y: number) => void)[] = [];
let scrollQueued = false;

window.addEventListener(
	'scroll',
	() => {
		if (scrollQueued) return;
		scrollQueued = true;
		requestAnimationFrame(() => {
			scrollQueued = false;
			const y = window.scrollY;
			for (const cb of scrollListeners) cb(y);
		});
	},
	{ passive: true },
);

export function onScroll(cb: (y: number) => void) {
	scrollListeners.push(cb);
	cb(window.scrollY);
}

const resizeListeners: (() => void)[] = [];
let resizeTimer = 0;

window.addEventListener('resize', () => {
	window.clearTimeout(resizeTimer);
	resizeTimer = window.setTimeout(() => resizeListeners.forEach((cb) => cb()), 120);
});

export function onResize(cb: () => void) {
	resizeListeners.push(cb);
}

/** Lenis and native scrolling both honour `scroll-padding-top` on <html>, so targets clear the header. */
export function scrollToTarget(target: HTMLElement | number, { immediate = false } = {}) {
	if (lenis) {
		// A native scroll (keyboard focus, find-in-page…) can land a frame before Lenis hears
		// about it; re-sync first so the target isn't computed from a stale position.
		if (!lenis.isScrolling) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
		lenis.scrollTo(target, { immediate, force: true, duration: 1.3 });
		return;
	}
	const behavior = immediate || reduceMotion ? 'auto' : 'smooth';
	if (typeof target === 'number') window.scrollTo({ top: target, behavior });
	else target.scrollIntoView({ block: 'start', behavior });
}

export function lockScroll() {
	lenis?.stop();
	document.documentElement.classList.add('scroll-locked');
}

export function unlockScroll() {
	lenis?.start();
	document.documentElement.classList.remove('scroll-locked');
}

function initAnchorLinks() {
	document.addEventListener('click', (event) => {
		if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
		if (!link) return;

		const hash = link.getAttribute('href') ?? '';
		const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
		if (!target) return;

		event.preventDefault();
		scrollToTarget(hash === '#top' ? 0 : target);
		history.replaceState(null, '', hash === '#top' ? location.pathname + location.search : hash);

		// Move focus for keyboard and screen-reader users without a second jump.
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
	});
}

export function initSmoothScroll() {
	if (!reduceMotion) {
		lenis = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true });
	}
	initAnchorLinks();
}
