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
		id: 'sugarcane-juice',
		icon: 'cane',
		title: 'Sugarcane Juice',
		kicker: 'Fresh & ice-cold',
		desc: 'Sweet, fresh sugarcane juice served ice-cold — a crowd favourite alongside the coconut bar.',
		points: ['Fresh, served ice-cold', 'Pairs with any station', 'Ask about a live press'],
	},
	{
		id: 'mocktails-cocktails',
		icon: 'cocktail',
		title: 'Mocktails & Cocktails',
		kicker: 'Served in the shell',
		desc: 'Signature drinks built around your event — mocktails for every guest, and cocktails served right in the coconut where your venue allows.',
		points: ['Custom signature drinks', 'Mocktails for every guest', 'Cocktails in the shell'],
	},
	{
		id: 'coffee-tea',
		icon: 'mug',
		title: 'Coffee & Tea',
		kicker: 'For any hour',
		desc: 'Coffee and tea for morning meetings, cooler evenings and everything in between.',
		points: ['Coffee & tea service', 'Great for corporate mornings', 'Pairs with any station'],
	},
];

export const eventTypes: { title: string; desc: string }[] = [
	{
		title: 'Weddings',
		desc: 'The cocktail-hour moment your guests film: coconuts opened live, signature drinks, a setup styled to your day.',
	},
	{
		title: 'Corporate & brand activations',
		desc: 'Logo-branded coconuts turn the bar into a brand moment — made for photos and conversation.',
	},
	{
		title: 'Festivals & markets',
		desc: 'The live cut is a showpiece that draws a crowd — and keeps it coming back.',
	},
	{
		title: 'Private celebrations',
		desc: 'Milestone birthdays, showers and anniversaries, with island vibes built in.',
	},
];

export const processSteps: { title: string; desc: string }[] = [
	{ title: 'Tell us about it', desc: 'Call, email or DM us your date, guest count and vision — it takes about a minute.' },
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
		a: 'Yes — cocktails can be served right in the coconut. Alcohol service depends on your venue and permits, so we’ll confirm the details when we plan your event. Coconut water, sugarcane juice, mocktails, coffee and tea are always on the menu too.',
	},
	{
		q: 'Can you brand the setup for our company or event?',
		a: 'Yes — we can brand coconuts with your logo or names. Mention it when you get in touch and we’ll include it in your quote.',
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
	'Sugarcane Juice',
	'Mocktails',
	'Coffee & Tea',
	'Weddings',
	'Corporate Events',
	'Brand Activations',
	'Festivals',
	'Private Parties',
];
