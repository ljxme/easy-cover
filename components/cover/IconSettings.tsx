'use client';

import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { IconPicker } from '@/components/cover/IconPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NumberInput, ResetButton } from '@/components/cover/controls-utils';
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
		<div className="space-y-4">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="picker">选择图标</TabsTrigger>
					<TabsTrigger value="upload">上传图标</TabsTrigger>
				</TabsList>

				<TabsContent value="picker" className="space-y-3 mt-4">
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label className="text-xs text-muted-foreground">搜索图标</Label>
							<a
								href="https://yesicon.app/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-[10px] text-muted-foreground flex items-center hover:text-primary hover:underline"
							>
								查找图标名称{' '}
								<ExternalLink className="w-3 h-3 ml-0.5" />
							</a>
						</div>
						<IconPicker
							value={icon.name}
							onChange={(v) => {
								updateIcon({ name: v, customIconUrl: undefined });
							}}
						/>
						<div className="text-center pt-1">
							<button
								type="button"
								className="text-[10px] text-muted-foreground hover:text-primary hover:underline cursor-pointer"
								onClick={() => setActiveTab('upload')}
							>
								没有找到想要的？手动上传！
							</button>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="upload" className="space-y-3 mt-4">
					<div className="space-y-2">
						<Label className="text-xs text-muted-foreground">上传图片</Label>
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
						{icon.customIconUrl && (
							<>
								<div className="space-y-3">
									<div className="flex justify-between items-center gap-2">
										<Label className="text-sm">图片圆角</Label>
										<div className="flex items-center gap-2">
											<NumberInput
												value={icon.customIconRadius}
												min={0}
												max={1000}
												step={5}
												onValueChange={(v) =>
													updateIcon({ customIconRadius: v })
												}
											/>
											<ResetButton
												onClick={() => updateIcon({ customIconRadius: 0 })}
											/>
										</div>
									</div>
									<Slider
										value={[icon.customIconRadius]}
										min={0}
										max={1000}
										step={5}
										onValueChange={(v) =>
											updateIcon({ customIconRadius: v[0] })
										}
										aria-label="图片圆角"
									/>
								</div>

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
					</div>
				</TabsContent>
			</Tabs>

			<div className="space-y-3">
				<div className="flex justify-between items-center gap-2">
					<Label className="text-sm">大小</Label>
					<div className="flex items-center gap-2">
						<NumberInput
							value={icon.size}
							min={20}
							max={2500}
							step={5}
							onValueChange={(v) => updateIcon({ size: v })}
						/>
						<ResetButton onClick={() => updateIcon({ size: 120 })} />
					</div>
				</div>
				<Slider
					value={[icon.size]}
					min={20}
					max={2500}
					step={5}
					onValueChange={(v) => updateIcon({ size: v[0] })}
					aria-label="图标大小"
				/>
			</div>

			<div className="space-y-3">
				<div className="flex justify-between items-center gap-2">
					<Label className="text-sm">旋转</Label>
					<div className="flex items-center gap-2">
						<NumberInput
							value={icon.rotation}
							min={0}
							max={360}
							step={1}
							onValueChange={(v) => updateIcon({ rotation: v })}
						/>
						<ResetButton onClick={() => updateIcon({ rotation: 0 })} />
					</div>
				</div>
				<Slider
					value={[icon.rotation]}
					min={0}
					max={360}
					step={1}
					onValueChange={(v) => updateIcon({ rotation: v[0] })}
					aria-label="图标旋转"
				/>
			</div>

			<div className="flex items-center justify-between">
				<Label className="text-sm">图标着色</Label>
				<ColorPicker
					color={icon.color}
					onChange={(c) => updateIcon({ color: c })}
				/>
			</div>

			<div className="flex items-center justify-between">
				<Label htmlFor="icon-shadow" className="text-sm">
					阴影
				</Label>
				<Switch
					id="icon-shadow"
					checked={icon.shadow}
					onCheckedChange={(c) => updateIcon({ shadow: c })}
				/>
			</div>

			{icon.shadow && (
				<div className="space-y-3 p-3 bg-muted/50 rounded-lg border">
					<div className="flex items-center justify-between">
						<Label className="text-xs">阴影颜色</Label>
						<ColorPicker
							color={icon.shadowColor}
							onChange={(c) => updateIcon({ shadowColor: c })}
						/>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-xs">模糊</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={icon.shadowBlur}
									min={0}
									max={100}
									step={1}
									onValueChange={(v) => updateIcon({ shadowBlur: v })}
								/>
								<ResetButton onClick={() => updateIcon({ shadowBlur: 6 })} />
							</div>
						</div>
						<Slider
							value={[icon.shadowBlur]}
							min={0}
							max={100}
							step={1}
							onValueChange={(v) => updateIcon({ shadowBlur: v[0] })}
							aria-label="阴影模糊"
						/>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-xs">垂直偏移</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={icon.shadowOffsetY}
									min={-50}
									max={50}
									step={1}
									onValueChange={(v) => updateIcon({ shadowOffsetY: v })}
								/>
								<ResetButton
									onClick={() => updateIcon({ shadowOffsetY: 4 })}
								/>
							</div>
						</div>
						<Slider
							value={[icon.shadowOffsetY]}
							min={-50}
							max={50}
							step={1}
							onValueChange={(v) => updateIcon({ shadowOffsetY: v[0] })}
							aria-label="阴影垂直偏移"
						/>
					</div>
				</div>
			)}

			<Separator className="my-2" />

			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">图标容器形状</Label>
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
					<div className="flex items-center justify-between">
						<Label className="text-sm">容器颜色</Label>
						<ColorPicker
							color={icon.bgColor}
							onChange={(c) => updateIcon({ bgColor: c })}
						/>
					</div>
					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-sm">内边距</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={icon.padding}
									min={0}
									max={100}
									step={5}
									onValueChange={(v) => updateIcon({ padding: v })}
								/>
								<ResetButton onClick={() => updateIcon({ padding: 40 })} />
							</div>
						</div>
						<Slider
							value={[icon.padding]}
							min={0}
							max={100}
							step={5}
							onValueChange={(v) => updateIcon({ padding: v[0] })}
							aria-label="内边距"
						/>
					</div>
					{icon.bgShape === 'rounded-square' && (
						<div className="space-y-3">
							<div className="flex justify-between items-center gap-2">
								<Label className="text-sm">容器圆角</Label>
								<div className="flex items-center gap-2">
									<NumberInput
										value={icon.radius}
										min={0}
										max={200}
										step={5}
										onValueChange={(v) => updateIcon({ radius: v })}
									/>
									<ResetButton onClick={() => updateIcon({ radius: 40 })} />
								</div>
							</div>
							<Slider
								value={[icon.radius]}
								min={0}
								max={200}
								step={5}
								onValueChange={(v) => updateIcon({ radius: v[0] })}
								aria-label="容器圆角"
							/>
						</div>
					)}

					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-sm">
								容器透明度 ({(icon.bgOpacity * 100).toFixed(0)}%)
							</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={Number((icon.bgOpacity * 100).toFixed(0))}
									min={0}
									max={100}
									step={1}
									onValueChange={(v) => updateIcon({ bgOpacity: v / 100 })}
								/>
								<ResetButton onClick={() => updateIcon({ bgOpacity: 1 })} />
							</div>
						</div>
						<Slider
							value={[icon.bgOpacity]}
							min={0}
							max={1}
							step={0.01}
							onValueChange={(v) => updateIcon({ bgOpacity: v[0] })}
							aria-label="容器透明度"
						/>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center gap-2">
							<Label className="text-sm">容器模糊</Label>
							<div className="flex items-center gap-2">
								<NumberInput
									value={icon.bgBlur}
									min={0}
									max={50}
									step={1}
									onValueChange={(v) => updateIcon({ bgBlur: v })}
								/>
								<ResetButton onClick={() => updateIcon({ bgBlur: 0 })} />
							</div>
						</div>
						<Slider
							value={[icon.bgBlur]}
							min={0}
							max={50}
							step={1}
							onValueChange={(v) => updateIcon({ bgBlur: v[0] })}
							aria-label="容器模糊"
						/>
					</div>
				</>
			)}
		</div>
	);
}
