import { site } from '../config/site';
import { lockScroll, unlockScroll } from './smooth-scroll';

declare global {
	interface Window {
		Calendly?: {
			initPopupWidget(options: {
				url: string;
				prefill?: { name?: string; email?: string };
				utm?: Record<string, string>;
			}): void;
		};
	}
}

const CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css';
const CALENDLY_JS = 'https://assets.calendly.com/assets/external/widget.js';
/** If the widget still hasn't arrived by then, go to the booking page instead of leaving the click hanging. */
const LOAD_TIMEOUT_MS = 6000;

let loader: Promise<void> | null = null;

/** Calendly's widget is only downloaded once someone heads for a "book a call" button. */
function loadCalendly(): Promise<void> {
	if (window.Calendly) return Promise.resolve();
	loader ??= new Promise<void>((resolve, reject) => {
		const fail = () => {
			loader = null;
			reject(new Error('Calendly failed to load'));
		};

		if (!document.querySelector(`link[href="${CALENDLY_CSS}"]`)) {
			const style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = CALENDLY_CSS;
			document.head.appendChild(style);
		}

		const script = document.createElement('script');
		script.src = CALENDLY_JS;
		script.async = true;
		script.onload = () => (window.Calendly ? resolve() : fail());
		script.onerror = () => {
			script.remove();
			fail();
		};
		document.head.appendChild(script);
	});
	return loader;
}

function withTimeout(promise: Promise<void>, ms: number) {
	return new Promise<void>((resolve, reject) => {
		const timer = window.setTimeout(() => reject(new Error('Timed out')), ms);
		promise.then(resolve, reject).finally(() => window.clearTimeout(timer));
	});
}

/** Calendly has no "closed" event, so keep the page behind the popup still until its overlay leaves the DOM. */
function holdScrollWhileOpen() {
	if (!document.querySelector('.calendly-overlay')) return;
	lockScroll();
	const observer = new MutationObserver(() => {
		if (document.querySelector('.calendly-overlay')) return;
		observer.disconnect();
		unlockScroll();
	});
	observer.observe(document.body, { childList: true, subtree: true });
}

export async function openCalendly(prefill: { name?: string; email?: string } = {}) {
	const url = site.booking.calendlyUrl;
	if (!url) return;
	try {
		await withTimeout(loadCalendly(), LOAD_TIMEOUT_MS);
		window.Calendly?.initPopupWidget({ url, prefill, utm: { utmSource: 'website' } });
		holdScrollWhileOpen();
	} catch {
		// Blocked by a content blocker or too slow: open the booking page itself. A same-tab
		// navigation can't be swallowed by a popup blocker the way a late window.open() can.
		location.assign(url);
	}
}

export function initCalendlyButtons() {
	if (!site.booking.calendlyUrl) return;

	// Start fetching the widget as soon as a pointer or keyboard focus lands on a trigger.
	const prefetch = (event: Event) => {
		if (!(event.target as Element | null)?.closest?.('[data-calendly]')) return;
		document.removeEventListener('pointerover', prefetch);
		document.removeEventListener('focusin', prefetch);
		loadCalendly().catch(() => {});
	};
	document.addEventListener('pointerover', prefetch, { passive: true });
	document.addEventListener('focusin', prefetch);

	document.addEventListener('click', async (event) => {
		const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-calendly]');
		if (!trigger) return;
		// Let cmd/ctrl/shift-click open the booking page in a new tab or window as usual.
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		if (trigger.getAttribute('aria-busy') === 'true') return;

		trigger.setAttribute('aria-busy', 'true');
		try {
			await openCalendly({
				name: trigger.dataset.prefillName || undefined,
				email: trigger.dataset.prefillEmail || undefined,
			});
		} finally {
			trigger.removeAttribute('aria-busy');
		}
	});
}
