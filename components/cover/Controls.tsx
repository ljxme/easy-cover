"use client";

import { IconPicker } from "@/components/cover/IconPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RATIOS, useCoverStore } from "@/store/useCoverStore";
import { toPng } from "html-to-image";
import {
  Download,
  ExternalLink,
  Github,
  Maximize,
  RotateCcw,
} from "lucide-react";
import React from "react";

type IconBgShape = "none" | "circle" | "square" | "rounded-square";

// Helper component for Reset Button
const ResetButton = ({
  onClick,
  tooltip = "重置",
}: {
  onClick: () => void;
  tooltip?: string;
}) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-6 w-6 ml-2"
    onClick={onClick}
    title={tooltip}
  >
    <RotateCcw className="h-3 w-3" />
  </Button>
);

function clampNumber(value: number, min?: number, max?: number) {
  if (Number.isNaN(value)) return value;
  if (typeof min === "number") value = Math.max(min, value);
  if (typeof max === "number") value = Math.min(max, value);
  return value;
}

function NumberInput({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  className?: string;
}) {
  const [text, setText] = React.useState(() => String(value));

  React.useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = React.useCallback(() => {
    if (text.trim() === "") {
      setText(String(value));
      return;
    }

    const next = Number(text);
    if (!Number.isFinite(next)) {
      setText(String(value));
      return;
    }

    onValueChange(clampNumber(next, min, max));
  }, [max, min, onValueChange, text, value]);

  return (
    <Input
      type="number"
      inputMode="decimal"
      className={className ?? "h-7 w-24 px-2 py-1 text-xs"}
      value={text}
      min={min}
      max={max}
      step={step}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
    />
  );
}

