'use client';

import { useCoverStore } from '@/store/useCoverStore';

export default function GuidesOverlay({
	dimensions,
}: {
	dimensions: { width: number; height: number };
}) {
	const showRuler = useCoverStore((s) => s.showRuler);

	return (
		<>
			{/* Ruler overlay */}
			{showRuler && (
				<div className="absolute inset-0 pointer-events-none opacity-30 z-40 export-exclude ruler-grid" />
			)}
		</>
	);
}
