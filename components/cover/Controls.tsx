'use client';

import { useState } from 'react';
import { Undo2, Redo2, Save, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsCard } from '@/components/cover/SettingsCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RATIOS, useCoverStore, type AspectRatio } from '@/store/useCoverStore';
import TextSettings from '@/components/cover/TextSettings';
import IconSettings from '@/components/cover/IconSettings';
import BackgroundSettings from '@/components/cover/BackgroundSettings';
import ExportPanel from '@/components/cover/ExportPanel';
import TemplateDialog from '@/components/cover/TemplateDialog';

const TEMPLATE_STORAGE_KEY = 'easy-cover-templates';

export interface SavedTemplate {
	name: string;
	ratio: AspectRatio;
	textContent: string;
	textFontSize: number;
	textColor: string;
	textStrokeColor: string;
	textStrokeWidth: number;
	textFontWeight: number;
	textFontFamily: string;
	iconName: string;
	iconSize: number;
	iconColor: string;
	iconBgShape: string;
	iconBgColor: string;
	bgType: string;
	bgColor: string;
}

export default function Controls() {
	const selectedRatio = useCoverStore((s) => s.selectedRatio);
	const showRuler = useCoverStore((s) => s.showRuler);
	const setRatio = useCoverStore((s) => s.setRatio);
	const setShowRuler = useCoverStore((s) => s.setShowRuler);
	const undo = useCoverStore((s) => s.undo);
	const redo = useCoverStore((s) => s.redo);
	const historyIndex = useCoverStore((s) => s.historyIndex);
	const history = useCoverStore((s) => s.history);
	const text = useCoverStore((s) => s.text);
	const icon = useCoverStore((s) => s.icon);
	const background = useCoverStore((s) => s.background);
	const updateText = useCoverStore((s) => s.updateText);
	const updateIcon = useCoverStore((s) => s.updateIcon);
	const updateBackground = useCoverStore((s) => s.updateBackground);

	const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
	const canUndo = historyIndex > 0;
	const canRedo = historyIndex < history.length - 1;

	const handleSaveTemplate = () => {
		const name = prompt('请输入模板名称：');
		if (!name) return;

		const template: SavedTemplate = {
			name,
			ratio: selectedRatio,
			textContent: text.content,
			textFontSize: text.fontSize,
			textColor: text.color,
			textStrokeColor: text.strokeColor,
			textStrokeWidth: text.strokeWidth,
			textFontWeight: text.fontWeight,
			textFontFamily: text.fontFamily,
			iconName: icon.name,
			iconSize: icon.size,
			iconColor: icon.color,
			iconBgShape: icon.bgShape,
			iconBgColor: icon.bgColor,
			bgType: background.type,
			bgColor: background.color,
		};

		try {
			const existing = JSON.parse(
				localStorage.getItem(TEMPLATE_STORAGE_KEY) || '[]',
			) as SavedTemplate[];
			existing.push(template);
			localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(existing));
		} catch {
			// localStorage unavailable
		}
	};

	const handleLoadTemplate = () => {
		try {
			const templates = JSON.parse(
				localStorage.getItem(TEMPLATE_STORAGE_KEY) || '[]',
			) as SavedTemplate[];
			if (templates.length === 0) {
				alert('没有已保存的模板');
				return;
			}
			setTemplateDialogOpen(true);
		} catch {
			// localStorage unavailable
		}
	};

	const handleApplyTemplate = (t: SavedTemplate) => {
		setRatio(t.ratio);
		updateText({
			content: t.textContent,
			fontSize: t.textFontSize,
			color: t.textColor,
			strokeColor: t.textStrokeColor,
			strokeWidth: t.textStrokeWidth,
			fontWeight: t.textFontWeight,
			fontFamily: t.textFontFamily,
		});
		updateIcon({
			name: t.iconName,
			size: t.iconSize,
			color: t.iconColor,
			bgShape: t.iconBgShape as 'none' | 'circle' | 'square' | 'rounded-square',
			bgColor: t.iconBgColor,
		});
		updateBackground({
			type: t.bgType as 'solid' | 'image',
			color: t.bgColor,
		});
	};

	return (
		<div className="w-full md:w-80 h-1/2 md:h-full border-t md:border-t-0 md:border-r bg-background flex flex-col shadow-lg z-10">
			<div className="p-5 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold flex items-center gap-2 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Easy Cover
						</h1>
						<p className="text-xs text-muted-foreground mt-1 font-medium">
							简单优雅的封面图生成工具
						</p>
					</div>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={undo}
							disabled={!canUndo}
							title="撤销"
							aria-label="撤销"
						>
							<Undo2 className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={redo}
							disabled={!canRedo}
							title="重做"
							aria-label="重做"
						>
							<Redo2 className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</div>

			<div className="flex-1 min-h-0 w-full bg-muted/5">
				<ScrollArea className="h-full">
					<div className="p-4 flex flex-col gap-3">
						{/* Layout Section */}
						<SettingsCard title="布局设置">
							<div className="flex flex-col gap-3">
								<div className="flex flex-col gap-1.5">
									<span className="text-xs text-muted-foreground font-medium">
										图片比例
									</span>
									<Select
										value={selectedRatio}
										onValueChange={(v) => setRatio(v as AspectRatio)}
									>
										<SelectTrigger>
											<SelectValue placeholder="选择比例" />
										</SelectTrigger>
										<SelectContent>
											{RATIOS.map((r) => (
												<SelectItem key={r.label} value={r.label}>
													{r.label} ({r.width}×{r.height})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between">
									<span className="text-xs text-muted-foreground font-medium">
										显示标尺 / 网格
									</span>
									<Switch
										checked={showRuler}
										onCheckedChange={setShowRuler}
									/>
								</div>

								<div className="flex gap-2 pt-1">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 text-xs h-8"
										onClick={handleSaveTemplate}
									>
										<Save className="w-3 h-3 mr-1" />
										保存模板
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1 text-xs h-8"
										onClick={handleLoadTemplate}
									>
										<FolderOpen className="w-3 h-3 mr-1" />
										加载模板
									</Button>
								</div>
							</div>
						</SettingsCard>

						{/* Text Section */}
						<SettingsCard title="文字设置">
							<TextSettings />
						</SettingsCard>

						{/* Icon Section */}
						<SettingsCard title="图标设置">
							<IconSettings />
						</SettingsCard>

						{/* Background Section */}
						<SettingsCard title="背景设置">
							<BackgroundSettings />
						</SettingsCard>
					</div>
				</ScrollArea>
			</div>

			<ExportPanel />

			<TemplateDialog
				open={templateDialogOpen}
				onOpenChange={setTemplateDialogOpen}
				onLoad={handleApplyTemplate}
			/>
		</div>
	);
}
