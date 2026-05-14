'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NumberInput, ResetButton } from '@/components/cover/controls-utils';
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
		<div className="space-y-4">
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

				<TabsContent value="solid" className="space-y-3 mt-4">
					<div className="flex items-center justify-between">
						<Label className="text-sm">颜色</Label>
						<ColorPicker
							color={background.color}
							onChange={(c) => updateBackground({ color: c })}
						/>
					</div>
				</TabsContent>

				<TabsContent value="image" className="space-y-3 mt-4">
					<div className="space-y-2">
						<Label className="text-xs text-muted-foreground">上传图片</Label>
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

					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-sm">高斯模糊</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={background.blur}
									min={0}
									max={50}
									step={1}
									onValueChange={(v) => updateBackground({ blur: v })}
								/>
								<ResetButton
									onClick={() => updateBackground({ blur: 0 })}
								/>
							</div>
						</div>
						<Slider
							value={[background.blur]}
							min={0}
							max={50}
							step={1}
							onValueChange={(v) => updateBackground({ blur: v[0] })}
							aria-label="高斯模糊"
						/>
					</div>

					<div className="space-y-3 pt-2 border-t">
						<div className="flex items-center justify-between gap-1 flex-wrap">
							<Label className="text-xs font-semibold text-muted-foreground w-full mb-1">
								图片变换
							</Label>
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

						<div className="space-y-3">
							<div className="flex justify-between items-center gap-2">
								<Label className="text-xs">缩放</Label>
								<div className="flex items-center gap-2">
									<NumberInput
										value={Number(background.scale.toFixed(2))}
										min={0.1}
										max={10}
										step={0.1}
										onValueChange={(v) => updateBackground({ scale: v })}
									/>
									<ResetButton
										onClick={() => updateBackground({ scale: 1 })}
									/>
								</div>
							</div>
							<Slider
								value={[background.scale]}
								min={0.1}
								max={10}
								step={0.1}
								onValueChange={(v) => updateBackground({ scale: v[0] })}
								aria-label="缩放"
							/>
						</div>

						<div className="space-y-3">
							<div className="flex justify-between items-center gap-2">
								<Label className="text-xs">水平位置</Label>
								<div className="flex items-center gap-2">
									<NumberInput
										value={background.positionX}
										min={-500}
										max={500}
										step={1}
										onValueChange={(v) => updateBackground({ positionX: v })}
									/>
									<ResetButton
										onClick={() => updateBackground({ positionX: 50 })}
									/>
								</div>
							</div>
							<Slider
								value={[background.positionX]}
								min={-500}
								max={500}
								step={1}
								onValueChange={(v) =>
									updateBackground({ positionX: v[0] })
								}
								aria-label="水平位置"
							/>
						</div>

						<div className="space-y-3">
							<div className="flex justify-between items-center gap-2">
								<Label className="text-xs">垂直位置</Label>
								<div className="flex items-center gap-2">
									<NumberInput
										value={background.positionY}
										min={-500}
										max={500}
										step={1}
										onValueChange={(v) => updateBackground({ positionY: v })}
									/>
									<ResetButton
										onClick={() => updateBackground({ positionY: 50 })}
									/>
								</div>
							</div>
							<Slider
								value={[background.positionY]}
								min={-500}
								max={500}
								step={1}
								onValueChange={(v) =>
									updateBackground({ positionY: v[0] })
								}
								aria-label="垂直位置"
							/>
						</div>

						<div className="space-y-3">
							<div className="flex justify-between items-center gap-2">
								<Label className="text-xs">旋转</Label>
								<div className="flex items-center gap-2">
									<NumberInput
										value={background.rotation}
										min={0}
										max={360}
										step={1}
										onValueChange={(v) => updateBackground({ rotation: v })}
									/>
									<ResetButton
										onClick={() => updateBackground({ rotation: 0 })}
									/>
								</div>
							</div>
							<Slider
								value={[background.rotation]}
								min={0}
								max={360}
								step={1}
								onValueChange={(v) => updateBackground({ rotation: v[0] })}
								aria-label="旋转"
							/>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			<div className="flex items-center justify-between mt-2">
				<Label htmlFor="bg-shadow" className="text-sm">
					背景阴影
				</Label>
				<Switch
					id="bg-shadow"
					checked={background.shadow}
					onCheckedChange={(c) => updateBackground({ shadow: c })}
				/>
			</div>

			{background.shadow && (
				<div className="space-y-3 p-3 bg-muted/50 rounded-lg border mt-2">
					<div className="flex items-center justify-between">
						<Label className="text-xs">阴影颜色</Label>
						<ColorPicker
							color={background.shadowColor}
							onChange={(c) => updateBackground({ shadowColor: c })}
						/>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-xs">模糊</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={background.shadowBlur}
									min={0}
									max={200}
									step={1}
									onValueChange={(v) => updateBackground({ shadowBlur: v })}
								/>
								<ResetButton
									onClick={() => updateBackground({ shadowBlur: 30 })}
								/>
							</div>
						</div>
						<Slider
							value={[background.shadowBlur]}
							min={0}
							max={200}
							step={1}
							onValueChange={(v) =>
								updateBackground({ shadowBlur: v[0] })
							}
							aria-label="阴影模糊"
						/>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-xs">垂直偏移</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={background.shadowOffsetY}
									min={-100}
									max={100}
									step={1}
									onValueChange={(v) =>
										updateBackground({ shadowOffsetY: v })
									}
								/>
								<ResetButton
									onClick={() => updateBackground({ shadowOffsetY: 10 })}
								/>
							</div>
						</div>
						<Slider
							value={[background.shadowOffsetY]}
							min={-100}
							max={100}
							step={1}
							onValueChange={(v) =>
								updateBackground({ shadowOffsetY: v[0] })
							}
							aria-label="阴影偏移"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
