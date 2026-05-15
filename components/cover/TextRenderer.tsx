'use client';

import { useCoverStore } from '@/store/useCoverStore';

export default function TextRenderer() {
	const text = useCoverStore((s) => s.text);

	return (
		<div
			className="whitespace-pre text-center leading-tight"
			style={{
				transform: `rotate(${text.rotation}deg)`,
				fontSize: `${text.fontSize}px`,
				color: text.color,
				fontWeight: text.fontWeight,
				fontFamily:
					text.fontFamily && text.fontFamily !== 'inherit'
						? text.fontFamily
						: undefined,
				WebkitTextStroke:
					text.strokeWidth > 0
						? `${text.strokeWidth}px ${text.strokeColor}`
						: undefined,
			}}
		>
			{text.content}
		</div>
	);
}
