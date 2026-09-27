import { lockScroll, reduceMotion, scrollToTarget, unlockScroll } from './smooth-scroll';

type Slide = {
	src: string;
	srcset: string;
	width: number;
	height: number;
	alt: string;
	video: { mp4: string; webm: string } | null;
};

const SWIPE_X = 60;
const SWIPE_DOWN = 110;
const CLOSE_MS = 240;

/**
 * Instagram-style post viewer for the events grid: tap a tile to open it full-screen, then
 * arrows / swipe / ← → keys to move through posts, and ✕ / Esc / tap outside / swipe down /
 * the browser's Back button to return to the grid. Each open post gets a #post-N history entry
 * so Back closes the viewer instead of leaving the page.
 */
export function initPostViewer() {
	const dialog = document.getElementById('post-viewer') as HTMLDialogElement | null;
	const data = document.getElementById('post-data');
	if (!dialog || !data || typeof dialog.showModal !== 'function') return;

	const slides = JSON.parse(data.textContent ?? '[]') as Slide[];
	const tiles = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-post]'));
	const stage = dialog.querySelector<HTMLElement>('[data-viewer-stage]');
	const figure = dialog.querySelector<HTMLElement>('[data-viewer-figure]');
	const img = dialog.querySelector<HTMLImageElement>('[data-viewer-img]');
	const video = dialog.querySelector<HTMLVideoElement>('[data-viewer-video]');
	const prevBtn = dialog.querySelector<HTMLButtonElement>('[data-viewer-prev]');
	const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-viewer-next]');
	const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-viewer-close]');
	const indexEl = dialog.querySelector<HTMLElement>('[data-viewer-index]');
	const dots = Array.from(dialog.querySelectorAll<HTMLElement>('.viewer-dot'));
	if (!slides.length || !stage || !figure || !img || !video || !prevBtn || !nextBtn || !closeBtn || !indexEl) return;

	let current = 0;
	let ownsHistoryEntry = false;
	let closing = false;

	const postHash = (i: number) => `#post-${i + 1}`;
	const indexFromHash = () => {
		const match = /^#post-(\d+)$/.exec(window.location.hash);
		const i = match ? Number(match[1]) - 1 : -1;
		return i >= 0 && i < slides.length ? i : -1;
	};

	const preload = (i: number) => {
		const slide = slides[i];
		if (!slide || slide.video) return;
		const image = new Image();
		image.sizes = '100vw';
		image.srcset = slide.srcset;
		image.src = slide.src;
	};

	const showVideo = (slide: Slide) => {
		img.hidden = true;
		img.removeAttribute('srcset');
		img.removeAttribute('src');
		video.hidden = false;
		video.setAttribute('aria-label', slide.alt);
		if (video.dataset.src !== slide.video!.mp4) {
			video.replaceChildren(
				Object.assign(document.createElement('source'), { src: slide.video!.webm, type: 'video/webm' }),
				Object.assign(document.createElement('source'), { src: slide.video!.mp4, type: 'video/mp4' }),
			);
			video.poster = slide.src;
			video.dataset.src = slide.video!.mp4;
			video.load();
		}
		if (!reduceMotion) video.play().catch(() => {});
	};

	const showImage = (slide: Slide) => {
		video.pause();
		video.hidden = true;
		img.hidden = false;
		img.alt = slide.alt;
		img.width = slide.width;
		img.height = slide.height;
		img.sizes = '(min-width: 1250px) 1088px, 100vw';
		img.srcset = slide.srcset;
		img.src = slide.src;
	};

	const render = (i: number, direction: 'next' | 'prev' | null) => {
		current = i;
		const slide = slides[i];
		if (slide.video) showVideo(slide);
		else showImage(slide);

		// Keep keyboard focus somewhere sensible when the focused arrow disappears at either end.
		const focused = document.activeElement;
		prevBtn.hidden = i === 0;
		nextBtn.hidden = i === slides.length - 1;
		if ((focused === prevBtn && prevBtn.hidden) || (focused === nextBtn && nextBtn.hidden)) {
			(prevBtn.hidden ? nextBtn : prevBtn).focus();
		}

		indexEl.textContent = String(i + 1);
		dots.forEach((dot, j) => dot.classList.toggle('is-active', j === i));

		if (direction) {
			figure.classList.remove('enter-next', 'enter-prev');
			void figure.offsetWidth;
			figure.classList.add(`enter-${direction}`);
		}

		preload(i + 1);
		preload(i - 1);
		if (ownsHistoryEntry) history.replaceState({ post: i }, '', postHash(i));
	};

	const go = (delta: number) => {
		const target = current + delta;
		if (target < 0 || target >= slides.length) return;
		render(target, delta > 0 ? 'next' : 'prev');
	};

	const open = (i: number, { pushHistory }: { pushHistory: boolean }) => {
		closing = false;
		dialog.classList.remove('is-closing');
		ownsHistoryEntry = false;
		render(i, null);
		dialog.showModal();
		lockScroll();
		if (pushHistory) history.pushState({ post: i }, '', postHash(i));
		ownsHistoryEntry = true;
	};

	/** Animate out, then close; the `close` event does the cleanup. */
	const requestClose = () => {
		if (!dialog.open || closing) return;
		closing = true;
		if (reduceMotion) {
			dialog.close();
			return;
		}
		dialog.classList.add('is-closing');
		window.setTimeout(() => dialog.close(), CLOSE_MS);
	};

	dialog.addEventListener('close', () => {
		closing = false;
		dialog.classList.remove('is-closing');
		figure.style.translate = '';
		figure.style.opacity = '';
		video.pause();
		unlockScroll();

		const tile = tiles[current];
		if (tile) {
			const rect = tile.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > window.innerHeight) scrollToTarget(tile, { immediate: true });
			tile.focus({ preventScroll: true });
		}

		if (ownsHistoryEntry) {
			ownsHistoryEntry = false;
			if (history.state?.post !== undefined) history.back();
		}
	});

	// Esc: use our animated close instead of the instant native one.
	dialog.addEventListener('cancel', (event) => {
		event.preventDefault();
		requestClose();
	});

	window.addEventListener('popstate', () => {
		const i = indexFromHash();
		if (dialog.open) {
			if (i === -1) {
				ownsHistoryEntry = false; // Back already removed our entry.
				requestClose();
			} else if (i !== current) {
				render(i, i > current ? 'next' : 'prev');
			}
		} else if (i !== -1) {
			open(i, { pushHistory: false });
		}
	});

	/* ---------- Opening from the grid ---------- */
	tiles.forEach((tile, i) => {
		tile.addEventListener('click', (event) => {
			// Cmd/Ctrl/Shift-click keeps the browser's "open image in new tab" behaviour.
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
			event.preventDefault();
			open(i, { pushHistory: true });
		});
	});

	/* ---------- Buttons, keys, trackpad ---------- */
	prevBtn.addEventListener('click', () => go(-1));
	nextBtn.addEventListener('click', () => go(1));
	closeBtn.addEventListener('click', requestClose);

	dialog.addEventListener('keydown', (event) => {
		if (event.target === video) return; // the video's own controls use the arrow keys
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			go(1);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			go(-1);
		}
	});

	let wheelLocked = false;
	dialog.addEventListener(
		'wheel',
		(event) => {
			if (Math.abs(event.deltaX) < 30 || Math.abs(event.deltaX) < Math.abs(event.deltaY) || wheelLocked) return;
			wheelLocked = true;
			go(event.deltaX > 0 ? 1 : -1);
			window.setTimeout(() => (wheelLocked = false), 500);
		},
		{ passive: true },
	);

	/* ---------- Swipe left/right to browse, swipe down to close ---------- */
	let startX = 0;
	let startY = 0;
	let axis: 'x' | 'y' | null = null;
	let pointerId: number | null = null;
	let dragged = false;

	const resetDrag = () => {
		figure.classList.remove('is-dragging');
		figure.style.translate = '';
		figure.style.opacity = '';
		axis = null;
		pointerId = null;
	};

	stage.addEventListener('pointerdown', (event) => {
		if (!event.isPrimary || (event.target as Element).closest('button')) return;
		if (event.pointerType === 'mouse' && (event.button !== 0 || event.target === video)) return;
		pointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		axis = null;
		dragged = false;
	});

	stage.addEventListener('pointermove', (event) => {
		if (event.pointerId !== pointerId) return;
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		if (!axis) {
			if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
			axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
			dragged = true;
			figure.classList.add('is-dragging');
			stage.setPointerCapture(event.pointerId);
		}
		if (axis === 'x') {
			// Resist at either end so it's clear there's nothing further that way.
			const atEdge = (dx > 0 && current === 0) || (dx < 0 && current === slides.length - 1);
			figure.style.translate = `${atEdge ? dx * 0.25 : dx}px 0`;
		} else if (dy > 0) {
			figure.style.translate = `0 ${dy}px`;
			figure.style.opacity = String(Math.max(0.35, 1 - dy / 400));
		}
	});

	const endDrag = (event: PointerEvent) => {
		if (event.pointerId !== pointerId) return;
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		const finishedAxis = axis;
		resetDrag();
		if (event.type === 'pointercancel') return;
		if (finishedAxis === 'x' && Math.abs(dx) > SWIPE_X) go(dx < 0 ? 1 : -1);
		else if (finishedAxis === 'y' && dy > SWIPE_DOWN) requestClose();
	};
	stage.addEventListener('pointerup', endDrag);
	stage.addEventListener('pointercancel', endDrag);

	// A tap on the dark area around the photo closes, like tapping outside a post.
	dialog.addEventListener('click', (event) => {
		if (dragged) {
			dragged = false;
			return;
		}
		if (!(event.target as Element).closest('button, img, video')) requestClose();
	});

	/* ---------- Deep link: /events/#post-3 opens that post ---------- */
	const initial = indexFromHash();
	if (initial !== -1) {
		history.replaceState(null, '', window.location.pathname + window.location.search);
		open(initial, { pushHistory: true });
	}
}
