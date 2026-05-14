'use client';

import { RotateCcw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

/**
 * A number input that defers committing the value until blur or Enter,
 * to avoid overwriting user input from external store updates.
 */
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
