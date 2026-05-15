'use client';

import { RotateCcw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

/**
 * Clamp a number between optional min and max bounds.
 * Returns the original value if it's NaN.
 */
export function clampNumber(value: number, min?: number, max?: number) {
	if (Number.isNaN(value)) return value;
	if (typeof min === 'number') value = Math.max(min, value);
	if (typeof max === 'number') value = Math.min(max, value);
	return value;
}

/**
 * Debounce a value by a given delay in milliseconds.
 */
export function useDebounceValue<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

/** A compact reset button with a rotate-ccw icon. */
export function ResetButton({
	onClick,
	tooltip = '重置',
}: {
	onClick: () => void;
	tooltip?: string;
}) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-6 w-6 ml-2"
			onClick={onClick}
			title={tooltip}
			aria-label={tooltip}
		>
			<RotateCcw className="h-3 w-3" />
		</Button>
	);
}

/* ------------------------------------------------------------------ */
/*  SliderRow — compact Label + NumberInput + ResetButton + Slider   */
/* ------------------------------------------------------------------ */

interface SliderRowProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	onValueChange: (value: number) => void;
	resetValue: number;
	formatValue?: (value: number) => string;
	labelExtra?: React.ReactNode;
}

export function SliderRow({
	label,
	value,
	min,
	max,
	step = 1,
	onValueChange,
	resetValue,
	formatValue,
	labelExtra,
}: SliderRowProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between items-center gap-2">
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
					<span>{label}</span>
					{labelExtra}
				</div>
				<div className="flex items-center gap-1">
					<NumberInput
						value={value}
						min={min}
						max={max}
						step={step}
						onValueChange={onValueChange}
					/>
					<ResetButton onClick={() => onValueChange(resetValue)} />
				</div>
			</div>
			<Slider
				value={[value]}
				min={min}
				max={max}
				step={step}
				onValueChange={(v) => onValueChange(v[0])}
			/>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Compact inline label row (Label + arbitrary control on the right) */
/* ------------------------------------------------------------------ */

interface InlineLabelRowProps {
	label: string;
	children: React.ReactNode;
}

export function InlineLabelRow({ label, children }: InlineLabelRowProps) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-xs text-muted-foreground font-medium">{label}</span>
			{children}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  NumberInput (existing, unchanged below)                           */
/* ------------------------------------------------------------------ */
export function NumberInput({
	value,
	min,
	max,
	step = 1,
	onValueChange,
	className,
}: {
	value: number;
	min?: number;
	max?: number;
	step?: number;
	onValueChange: (value: number) => void;
	className?: string;
}) {
	const [text, setText] = React.useState(() => String(value));
	const isEditingRef = React.useRef(false);

	// Sync external value only when the input is not being actively edited.
	React.useEffect(() => {
		if (!isEditingRef.current) {
			setText(String(value));
		}
	}, [value]);

	const commit = React.useCallback(() => {
		isEditingRef.current = false;

		if (text.trim() === '') {
			setText(String(value));
			return;
		}

		const next = Number(text);
		if (!Number.isFinite(next)) {
			setText(String(value));
			return;
		}

		onValueChange(clampNumber(next, min, max));
	}, [max, min, onValueChange, text, value]);

	return (
		<Input
			type="number"
			inputMode="decimal"
			className={className ?? 'h-7 w-24 px-2 py-1 text-xs'}
			value={text}
			min={min}
			max={max}
			step={step}
			onChange={(e) => {
				isEditingRef.current = true;
				setText(e.target.value);
			}}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					(e.currentTarget as HTMLInputElement).blur();
				}
			}}
		/>
	);
}
