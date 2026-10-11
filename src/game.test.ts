import { describe, expect, it } from "vitest";
import type { InitApi } from "@clockwyrks/simple-2d";
import {
  BOARD_CX,
  BOARD_CY,
  CELL_PITCH,
  REFRACT_DEBUG_VERSION,
} from "./constants";
import { game, type RefractDebugApi, type RefractState } from "./game";

function init(): [RefractState, RefractDebugApi] {
  const api = {
    input: {
      register: () => undefined,
      layout: () => null,
    },
    audio: {
      define: () => undefined,
      load: () => Promise.resolve(),
    },
    assets: {
      loadImage: () => Promise.reject(new Error("unused")),
      loadAudio: () => Promise.reject(new Error("unused")),
      load: () => Promise.reject(new Error("unused")),
      resolve: (path: string) => `assets/${path}`,
    },
    diagnostics: {
      register: () => undefined,
    },
    events: {},
    viewport: () => ({
      width: 1280,
      height: 720,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }),
  } as unknown as InitApi<RefractState>;
  const initialized = game.initialize(api);
  if (initialized instanceof Promise)
    throw new Error("test expected sync init");
  return initialized;
}

function x(col: number, cols: number): number {
  return BOARD_CX - ((cols - 1) * CELL_PITCH) / 2 + col * CELL_PITCH;
}

function y(row: number, rows: number): number {
  return BOARD_CY - ((rows - 1) * CELL_PITCH) / 2 + row * CELL_PITCH;
}

describe("Refract simulation", () => {
  it("draws a complete beam through a lens and solves the posed board", () => {
    const initialized = init();
    let state = initialized[0];
    const debug = initialized[1];
    state = debug.loadBoard(state, ["TtT"]);

    state = debug.pointerDown(state, x(0, 3), y(0, 1));
    state = debug.pointerMove(state, x(1, 3), y(0, 1));
    state = debug.pointerMove(state, x(2, 3), y(0, 1));
    state = debug.pointerUp(state);

    const shot = debug.snapshot(state);
    expect(shot.version).toBe(REFRACT_DEBUG_VERSION);
    expect(shot.solved).toBe(true);
    expect(shot.screen).toBe("solved");
    expect(shot.beams.triangle?.complete).toBe(true);
    expect(shot.tracing).toBeNull();
  });

  it("refuses a segment into another channel's node", () => {
    const initialized = init();
    let state = initialized[0];
    const debug = initialized[1];
    state = debug.loadBoard(state, ["TST", ".S."]);

    state = debug.pointerDown(state, x(0, 3), y(0, 2));
    state = debug.pointerMove(state, x(1, 3), y(0, 2));

    const shot = debug.snapshot(state);
    expect(shot.beams.triangle?.cells).toEqual([{ col: 0, row: 0 }]);
    expect(shot.tracing?.channel).toBe("triangle");
  });

  it("spends every crystal charge exactly as beams enter crystals", () => {
    const initialized = init();
    let state = initialized[0];
    const debug = initialized[1];
    state = debug.loadBoard(state, ["T1T"]);

    state = debug.pointerDown(state, x(0, 3), y(0, 1));
    state = debug.pointerMove(state, x(1, 3), y(0, 1));
    state = debug.pointerMove(state, x(2, 3), y(0, 1));

    const crystal = debug
      .snapshot(state)
      .board.nodes.find((node) => node.kind === "crystal");
    expect(crystal?.spent).toBe(1);
    expect(debug.snapshot(state).solved).toBe(true);
  });

  it("generates cascade boards inside each tier's structural bounds", () => {
    const initialized = init();
    let state = initialized[0];
    const debug = initialized[1];
    for (let tier = 1; tier <= 5; tier += 1) {
      state = debug.generateBoard(state, tier);
      const shot = debug.snapshot(state);
      expect(shot.screen).toBe("playing");
      expect(shot.board.cols).toBeGreaterThanOrEqual(1);
      expect(shot.board.rows).toBeGreaterThanOrEqual(1);
      expect(Object.keys(shot.beams).length).toBeGreaterThan(0);
    }
  });
});