export default function Controls() {
  const store = useCoverStore();
  type BackgroundUpdate = Parameters<typeof store.updateBackground>[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      store.updateBackground({ type: "image", imageUrl: url });
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      store.updateIcon({ customIconUrl: url });
    }
  };

  const handleExport = async () => {
    // This requires accessing the DOM node.
    // Ideally, we pass a ref or use an ID.
    // We'll target the container inside Canvas.
    // Since Controls is a sibling, we might need a way to signal.
    // For now, let's assume we can find the element by a known ID or class.
    // But `html-to-image` works best if we have the Ref.
    // I will dispatch a custom event or use a global ID.
    // Let's add an ID to the Canvas container in Canvas.tsx: id="canvas-export-target"

    const node = document.getElementById("canvas-export-target");
    if (!node) return;

    // We might need to handle scaling back to 1 before export, or html-to-image handles it.
    // Usually better to clone and export.
    // For now, simple attempt:
    try {
      const dataUrl = await toPng(node as HTMLElement, {
        quality: 0.95,
        pixelRatio: 1,
        skipFonts: true,
        filter: (node) => {
          // Exclude elements with the class 'export-exclude'
          if (node.classList?.contains("export-exclude")) {
            return false;
          }
          return true;
        },
      });
      const link = document.createElement("a");
      link.download = "easy-cover.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleFit = (mode: "contain" | "cover") => {
    // Always reset position and rotation
    const updates: BackgroundUpdate = {
      positionX: 50,
      positionY: 50,
      rotation: 0,
    };

    // We will simply reset scale to 1 and let user manually adjust if they want 'contain'.
    // But for 'cover', we try to calculate a scale that fills the canvas.

    if (mode === "contain") {
      updates.scale = 1;
    } else {
      // Calculate scale to cover
      // 1. Get current canvas dimensions
      const activeRatios = RATIOS.filter((r) =>
        store.selectedRatios.includes(r.label),
      );
      if (activeRatios.length > 0 && store.background.imageUrl) {
        const maxWidth = Math.max(...activeRatios.map((r) => r.width));
        const maxHeight = Math.max(...activeRatios.map((r) => r.height));
        const canvasRatio = maxWidth / maxHeight;

        // 2. Get image dimensions
        const img = new Image();
        img.src = store.background.imageUrl;
        img.onload = () => {
          const imgRatio = img.naturalWidth / img.naturalHeight;

          let newScale = 1;
          if (imgRatio > canvasRatio) {
            // Image is wider than canvas: Scale based on Height
            // Contain logic makes width match canvas (if img wider? No.)
            // Let's revisit:
            // In 'contain' (object-fit), img is scaled so it fits inside.
            // If imgRatio > canvasRatio (Image is flatter):
            //   It hits the sides first. Width = CanvasWidth. Height = Width / imgRatio.
            //   To cover, we need Height = CanvasHeight.
            //   Scale = CanvasHeight / CurrentHeight = CanvasHeight / (CanvasWidth / imgRatio)
            //         = (CanvasHeight / CanvasWidth) * imgRatio = imgRatio / canvasRatio.
            newScale = imgRatio / canvasRatio;
          } else {
            // Image is taller than canvas:
            //   It hits top/bottom first. Height = CanvasHeight. Width = Height * imgRatio.
            //   To cover, we need Width = CanvasWidth.
            //   Scale = CanvasWidth / CurrentWidth = CanvasWidth / (CanvasHeight * imgRatio)
            //         = (CanvasWidth / CanvasHeight) / imgRatio = canvasRatio / imgRatio.
            newScale = canvasRatio / imgRatio;
          }

          // Apply with a slight buffer to avoid sub-pixel gaps
          store.updateBackground({ ...updates, scale: newScale * 1.01 });
        };
        return; // Async update
      } else {
        // Fallback
        updates.scale = 1;
      }
    }
    store.updateBackground(updates);
  };

  const [activeTab, setActiveTab] = React.useState("picker");

  return (
    <div className="w-full md:w-80 h-1/2 md:h-full border-t md:border-t-0 md:border-r bg-background flex flex-col shadow-lg z-10">
      <div className="p-5 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <h1 className="text-xl font-bold flex items-center gap-2 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Easy Cover
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          简单优雅的封面图生成工具
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full bg-muted/5">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Layout Section */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="px-4 py-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium">布局设置</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    图片比例
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RATIOS.map((r) => (
                      <div
                        key={r.label}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`ratio-${r.label}`}
                          checked={store.selectedRatios.includes(r.label)}
                          onCheckedChange={() => store.toggleRatio(r.label)}
                        />
                        <label
                          htmlFor={`ratio-${r.label}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {r.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-ruler" className="text-sm">
                    显示标尺 / 网格
                  </Label>
                  <Switch
                    id="show-ruler"
                    checked={store.showRuler}
                    onCheckedChange={store.setShowRuler}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Text Section */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="px-4 py-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium">文字设置</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">内容</Label>
                  <Input
                    value={store.text.content}
                    onChange={(e) =>
                      store.updateText({ content: e.target.value })
                    }
                    className="bg-background"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <Label className="text-sm">大小</Label>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        value={store.text.fontSize}
                        min={12}
                        max={2500}
                        step={1}
                        onValueChange={(v) => store.updateText({ fontSize: v })}
                      />
                      <ResetButton
                        onClick={() => store.updateText({ fontSize: 160 })}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[store.text.fontSize]}
                    min={12}
                    max={2500}
                    step={1}
                    onValueChange={(v) => store.updateText({ fontSize: v[0] })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">颜色</Label>
                  <ColorPicker
                    color={store.text.color}
                    onChange={(c) => store.updateText({ color: c })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <Label className="text-sm">描边宽度</Label>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        value={store.text.strokeWidth}
                        min={0}
                        max={10}
                        step={0.5}
                        onValueChange={(v) =>
                          store.updateText({ strokeWidth: v })
                        }
                      />
                      <ResetButton
                        onClick={() => store.updateText({ strokeWidth: 0 })}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[store.text.strokeWidth]}
                    min={0}
                    max={10}
                    step={0.5}
                    onValueChange={(v) =>
                      store.updateText({ strokeWidth: v[0] })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">描边颜色</Label>
                  <ColorPicker
                    color={store.text.strokeColor}
                    onChange={(c) => store.updateText({ strokeColor: c })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Icon Section */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="px-4 py-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium">图标设置</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="picker">选择图标</TabsTrigger>
                    <TabsTrigger value="upload">上传图标</TabsTrigger>
                  </TabsList>

                  <TabsContent value="picker" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-muted-foreground">
                          搜索图标
                        </Label>
                        <a
                          href="https://yesicon.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-muted-foreground flex items-center hover:text-primary hover:underline"
                        >
                          查找图标名称{" "}
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                      <IconPicker
                        value={store.icon.name}
                        onChange={(v) => {
                          store.updateIcon({
                            name: v,
                            customIconUrl: undefined,
                          }); // Clear custom icon when picking new one
                        }}
                      />
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          className="text-[10px] text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                          onClick={() => setActiveTab("upload")}
                        >
                          没有找到想要的？手动上传！
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        上传图片
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="bg-background"
                      />
                      {store.icon.customIconUrl && (
                        <>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center gap-2">
                              <Label className="text-sm">图片圆角</Label>
                              <div className="flex items-center gap-2">
                                <NumberInput
                                  value={store.icon.customIconRadius}
                                  min={0}
                                  max={1000}
                                  step={5}
                                  onValueChange={(v) =>
                                    store.updateIcon({ customIconRadius: v })
                                  }
                                />
                                <ResetButton
                                  onClick={() =>
                                    store.updateIcon({ customIconRadius: 0 })
                                  }
                                />
                              </div>
                            </div>
                            <Slider
                              value={[store.icon.customIconRadius]}
                              min={0}
                              max={1000}
                              step={5}
                              onValueChange={(v) =>
                                store.updateIcon({ customIconRadius: v[0] })
                              }
                            />
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() =>
                              store.updateIcon({ customIconUrl: undefined })
                            }
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
                        value={store.icon.size}
                        min={20}
                        max={2500}
                        step={5}
                        onValueChange={(v) => store.updateIcon({ size: v })}
                      />
                      <ResetButton
                        onClick={() => store.updateIcon({ size: 120 })}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[store.icon.size]}
                    min={20}
                    max={2500}
                    step={5}
                    onValueChange={(v) => store.updateIcon({ size: v[0] })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <Label className="text-sm">旋转</Label>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        value={store.icon.rotation}
                        min={0}
                        max={360}
                        step={1}
                        onValueChange={(v) => store.updateIcon({ rotation: v })}
                      />
                      <ResetButton
                        onClick={() => store.updateIcon({ rotation: 0 })}
                      />
                    </div>
                  </div>
                  <Slider
                    value={[store.icon.rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(v) => store.updateIcon({ rotation: v[0] })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">图标着色</Label>
                  <ColorPicker
                    color={store.icon.color}
                    onChange={(c) => store.updateIcon({ color: c })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="icon-shadow" className="text-sm">
                    阴影
                  </Label>
                  <Switch
                    id="icon-shadow"
                    checked={store.icon.shadow}
                    onCheckedChange={(c) => store.updateIcon({ shadow: c })}
                  />
                </div>

                {store.icon.shadow && (
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">阴影颜色</Label>
                      <ColorPicker
                        color={store.icon.shadowColor}
                        onChange={(c) => store.updateIcon({ shadowColor: c })}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">模糊</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={store.icon.shadowBlur}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(v) =>
                              store.updateIcon({ shadowBlur: v })
                            }
                          />
                          <ResetButton
                            onClick={() => store.updateIcon({ shadowBlur: 6 })}
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.icon.shadowBlur]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) =>
                          store.updateIcon({ shadowBlur: v[0] })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">垂直偏移</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={store.icon.shadowOffsetY}
                            min={-50}
                            max={50}
                            step={1}
                            onValueChange={(v) =>
                              store.updateIcon({ shadowOffsetY: v })
                            }
                          />
                          <ResetButton
                            onClick={() =>
                              store.updateIcon({ shadowOffsetY: 4 })
                            }
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.icon.shadowOffsetY]}
                        min={-50}
                        max={50}
                        step={1}
                        onValueChange={(v) =>
                          store.updateIcon({ shadowOffsetY: v[0] })
                        }
                      />
                    </div>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    图标容器形状
                  </Label>
                  <Select
                    value={store.icon.bgShape}
                    onValueChange={(v) => {
                      const next = v as IconBgShape;
                      if (
                        next === "none" ||
                        next === "circle" ||
                        next === "square" ||
                        next === "rounded-square"
                      ) {
                        store.updateIcon({ bgShape: next });
                      }
                    }}
                  >
                    <SelectTrigger>
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

                {store.icon.bgShape !== "none" && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">容器颜色</Label>
                      <ColorPicker
                        color={store.icon.bgColor}
                        onChange={(c) => store.updateIcon({ bgColor: c })}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-sm">内边距</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={store.icon.padding}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(v) =>
                              store.updateIcon({ padding: v })
                            }
                          />
                          <ResetButton
                            onClick={() => store.updateIcon({ padding: 40 })}
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.icon.padding]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(v) =>
                          store.updateIcon({ padding: v[0] })
                        }
                      />
                    </div>
                    {store.icon.bgShape === "rounded-square" && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <Label className="text-sm">容器圆角</Label>
                          <div className="flex items-center gap-2">
                            <NumberInput
                              value={store.icon.radius}
                              min={0}
                              max={200}
                              step={5}
                              onValueChange={(v) =>
                                store.updateIcon({ radius: v })
                              }
                            />
                            <ResetButton
                              onClick={() => store.updateIcon({ radius: 40 })}
                            />
                          </div>
                        </div>
                        <Slider
                          value={[store.icon.radius]}
                          min={0}
                          max={200}
                          step={5}
                          onValueChange={(v) =>
                            store.updateIcon({ radius: v[0] })
                          }
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-sm">
                          容器透明度 ({(store.icon.bgOpacity * 100).toFixed(0)}
                          %)
                        </Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={Number(
                              (store.icon.bgOpacity * 100).toFixed(0),
                            )}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(v) =>
                              store.updateIcon({ bgOpacity: v / 100 })
                            }
                          />
                          <ResetButton
                            onClick={() => store.updateIcon({ bgOpacity: 1 })}
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.icon.bgOpacity]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(v) =>
                          store.updateIcon({ bgOpacity: v[0] })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-sm">容器模糊</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={store.icon.bgBlur}
                            min={0}
                            max={50}
                            step={1}
                            onValueChange={(v) =>
                              store.updateIcon({ bgBlur: v })
                            }
                          />
                          <ResetButton
                            onClick={() => store.updateIcon({ bgBlur: 0 })}
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.icon.bgBlur]}
                        min={0}
                        max={50}
                        step={1}
                        onValueChange={(v) =>
                          store.updateIcon({ bgBlur: v[0] })
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Background Section */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="px-4 py-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium">背景设置</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <Tabs
                  defaultValue={store.background.type}
                  onValueChange={(v) =>
                    store.updateBackground({ type: v as "solid" | "image" })
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
                        color={store.background.color}
                        onChange={(c) => store.updateBackground({ color: c })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        上传图片
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-sm">高斯模糊</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={store.background.blur}
                            min={0}
                            max={50}
                            step={1}
                            onValueChange={(v) =>
                              store.updateBackground({ blur: v })
                            }
                          />
                          <ResetButton
                            onClick={() => store.updateBackground({ blur: 0 })}
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.background.blur]}
                        min={0}
                        max={50}
                        step={1}
                        onValueChange={(v) =>
                          store.updateBackground({ blur: v[0] })
                        }
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
                          onClick={() => handleFit("contain")}
                        >
                          <Maximize className="w-3 h-3 mr-1" />
                          适应
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs flex-1"
                          onClick={() => handleFit("cover")}
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
                              value={Number(store.background.scale.toFixed(2))}
                              min={0.1}
                              max={10}
                              step={0.1}
                              onValueChange={(v) =>
                                store.updateBackground({ scale: v })
                              }
                            />
                            <ResetButton
                              onClick={() =>
                                store.updateBackground({ scale: 1 })
                              }
                            />
                          </div>
                        </div>
                        <Slider
                          value={[store.background.scale]}
                          min={0.1}
                          max={10}
                          step={0.1}
                          onValueChange={(v) =>
                            store.updateBackground({ scale: v[0] })
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <Label className="text-xs">水平位置</Label>
                          <div className="flex items-center gap-2">
                            <NumberInput
                              value={store.background.positionX}
                              min={-500}
                              max={500}
                              step={1}
                              onValueChange={(v) =>
                                store.updateBackground({ positionX: v })
                              }
                            />
                            <ResetButton
                              onClick={() =>
                                store.updateBackground({ positionX: 50 })
                              }
                            />
                          </div>
                        </div>
                        <Slider
                          value={[store.background.positionX]}
                          min={-500}
                          max={500}
                          step={1}
                          onValueChange={(v) =>
                            store.updateBackground({ positionX: v[0] })
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <Label className="text-xs">垂直位置</Label>
                          <div className="flex items-center gap-2">
                            <NumberInput
                              value={store.background.positionY}
                              min={-500}
                              max={500}
                              step={1}
                              onValueChange={(v) =>
                                store.updateBackground({ positionY: v })
                              }
                            />
                            <ResetButton
                              onClick={() =>
                                store.updateBackground({ positionY: 50 })
                              }
                            />
                          </div>
                        </div>
                        <Slider
                          value={[store.background.positionY]}
                          min={-500}
                          max={500}
                          step={1}
                          onValueChange={(v) =>
                            store.updateBackground({ positionY: v[0] })
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <Label className="text-xs">旋转</Label>
                          <div className="flex items-center gap-2">
                            <NumberInput
                              value={store.background.rotation}
                              min={0}
                              max={360}
                              step={1}
                              onValueChange={(v) =>
                                store.updateBackground({ rotation: v })
                              }
                            />
                            <ResetButton
                              onClick={() =>
                                store.updateBackground({ rotation: 0 })
                              }
                            />
                          </div>
                        </div>
                        <Slider
                          value={[store.background.rotation]}
                          min={0}
                          max={360}
                          step={1}
                          onValueChange={(v) =>
                            store.updateBackground({ rotation: v[0] })
                          }
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
                    checked={store.background.shadow}
                    onCheckedChange={(c) =>
                      store.updateBackground({ shadow: c })
                    }
                  />
                </div>

                {store.background.shadow && (
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg border mt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">阴影颜色</Label>
                      <ColorPicker
                        color={store.background.shadowColor}
                        onChange={(c) =>
                          store.updateBackground({ shadowColor: c })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">模糊</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={store.background.shadowBlur}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={(v) =>
                              store.updateBackground({ shadowBlur: v })
                            }
                          />
                          <ResetButton
                            onClick={() =>
                              store.updateBackground({ shadowBlur: 30 })
                            }
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.background.shadowBlur]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={(v) =>
                          store.updateBackground({ shadowBlur: v[0] })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">垂直偏移</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput
                            value={store.background.shadowOffsetY}
                            min={-100}
                            max={100}
                            step={1}
                            onValueChange={(v) =>
                              store.updateBackground({ shadowOffsetY: v })
                            }
                          />
                          <ResetButton
                            onClick={() =>
                              store.updateBackground({ shadowOffsetY: 10 })
                            }
                          />
                        </div>
                      </div>
                      <Slider
                        value={[store.background.shadowOffsetY]}
                        min={-100}
                        max={100}
                        step={1}
                        onValueChange={(v) =>
                          store.updateBackground({ shadowOffsetY: v[0] })
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

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
    </div>
  );
}
