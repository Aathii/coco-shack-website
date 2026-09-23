import { reduceMotion } from './smooth-scroll';

/** Desktop-only pointer effects: card spotlights and gently magnetic CTAs. */
export function initPointerFx() {
	if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

	document.querySelectorAll<HTMLElement>('.spotlight').forEach((card) => {
		card.addEventListener('pointermove', (event) => {
			const rect = card.getBoundingClientRect();
			card.style.setProperty('--sx', `${event.clientX - rect.left}px`);
			card.style.setProperty('--sy', `${event.clientY - rect.top}px`);
		});
	});

	document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((button) => {
		const strength = 0.25;
		button.addEventListener('pointermove', (event) => {
			const rect = button.getBoundingClientRect();
			const x = event.clientX - (rect.left + rect.width / 2);
			const y = event.clientY - (rect.top + rect.height / 2);
			button.style.setProperty('--mx', `${(x * strength).toFixed(1)}px`);
			button.style.setProperty('--my', `${(y * strength).toFixed(1)}px`);
		});
		button.addEventListener('pointerleave', () => {
			button.style.setProperty('--mx', '0px');
			button.style.setProperty('--my', '0px');
		});
	});
}
