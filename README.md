# Easy Cover

A simple and elegant cover image generation tool.Runs entirely on the client side, protecting your privacy.

Forked from [AcoFork](https://github.com/afoim/easy_cover)

## Features

* **Pure Client-Side Generation**
  All image processing is performed entirely in the browser. No files are uploaded to any server.

* **Multiple Aspect Ratio Support**
  Supports a wide range of common cover ratios, including 1:1, 16:9, 21:9, 4:3, 2:1, and more.

* **Rich Icon Library**
  Integrated with Iconify, allowing you to search and use tens of thousands of icons.

* **Highly Customizable**

  * **Icons**: Adjustable size, rotation, color, shadow, container shape (circle / square / rounded), and frosted glass effects (Gaussian blur + opacity).
  * **Text**: Custom content, font size, color, and stroke.
  * **Background**: Solid color backgrounds or image backgrounds, with support for scaling, rotation, translation, and blur.

* **Intelligent Layout**
  Automatic center alignment with support for both “contain” and “cover” image fitting modes.

* **Clean Export**
  One-click PNG export that automatically hides guides and rulers.

## Tech Stack

* [Next.js](https://nextjs.org/) — React framework
* [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
* [Shadcn/ui](https://ui.shadcn.com/) — UI component library
* [Zustand](https://github.com/pmndrs/zustand) — State management
* [Iconify](https://iconify.design/) — Icon solution
* [html-to-image](https://github.com/bubkoo/html-to-image) — DOM-to-image rendering

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ljxme/easy-cover.git
cd easy-cover
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open your browser and visit `http://localhost:3110` to start using the application.

## Usage Guide

1. **Select Layout**
   Choose the desired image aspect ratio (e.g., 16:9) from the left panel.

2. **Configure Content**
   Enter the cover title and adjust the text size and color.

3. **Add Icons**
   Use the icon picker to search and select an icon. Customize its style and container background, including frosted glass effects.

4. **Configure Background**
   Select a solid color background or upload a local image. Use the “Contain” or “Cover” buttons to quickly adjust image fitting.

5. **Export**
   Click the “Export Cover Image” button at the bottom to save the generated image.

---

## Deployment

This project is configured for static export (`output: 'export'`) and can be deployed to any static hosting service.

### Deploying on Vercel

1. Fork this repository.
2. Import the project into Vercel.
3. Vercel will automatically detect the Next.js framework.
4. **Important**: Ensure the build command is `npm run build` (default), and the output directory is `out` (the default directory for Next.js static exports).

   * Note: The project already enables `output: 'export'` in `next.config.ts`, so no additional configuration is required.

## License

This project is licensed under the [AGPL-3.0](LICENSE) license.

---

Made with ❤️ by Ljx | Inspired ✨ by [AcoFork](https://github.com/afoim)
