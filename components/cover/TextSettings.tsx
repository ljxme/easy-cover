'use client';

import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SliderRow, InlineLabelRow } from '@/components/cover/controls-utils';
import { useCoverStore } from '@/store/useCoverStore';

const PRESET_FONTS = [
	{ label: '默认', value: 'inherit' },
	{ label: '思源黑体', value: '"Noto Sans SC", sans-serif' },
	{ label: '思源宋体', value: '"Noto Serif SC", serif' },
	{ label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
	{ label: '黑体', value: 'SimHei, sans-serif' },
	{ label: '宋体', value: 'SimSun, serif' },
	{ label: '楷体', value: 'KaiTi, serif' },
	{ label: '仿宋', value: 'FangSong, serif' },
	{ label: 'Arial', value: 'Arial, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Times New Roman', value: '"Times New Roman", serif' },
	{ label: 'Courier New', value: '"Courier New", monospace' },
];

export default function TextSettings() {
	const text = useCoverStore((s) => s.text);
	const updateText = useCoverStore((s) => s.updateText);

	return (
		<div className="flex flex-col gap-3">
			{/* Content */}
			<div className="flex flex-col gap-1.5">
				<span className="text-xs text-muted-foreground font-medium">内容</span>
				<Input
					value={text.content}
					onChange={(e) => updateText({ content: e.target.value })}
					className="bg-background"
				/>
			</div>

			{/* Font family */}
			<div className="flex flex-col gap-1.5">
				<span className="text-xs text-muted-foreground font-medium">字体</span>
				<Select
					value={text.fontFamily}
					onValueChange={(v) => updateText({ fontFamily: v })}
				>
					<SelectTrigger>
						<SelectValue placeholder="选择字体" />
					</SelectTrigger>
					<SelectContent>
						{PRESET_FONTS.map((f) => (
							<SelectItem key={f.value} value={f.value}>
								<span style={{ fontFamily: f.value }}>{f.label}</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					value={text.fontFamily}
					onChange={(e) => updateText({ fontFamily: e.target.value })}
					placeholder="或输入自定义字体名称"
					className="bg-background text-xs"
				/>
			</div>

			{/* Font size */}
			<SliderRow
				label="大小"
				value={text.fontSize}
				min={12}
				max={2500}
				step={1}
				onValueChange={(v) => updateText({ fontSize: v })}
				resetValue={160}
			/>

			{/* Color */}
			<InlineLabelRow label="颜色">
				<ColorPicker
					color={text.color}
					onChange={(c) => updateText({ color: c })}
				/>
			</InlineLabelRow>

			{/* Stroke width */}
			<SliderRow
				label="描边宽度"
				value={text.strokeWidth}
				min={0}
				max={10}
				step={0.5}
				onValueChange={(v) => updateText({ strokeWidth: v })}
				resetValue={0}
			/>

			{/* Stroke color */}
			<InlineLabelRow label="描边颜色">
				<ColorPicker
					color={text.strokeColor}
					onChange={(c) => updateText({ strokeColor: c })}
				/>
			</InlineLabelRow>
		</div>
	);
}
