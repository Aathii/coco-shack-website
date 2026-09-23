import { scrollToTarget } from './smooth-scroll';

/**
 * Multi-step booking form.
 * - With site.booking.web3formsKey set, requests are emailed to the owner and the visitor sees a confirmation.
 * - Without it, the visitor gets their finished request to send themselves: we open their email app
 *   (if site.contact.email is set) and offer a copy-ready version for email or an Instagram DM.
 * "Request received" is only ever shown after a real delivery, and the draft is kept until then.
 */

type Booking = {
	name: string;
	email: string;
	phone: string;
	eventType: string;
	eventDate: string;
	guests: string;
	location: string;
	stations: string[];
	branding: string;
	serviceTime: string;
	budget: string;
	message: string;
	referral: string;
};

const DRAFT_KEY = 'coco-booking-draft';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function prettyDate(iso: string) {
	if (!iso) return '';
	const [y, m, d] = iso.split('-').map(Number);
	if (!y || !m || !d) return iso;
	return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
		weekday: 'short',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function summaryLines(b: Booking) {
	return [
		`Event: ${b.eventType}`,
		`Date: ${prettyDate(b.eventDate) || 'Not set yet'}`,
		`Guests: ${b.guests}`,
		`Location: ${b.location || '—'}`,
		`Stations: ${b.stations.join(', ')}`,
		`Branded coconuts: ${b.branding}`,
		`Service time: ${b.serviceTime || '—'}`,
		`Budget for the bar: ${b.budget || '—'}`,
		'',
		`Name: ${b.name}`,
		`Email: ${b.email}`,
		`Phone: ${b.phone || '—'}`,
		`Heard about us: ${b.referral || '—'}`,
		`Notes: ${b.message || '—'}`,
	];
}

function subjectFor(b: Booking) {
	return `${b.eventType}${b.eventDate ? `, ${prettyDate(b.eventDate)}` : ''} — ${b.name}`;
}

function setButtonLabel(button: Element, label: string) {
	button.querySelectorAll('.btn-roll-inner > span').forEach((span) => (span.textContent = label));
}

export function initBookingForm() {
	const form = document.getElementById('booking-form') as HTMLFormElement | null;
	const card = document.getElementById('booking-card');
	const success = document.getElementById('booking-success');
	const handoff = document.getElementById('booking-handoff');
	if (!form || !card || !success || !handoff) return;

	const steps = Array.from(form.querySelectorAll<HTMLElement>('[data-step]'));
	const backButton = form.querySelector<HTMLButtonElement>('[data-action="back"]');
	const nextButton = form.querySelector<HTMLButtonElement>('[data-action="next"]');
	const submitButton = form.querySelector<HTMLButtonElement>('[data-action="submit"]');
	const alertBox = form.querySelector<HTMLElement>('[data-form-alert]');
	const stepCount = form.querySelector<HTMLElement>('[data-step-count]');
	const stepName = form.querySelector<HTMLElement>('[data-step-name]');
	const bars = Array.from(form.querySelectorAll<HTMLElement>('[data-progress-bar]'));
	if (!backButton || !nextButton || !submitButton || !alertBox || !steps.length) return;

	const accessKey = form.dataset.accessKey ?? '';
	const inbox = form.dataset.inbox ?? '';
	const dmUrl = form.dataset.dm ?? '';
	const submitLabel = submitButton.querySelector('.btn-roll-inner > span')?.textContent ?? 'Send';
	let current = 0;
	let busy = false;

	/* Dates in the past make no sense for a booking. */
	const dateInput = form.querySelector<HTMLInputElement>('input[name="eventDate"]');
	if (dateInput) {
		const today = new Date();
		today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
		dateInput.min = today.toISOString().slice(0, 10);
	}

	/* ---------- Draft persistence (phones reload tabs; don't lose a lead) ---------- */
	const saveDraft = () => {
		try {
			const draft: Record<string, string[]> = {};
			new FormData(form).forEach((value, key) => {
				if (key === 'botcheck') return;
				(draft[key] ??= []).push(String(value));
			});
			sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
		} catch {
			/* storage unavailable (private mode) — fine */
		}
	};

	const restoreDraft = () => {
		try {
			const raw = sessionStorage.getItem(DRAFT_KEY);
			if (!raw) return;
			const draft = JSON.parse(raw) as Record<string, string[]>;
			for (const [key, values] of Object.entries(draft)) {
				form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${key}"]`).forEach((field) => {
					if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
						field.checked = values.includes(field.value);
					} else {
						field.value = values[0] ?? '';
					}
				});
			}
		} catch {
			/* corrupt or unavailable draft — start fresh */
		}
	};

	const clearDraft = () => {
		try {
			sessionStorage.removeItem(DRAFT_KEY);
		} catch {
			/* noop */
		}
	};

	/* ---------- Validation ---------- */
	const setError = (name: string, message: string | null) => {
		const errorEl = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
		if (errorEl) {
			errorEl.textContent = message ?? '';
			errorEl.hidden = !message;
		}
		form.querySelectorAll<HTMLElement>(`[name="${name}"]`).forEach((field) => {
			if (message) field.setAttribute('aria-invalid', 'true');
			else field.removeAttribute('aria-invalid');
		});
	};

	const validate = (index: number): HTMLElement | null => {
		const step = steps[index];
		let firstInvalid: HTMLElement | null = null;

		for (const group of step.querySelectorAll<HTMLElement>('[data-required-group]')) {
			const name = group.dataset.requiredGroup ?? '';
			const ok = Boolean(form.querySelector(`[name="${name}"]:checked`));
			setError(name, ok ? null : group.dataset.errorMessage ?? 'Please choose an option.');
			if (!ok && !firstInvalid) firstInvalid = group.querySelector('input');
		}

		for (const field of step.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-required]')) {
			const value = field.value.trim();
			let message: string | null = null;
			if (!value) message = field.dataset.errorMessage ?? 'This field is required.';
			else if (field.type === 'email' && !EMAIL_PATTERN.test(value)) message = 'That email doesn’t look quite right.';
			setError(field.name, message);
			if (message && !firstInvalid) firstInvalid = field;
		}

		// `novalidate` means the browser won't enforce `min`, and a restored draft can carry an old date.
		const date = step.querySelector<HTMLInputElement>('input[name="eventDate"]');
		if (date) {
			const message = date.value && date.min && date.value < date.min ? 'Please pick a date from today onward.' : null;
			setError('eventDate', message);
			if (message && !firstInvalid) firstInvalid = date;
		}

		const phone = step.querySelector<HTMLInputElement>('input[name="phone"]');
		if (phone) {
			const digits = phone.value.replace(/\D/g, '');
			const message = phone.value.trim() && digits.length < 10 ? 'Please include your area code.' : null;
			setError('phone', message);
			if (message && !firstInvalid) firstInvalid = phone;
		}

		return firstInvalid;
	};

	/* ---------- Steps ---------- */
	// Offsets come from `scroll-padding-top` on <html>, which also covers native focus scrolling.
	const keepCardInView = () => {
		const top = card.getBoundingClientRect().top;
		if (top < 0 || top > window.innerHeight * 0.45) scrollToTarget(card);
	};

	const replayEnter = (el: HTMLElement) => {
		el.classList.remove('step-enter');
		void el.offsetWidth;
		el.classList.add('step-enter');
	};

	const hideAlert = () => {
		alertBox.hidden = true;
		alertBox.replaceChildren();
	};

	const showStep = (index: number, moveFocus = true) => {
		current = index;
		steps.forEach((step, i) => (step.hidden = i !== index));
		replayEnter(steps[index]);
		backButton.hidden = index === 0;
		nextButton.hidden = index === steps.length - 1;
		submitButton.hidden = index !== steps.length - 1;
		if (stepCount) stepCount.textContent = `Step ${index + 1} of ${steps.length}`;
		if (stepName) stepName.textContent = steps[index].dataset.stepName ?? '';
		bars.forEach((bar, i) => bar.classList.toggle('is-active', i <= index));
		hideAlert();
		if (moveFocus) {
			steps[index].querySelector<HTMLElement>('[data-step-title]')?.focus({ preventScroll: true });
			keepCardInView();
		}
	};

	const goNext = () => {
		const invalid = validate(current);
		if (invalid) {
			invalid.focus();
			return;
		}
		showStep(current + 1);
	};

	/* ---------- Result panels ---------- */
	const showPanel = (panel: HTMLElement) => {
		form.hidden = true;
		success.hidden = panel !== success;
		handoff.hidden = panel !== handoff;
		replayEnter(panel);
		panel.focus({ preventScroll: true });
		keepCardInView();
	};

	const showSuccess = (b: Booking) => {
		success.querySelectorAll<HTMLElement>('[data-first-name]').forEach((el) => (el.textContent = b.name.split(/\s+/)[0] || 'there'));
		success.querySelectorAll<HTMLElement>('[data-reply-email]').forEach((el) => (el.textContent = b.email));
		success.querySelectorAll<HTMLElement>('[data-calendly]').forEach((el) => {
			el.dataset.prefillName = b.name;
			el.dataset.prefillEmail = b.email;
		});
		clearDraft();
		showPanel(success);
		window.dispatchEvent(new CustomEvent('coco:booking-sent'));
	};

	const mailtoFor = (b: Booking) =>
		`mailto:${inbox}?subject=${encodeURIComponent(`Booking request: ${subjectFor(b)}`)}&body=${encodeURIComponent(summaryLines(b).join('\n'))}`;

	/** Not sent yet: give the visitor their finished request to send by email or DM. The draft stays saved. */
	const showHandoff = (b: Booking) => {
		const text = handoff.querySelector<HTMLTextAreaElement>('[data-request-text]');
		if (text) text.value = `Hi! I'd like to book The Coco Shack.\n\n${summaryLines(b).join('\n')}`;
		const mailLink = handoff.querySelector<HTMLAnchorElement>('[data-mailto]');
		if (mailLink && inbox) mailLink.href = mailtoFor(b);
		showPanel(handoff);
		if (inbox) window.location.href = mailtoFor(b);
	};

	const showSendError = () => {
		const message = document.createElement('p');
		message.append('Your request didn’t go through — please try again in a moment, or ');
		if (inbox) {
			const email = document.createElement('a');
			email.href = `mailto:${inbox}`;
			email.textContent = 'email us';
			email.className = 'font-semibold underline underline-offset-4';
			message.append(email, ' or ');
		}
		const dm = document.createElement('a');
		dm.href = dmUrl;
		dm.target = '_blank';
		dm.rel = 'noopener noreferrer';
		dm.textContent = 'message us on Instagram';
		dm.className = 'font-semibold underline underline-offset-4';
		message.append(dm, '. Your details are still filled in.');
		alertBox.replaceChildren(message);
		alertBox.hidden = false;
	};

	/* ---------- Submission ---------- */
	const collect = (): Booking => {
		const data = new FormData(form);
		const text = (key: string) => String(data.get(key) ?? '').trim();
		return {
			name: text('name'),
			email: text('email'),
			phone: text('phone'),
			eventType: text('eventType'),
			eventDate: text('eventDate'),
			guests: text('guests'),
			location: text('location'),
			stations: data.getAll('stations').map(String),
			branding: data.get('branding') ? 'Yes' : 'No',
			serviceTime: text('serviceTime'),
			budget: text('budget'),
			message: text('message'),
			referral: text('referral'),
		};
	};

	const sendToInbox = async (b: Booking) => {
		const controller = new AbortController();
		const timeout = window.setTimeout(() => controller.abort(), 15000);
		const campaign = new URLSearchParams(window.location.search).get('utm_source');
		try {
			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				signal: controller.signal,
				body: JSON.stringify({
					access_key: accessKey,
					subject: `New booking request: ${subjectFor(b)}`,
					from_name: 'The Coco Shack website',
					name: b.name,
					email: b.email,
					phone: b.phone || '—',
					'Event type': b.eventType,
					'Event date': prettyDate(b.eventDate) || 'Not set yet',
					Guests: b.guests,
					Location: b.location || '—',
					Stations: b.stations.join(', '),
					'Branded coconuts': b.branding,
					'Service time': b.serviceTime || '—',
					'Budget for the bar': b.budget || '—',
					'Heard about us': b.referral || '—',
					Notes: b.message || '—',
					...(campaign ? { 'Campaign source': campaign } : {}),
				}),
			});
			const result = await response.json().catch(() => null);
			if (!response.ok || !result?.success) {
				throw new Error(result?.body?.message ?? result?.message ?? `Request failed (${response.status})`);
			}
		} finally {
			window.clearTimeout(timeout);
		}
	};

	const setBusy = (state: boolean) => {
		busy = state;
		submitButton.disabled = state;
		submitButton.setAttribute('aria-busy', String(state));
		setButtonLabel(submitButton, state ? 'Sending…' : submitLabel);
	};

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (busy) return;
		if (current < steps.length - 1) {
			goNext();
			return;
		}

		const invalid = validate(current);
		if (invalid) {
			invalid.focus();
			return;
		}

		const booking = collect();
		const honeypot = form.querySelector<HTMLInputElement>('input[name="botcheck"]');
		if (honeypot?.checked) {
			showSuccess(booking);
			return;
		}

		if (!accessKey) {
			showHandoff(booking);
			return;
		}

		hideAlert();
		setBusy(true);
		try {
			await sendToInbox(booking);
			showSuccess(booking);
		} catch (error) {
			console.error('[booking] delivery failed', error);
			showSendError();
		} finally {
			setBusy(false);
		}
	});

	// A double-click would otherwise also hit whatever appears under the pointer on the next step
	// (on step 2 → 3 that's the submit button, rendered in the same spot as Continue).
	nextButton.addEventListener('click', (event) => {
		if (event.detail > 1) return;
		goNext();
	});
	submitButton.addEventListener('click', (event) => {
		if (event.detail > 1) event.preventDefault();
	});
	backButton.addEventListener('click', () => showStep(Math.max(current - 1, 0)));

	const onFieldChange = (event: Event) => {
		const field = event.target as HTMLInputElement;
		if (field.name && field.getAttribute('aria-invalid') === 'true') setError(field.name, null);
		saveDraft();
	};
	form.addEventListener('input', onFieldChange);
	form.addEventListener('change', onFieldChange);

	/* "Weddings", "Festivals"… rows pre-select the event type before scrolling here. */
	document.addEventListener('click', (event) => {
		const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-prefill-event]');
		if (!trigger) return;
		const radio = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="eventType"]')).find(
			(input) => input.value === trigger.dataset.prefillEvent,
		);
		if (radio) {
			radio.checked = true;
			setError('eventType', null);
			saveDraft();
		}
	});

	handoff.querySelector('[data-copy-request]')?.addEventListener('click', async (event) => {
		const button = event.currentTarget as HTMLElement;
		const text = handoff.querySelector<HTMLTextAreaElement>('[data-request-text]');
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text.value);
			setButtonLabel(button, 'Copied');
		} catch {
			text.focus();
			text.select();
			setButtonLabel(button, 'Selected — copy it above');
		}
	});

	document.querySelectorAll('[data-booking-edit]').forEach((button) =>
		button.addEventListener('click', () => {
			handoff.hidden = true;
			form.hidden = false;
			showStep(steps.length - 1);
		}),
	);

	document.querySelectorAll('[data-booking-reset]').forEach((button) =>
		button.addEventListener('click', () => {
			form.reset();
			clearDraft();
			form.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
			form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => (el.hidden = true));
			success.hidden = true;
			handoff.hidden = true;
			form.hidden = false;
			showStep(0);
		}),
	);

	restoreDraft();
	showStep(0, false);
}
