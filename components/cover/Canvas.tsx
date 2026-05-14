'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RATIOS, useCoverStore } from '@/store/useCoverStore';
import IconRenderer from '@/components/cover/IconRenderer';
import TextRenderer from '@/components/cover/TextRenderer';
import GuidesOverlay from '@/components/cover/GuidesOverlay';

export default function Canvas() {
	const selectedRatio = useCoverStore((s) => s.selectedRatio);
	const background = useCoverStore((s) => s.background);

	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);

	const dimensions = useMemo(() => {
		const ratio = RATIOS.find((r) => r.label === selectedRatio);
		if (!ratio) return { width: 1600, height: 900 };
		return { width: ratio.width, height: ratio.height };
	}, [selectedRatio]);

	useEffect(() => {
		const handleResize = () => {
			if (!containerRef.current) return;
			const parent = containerRef.current.parentElement;
			if (!parent) return;

			const padding = 80;
			const availableWidth = parent.clientWidth - padding;
			const availableHeight = parent.clientHeight - padding;

			const scaleX = availableWidth / dimensions.width;
			const scaleY = availableHeight / dimensions.height;
			setScale(Math.min(scaleX, scaleY) * 0.9);
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [dimensions]);

	return (
		<div
			className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden relative w-full h-[55vh] md:h-full min-w-0 shrink-0 md:shrink"
			role="region"
			aria-label="封面预览"
		>
			<div
				ref={containerRef}
				style={{
					width: dimensions.width,
					height: dimensions.height,
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: `translate(-50%, -50%) scale(${scale})`,
					transformOrigin: 'center',
				}}
				className="transition-all duration-300"
			>
				<div
					id="canvas-export-target"
					className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center"
					style={{
						boxShadow: background.shadow
							? `0 ${background.shadowOffsetY}px ${background.shadowBlur}px ${background.shadowColor}`
							: 'none',
					}}
				>
					<div
						className="absolute inset-0"
						style={{
							backgroundColor:
								background.type === 'solid' ? background.color : '#ffffff',
							borderRadius: `${background.radius}px`,
						}}
					>
						{background.type === 'image' && background.imageUrl && (
							<Image
								src={background.imageUrl}
								alt="Background"
								fill
								sizes="100vw"
								className="absolute inset-0 object-contain pointer-events-none"
								style={{
									filter: `blur(${background.blur}px)`,
									transform: `scale(${background.scale}) translate(${background.positionX - 50}%, ${background.positionY - 50}%) rotate(${background.rotation}deg)`,
									transformOrigin: 'center',
								}}
							/>
						)}
					</div>

					<div className="z-10 pointer-events-none">
						<div className="grid place-items-center relative">
							<div className="z-10">
								<TextRenderer />
							</div>
							<div className="z-20 absolute">
								<IconRenderer />
							</div>
						</div>
					</div>

					<GuidesOverlay dimensions={dimensions} />
				</div>
			</div>
		</div>
	);
}
