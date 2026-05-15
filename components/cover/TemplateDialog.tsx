'use client';

import { useState, useEffect } from 'react';
import { Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import type { SavedTemplate } from './Controls';

const TEMPLATE_STORAGE_KEY = 'easy-cover-templates';

interface TemplateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onLoad: (template: SavedTemplate) => void;
}

export default function TemplateDialog({
	open,
	onOpenChange,
	onLoad,
}: TemplateDialogProps) {
	const [templates, setTemplates] = useState<SavedTemplate[]>([]);

	useEffect(() => {
		if (open) {
			loadTemplates();
		}
	}, [open]);

	const loadTemplates = () => {
		try {
			const data = JSON.parse(
				localStorage.getItem(TEMPLATE_STORAGE_KEY) || '[]',
			) as SavedTemplate[];
			setTemplates(data);
		} catch {
			setTemplates([]);
		}
	};

	const handleDelete = (index: number) => {
		const name = templates[index].name;
		if (!confirm(`确定要删除模板「${name}」吗？`)) return;

		const updated = [...templates];
		updated.splice(index, 1);
		localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
		setTemplates(updated);
	};

	const handleLoad = (index: number) => {
		onLoad(templates[index]);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>模板管理</DialogTitle>
					<DialogDescription>
						{templates.length === 0
							? '暂无已保存的模板'
							: `共 ${templates.length} 个模板，点击加载或删除`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2 max-h-80 overflow-y-auto">
					{templates.map((t, i) => (
						<div
							key={i}
							className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
						>
							<div className="flex-1 min-w-0 mr-2">
								<p className="text-sm font-medium truncate">{t.name}</p>
								<p className="text-xs text-muted-foreground">
									{t.ratio} · {t.bgType}背景
								</p>
							</div>
							<div className="flex gap-1.5 shrink-0">
								<Button
									variant="outline"
									size="sm"
									className="h-8 text-xs"
									onClick={() => handleLoad(i)}
								>
									<FolderOpen className="w-3 h-3 mr-1" />
									加载
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
									onClick={() => handleDelete(i)}
									title="删除模板"
								>
									<Trash2 className="w-3.5 h-3.5" />
								</Button>
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
