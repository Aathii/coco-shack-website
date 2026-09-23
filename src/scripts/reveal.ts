import { reduceMotion } from './smooth-scroll';

/** Fades/clips elements marked `data-reveal` into view, staggering siblings that enter together. */
export function initReveal() {
	const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
	if (!elements.length) return;

	if (reduceMotion || !('IntersectionObserver' in window)) {
		elements.forEach((el) => el.classList.add('is-in'));
		return;
	}

	const siblings = new Map<Element | null, HTMLElement[]>();
	for (const el of elements) {
		const group = siblings.get(el.parentElement) ?? [];
		group.push(el);
		siblings.set(el.parentElement, group);
	}
	siblings.forEach((group) => {
		group.forEach((el, i) => {
			if (!el.style.getPropertyValue('--reveal-delay')) {
				el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 85}ms`);
			}
		});
	});

	const reveal = (el: Element) => {
		if (el.classList.contains('is-in')) return;
		el.classList.add('is-in');
		observer.unobserve(el);
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				reveal(entry.target);
				// Siblings on the same visual row come in together (card rows, swipe rails whose
				// next card only peeks in), cascading via their stagger delays.
				const top = entry.target.getBoundingClientRect().top;
				for (const sibling of siblings.get(entry.target.parentElement) ?? []) {
					if (Math.abs(sibling.getBoundingClientRect().top - top) < 24) reveal(sibling);
				}
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
	);

	elements.forEach((el) => observer.observe(el));
}
