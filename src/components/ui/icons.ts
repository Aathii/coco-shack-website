/** Line icons on a 24px grid, drawn to match the line-art style of the brand badge. */
export const icons = {
	coconut:
		'<path d="M4.8 11.2c0 5 3.1 9.3 7.2 9.3s7.2-4.3 7.2-9.3"/><ellipse cx="12" cy="11.2" rx="7.2" ry="2.1"/><path d="M13.4 10.4 17 3.5h2.6"/><path d="M8.4 14.4c.3 1.7 1 3 2 3.9M15.6 14.4c-.3 1.7-1 3-2 3.9"/>',
	cane: '<path d="M7 21V8.5M12 21V6M17 21V9"/><path d="M5.8 12.5h2.4M5.8 17h2.4M10.8 10.5h2.4M10.8 15.5h2.4M15.8 13h2.4M15.8 17.5h2.4"/><path d="M7 8.5c-.4-2 .5-3.8 2.4-4.8M12 6c.6-1.9 2.2-3.1 4.3-3.3M17 9c.9-1.6 2.5-2.5 4.4-2.4"/>',
	cocktail: '<path d="M4.5 4h15L12 12.5V20M8.5 20.5h7M7.3 7.2h9.4"/><circle cx="16.8" cy="5.4" r="1.1" fill="currentColor" stroke="none"/>',
	mug: '<path d="M5 8.5h11v6.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8.5Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8.5 5.6c0-1 .8-1.2.8-2.2M12 5.6c0-1 .8-1.2.8-2.2"/>',
	leaf: '<path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Z"/><path d="M6 18c3-4 7-8 12-10"/>',
	palm: '<path d="M12 21V12"/><path d="M12 12c0-5 1-8 4-9M12 12c0-5-1-8-4-9M12 12c1.5-3.5 4-5 7-5M12 12c-1.5-3.5-4-5-7-5M12 12c2.5-2 5.5-2.3 8-1.5M12 12c-2.5-2-5.5-2.3-8-1.5"/>',
	pin: '<path d="M12 21s7-7.2 7-12.5A7 7 0 0 0 5 8.5C5 13.8 12 21 12 21Z"/><circle cx="12" cy="8.5" r="2.4"/>',
	calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v5M16 3v5"/>',
	sparkle: '<path d="M12 3c.6 4 2 6.4 6 7-4 .6-5.4 3-6 7-.6-4-2-6.4-6-7 4-.6 5.4-3 6-7Z"/>',
	check: '<path d="M5 12.5 10 17l9-10"/>',
	arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
	'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
	'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
	instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
	phone: '<path d="M5.2 4.5h3.1l1.6 4-2 1.3a10.5 10.5 0 0 0 6.3 6.3l1.3-2 4 1.6v3.1a1.6 1.6 0 0 1-1.7 1.6A15.6 15.6 0 0 1 3.6 6.2a1.6 1.6 0 0 1 1.6-1.7Z"/>',
	mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.2 7.2 7.8 5.8 7.8-5.8"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M15.5 8.5V6.2a1.7 1.7 0 0 0-1.7-1.7H6.2a1.7 1.7 0 0 0-1.7 1.7v7.6a1.7 1.7 0 0 0 1.7 1.7h2.3"/>',
	users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><path d="M15.2 5.6a3 3 0 0 1 0 5.8M17.3 14.4c1.8.5 3 2 3.4 4.4"/>',
} as const;

export type IconName = keyof typeof icons;
