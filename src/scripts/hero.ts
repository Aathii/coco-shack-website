import { onResize, onScroll, reduceMotion } from './smooth-scroll';

/**
 * Drives the hero's "walk up to the booth" moment: as the visitor scrolls, the photo pushes in,
 * the copy lifts away and the badge grows and glows toward the centre — then the page content
 * slides up over the pinned stage. Exposes progress to CSS as `--p` (0 → 1).
 */
export function initHero() {
	const stage = document.getElementById('hero-stage');
	const spacer = document.getElementById('hero-spacer');
	const badgeAnchor = document.querySelector<HTMLElement>('[data-hero-badge-anchor]');
	if (!stage || !spacer) return;

	// Reduced motion: keep Andrew's photo as the resting background instead of cutting to a looping
	// video (the inline script in Hero.astro already leaves the video source-less in this case, so
	// this is a defensive backstop). Otherwise, this is the fallback if the video errors out
	// (slow connection, unsupported codec).
	const video = document.getElementById('hero-video') as HTMLVideoElement | null;
	if (video) {
		if (reduceMotion) {
			stage.classList.add('no-hero-video');
			video.pause();
			video.removeAttribute('autoplay');
		} else {
			video.addEventListener('error', () => stage.classList.add('no-hero-video'));
		}
	}

	let spacerHeight = 0;
	let range = 1;

	const measure = () => {
		spacerHeight = spacer.offsetHeight;
		range = Math.max(spacerHeight - window.innerHeight, 1);
		if (badgeAnchor) {
			const rect = badgeAnchor.getBoundingClientRect();
			const shift = window.innerHeight / 2 - (rect.top + rect.height / 2);
			stage.style.setProperty('--badge-shift', `${shift.toFixed(1)}px`);
		}
	};

	const update = (y: number) => {
		if (!reduceMotion) {
			const progress = Math.min(Math.max(y / range, 0), 1);
			stage.style.setProperty('--p', progress.toFixed(4));
			// Faded-out copy shouldn't still catch clicks or keyboard focus.
			stage.classList.toggle('copy-gone', progress > 0.42);
		}
		// Once the content card fully covers the stage, stop painting it.
		stage.classList.toggle('is-covered', y >= spacerHeight - 1);
	};

	measure();
	onScroll(update);
	onResize(() => {
		measure();
		update(window.scrollY);
	});
	// Web fonts change the headline height, which moves the badge — re-measure once they land.
	document.fonts?.ready.then(() => {
		measure();
		update(window.scrollY);
	});
}
