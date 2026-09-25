/**
 * Everything business-specific lives here. Edit this file and the whole site updates.
 * Leave a value as '' to hide the feature it powers (e.g. no phone = no call buttons).
 */
export const site = {
	name: 'The Coco Shack',
	shortName: 'Coco Shack',
	tagline: 'Fresh From The Islands',
	description:
		"Toronto's live coconut bar — coconuts cut live, cocktails served in the shell, fresh sugarcane juice, mocktails, coffee and tea for weddings, corporate events and festivals across the GTA.",

	// Keep in sync with `site` in astro.config.mjs.
	url: 'https://thecocoshack.ca',

	contact: {
		// Sourced from their own "Contact Us Today" Instagram post — please confirm these are still current.
		email: 'thecocoshack.toronto@gmail.com', // shown on the site + used as a backup if the form service is down
		phone: '(647) 673-2018', // adds call/text buttons everywhere
		instagram: 'thecocoshack.toronto',
	},

	booking: {
		// Web3Forms access key (public by design) — delivers booking requests to thecocoshack.toronto@gmail.com.
		// If emptied, the form hands visitors off to email (if set above) or Instagram DMs.
		web3formsKey: 'ce7f2106-00c6-4694-bf95-c01f5ee49157',
		// Optional, e.g. 'https://calendly.com/thecocoshack/intro-call' — adds "Book a quick call" buttons.
		calendlyUrl: '',
		// Optional, e.g. 'one business day' — shown as "we usually reply within …". Only promise what you'll keep.
		responseTime: '',
	},

	pricing: {
		// Optional, e.g. '$3,000' — shown as "Most events start from …". Screens out budgets that don't fit.
		startingFrom: '',
	},

	location: {
		city: 'Toronto',
		region: 'ON',
		country: 'CA',
		serviceArea: ['Toronto', 'Mississauga', 'Brampton', 'Vaughan', 'Markham', 'Richmond Hill', 'Oakville', 'Burlington'],
	},
} as const;

export const instagramUrl = `https://www.instagram.com/${site.contact.instagram}/`;
export const instagramHandle = `@${site.contact.instagram}`;

function toTelHref(phone: string): string {
	const digits = phone.replace(/[^\d+]/g, '');
	if (!digits) return '';
	if (digits.startsWith('+')) return `tel:${digits}`;
	return `tel:${digits.length === 10 ? `+1${digits}` : digits}`;
}

export const telHref = toTelHref(site.contact.phone);
export const mailHref = site.contact.email ? `mailto:${site.contact.email}` : '';
