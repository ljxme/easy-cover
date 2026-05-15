'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SliderRow, InlineLabelRow } from '@/components/cover/controls-utils';
import { RATIOS, useCoverStore } from '@/store/useCoverStore';

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

export default function BackgroundSettings() {
	const background = useCoverStore((s) => s.background);
	const selectedRatio = useCoverStore((s) => s.selectedRatio);
	const updateBackground = useCoverStore((s) => s.updateBackground);

	type BackgroundUpdate = Parameters<typeof updateBackground>[0];
	const blobUrlRef = useRef<string | null>(null);
	const fitRequestIdRef = useRef(0);

	useEffect(() => {
		return () => {
			if (blobUrlRef.current) {
				URL.revokeObjectURL(blobUrlRef.current);
			}
		};
	}, []);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
		updateBackground({ type: 'image', imageUrl: url });
	};

	const handleFit = useCallback(
		(mode: 'contain' | 'cover') => {
			const updates: BackgroundUpdate = {
				positionX: 50,
				positionY: 50,
				rotation: 0,
			};

			if (mode === 'contain') {
				updates.scale = 1;
			} else if (background.imageUrl) {
				const ratio = RATIOS.find((r) => r.label === selectedRatio);
				if (!ratio) {
					updates.scale = 1;
				} else {
					const canvasRatio = ratio.width / ratio.height;

					fitRequestIdRef.current += 1;
					const currentRequestId = fitRequestIdRef.current;

					const img = new Image();
					img.src = background.imageUrl;
					img.onload = () => {
						if (fitRequestIdRef.current !== currentRequestId) return;

						const imgRatio = img.naturalWidth / img.naturalHeight;

						let newScale = 1;
						if (imgRatio > canvasRatio) {
							newScale = imgRatio / canvasRatio;
						} else {
							newScale = canvasRatio / imgRatio;
						}

						updateBackground({ ...updates, scale: newScale * 1.01 });
					};
					return;
				}
			} else {
				updates.scale = 1;
			}
			updateBackground(updates);
		},
		[background.imageUrl, selectedRatio, updateBackground],
	);

	return (
		<div className="flex flex-col gap-3">
			<Tabs
				defaultValue={background.type}
				onValueChange={(v) =>
					updateBackground({ type: v as 'solid' | 'image' })
				}
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="solid">纯色背景</TabsTrigger>
					<TabsTrigger value="image">图片背景</TabsTrigger>
				</TabsList>

				<TabsContent value="solid" className="mt-3">
					<InlineLabelRow label="颜色">
						<ColorPicker
							color={background.color}
							onChange={(c) => updateBackground({ color: c })}
						/>
					</InlineLabelRow>
				</TabsContent>

				<TabsContent value="image" className="flex flex-col gap-3 mt-3">
					<div className="flex flex-col gap-1.5">
						<span className="text-xs text-muted-foreground font-medium">
							上传图片
						</span>
						<Input
							type="file"
							accept="image/png,image/jpeg,image/webp,image/svg+xml"
							onChange={handleImageUpload}
							className="bg-background"
							aria-label="上传背景图片"
						/>
						<p className="text-[10px] text-muted-foreground">
							支持 PNG、JPEG、WebP、SVG，最大 10MB
						</p>
					</div>

					<SliderRow
						label="高斯模糊"
						value={background.blur}
						min={0}
						max={50}
						step={1}
						onValueChange={(v) => updateBackground({ blur: v })}
						resetValue={0}
					/>

					{/* Image transform section */}
					<div className="flex flex-col gap-2 pt-2 border-t">
						<div className="flex items-center gap-1">
							<span className="text-xs text-muted-foreground font-medium w-full">
								图片变换
							</span>
							<Button
								variant="outline"
								size="sm"
								className="h-7 text-xs flex-1"
								onClick={() => handleFit('contain')}
							>
								<Maximize className="w-3 h-3 mr-1" />
								适应
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="h-7 text-xs flex-1"
								onClick={() => handleFit('cover')}
							>
								<Maximize className="w-3 h-3 mr-1 rotate-90" />
								铺满
							</Button>
						</div>

						<SliderRow
							label="缩放"
							value={Number(background.scale.toFixed(2))}
							min={0.1}
							max={10}
							step={0.1}
							onValueChange={(v) => updateBackground({ scale: v })}
							resetValue={1}
						/>

						<SliderRow
							label="水平位置"
							value={background.positionX}
							min={-500}
							max={500}
							step={1}
							onValueChange={(v) => updateBackground({ positionX: v })}
							resetValue={50}
						/>

						<SliderRow
							label="垂直位置"
							value={background.positionY}
							min={-500}
							max={500}
							step={1}
							onValueChange={(v) => updateBackground({ positionY: v })}
							resetValue={50}
						/>

						<SliderRow
							label="旋转"
							value={background.rotation}
							min={0}
							max={360}
							step={1}
							onValueChange={(v) => updateBackground({ rotation: v })}
							resetValue={0}
						/>
					</div>
				</TabsContent>
			</Tabs>

			{/* Shadow toggle */}
			<div className="flex items-center justify-between">
				<span className="text-xs text-muted-foreground font-medium">
					背景阴影
				</span>
				<Switch
					checked={background.shadow}
					onCheckedChange={(c) => updateBackground({ shadow: c })}
				/>
			</div>

			{/* Shadow settings panel */}
			{background.shadow && (
				<div className="flex flex-col gap-3 p-3 rounded-lg border bg-muted/30">
					<InlineLabelRow label="阴影颜色">
						<ColorPicker
							color={background.shadowColor}
							onChange={(c) => updateBackground({ shadowColor: c })}
						/>
					</InlineLabelRow>

					<SliderRow
						label="模糊"
						value={background.shadowBlur}
						min={0}
						max={200}
						step={1}
						onValueChange={(v) => updateBackground({ shadowBlur: v })}
						resetValue={30}
					/>

					<SliderRow
						label="垂直偏移"
						value={background.shadowOffsetY}
						min={-100}
						max={100}
						step={1}
						onValueChange={(v) => updateBackground({ shadowOffsetY: v })}
						resetValue={10}
					/>
				</div>
			)}
		</div>
	);
}
