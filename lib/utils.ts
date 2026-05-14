import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Convert a hex color string to an rgba() string.
 * Supports #RGB, #RGBA, #RRGGBB, and #RRGGBBAA formats.
 */
export function hexToRgba(hex: string, alpha: number): string {
	let r = 0,
		g = 0,
		b = 0,
		a = alpha;

	// Remove leading # if present
	const h = hex.startsWith('#') ? hex.slice(1) : hex;

	if (h.length === 3) {
		// #RGB
		r = parseInt(h[0] + h[0], 16);
		g = parseInt(h[1] + h[1], 16);
		b = parseInt(h[2] + h[2], 16);
	} else if (h.length === 4) {
		// #RGBA
		r = parseInt(h[0] + h[0], 16);
		g = parseInt(h[1] + h[1], 16);
		b = parseInt(h[2] + h[2], 16);
		a = (parseInt(h[3] + h[3], 16) / 255) * alpha;
	} else if (h.length === 6) {
		// #RRGGBB
		r = parseInt(h.slice(0, 2), 16);
		g = parseInt(h.slice(2, 4), 16);
		b = parseInt(h.slice(4, 6), 16);
	} else if (h.length === 8) {
		// #RRGGBBAA
		r = parseInt(h.slice(0, 2), 16);
		g = parseInt(h.slice(2, 4), 16);
		b = parseInt(h.slice(4, 6), 16);
		a = (parseInt(h.slice(6, 8), 16) / 255) * alpha;
	}

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}
