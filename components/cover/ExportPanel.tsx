'use client';

import React, { useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExportPanel() {
	const handleExport = useCallback(async () => {
		const node = document.getElementById('canvas-export-target');
		if (!node) return;

		try {
			const dataUrl = await toPng(node as HTMLElement, {
				quality: 0.95,
				pixelRatio: window.devicePixelRatio || 1,
				filter: (node) => {
					if (node.classList?.contains('export-exclude')) {
						return false;
					}
					return true;
				},
			});
			const link = document.createElement('a');
			link.download = 'easy-cover.png';
			link.href = dataUrl;
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			console.error('Export failed', err);
		}
	}, []);

	return (
		<div className="p-4 border-t bg-muted/20 space-y-4">
			<Button
				className="w-full font-semibold shadow-sm"
				size="lg"
				onClick={handleExport}
			>
				<Download className="w-4 h-4 mr-2" />
				导出封面图
			</Button>

			<div className="text-center text-xs text-muted-foreground">
				<a
					href="https://github.com/ljxme/easy-cover"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-primary transition-colors flex items-center justify-center gap-1"
				>
					<Github className="w-4 h-4" />
					GitHub 开源仓库
				</a>
			</div>
		</div>
	);
}
