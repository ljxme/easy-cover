'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { Slider } from '@/components/ui/slider';
import { NumberInput, ResetButton } from '@/components/cover/controls-utils';
import { useCoverStore } from '@/store/useCoverStore';

export default function TextSettings() {
	const text = useCoverStore((s) => s.text);
	const updateText = useCoverStore((s) => s.updateText);

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">内容</Label>
				<Input
					value={text.content}
					onChange={(e) => updateText({ content: e.target.value })}
					className="bg-background"
				/>
			</div>

			<div className="space-y-3">
				<div className="flex justify-between items-center gap-2">
					<Label className="text-sm">大小</Label>
					<div className="flex items-center gap-2">
						<NumberInput
							value={text.fontSize}
							min={12}
							max={2500}
							step={1}
							onValueChange={(v) => updateText({ fontSize: v })}
						/>
						<ResetButton onClick={() => updateText({ fontSize: 160 })} />
					</div>
				</div>
				<Slider
					value={[text.fontSize]}
					min={12}
					max={2500}
					step={1}
					onValueChange={(v) => updateText({ fontSize: v[0] })}
				/>
			</div>

			<div className="flex items-center justify-between">
				<Label className="text-sm">颜色</Label>
				<ColorPicker
					color={text.color}
					onChange={(c) => updateText({ color: c })}
				/>
			</div>

			<div className="space-y-3">
				<div className="flex justify-between items-center gap-2">
					<Label className="text-sm">描边宽度</Label>
					<div className="flex items-center gap-2">
						<NumberInput
							value={text.strokeWidth}
							min={0}
							max={10}
							step={0.5}
							onValueChange={(v) => updateText({ strokeWidth: v })}
						/>
						<ResetButton onClick={() => updateText({ strokeWidth: 0 })} />
					</div>
				</div>
				<Slider
					value={[text.strokeWidth]}
					min={0}
					max={10}
					step={0.5}
					onValueChange={(v) => updateText({ strokeWidth: v[0] })}
				/>
			</div>

			<div className="flex items-center justify-between">
				<Label className="text-sm">描边颜色</Label>
				<ColorPicker
					color={text.strokeColor}
					onChange={(c) => updateText({ strokeColor: c })}
				/>
			</div>
		</div>
	);
}
