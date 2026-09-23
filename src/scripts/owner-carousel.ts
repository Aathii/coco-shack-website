import { reduceMotion } from './smooth-scroll';

const AUTOPLAY_MS = 4500;
const RESUME_AFTER_MS = 7000;

/** Sleek single-image carousel: native scroll-snap for touch/drag, arrows + dots for clicks. */
export function initOwnerCarousel() {
	document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
		const track = root.querySelector<HTMLElement>('[data-carousel-track]');
		const slides = [...root.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
		const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]')];
		const prevBtn = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
		const nextBtn = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
		if (!track || slides.length < 2) return;

		let index = 0;
		let autoplayTimer = 0;
		let resumeTimer = 0;

		const goTo = (i: number, behavior: ScrollBehavior = 'smooth') => {
			index = (i + slides.length) % slides.length;
			track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior });
			dots.forEach((dot, di) => dot.setAttribute('aria-selected', String(di === index)));
		};

		const stopAutoplay = () => window.clearInterval(autoplayTimer);
		const startAutoplay = () => {
			stopAutoplay();
			if (reduceMotion) return;
			autoplayTimer = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS);
		};

		// Any user interaction pauses autoplay for a while rather than fighting the visitor's own swipe.
		const pauseThenResume = () => {
			stopAutoplay();
			window.clearTimeout(resumeTimer);
			resumeTimer = window.setTimeout(startAutoplay, RESUME_AFTER_MS);
		};

		prevBtn?.addEventListener('click', () => {
			goTo(index - 1);
			pauseThenResume();
		});
		nextBtn?.addEventListener('click', () => {
			goTo(index + 1);
			pauseThenResume();
		});
		dots.forEach((dot, i) =>
			dot.addEventListener('click', () => {
				goTo(i);
				pauseThenResume();
			}),
		);
		track.addEventListener('pointerdown', pauseThenResume, { passive: true });
		track.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowRight') {
				event.preventDefault();
				goTo(index + 1);
				pauseThenResume();
			} else if (event.key === 'ArrowLeft') {
				event.preventDefault();
				goTo(index - 1);
				pauseThenResume();
			}
		});

		// Keep the dots in sync when the visitor swipes/drags the track directly rather than using the controls.
		let scrollRaf = 0;
		track.addEventListener(
			'scroll',
			() => {
				cancelAnimationFrame(scrollRaf);
				scrollRaf = requestAnimationFrame(() => {
					const nearest = slides.reduce((best, slide, i) => {
						const dist = Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft);
						return dist < best.dist ? { i, dist } : best;
					}, { i: 0, dist: Infinity }).i;
					if (nearest !== index) {
						index = nearest;
						dots.forEach((dot, di) => dot.setAttribute('aria-selected', String(di === index)));
					}
				});
			},
			{ passive: true },
		);

		goTo(0, 'auto');
		startAutoplay();
	});
}
