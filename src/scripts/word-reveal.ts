import { onScroll, reduceMotion } from './smooth-scroll';

/** Lights up a statement word by word as it scrolls through the viewport. */
export function initWordReveal() {
	document.querySelectorAll<HTMLElement>('[data-word-reveal]').forEach((block) => {
		const words = Array.from(block.querySelectorAll<HTMLElement>('.w'));
		if (!words.length) return;

		if (reduceMotion) {
			words.forEach((w) => (w.style.opacity = '1'));
			return;
		}

		let inView = false;
		const update = () => {
			const rect = block.getBoundingClientRect();
			const vh = window.innerHeight;
			const start = vh * 0.85;
			const end = vh * 0.35;
			const progress = Math.min(Math.max((start - rect.top) / (rect.height + start - end), 0), 1);
			const lit = progress * (words.length + 2);
			words.forEach((w, i) => {
				const amount = Math.min(Math.max(lit - i, 0), 1);
				w.style.opacity = (0.16 + amount * 0.84).toFixed(3);
			});
		};

		new IntersectionObserver(([entry]) => {
			inView = entry.isIntersecting;
			if (inView) update();
		}, { rootMargin: '15% 0px' }).observe(block);

		onScroll(() => {
			if (inView) update();
		});
	});
}
