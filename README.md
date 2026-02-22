# Snaply - Screenshot Stylizer

Transform raw screenshots into polished, shareable visuals with beautiful gradients, shadows, rounded corners, and instant exports. A fast, privacy-focused web app that processes everything locally in your browser.

![Snaply Preview](public/logo.png)

## Features

- **15+ Style Presets** - One-click transformations with curated styles like Candy Pop, Glassmorphism, Neon Cyber, and more
- **Full Customization** - Fine-tune padding, border radius, shadow intensity, and aspect ratios
- **Gradient Backgrounds** - Beautiful gradient options with custom color pickers
- **Blur Effect** - Glassmorphism-style blurred backdrop using your screenshot
- **Multiple Aspect Ratios** - Auto, 1:1 (Square), 16:9 (Landscape), 4:5 (Portrait), 9:16 (Story)
- **Export Formats** - Download as PNG (lossless), JPEG (smaller), or WebP (modern)
- **2x Resolution Export** - High-quality exports for retina displays
- **Dark/Light Theme** - Toggle between themes with system preference detection
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Privacy First** - All processing happens locally; no images are uploaded to any server

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd screenshot-stylizer

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

| Category         | Technology                   |
| ---------------- | ---------------------------- |
| Framework        | React 18 + TypeScript        |
| Build Tool       | Vite 5                       |
| Styling          | Tailwind CSS 3.4             |
| UI Components    | shadcn/ui (Radix primitives) |
| Icons            | Lucide React                 |
| Theme Management | next-themes                  |
| Notifications    | Sonner                       |
| Routing          | React Router DOM 6           |

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (button, slider, etc.)
│   ├── CanvasRenderer.tsx     # Core canvas rendering with effects
│   ├── ExportButton.tsx       # Format selection & download
│   ├── ImageUpload.tsx        # Drag & drop image upload
│   ├── SettingsPanel.tsx      # Customization controls
│   ├── StylePresets.tsx       # Preset style cards
│   ├── ThemeToggle.tsx        # Dark/light mode switch
│   └── theme-provider.tsx     # Theme context provider
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notifications
├── lib/
│   └── utils.ts               # Utility functions (cn helper)
├── pages/
│   ├── Index.tsx              # Main application page
│   └── NotFound.tsx           # 404 fallback page
├── types/
│   └── beautifier.ts          # TypeScript types & style presets
├── App.tsx                    # App wrapper with router
├── main.tsx                   # Entry point
└── index.css                  # Global styles & CSS variables
```

## Available Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Production build (optimized)             |
| `npm run build:dev` | Development build (unminified)           |
| `npm run preview`   | Preview production build locally         |
| `npm run lint`      | Run ESLint on the codebase               |

## Core Components

### CanvasRenderer

The heart of the application. Uses HTML5 Canvas API to render styled screenshots with:

- Gradient or solid color backgrounds
- Configurable drop shadows with blur
- Rounded corners via canvas clipping paths
- Glassmorphism blur effect
- High-resolution 2x export

### StylePresets

Pre-configured styles defined in [`src/types/beautifier.ts`](src/types/beautifier.ts:32):

| Preset         | Description                       |
| -------------- | --------------------------------- |
| Candy Pop      | Playful pastel pink gradient      |
| Tropical Burst | Warm orange-yellow gradient       |
| Glassmorphism  | Blurred backdrop with soft shadow |
| Soft Lavender  | Calm purple gradient              |
| Graphite       | Modern dark background            |
| Neon Cyber     | Vibrant cyan-magenta glow         |
| Royal Blue     | Clean blue gradient               |
| Pearl Light    | Smooth minimal white              |
| Ocean Gradient | Blue to teal waves                |
| And more...    |                                   |

### SettingsPanel

Fine-grained controls for:

- **Padding**: 16-120px
- **Border Radius**: 0-48px
- **Shadow Intensity**: 0-80%
- **Aspect Ratio**: Auto, 1:1, 16:9, 4:5, 9:16
- **Background**: Solid color or gradient
- **Blur Effect**: Toggle glassmorphism

## How It Works

1. **Upload** - Drag & drop or click to upload a screenshot
2. **Style** - Choose a preset or customize settings manually
3. **Preview** - See real-time changes in the canvas preview
4. **Export** - Download in your preferred format (PNG/JPEG/WebP)

All processing happens client-side using the Canvas API. No server uploads required.

## Customization

### Adding New Presets

Edit [`src/types/beautifier.ts`](src/types/beautifier.ts:32) to add new style presets:

```typescript
export const presets: Preset[] = [
  {
    id: "my-preset",
    name: "My Preset",
    description: "Custom style",
    settings: {
      padding: 48,
      borderRadius: 16,
      shadowIntensity: 30,
      useGradient: true,
      gradientStart: "#ff0000",
      gradientEnd: "#0000ff",
      blurBackground: false,
    },
  },
  // ... other presets
];
```

### Theming

The app uses CSS variables for theming. Customize colors in [`src/index.css`](src/index.css):

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --background: 0 0% 100%;
  /* ... */
}

.dark {
  --primary: 210 40% 98%;
  --background: 222.2 84% 4.9%;
  /* ... */
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires Canvas API and modern CSS features (backdrop-filter, CSS variables).

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with React, TypeScript, and Tailwind CSS.
