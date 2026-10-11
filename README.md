# Refract

Refract is a browser puzzle game about drawing light across a dark optical
bench. Each board is a lattice of emitters, lenses, and crystals. Trace one beam
per channel, connect matching emitters, thread every matching lens, and spend
each crystal charge exactly.

## Install

```sh
npm ci
```

## Develop

```sh
npm run dev
```

Vite serves the game locally with hot reload. The game runs fully in the browser
and fetches no runtime assets.

## Build

```sh
npm run build
```

The production site is emitted to `dist/`, with `dist/index.html` as the static
entry point.

## Controls

- Pointer: press an emitter or beam end, then drag from node to node.
- Backtrack: drag onto the previous node in the live beam.
- Clear board: `R` or the `CLEAR` control.
- Menus: arrow keys or `WASD`; confirm with `Enter` or `Space`.
- Back: `Escape` or the `BACK` control.
- Mute: `M`.

## Modes

Campaign is a fixed course of 24 handcrafted boards. Solving a board unlocks
the next, and solved boards stay replayable for the session.

Cascade is an endless run of generated boards. Solving boards raises the tier,
adding more channels, crystals, and tighter routes.
