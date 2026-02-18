# NOTES Svelte

A note-taking app built with Svelte 5, Vite, and TypeScript. Notes are written in [Markdown](https://www.markdownguide.org/).

## Getting Started

### Prerequisites

The app requires a backend server. Use the shared Node server in `node-server-ts-public`.

### Development

1. Start the backend server (e.g. `npm run dev` in `node-server-ts-public` on port 5000).
2. Start the Svelte app:

```sh
npm run dev
```

3. Open [http://localhost:5173/](http://localhost:5173/).

### Build

```sh
npm run build
```

The build output is in the `dist/` folder.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_ENDPOINT` | API base URL. Leave empty for development (uses Vite proxy). For production, use the full URL (e.g. `https://www.snipbee.com/`). |

### Example

- **Development** (`.env.development`): `VITE_API_ENDPOINT=` (empty – API requests go through Vite proxy to `http://localhost:5000`)
- **Production**: `VITE_API_ENDPOINT=https://www.snipbee.com/`

## Proxy Configuration

In development, Vite proxies `/api` to `http://localhost:5000`, so the backend must run on that port.

## Architecture

- **Framework**: Svelte 5 with runes
- **Routing**: svelte-spa-router
- **Auth**: JWT (Bearer token) + refresh token (cookies)
- **Backend**: `node-server-ts-public`

## Features

- **Notebooks**: Create, edit, and delete notebooks. Set name and cover color (default, red, green, blue).
- **Notes**: Create, edit, move, and delete notes. Markdown rendering with syntax highlighting.
- **Profile**: Change username and password.
