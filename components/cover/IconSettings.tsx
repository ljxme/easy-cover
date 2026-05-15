'use client';

import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { IconPicker } from '@/components/cover/IconPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SliderRow, InlineLabelRow } from '@/components/cover/controls-utils';
import { useCoverStore } from '@/store/useCoverStore';

type IconBgShape = 'none' | 'circle' | 'square' | 'rounded-square';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateImageFile(file: File): string | null {
	if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
		return '仅支持 PNG、JPEG、WebP、SVG 格式';
	}
	if (file.size > MAX_FILE_SIZE) {
		return '文件大小不能超过 10MB';
	}
	return null;
}

export default function IconSettings() {
	const icon = useCoverStore((s) => s.icon);
	const updateIcon = useCoverStore((s) => s.updateIcon);

	const [activeTab, setActiveTab] = React.useState('picker');
	const blobUrlRef = useRef<string | null>(null);

	useEffect(() => {
		return () => {
			if (blobUrlRef.current) {
				URL.revokeObjectURL(blobUrlRef.current);
			}
		};
	}, []);

	const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const error = validateImageFile(file);
		if (error) {
			alert(error);
			e.target.value = '';
			return;
		}

		if (blobUrlRef.current) {
			URL.revokeObjectURL(blobUrlRef.current);
		}
		const url = URL.createObjectURL(file);
		blobUrlRef.current = url;
		updateIcon({ customIconUrl: url });
	};

	return (
		<div className="flex flex-col gap-3">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="picker">选择图标</TabsTrigger>
					<TabsTrigger value="upload">上传图标</TabsTrigger>
				</TabsList>

				<TabsContent value="picker" className="flex flex-col gap-3 mt-3">
					<div className="flex justify-between items-center">
						<span className="text-xs text-muted-foreground font-medium">
							搜索图标
						</span>
						<a
							href="https://yesicon.app/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[10px] text-muted-foreground flex items-center hover:text-primary hover:underline"
						>
							查找图标名称 <ExternalLink className="w-3 h-3 ml-0.5" />
						</a>
					</div>
					<IconPicker
						value={icon.name}
						onChange={(v) => {
							updateIcon({ name: v, customIconUrl: undefined });
						}}
					/>
					<div className="text-center">
						<button
							type="button"
							className="text-[10px] text-muted-foreground hover:text-primary hover:underline cursor-pointer"
							onClick={() => setActiveTab('upload')}
						>
							没有找到想要的？手动上传！
						</button>
					</div>
				</TabsContent>

				<TabsContent value="upload" className="flex flex-col gap-3 mt-3">
					<div className="flex flex-col gap-1.5">
						<span className="text-xs text-muted-foreground font-medium">
							上传图片
						</span>
						<Input
							type="file"
							accept="image/png,image/jpeg,image/webp,image/svg+xml"
							onChange={handleIconUpload}
							className="bg-background"
							aria-label="上传自定义图标"
						/>
						<p className="text-[10px] text-muted-foreground">
							支持 PNG、JPEG、WebP、SVG，最大 10MB
						</p>
					</div>

					{icon.customIconUrl && (
						<>
							<SliderRow
								label="图片圆角"
								value={icon.customIconRadius}
								min={0}
								max={1000}
								step={5}
								onValueChange={(v) => updateIcon({ customIconRadius: v })}
								resetValue={0}
							/>

							<Button
								variant="outline"
								size="sm"
								className="w-full text-xs"
								onClick={() => {
									if (blobUrlRef.current) {
										URL.revokeObjectURL(blobUrlRef.current);
										blobUrlRef.current = null;
									}
									updateIcon({ customIconUrl: undefined });
								}}
							>
								清除自定义图标 (使用默认图标)
							</Button>
						</>
					)}
				</TabsContent>
			</Tabs>

			<SliderRow
				label="大小"
				value={icon.size}
				min={20}
				max={2500}
				step={5}
				onValueChange={(v) => updateIcon({ size: v })}
				resetValue={120}
			/>

			<SliderRow
				label="旋转"
				value={icon.rotation}
				min={0}
				max={360}
				step={1}
				onValueChange={(v) => updateIcon({ rotation: v })}
				resetValue={0}
			/>

			<InlineLabelRow label="图标着色">
				<ColorPicker
					color={icon.color}
					onChange={(c) => updateIcon({ color: c })}
				/>
			</InlineLabelRow>

			<div className="flex items-center justify-between">
				<span className="text-xs text-muted-foreground font-medium">阴影</span>
				<Switch
					checked={icon.shadow}
					onCheckedChange={(c) => updateIcon({ shadow: c })}
				/>
			</div>

			{icon.shadow && (
				<div className="flex flex-col gap-3 p-3 rounded-lg border bg-muted/30">
					<InlineLabelRow label="阴影颜色">
						<ColorPicker
							color={icon.shadowColor}
							onChange={(c) => updateIcon({ shadowColor: c })}
						/>
					</InlineLabelRow>

					<SliderRow
						label="模糊"
						value={icon.shadowBlur}
						min={0}
						max={100}
						step={1}
						onValueChange={(v) => updateIcon({ shadowBlur: v })}
						resetValue={6}
					/>

					<SliderRow
						label="垂直偏移"
						value={icon.shadowOffsetY}
						min={-50}
						max={50}
						step={1}
						onValueChange={(v) => updateIcon({ shadowOffsetY: v })}
						resetValue={4}
					/>
				</div>
			)}

			<Separator />

			<div className="flex flex-col gap-1.5">
				<span className="text-xs text-muted-foreground font-medium">
					图标容器形状
				</span>
				<Select
					value={icon.bgShape}
					onValueChange={(v) => {
						const next = v as IconBgShape;
						if (
							next === 'none' ||
							next === 'circle' ||
							next === 'square' ||
							next === 'rounded-square'
						) {
							updateIcon({ bgShape: next });
						}
					}}
				>
					<SelectTrigger aria-label="容器形状">
						<SelectValue placeholder="容器形状" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">无</SelectItem>
						<SelectItem value="circle">圆形</SelectItem>
						<SelectItem value="square">方形</SelectItem>
						<SelectItem value="rounded-square">圆角矩形</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{icon.bgShape !== 'none' && (
				<>
					<InlineLabelRow label="容器颜色">
						<ColorPicker
							color={icon.bgColor}
							onChange={(c) => updateIcon({ bgColor: c })}
						/>
					</InlineLabelRow>

					<SliderRow
						label="内边距"
						value={icon.padding}
						min={0}
						max={100}
						step={5}
						onValueChange={(v) => updateIcon({ padding: v })}
						resetValue={40}
					/>

					{icon.bgShape === 'rounded-square' && (
						<SliderRow
							label="容器圆角"
							value={icon.radius}
							min={0}
							max={200}
							step={5}
							onValueChange={(v) => updateIcon({ radius: v })}
							resetValue={40}
						/>
					)}

					<SliderRow
						label={`容器透明度 (${(icon.bgOpacity * 100).toFixed(0)}%)`}
						value={icon.bgOpacity}
						min={0}
						max={1}
						step={0.01}
						onValueChange={(v) => updateIcon({ bgOpacity: v })}
						resetValue={1}
					/>

					<SliderRow
						label="容器模糊"
						value={icon.bgBlur}
						min={0}
						max={50}
						step={1}
						onValueChange={(v) => updateIcon({ bgBlur: v })}
						resetValue={0}
					/>
				</>
			)}
		</div>
	);
}
