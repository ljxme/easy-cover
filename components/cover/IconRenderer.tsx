'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useCoverStore } from '@/store/useCoverStore';
import { hexToRgba } from '@/lib/utils';

export default function IconRenderer() {
	const icon = useCoverStore((s) => s.icon);

	const bgColor =
		icon.bgShape !== 'none'
			? hexToRgba(icon.bgColor, icon.bgOpacity)
			: 'transparent';

	return (
		<div
			className="flex items-center justify-center"
			style={{
				transform: `rotate(${icon.rotation}deg)`,
				filter: icon.shadow
					? `drop-shadow(0 ${icon.shadowOffsetY}px ${icon.shadowBlur}px ${icon.shadowColor})`
					: 'none',
				backgroundColor: bgColor,
				backdropFilter: icon.bgBlur > 0 ? `blur(${icon.bgBlur}px)` : 'none',
				WebkitBackdropFilter:
					icon.bgBlur > 0 ? `blur(${icon.bgBlur}px)` : 'none',
				padding: icon.bgShape !== 'none' ? `${icon.padding}px` : 0,
				borderRadius:
					icon.bgShape === 'circle'
						? '50%'
						: icon.bgShape === 'rounded-square'
							? `${icon.radius}px`
							: icon.bgShape === 'square'
								? '0'
								: '0',
			}}
		>
			{icon.customIconUrl ? (
				<Image
					src={icon.customIconUrl}
					alt="Custom Icon"
					width={icon.size}
					height={icon.size}
					className="w-full h-full object-contain"
					style={{
						borderRadius: `${icon.customIconRadius}px`,
					}}
				/>
			) : (
				<Icon
					icon={icon.name}
					width={icon.size}
					height={icon.size}
					color={icon.color}
				/>
			)}
		</div>
	);
}
