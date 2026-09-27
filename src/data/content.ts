/**
 * Site copy that's likely to change: services, event types, FAQs, testimonials.
 * Edit freely — components render whatever is in these lists.
 */

import type { IconName } from '../components/ui/icons';
import { site } from '../config/site';

export const services: {
	id: string;
	icon: IconName;
	title: string;
	kicker: string;
	desc: string;
	points: string[];
}[] = [
	{
		id: 'coconut-bar',
		icon: 'coconut',
		title: 'Coconut Bar',
		kicker: 'The centrepiece',
		desc: 'Young coconuts opened live in front of your guests — the moment everyone gathers around. Sipped straight from the shell.',
		points: ['Opened fresh, to order', 'Served right in the shell', 'Logo-branded coconuts available'],
	},
	{
		id: 'mocktails',
		icon: 'mocktail',
		title: 'Mocktails',
		kicker: 'For every guest',
		desc: 'Alcohol-free signature drinks, poured right into the shell — every guest gets the full coconut moment. Fresh, bright and built around your event.',
		points: ['Alcohol-free, all ages', 'Poured right into the shell', 'Custom signature drinks'],
	},
	{
		id: 'cocktails',
		icon: 'cocktail',
		title: 'Cocktails',
		kicker: 'In the shell',
		desc: 'Signature cocktails poured right into the coconut — the drink everyone photographs first. Served where your venue allows; we’ll confirm the details when we plan your event.',
		points: ['Custom signature cocktails', 'Poured right into the coconut', 'Served where your venue allows'],
	},
];

/** `value` must match an option in the booking form so the rows can pre-select it. */
export const eventTypes: { value: string; title: string; desc: string }[] = [
	{
		value: 'Wedding',
		title: 'Weddings',
		desc: 'The cocktail-hour moment your guests film: coconuts opened live, signature drinks, a setup styled to your day.',
	},
	{
		value: 'Corporate / brand event',
		title: 'Corporate & brand activations',
		desc: 'Logo-branded coconuts turn the bar into a brand moment — made for photos and conversation.',
	},
	{
		value: 'Festival / market',
		title: 'Festivals & markets',
		desc: 'The live cut is a showpiece that draws a crowd — and keeps it coming back.',
	},
	{
		value: 'Private celebration',
		title: 'Private celebrations',
		desc: 'Milestone birthdays, showers and anniversaries, with island vibes built in.',
	},
];

export const processSteps: { title: string; desc: string }[] = [
	{ title: 'Tell us about it', desc: 'Share your date, guest count and how many coconuts you need — it takes about a minute.' },
	{ title: 'Plan your bar', desc: 'We suggest stations and styling, then send a quote for your event.' },
	{ title: 'We set up', desc: 'We coordinate load-in with your venue and style the station on site.' },
	{ title: 'Served live', desc: 'Coconuts opened and drinks poured right in front of your guests.' },
];

export const faqs: { q: string; a: string }[] = [
	{
		q: 'How far in advance should we book?',
		a: 'As early as you can — popular dates go first, especially in wedding and festival season. Send your date and we’ll confirm availability.',
	},
	{
		q: 'How is pricing determined?',
		a: `Every event is quoted on its own — guest count, stations, service time and location all factor in.${
			site.pricing.startingFrom ? ` Most events start from ${site.pricing.startingFrom}.` : ''
		} Send your details and we’ll put a quote together.`,
	},
	{
		q: 'What do you need from our venue?',
		a: 'Tell us where you’re hosting and we’ll confirm space, power and access with you or your coordinator.',
	},
	{
		q: 'Do you serve alcohol?',
		a: 'Yes — cocktails can be served right in the coconut. Alcohol service depends on your venue and permits, so we’ll confirm the details when we plan your event. Fresh coconut water and mocktails are always on the menu too.',
	},
	{
		q: 'Can you brand the setup for our company or event?',
		a: 'Yes — we can brand coconuts with your logo or names. Mention it in your request and we’ll include it in your quote.',
	},
	{
		q: 'Do you travel outside the GTA?',
		a: 'We’re based in Toronto and serve the GTA. Planning something further out? Reach out and we’ll let you know.',
	},
	{
		q: 'What’s included in a booking?',
		a: 'Your quote spells out exactly what’s included — stations, service time, styling and setup — before you commit to anything.',
	},
];

/**
 * Real client quotes only. The testimonials section stays hidden until this has entries.
 * Example: { quote: '…', name: 'Priya S.', event: 'Wedding, Vaughan' }
 */
export const testimonials: { quote: string; name: string; event: string }[] = [];

export const marqueeItems = [
	'Coconut Bar',
	'Cocktails in the Shell',
	'Mocktails',
	'Coconuts Opened Live',
	'Weddings',
	'Corporate Events',
	'Brand Activations',
	'Festivals',
	'Private Parties',
];

/** Booking form choices. Edit labels/options here; the email you receive uses these values. */
export const bookingOptions = {
	eventTypes: ['Wedding', 'Corporate / brand event', 'Festival / market', 'Private celebration', 'Something else'],
	guestCounts: ['Under 50', '50–100', '100–200', '200–400', '400+'],
	stations: ['Coconut Bar', 'Mocktails', 'Cocktails', 'Not sure yet — recommend something'],
};
