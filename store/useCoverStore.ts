import { create } from 'zustand';

export type AspectRatio = '1:1' | '16:9' | '21:9' | '4:3' | '2:1';

export const RATIOS: { label: AspectRatio; width: number; height: number }[] = [
	{ label: '1:1', width: 900, height: 900 },
	{ label: '16:9', width: 1600, height: 900 },
	{ label: '21:9', width: 2100, height: 900 },
	{ label: '4:3', width: 1200, height: 900 },
	{ label: '2:1', width: 1800, height: 900 },
];

interface TextSettings {
	content: string;
	fontSize: number;
	color: string;
	strokeColor: string;
	strokeWidth: number;
	fontWeight: number;
	fontFamily: string;
	x: number;
	y: number;
	rotation: number;
}

interface IconSettings {
	name: string;
	size: number;
	color: string;
	shadow: boolean;
	x: number;
	y: number;
	rotation: number;
	bgShape: 'none' | 'circle' | 'square' | 'rounded-square';
	bgColor: string;
	padding: number;
	radius: number;
	shadowColor: string;
	shadowBlur: number;
	shadowOffsetY: number;
	bgOpacity: number;
	bgBlur: number;
	customIconUrl?: string;
	customIconRadius: number;
}

interface BackgroundSettings {
	type: 'solid' | 'image';
	color: string;
	imageUrl: string;
	blur: number;
	radius: number;
	shadow: boolean;
	opacity: number;
	shadowColor: string;
	shadowBlur: number;
	shadowOffsetY: number;
	scale: number;
	positionX: number;
	positionY: number;
	rotation: number;
}

interface DesignSnapshot {
	text: TextSettings;
	icon: IconSettings;
	background: BackgroundSettings;
}

const MAX_HISTORY = 50;

function snap(state: CoverState): DesignSnapshot {
	return {
		text: { ...state.text },
		icon: { ...state.icon },
		background: { ...state.background },
	};
}

interface CoverState {
	selectedRatio: AspectRatio;
	showRuler: boolean;
	text: TextSettings;
	icon: IconSettings;
	background: BackgroundSettings;

	// History
	history: DesignSnapshot[];
	historyIndex: number;

	// Actions
	setRatio: (ratio: AspectRatio) => void;
	setShowRuler: (show: boolean) => void;
	updateText: (settings: Partial<TextSettings>) => void;
	updateIcon: (settings: Partial<IconSettings>) => void;
	updateBackground: (settings: Partial<BackgroundSettings>) => void;
	undo: () => void;
	redo: () => void;
}

const initialSnapshot: DesignSnapshot = {
	text: {
		content: '封面标题',
		fontSize: 160,
		color: '#000000',
		strokeColor: '#ffffff',
		strokeWidth: 0,
		fontWeight: 700,
		fontFamily: 'inherit',
		x: 0,
		y: 0,
		rotation: 0,
	},
	icon: {
		name: 'logos:react',
		size: 120,
		color: '#000000',
		shadow: true,
		x: 0,
		y: 0,
		rotation: 0,
		bgShape: 'rounded-square',
		bgColor: '#ffffff',
		padding: 40,
		radius: 40,
		shadowColor: 'rgba(0,0,0,0.3)',
		shadowBlur: 6,
		shadowOffsetY: 4,
		bgOpacity: 1,
		bgBlur: 0,
		customIconRadius: 0,
	},
	background: {
		type: 'solid',
		color: '#f3f4f6',
		imageUrl: '',
		blur: 0,
		radius: 0,
		shadow: false,
		opacity: 1,
		shadowColor: 'rgba(0,0,0,0.3)',
		shadowBlur: 30,
		shadowOffsetY: 10,
		scale: 1,
		positionX: 50,
		positionY: 50,
		rotation: 0,
	},
};

export const useCoverStore = create<CoverState>((set, get) => ({
	selectedRatio: '16:9',
	showRuler: true,
	text: { ...initialSnapshot.text },
	icon: { ...initialSnapshot.icon },
	background: { ...initialSnapshot.background },

	history: [initialSnapshot],
	historyIndex: 0,

	setRatio: (ratio) => set({ selectedRatio: ratio }),
	setShowRuler: (show) => set({ showRuler: show }),

	updateText: (settings) =>
		set((state) => {
			const newText = { ...state.text, ...settings };
			const snapshot = snap({ ...state, text: newText });
			const newHistory = state.history
				.slice(0, state.historyIndex + 1)
				.concat(snapshot)
				.slice(-MAX_HISTORY);
			return {
				text: newText,
				history: newHistory,
				historyIndex: newHistory.length - 1,
			};
		}),

	updateIcon: (settings) =>
		set((state) => {
			const newIcon = { ...state.icon, ...settings };
			const snapshot = snap({ ...state, icon: newIcon });
			const newHistory = state.history
				.slice(0, state.historyIndex + 1)
				.concat(snapshot)
				.slice(-MAX_HISTORY);
			return {
				icon: newIcon,
				history: newHistory,
				historyIndex: newHistory.length - 1,
			};
		}),

	updateBackground: (settings) =>
		set((state) => {
			const newBg = { ...state.background, ...settings };
			const snapshot = snap({ ...state, background: newBg });
			const newHistory = state.history
				.slice(0, state.historyIndex + 1)
				.concat(snapshot)
				.slice(-MAX_HISTORY);
			return {
				background: newBg,
				history: newHistory,
				historyIndex: newHistory.length - 1,
			};
		}),

	undo: () =>
		set((state) => {
			if (state.historyIndex <= 0) return state;
			const newIndex = state.historyIndex - 1;
			const snap = state.history[newIndex];
			return {
				text: { ...snap.text },
				icon: { ...snap.icon },
				background: { ...snap.background },
				historyIndex: newIndex,
			};
		}),

	redo: () =>
		set((state) => {
			if (state.historyIndex >= state.history.length - 1) return state;
			const newIndex = state.historyIndex + 1;
			const snap = state.history[newIndex];
			return {
				text: { ...snap.text },
				icon: { ...snap.icon },
				background: { ...snap.background },
				historyIndex: newIndex,
			};
		}),
}));
