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
| `VITE_API_ENDPOINT` | API base URL. Leave empty for development (uses Vite proxy). For production, use the full URL (e.g. `https://www.[domain].com/`). |

### Example

- **Development** (`.env.development`): `VITE_API_ENDPOINT=` (empty – API requests go through Vite proxy to `http://localhost:5000`)
- **Production**: `VITE_API_ENDPOINT=https://www.[domain].com/`

## Proxy Configuration

In development, Vite proxies `/api` to `http://localhost:5000`, so the backend must run on that port.

## Architecture

- **Framework**: Svelte 5 with runes
- **Routing**: svelte-spa-router
- **Auth**: JWT (Bearer token) + refresh token (cookies)
- **Backend**: `node-server-ts-public`

## About

This is a note taking app. The notes can be written using [Markdown](https://www.markdownguide.org/).

# Folders

Folders can be created for organising the Notes. The name and colour of these Folders can be updated. Empty Folders can be deleted. The Notes within a Folder can be moved to other Folders.
To create a Folder select the **Add Notebook** button on the Notebooks page. An "Add Folder" dialogue box will appear. Add the Notebook name and colour and select the **Add Notebook** button to create the new Folder.

# Notes

To create a new Note select the Notebook where that Note will be stored and then select the **Add Note** button. An empty Note will be created within the current Folder. Enter Markdown into the empty Note and then select the **Create Note** button.

By default the notes are displayed as rendered Markdown. The notes can be edited by selecting the **Edit** button which will display the unrendered Markdown. Selecting the **View** button will display the rendered Markdown.

To move a Note or Notes from a Folder select the **Edit Notes** button. All the Notes within that folder will become selectable. Select those Notes which you want to move and then select the **Move** button. A dialogue box will appear with a dropdown list showing all available Notebooks. Select the destination Notebook and then select the **Move Note/s** button.

To delete a Note or Notes from a folder select the **Edit Notes** button. All the notes within that folder will become selectable. Select those Notes which you want to delete and then select the **Delete** button. The selected Notes will be deleted.

The Notebooks and the Notes in a Notebook are displayed in the order which they were updated.
