# Tharros — Premium AI Agent Studio

Tharros is an Ottawa-based specialized studio dedicated to building high-performance, practical AI agents for small businesses. We solve the "Small Business Trap" by automating lead capture, customer inquiry handling, and back-office admin.

**Live Site:** [https://tharros.ca](https://tharros.ca)

## 🚀 The Tharros Philosophy

We believe small businesses don't need "corporate AI strategies"—they need lightweight agents that work on Tuesday morning when the phone won't stop ringing.

- **Tailored, Not Generic**: Every agent is custom-trained on specific business knowledge.
- **Industrial Aesthetics**: Minimalist, high-performance interfaces featuring CRT scanlines, geometric grid overlays, and a "Command Console" persona.
- **Cinematic Navigation**: Optimized `PageTransition` system providing seamless, 250ms motion-orchestrated route changes.
- **Bento Grid Architecture**: Asymmetric, high-density layouts for clear information hierarchy.
- **Performance Hardened**: Implemented `content-visibility: auto`, dynamic imports, and GPU acceleration for flawless mobile performance.
- **Hyper-Local SEO**: Comprehensive JSON-LD suite (LocalBusiness, Organization, Service) tailored for the Ottawa-Kanata market.

## 🛠 Tech Stack

- **Core**: Next.js (App Router), React 19, TypeScript
- **Logic**: Relevance AI SDK (CRM Intake Agent Model)
- **Styling**: Tailwind CSS 4.0
- **Animations**: motion/react (Framer Motion)
- **Performance**: Content-visibility, Progressive Hydration, GPU acceleration

## 📁 Project Structure

- `/app`: Next.js App Router pages and global configurations.
- `/components`: Modular UI components (Hero, ChatDemo, ProblemSection, etc.).
- `/components/wrappers`: Client-side hydration wrappers for heavy AI components.
- `/public`: Static assets (Logos, OG images, favicon, icons).
- `THARROS_KNOWLEDGE_BASE.md`: The definitive source of truth for the Tharros brand mission.
- `AGENTS.md`: Internal guidelines for AI agent behavior and interface standards.
- `CLAUDE.md`: Developer-facing guidelines for design systems and code style.

## ⚡ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📄 License

Private. All rights reserved by Tharros.

