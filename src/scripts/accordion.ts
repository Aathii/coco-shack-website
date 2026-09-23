import { reduceMotion } from './smooth-scroll';

/** Smooth open/close for <details data-accordion>, keeping native keyboard and no-JS behaviour. */
export function initAccordion() {
	document.querySelectorAll<HTMLDetailsElement>('details[data-accordion]').forEach((details) => {
		const summary = details.querySelector('summary');
		const content = details.querySelector<HTMLElement>('[data-accordion-content]');
		if (!summary || !content || reduceMotion) return;

		let animation: Animation | null = null;

		summary.addEventListener('click', (event) => {
			event.preventDefault();
			// Cancelling a still-running animation snaps `content` back to its natural (auto) height —
			// reading offsetHeight below always sees that real value, never a mid-flight one.
			animation?.cancel();
			content.style.overflow = 'hidden';

			// Decided fresh on every click, not read back off `details.open` inside a stale onfinish —
			// that way a rapid re-click (which cancels the previous animation before its onfinish runs)
			// can never leave the open attribute, the icon rotation and the visible height disagreeing.
			const opening = !details.open;

			if (opening) {
				details.classList.remove('is-closing');
				details.open = true;
				animation = content.animate(
					{ height: ['0px', `${content.offsetHeight}px`], opacity: [0, 1] },
					{ duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
				);
			} else {
				details.classList.add('is-closing');
				animation = content.animate(
					{ height: [`${content.offsetHeight}px`, '0px'], opacity: [1, 0] },
					// fill: 'forwards' holds height/opacity at the final frame once playback ends — without it,
					// a finished animation's effect is removed and the box reverts to its natural (auto) height,
					// flashing back open for a frame before `details.open = false` below takes it out of flow.
					{ duration: 380, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
				);
			}

			animation.onfinish = () => {
				if (!opening) {
					details.open = false;
					details.classList.remove('is-closing');
				}
				content.style.overflow = '';
				// Left playing (not cancelled): its forwards fill is what keeps the box collapsed at
				// height 0 between now and whenever the next click cancels it to start a fresh animation.
				animation = null;
			};
		});
	});
}
