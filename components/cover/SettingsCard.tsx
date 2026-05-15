'use client';

import type React from 'react';

interface SettingsCardProps {
	title: string;
	children: React.ReactNode;
}

/**
 * Uniform compact settings card.
 * Applies consistent spacing to the header and content area.
 */
export function SettingsCard({ title, children }: SettingsCardProps) {
	return (
		<div className="rounded-lg border bg-card">
			<div className="px-4 py-2 border-b bg-muted/20">
				<h3 className="text-sm font-medium leading-none">{title}</h3>
			</div>
			<div className="p-4">{children}</div>
		</div>
	);
}
