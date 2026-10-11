import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  BACK_LABEL,
  BINDINGS,
  BOARD_CX,
  BOARD_CY,
  CAMPAIGN_LENGTH,
  CELL_PITCH,
  CHANNELS,
  CLEAR_LABEL,
  CUES,
  GRID_MAX_COLS,
  GRID_MAX_ROWS,
  HUD_SOLVED_LABEL,
  HUD_TIER_LABEL,
  MAX_TIER,
  NODE_HIT_R,
  NODE_R,
  REFRACT_DEBUG_VERSION,
  SET_LABELS,
  SOLVED_ITEMS,
  SOLVED_TITLE_TEXT,
  STAGE_H,
  STAGE_W,
  TAGLINE_TEXT,
  TARGET_MIN_H,
  TARGET_MIN_W,
  TIER_ADVANCE,
  TIERS,
  TITLE_ITEMS,
  TITLE_TEXT,
} from "./constants";

export type Screen =
  "title" | "howto" | "select" | "playing" | "solved" | "complete";

export type Mode = "campaign" | "cascade";

export type Channel = "triangle" | "square" | "diamond";

export type NodeKind = "emitter" | "lens" | "crystal";

export interface Cell {
  readonly col: number;
  readonly row: number;
}

export interface NodeState {
  readonly col: number;
  readonly row: number;
  readonly kind: NodeKind;
  readonly channel: Channel | null;
  readonly charges: number | null;
}

export interface BoardState {
  readonly cols: number;
  readonly rows: number;
  readonly nodes: readonly NodeState[];
}

export interface BeamState {
  readonly channel: Channel;
  readonly cells: readonly Cell[];
}

export interface TraceState {
  readonly channel: Channel;
}

export type PointerDevice = "mouse" | "pen" | "touch";

export interface PointerState {
  readonly x: number;
  readonly y: number;
  readonly down: boolean;
  readonly device: PointerDevice;
}

export interface RefractState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;

  readonly board: BoardState;
  readonly beams: readonly BeamState[];
  readonly tracing: TraceState | null;

  readonly boardIndex: number;
  readonly solvedBoards: readonly number[];
  readonly unlockedCount: number;
  readonly selectIndex: number;

  readonly solvedCount: number;
  readonly tier: number;

  readonly pointer: PointerState;
  readonly armedTarget: string | null;
  readonly simTime: number;
  readonly muted: boolean;
}

interface Target {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface SnapshotNode extends NodeState {
  readonly x: number;
  readonly y: number;
  readonly spent: number | null;
}

interface SnapshotBeam {
  readonly cells: readonly Cell[];
  readonly complete: boolean;
}

export interface RefractSnapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly boardIndex: number;
  readonly solvedBoards: readonly number[];
  readonly unlockedCount: number;
  readonly selectIndex: number;
  readonly solvedCount: number;
  readonly tier: number;
  readonly board: {
    readonly cols: number;
    readonly rows: number;
    readonly nodes: readonly SnapshotNode[];
  };
  readonly beams: Partial<Record<Channel, SnapshotBeam>>;
  readonly solved: boolean;
  readonly tracing: { readonly channel: Channel; readonly live: Cell } | null;
  readonly pointer: PointerState;
  readonly targets: readonly Target[];
  readonly muted: boolean;
  readonly simTime: number;
}

export interface RefractDebugApi {
  readonly version: number;
  reset(state: DeepReadonly<RefractState>): RefractState;
  snapshot(state: DeepReadonly<RefractState>): RefractSnapshot;
  reconcile(state: DeepReadonly<RefractState>): RefractState;
  setMode(state: DeepReadonly<RefractState>, mode: Mode): RefractState;
  setScreen(state: DeepReadonly<RefractState>, screen: Screen): RefractState;
  setMenuIndex(state: DeepReadonly<RefractState>, index: number): RefractState;
  setSolvedCount(
    state: DeepReadonly<RefractState>,
    count: number,
  ): RefractState;
  setTier(state: DeepReadonly<RefractState>, tier: number): RefractState;
  generateBoard(state: DeepReadonly<RefractState>, tier: number): RefractState;
  loadBoard(
    state: DeepReadonly<RefractState>,
    board: readonly string[],
  ): RefractState;
  pointerDown(
    state: DeepReadonly<RefractState>,
    x: number,
    y: number,
    device?: PointerDevice,
  ): RefractState;
  pointerMove(
    state: DeepReadonly<RefractState>,
    x: number,
    y: number,
    device?: PointerDevice,
  ): RefractState;
  pointerUp(
    state: DeepReadonly<RefractState>,
    device?: PointerDevice,
  ): RefractState;
  clear(state: DeepReadonly<RefractState>): RefractState;
}

export const BACKGROUND = "#080910";

const CHANNEL_HUES: Record<Channel, string> = {
  triangle: "#ffcf5a",
  square: "#56d6ff",
  diamond: "#f073ff",
};

const CAMPAIGN_BOARDS: readonly (readonly string[])[] = [
  [".Tt", "ttT", ".tt"],
  [".tt", "TtT", "tt."],
  ["tTtt", "ttTt", "ttt."],
  ["Tt.t", "tTtt", ".ttt"],
  [".tTt", ".ttt", "ttTt", "tttt"],
  ["tttT", "ttt.", "t.tt", "ttTt"],
  ["STtt", "sstt", "ssTt", "Sss."],
  ["Sst..", "stTtt", "ssttt", "SsstT"],
  ["tSss", "2tss", "Ttss", "tTS."],
  ["Tt.T.", "ttt..", "t2sSs", "tSsss"],
  ["..t.s", "ttT2s", "ttS2S", "t.Tss"],
  ["Tttt.", "ttsSt", ".22t.", "ssST."],
  [".Ddd", "tTdD", "t22.", "tsSs", "T.S."],
  ["..tT.", "t2dD.", "T2t.s", "d2sss", "DSssS"],
  [".T.2t", "sDttt", "sS2Td", "ss22D", ".S.d."],
  ["..ttt", ".S2tt", "DsTsT", "d22d.", "SddD."],
  ["...ttd", "S2Ttdd", "t32Ddd", "Tss2d.", "sS.dD."],
  ["T.....", "ttDsss", "dd3222", ".dt3Ss", "DddTSs"],
  [".Dttt", ".dd3t", ".d2TT", "S2s2D", ".sSss"],
  [".S.tT.", "s2ttDd", "s2T2.d", "s22d3.", "ssSddD"],
  ["S2D..T", "d2ssts", ".D3S3s", ".dT32t", ".d2tt."],
  [".tt2d.", ".t2t2d", "t1DdSd", "2.S3dD", "TT2sd.", ".ssss."],
  ["s2SST..", "2232.t.", "stTsttt", "..t.t.t", "d22ttdD", "dD2dddd"],
  ["ssdd.d.", "2S.dd2d", "ssD..d.", "t2ttTdd", ".t323Dd", "ttT2sS."],
];

const CASCADE_TEMPLATES: Readonly<Record<number, readonly string[]>> = {
  1: CAMPAIGN_BOARDS[0],
  2: CAMPAIGN_BOARDS[6],
  3: CAMPAIGN_BOARDS[10],
  4: CAMPAIGN_BOARDS[13],
  5: CAMPAIGN_BOARDS[23],
};

const EMPTY_BOARD: BoardState = { cols: 1, rows: 1, nodes: [] };

function cellX(col: number, cols: number): number {
  return BOARD_CX - ((cols - 1) * CELL_PITCH) / 2 + col * CELL_PITCH;
}

function cellY(row: number, rows: number): number {
  return BOARD_CY - ((rows - 1) * CELL_PITCH) / 2 + row * CELL_PITCH;
}

function sameCell(a: Cell, b: Cell): boolean {
  return a.col === b.col && a.row === b.row;
}

function cellKey(cell: Cell): string {
  return `${cell.col},${cell.row}`;
}

function lastCell(cells: readonly Cell[]): Cell {
  return cells.length === 0
    ? { col: -1, row: -1 }
    : (cells[cells.length - 1] as Cell);
}

function segmentKey(a: Cell, b: Cell): string {
  const ak = cellKey(a);
  const bk = cellKey(b);
  return ak < bk ? `${ak}|${bk}` : `${bk}|${ak}`;
}

function isDiagonal(a: Cell, b: Cell): boolean {
  return Math.abs(a.col - b.col) === 1 && Math.abs(a.row - b.row) === 1;
}

function crossingKey(a: Cell, b: Cell): string | null {
  if (!isDiagonal(a, b)) return null;
  const minCol = Math.min(a.col, b.col);
  const minRow = Math.min(a.row, b.row);
  return `${minCol},${minRow}`;
}

function parseBoard(lines: readonly string[]): BoardState {
  if (lines.length < 1 || lines.length > GRID_MAX_ROWS) {
    throw new Error("loadBoard: board height is outside the supported grid");
  }
  const cols = lines[0]?.length ?? 0;
  if (cols < 1 || cols > GRID_MAX_COLS) {
    throw new Error("loadBoard: board width is outside the supported grid");
  }
  const nodes: NodeState[] = [];
  for (const [row, line] of lines.entries()) {
    if (line.length !== cols) throw new Error("loadBoard: board rows differ");
    for (let col = 0; col < line.length; col += 1) {
      const ch = line[col];
      const channel = notationChannel(ch);
      if (ch === ".") continue;
      if (channel !== null) {
        nodes.push({
          col,
          row,
          kind: ch === ch.toUpperCase() ? "emitter" : "lens",
          channel,
          charges: null,
        });
      } else if (ch === "1" || ch === "2" || ch === "3") {
        nodes.push({
          col,
          row,
          kind: "crystal",
          channel: null,
          charges: Number(ch),
        });
      } else {
        throw new Error(`loadBoard: unknown board notation "${ch}"`);
      }
    }
  }
  validateBoard({ cols, rows: lines.length, nodes });
  return { cols, rows: lines.length, nodes };
}

function notationChannel(ch: string): Channel | null {
  const lower = ch.toLowerCase();
  if (lower === "t") return "triangle";
  if (lower === "s") return "square";
  if (lower === "d") return "diamond";
  return null;
}

function validateBoard(board: BoardState): void {
  for (const channel of CHANNELS) {
    const emitters = board.nodes.filter(
      (node) => node.kind === "emitter" && node.channel === channel,
    );
    const usesChannel = board.nodes.some((node) => node.channel === channel);
    if (usesChannel && emitters.length !== 2) {
      throw new Error(`loadBoard: ${channel} needs exactly two emitters`);
    }
  }
}

function channelsInBoard(board: DeepReadonly<BoardState>): readonly Channel[] {
  return CHANNELS.filter((channel) =>
    board.nodes.some((node) => node.channel === channel),
  );
}

function emptyBeams(board: DeepReadonly<BoardState>): readonly BeamState[] {
  return channelsInBoard(board).map((channel) => ({ channel, cells: [] }));
}

function initialState(): RefractState {
  return {
    screen: "title",
    mode: "campaign",
    menuIndex: 0,
    board: EMPTY_BOARD,
    beams: [],
    tracing: null,
    boardIndex: 0,
    solvedBoards: [],
    unlockedCount: 1,
    selectIndex: 0,
    solvedCount: 0,
    tier: 1,
    pointer: { x: 0, y: 0, down: false, device: "mouse" },
    armedTarget: null,
    simTime: 0,
    muted: false,
  };
}

function findNode(
  board: DeepReadonly<BoardState>,
  cell: Cell,
): DeepReadonly<NodeState> | undefined {
  return board.nodes.find(
    (node) => node.col === cell.col && node.row === cell.row,
  );
}

function targetNode(
  board: DeepReadonly<BoardState>,
  x: number,
  y: number,
): DeepReadonly<NodeState> | undefined {
  return board.nodes.find((node) => {
    const dx = x - cellX(node.col, board.cols);
    const dy = y - cellY(node.row, board.rows);
    return Math.hypot(dx, dy) <= NODE_HIT_R;
  });
}

function beamFor(
  beams: DeepReadonly<readonly BeamState[]>,
  channel: Channel,
): DeepReadonly<BeamState> | undefined {
  return beams.find((beam) => beam.channel === channel);
}

function replaceBeam(
  beams: DeepReadonly<readonly BeamState[]>,
  beam: BeamState,
): readonly BeamState[] {
  return beams.map((current) =>
    current.channel === beam.channel ? beam : current,
  );
}

function truncateToLast(cells: readonly Cell[], cell: Cell): readonly Cell[] {
  for (let index = cells.length - 1; index >= 0; index -= 1) {
    if (sameCell(cells[index] as Cell, cell)) return cells.slice(0, index + 1);
  }
  return cells;
}

function beginTrace(
  state: DeepReadonly<RefractState>,
  node: DeepReadonly<NodeState>,
): RefractState {
  const cell = { col: node.col, row: node.row };
  if (node.kind === "emitter" && node.channel !== null) {
    const beam = beamFor(state.beams, node.channel);
    if (beam && beam.cells.length < 2) {
      return {
        ...state,
        beams: replaceBeam(state.beams, {
          channel: node.channel,
          cells: [cell],
        }),
        tracing: { channel: node.channel },
      };
    }
  }

  for (const beam of state.beams) {
    if (
      beam.cells.length >= 1 &&
      sameCell(beam.cells[beam.cells.length - 1] as Cell, cell)
    ) {
      return { ...state, tracing: { channel: beam.channel } };
    }
    if (beam.cells.length >= 1 && sameCell(beam.cells[0] as Cell, cell)) {
      return {
        ...state,
        beams: replaceBeam(state.beams, {
          channel: beam.channel,
          cells: [...beam.cells].reverse(),
        }),
        tracing: { channel: beam.channel },
      };
    }
  }

  const passing = state.beams.filter((beam) =>
    beam.cells.some((beamCell) => sameCell(beamCell, cell)),
  );
  if (passing.length === 1) {
    const beam = passing[0] as DeepReadonly<BeamState>;
    const cells = truncateToLast(beam.cells, cell);
    return {
      ...state,
      beams: replaceBeam(state.beams, { channel: beam.channel, cells }),
      tracing: { channel: beam.channel },
    };
  }
  return state as RefractState;
}

interface MoveResult {
  readonly state: RefractState;
  readonly added: boolean;
  readonly retracted: boolean;
  readonly channelCompleted: boolean;
  readonly solved: boolean;
}

function resolveTraceMove(
  state: DeepReadonly<RefractState>,
  node: DeepReadonly<NodeState>,
): MoveResult {
  if (state.tracing === null) {
    return {
      state: state as RefractState,
      added: false,
      retracted: false,
      channelCompleted: false,
      solved: false,
    };
  }
  const channel = state.tracing.channel;
  const beam = beamFor(state.beams, channel);
  if (!beam || beam.cells.length === 0) {
    return {
      state: state as RefractState,
      added: false,
      retracted: false,
      channelCompleted: false,
      solved: false,
    };
  }
  const next = { col: node.col, row: node.row };
  const cells = [...beam.cells];
  const live = cells[cells.length - 1] as Cell;
  if (sameCell(live, next)) {
    return {
      state: state as RefractState,
      added: false,
      retracted: false,
      channelCompleted: false,
      solved: false,
    };
  }
  if (cells.length >= 2 && sameCell(cells[cells.length - 2] as Cell, next)) {
    const beforeComplete = isChannelComplete(state.board, beam);
    cells.pop();
    const newBeam = { channel, cells };
    const nextState = { ...state, beams: replaceBeam(state.beams, newBeam) };
    return {
      state: nextState,
      added: false,
      retracted: true,
      channelCompleted: false,
      solved: beforeComplete && isSolved(nextState) ? false : false,
    };
  }
  if (!isAdjacent(live, next) || !canAddSegment(state, beam, next)) {
    return {
      state: state as RefractState,
      added: false,
      retracted: false,
      channelCompleted: false,
      solved: false,
    };
  }
  const beforeComplete = isChannelComplete(state.board, beam);
  const candidateBeam = { channel, cells: [...cells, next] };
  let nextState: RefractState = {
    ...state,
    beams: replaceBeam(state.beams, candidateBeam),
  };
  const channelCompleted =
    !beforeComplete && isChannelComplete(nextState.board, candidateBeam);
  const solved = isSolved(nextState);
  if (solved) {
    nextState = finishSolvedBoard(nextState);
  }
  return {
    state: nextState,
    added: true,
    retracted: false,
    channelCompleted,
    solved,
  };
}

function isAdjacent(a: Cell, b: Cell): boolean {
  const dc = Math.abs(a.col - b.col);
  const dr = Math.abs(a.row - b.row);
  return dc <= 1 && dr <= 1 && dc + dr > 0;
}

function canAddSegment(
  state: DeepReadonly<RefractState>,
  beam: DeepReadonly<BeamState>,
  next: Cell,
): boolean {
  const live = beam.cells[beam.cells.length - 1] as Cell | undefined;
  if (!live) return false;
  const node = findNode(state.board, next);
  if (!node) return false;
  if (
    (node.kind === "emitter" || node.kind === "lens") &&
    node.channel !== beam.channel
  ) {
    return false;
  }
  if (node.kind === "emitter" && node.channel === beam.channel) {
    if (beam.cells.some((cell) => sameCell(cell, next))) return false;
  }
  const key = segmentKey(live, next);
  for (const other of state.beams) {
    for (let index = 0; index < other.cells.length - 1; index += 1) {
      if (
        segmentKey(
          other.cells[index] as Cell,
          other.cells[index + 1] as Cell,
        ) === key
      )
        return false;
    }
  }
  const cross = crossingKey(live, next);
  if (cross !== null) {
    for (const other of state.beams) {
      for (let index = 0; index < other.cells.length - 1; index += 1) {
        const a = other.cells[index] as Cell;
        const b = other.cells[index + 1] as Cell;
        if (crossingKey(a, b) === cross && !sameDiagonal(live, next, a, b))
          return false;
      }
    }
  }
  const degrees = nodeDegrees(state.beams);
  const liveNode = findNode(state.board, live);
  const nextDegree = degrees.get(cellKey(next)) ?? 0;
  const liveDegree = degrees.get(cellKey(live)) ?? 0;
  if (!capacityAllows(liveNode, liveDegree + 1, beam.channel)) return false;
  if (!capacityAllows(node, nextDegree + 1, beam.channel)) return false;
  if (
    node.kind === "crystal" &&
    spentOnCrystal(state.beams, next) >= (node.charges ?? 0)
  )
    return false;
  return true;
}

function sameDiagonal(a: Cell, b: Cell, c: Cell, d: Cell): boolean {
  return segmentKey(a, b) === segmentKey(c, d);
}

function nodeDegrees(
  beams: DeepReadonly<readonly BeamState[]>,
): Map<string, number> {
  const degrees = new Map<string, number>();
  for (const beam of beams) {
    for (let index = 0; index < beam.cells.length - 1; index += 1) {
      const a = beam.cells[index] as Cell;
      const b = beam.cells[index + 1] as Cell;
      degrees.set(cellKey(a), (degrees.get(cellKey(a)) ?? 0) + 1);
      degrees.set(cellKey(b), (degrees.get(cellKey(b)) ?? 0) + 1);
    }
  }
  return degrees;
}

function capacityAllows(
  node: DeepReadonly<NodeState> | undefined,
  degree: number,
  channel: Channel,
): boolean {
  if (!node) return false;
  if (node.kind === "emitter") return node.channel === channel && degree <= 1;
  if (node.kind === "lens") return node.channel === channel && degree <= 2;
  return degree <= (node.charges ?? 0) * 2;
}

function spentOnCrystal(
  beams: DeepReadonly<readonly BeamState[]>,
  crystal: Cell,
): number {
  let spent = 0;
  for (const beam of beams) {
    for (const cell of beam.cells) if (sameCell(cell, crystal)) spent += 1;
  }
  return spent;
}

function isChannelComplete(
  board: DeepReadonly<BoardState>,
  beam: DeepReadonly<BeamState>,
): boolean {
  if (beam.cells.length < 2) return false;
  const channelNodes = board.nodes.filter(
    (node) => node.channel === beam.channel,
  );
  const emitters = channelNodes.filter((node) => node.kind === "emitter");
  const lenses = channelNodes.filter((node) => node.kind === "lens");
  const degrees = nodeDegrees([beam]);
  if (
    emitters.length !== 2 ||
    !emitters.every((node) => (degrees.get(cellKey(node)) ?? 0) === 1)
  ) {
    return false;
  }
  if (!lenses.every((node) => (degrees.get(cellKey(node)) ?? 0) === 2))
    return false;
  const first = beam.cells[0] as Cell;
  const last = beam.cells[beam.cells.length - 1] as Cell;
  return (
    emitters.some((node) => sameCell(node, first)) &&
    emitters.some((node) => sameCell(node, last))
  );
}

function isCrystalSatisfied(
  beams: DeepReadonly<readonly BeamState[]>,
  node: DeepReadonly<NodeState>,
): boolean {
  if (node.kind !== "crystal") return true;
  const spent = spentOnCrystal(beams, node);
  if (spent !== node.charges) return false;
  const degrees = nodeDegrees(beams);
  return (degrees.get(cellKey(node)) ?? 0) === spent * 2;
}

function isSolved(state: DeepReadonly<RefractState>): boolean {
  return (
    state.beams.length > 0 &&
    state.beams.every((beam) => isChannelComplete(state.board, beam)) &&
    state.board.nodes.every((node) => isCrystalSatisfied(state.beams, node))
  );
}

function finishSolvedBoard(state: DeepReadonly<RefractState>): RefractState {
  if (state.mode === "cascade") {
    const solvedCount = state.solvedCount + 1;
    return {
      ...state,
      screen: "solved",
      menuIndex: 0,
      tracing: null,
      armedTarget: null,
      solvedCount,
      tier: tierForSolvedCount(solvedCount),
    };
  }
  const boardIndex = state.boardIndex;
  const solvedBoards = state.solvedBoards.includes(boardIndex)
    ? [...state.solvedBoards]
    : [...state.solvedBoards, boardIndex].sort((a, b) => a - b);
  const unlockedCount = Math.max(
    state.unlockedCount,
    Math.min(CAMPAIGN_LENGTH, boardIndex + 2),
  );
  return {
    ...state,
    screen: solvedBoards.length >= CAMPAIGN_LENGTH ? "complete" : "solved",
    menuIndex: 0,
    tracing: null,
    armedTarget: null,
    solvedBoards,
    unlockedCount,
    selectIndex: boardIndex,
  };
}

function tierForSolvedCount(count: number): number {
  return Math.min(Math.floor(count / TIER_ADVANCE) + 1, MAX_TIER);
}

function loadBoardState(
  state: DeepReadonly<RefractState>,
  board: BoardState,
): RefractState {
  return {
    ...state,
    screen: "playing",
    menuIndex: 0,
    board,
    beams: emptyBeams(board),
    tracing: null,
    armedTarget: null,
  };
}

function enterCampaignBoard(
  state: DeepReadonly<RefractState>,
  index: number,
): RefractState {
  return {
    ...loadBoardState(
      state,
      parseBoard(CAMPAIGN_BOARDS[index] ?? CAMPAIGN_BOARDS[0]),
    ),
    mode: "campaign",
    boardIndex: index,
    selectIndex: index,
  };
}

function generateBoardForTier(tier: number): BoardState {
  const wholeTier = assertWhole(tier, "tier");
  const rung = TIERS[wholeTier - 1];
  if (wholeTier < 1 || wholeTier > MAX_TIER || rung === undefined)
    throw new RangeError("tier is outside the ladder");
  const board = parseBoard(
    CASCADE_TEMPLATES[wholeTier] ?? CASCADE_TEMPLATES[1],
  );
  if (
    board.cols < rung.minCols ||
    board.cols > rung.maxCols ||
    board.rows < rung.minRows ||
    board.rows > rung.maxRows
  ) {
    throw new Error("cascade template no longer matches its tier ladder");
  }
  return board;
}

function assertWhole(value: number, name: string): number {
  if (!Number.isInteger(value))
    throw new RangeError(`${name} must be a whole number`);
  return value;
}

function clearBeams(state: DeepReadonly<RefractState>): RefractState {
  return { ...state, beams: emptyBeams(state.board), tracing: null };
}

function screenTargets(state: DeepReadonly<RefractState>): readonly Target[] {
  switch (state.screen) {
    case "title":
      return TITLE_ITEMS.map((_, index) =>
        menuTarget(index, TITLE_ITEMS.length),
      );
    case "howto":
      return [{ id: "back", x: 64, y: 604, w: 160, h: 76 }];
    case "select":
      return [
        ...Array.from({ length: CAMPAIGN_LENGTH }, (_, index) =>
          boardTarget(index),
        ),
        { id: "back", x: 64, y: 604, w: 160, h: 76 },
      ];
    case "playing":
      return [
        { id: "clear", x: 64, y: 604, w: 170, h: 76 },
        { id: "back", x: 1046, y: 604, w: 170, h: 76 },
      ];
    case "solved":
      return solvedItems(state).map((_, index, all) =>
        menuTarget(index, all.length),
      );
    case "complete":
      return [menuTarget(0, 2), menuTarget(1, 2)];
  }
}

function menuTarget(index: number, count: number): Target {
  const w = Math.max(360, TARGET_MIN_W);
  const h = TARGET_MIN_H;
  const gap = 16;
  const top = count === 3 ? 394 : 420;
  return {
    id: `menu-${index}`,
    x: STAGE_W / 2 - w / 2,
    y: top + index * (h + gap),
    w,
    h,
  };
}

function boardTarget(index: number): Target {
  const col = index % 6;
  const row = Math.floor(index / 6);
  const w = 128;
  const h = TARGET_MIN_H;
  return {
    id: `board-${index + 1}`,
    x: 262 + col * 132,
    y: 180 + row * 92,
    w,
    h,
  };
}

function hitTarget(
  state: DeepReadonly<RefractState>,
  x: number,
  y: number,
): Target | null {
  return (
    screenTargets(state).find(
      (target) =>
        x >= target.x &&
        y >= target.y &&
        x <= target.x + target.w &&
        y <= target.y + target.h,
    ) ?? null
  );
}

function solvedItems(state: DeepReadonly<RefractState>): readonly string[] {
  if (state.mode === "cascade") return SOLVED_ITEMS;
  return state.boardIndex < CAMPAIGN_LENGTH - 1
    ? ["NEXT BOARD", "REPLAY", "BACK TO SELECT"]
    : ["REPLAY", "BACK TO SELECT"];
}

function applyTargetHighlight(
  state: DeepReadonly<RefractState>,
  id: string,
): RefractState {
  if (id.startsWith("menu-"))
    return { ...state, menuIndex: Number(id.slice(5)) };
  if (id.startsWith("board-"))
    return { ...state, selectIndex: Number(id.slice(6)) - 1 };
  return state as RefractState;
}

function takeTarget(
  state: DeepReadonly<RefractState>,
  id: string,
): RefractState {
  if (id.startsWith("menu-"))
    return confirmChoice({ ...state, menuIndex: Number(id.slice(5)) });
  if (id.startsWith("board-"))
    return confirmChoice({ ...state, selectIndex: Number(id.slice(6)) - 1 });
  if (id === "back") return goBack(state);
  if (id === "clear") return clearBeams(state);
  return state as RefractState;
}

function confirmChoice(state: DeepReadonly<RefractState>): RefractState {
  switch (state.screen) {
    case "title":
      if (state.menuIndex === 0)
        return {
          ...state,
          mode: "campaign",
          screen: "select",
          armedTarget: null,
        };
      if (state.menuIndex === 1) {
        const board = generateBoardForTier(1);
        return {
          ...loadBoardState(state, board),
          mode: "cascade",
          solvedCount: 0,
          tier: 1,
        };
      }
      return { ...state, screen: "howto", menuIndex: 0, armedTarget: null };
    case "select":
      if (state.selectIndex >= 0 && state.selectIndex < state.unlockedCount) {
        return enterCampaignBoard(state, state.selectIndex);
      }
      return state as RefractState;
    case "solved":
      return confirmSolved(state);
    case "complete":
      if (state.menuIndex === 0)
        return { ...state, screen: "select", menuIndex: 0, armedTarget: null };
      return { ...state, screen: "title", menuIndex: 0, armedTarget: null };
    default:
      return state as RefractState;
  }
}

function confirmSolved(state: DeepReadonly<RefractState>): RefractState {
  if (state.mode === "cascade") {
    if (state.menuIndex === 0)
      return loadBoardState(state, generateBoardForTier(state.tier));
    return {
      ...loadBoardState(state, generateBoardForTier(1)),
      solvedCount: 0,
      tier: 1,
    };
  }
  const hasNext = state.boardIndex < CAMPAIGN_LENGTH - 1;
  if (hasNext && state.menuIndex === 0)
    return enterCampaignBoard(state, state.boardIndex + 1);
  const replayIndex = hasNext ? 1 : 0;
  if (state.menuIndex === replayIndex)
    return enterCampaignBoard(state, state.boardIndex);
  return { ...state, screen: "select", menuIndex: 0, armedTarget: null };
}

function goBack(state: DeepReadonly<RefractState>): RefractState {
  switch (state.screen) {
    case "howto":
      return {
        ...state,
        screen: "title",
        menuIndex: 2,
        armedTarget: null,
        tracing: null,
      };
    case "select":
      return { ...state, screen: "title", menuIndex: 0, armedTarget: null };
    case "playing":
      if (state.mode === "cascade")
        return {
          ...state,
          screen: "title",
          menuIndex: 1,
          armedTarget: null,
          tracing: null,
        };
      return {
        ...state,
        screen: "select",
        menuIndex: 0,
        beams: emptyBeams(state.board),
        tracing: null,
        armedTarget: null,
      };
    case "solved":
      if (state.mode === "cascade")
        return { ...state, screen: "title", menuIndex: 1, armedTarget: null };
      return { ...state, screen: "select", menuIndex: 0, armedTarget: null };
    case "complete":
      return { ...state, screen: "select", menuIndex: 0, armedTarget: null };
    default:
      return state as RefractState;
  }
}

function moveMenu(
  state: DeepReadonly<RefractState>,
  direction: number,
): RefractState {
  const count =
    state.screen === "title"
      ? TITLE_ITEMS.length
      : state.screen === "solved"
        ? solvedItems(state).length
        : state.screen === "complete"
          ? 2
          : 0;
  if (count === 0) return state as RefractState;
  return { ...state, menuIndex: (state.menuIndex + direction + count) % count };
}

function moveSelect(
  state: DeepReadonly<RefractState>,
  dc: number,
  dr: number,
): RefractState {
  const col = ((state.selectIndex % 6) + dc + 6) % 6;
  const row = (Math.floor(state.selectIndex / 6) + dr + 4) % 4;
  return { ...state, selectIndex: row * 6 + col };
}

interface PointerEventResult {
  readonly state: RefractState;
  readonly added: boolean;
  readonly retracted: boolean;
  readonly channelCompleted: boolean;
  readonly solved: boolean;
}

function pointerDownState(
  state: DeepReadonly<RefractState>,
  x: number,
  y: number,
  device: PointerDevice = "mouse",
): PointerEventResult {
  let next: RefractState = { ...state, pointer: { x, y, down: true, device } };
  const target = hitTarget(next, x, y);
  if (target) {
    next = {
      ...applyTargetHighlight(next, target.id),
      armedTarget: target.id,
      tracing: null,
    };
    return quietPointer(next);
  }
  if (next.screen === "playing") {
    const node = targetNode(next.board, x, y);
    if (node) next = beginTrace(next, node);
  }
  return quietPointer(next);
}

function pointerMoveState(
  state: DeepReadonly<RefractState>,
  x: number,
  y: number,
  device: PointerDevice = "mouse",
): PointerEventResult {
  let next: RefractState = {
    ...state,
    pointer: { x, y, down: state.pointer.down, device },
  };
  const target = hitTarget(next, x, y);
  if (target && next.tracing === null)
    next = applyTargetHighlight(next, target.id);
  if (
    next.screen === "playing" &&
    next.armedTarget === null &&
    next.tracing !== null
  ) {
    const node = targetNode(next.board, x, y);
    if (node) return resolveTraceMove(next, node);
  }
  return quietPointer(next);
}

function pointerUpState(
  state: DeepReadonly<RefractState>,
  device: PointerDevice = "mouse",
): PointerEventResult {
  let next: RefractState = {
    ...state,
    pointer: { ...state.pointer, down: false, device },
  };
  if (state.armedTarget !== null) {
    const target = hitTarget(next, state.pointer.x, state.pointer.y);
    next =
      target?.id === state.armedTarget
        ? takeTarget(next, state.armedTarget)
        : next;
    return quietPointer({ ...next, armedTarget: null, tracing: null });
  }
  if (next.tracing !== null) {
    const beam = beamFor(next.beams, next.tracing.channel);
    if (beam && beam.cells.length === 1) {
      next = {
        ...next,
        beams: replaceBeam(next.beams, { channel: beam.channel, cells: [] }),
      };
    }
  }
  return quietPointer({ ...next, tracing: null });
}

function quietPointer(state: RefractState): PointerEventResult {
  return {
    state,
    added: false,
    retracted: false,
    channelCompleted: false,
    solved: false,
  };
}

function snapshot(state: DeepReadonly<RefractState>): RefractSnapshot {
  const beams: Partial<Record<Channel, SnapshotBeam>> = {};
  for (const beam of state.beams) {
    beams[beam.channel] = {
      cells: beam.cells.map((cell) => ({ ...cell })),
      complete: isChannelComplete(state.board, beam),
    };
  }
  return {
    version: REFRACT_DEBUG_VERSION,
    screen: state.screen,
    mode: state.mode,
    menuIndex: state.menuIndex,
    boardIndex: state.boardIndex,
    solvedBoards: [...state.solvedBoards],
    unlockedCount: state.unlockedCount,
    selectIndex: state.selectIndex,
    solvedCount: state.solvedCount,
    tier: state.tier,
    board: {
      cols: state.board.cols,
      rows: state.board.rows,
      nodes: state.board.nodes.map((node) => ({
        ...node,
        x: cellX(node.col, state.board.cols),
        y: cellY(node.row, state.board.rows),
        spent:
          node.kind === "crystal" ? spentOnCrystal(state.beams, node) : null,
      })),
    },
    beams,
    solved: isSolved(state),
    tracing:
      state.tracing === null
        ? null
        : {
            channel: state.tracing.channel,
            live: {
              ...lastCell(
                beamFor(state.beams, state.tracing.channel)?.cells ?? [],
              ),
            },
          },
    pointer: { ...state.pointer },
    targets: screenTargets(state).map((target) => ({ ...target })),
    muted: state.muted,
    simTime: state.simTime,
  };
}

function createDebug(): RefractDebugApi {
  return {
    version: REFRACT_DEBUG_VERSION,
    reset: (state) => ({ ...initialState(), muted: state.muted }),
    snapshot,
    reconcile: (state) => state as RefractState,
    setMode: (state, mode) => ({ ...state, mode }),
    setScreen: (state, screen) => ({ ...state, screen, armedTarget: null }),
    setMenuIndex: (state, index) => ({ ...state, menuIndex: index }),
    setSolvedCount: (state, count) => ({
      ...state,
      solvedCount: assertWhole(count, "count"),
    }),
    setTier: (state, tier) => ({ ...state, tier: assertWhole(tier, "tier") }),
    generateBoard: (state, tier) =>
      loadBoardState(state, generateBoardForTier(tier)),
    loadBoard: (state, board) => loadBoardState(state, parseBoard(board)),
    pointerDown: (state, x, y, device = "mouse") =>
      pointerDownState(state, x, y, device).state,
    pointerMove: (state, x, y, device = "mouse") =>
      pointerMoveState(state, x, y, device).state,
    pointerUp: (state, device = "mouse") => pointerUpState(state, device).state,
    clear: clearBeams,
  };
}

function registerDiagnostics(api: InitApi<RefractState>): void {
  api.diagnostics.register("screen", (state) => state.screen);
  api.diagnostics.register("mode", (state) => state.mode);
  api.diagnostics.register(
    "board",
    (state) => `${state.board.cols}x${state.board.rows}`,
  );
  api.diagnostics.register("solved", (state) => isSolved(state));
  api.diagnostics.register(
    "pointer",
    (state) =>
      `${Math.round(state.pointer.x)},${Math.round(state.pointer.y)} ${state.pointer.device}`,
  );
  for (const channel of CHANNELS) {
    api.diagnostics.register(`${channel} beam`, (state) => {
      const beam = beamFor(state.beams, channel);
      return beam
        ? `${Math.max(0, beam.cells.length - 1)} ${isChannelComplete(state.board, beam) ? "done" : "open"}`
        : "-";
    });
  }
  api.diagnostics.register(
    "crystals",
    (state) =>
      state.board.nodes
        .filter((node) => node.kind === "crystal")
        .map((node) => `${spentOnCrystal(state.beams, node)}/${node.charges}`)
        .join(" ") || "-",
  );
}

function playCueSet(api: UpdateApi, cues: ReadonlySet<string>): void {
  for (const cue of cues) api.audio.play(cue);
}

export const game: Game<RefractState, RefractDebugApi> = {
  initialize(api: InitApi<RefractState>): [RefractState, RefractDebugApi] {
    for (const action of ACTIONS)
      api.input.register(action, { keys: [...BINDINGS[action]] });
    api.audio.define(CUES.connect, {
      wave: "sine",
      freq: 620,
      freqTo: 880,
      gain: 0.12,
      durationMs: 70,
    });
    api.audio.define(CUES.retract, {
      wave: "triangle",
      freq: 360,
      freqTo: 180,
      gain: 0.11,
      durationMs: 90,
    });
    api.audio.define(CUES.channelComplete, {
      wave: "sine",
      freq: 700,
      freqTo: 1120,
      gain: 0.14,
      durationMs: 130,
    });
    api.audio.define(CUES.solved, {
      wave: "sawtooth",
      freq: 420,
      freqTo: 840,
      gain: 0.12,
      durationMs: 190,
    });
    api.audio.define(CUES.clear, {
      wave: "square",
      freq: 180,
      freqTo: 120,
      gain: 0.08,
      durationMs: 110,
    });
    registerDiagnostics(api);
    return [initialState(), createDebug()];
  },

  update(
    state: DeepReadonly<RefractState>,
    api: UpdateApi,
    dt: number,
  ): RefractState {
    const cues = new Set<string>();
    let next: RefractState = { ...state, simTime: state.simTime + dt };

    if (api.input.pressed("mute")) api.audio.setMuted(!api.audio.muted());
    if (
      api.input.pressed("clear") &&
      next.screen === "playing" &&
      next.beams.some((beam) => beam.cells.length > 1)
    ) {
      next = clearBeams(next);
      cues.add(CUES.clear);
    }
    if (api.input.pressed("back")) next = goBack(next);
    if (api.input.pressed("up"))
      next =
        next.screen === "select" ? moveSelect(next, 0, -1) : moveMenu(next, -1);
    if (api.input.pressed("down"))
      next =
        next.screen === "select" ? moveSelect(next, 0, 1) : moveMenu(next, 1);
    if (api.input.pressed("left") && next.screen === "select")
      next = moveSelect(next, -1, 0);
    if (api.input.pressed("right") && next.screen === "select")
      next = moveSelect(next, 1, 0);
    if (api.input.pressed("confirm")) next = confirmChoice(next);

    const samples = api.input
      .pointerSamples()
      .filter((sample) => sample.primary);
    if (samples.length === 0) {
      const pointer = api.input.pointer();
      next = {
        ...next,
        pointer: {
          x: pointer.x,
          y: pointer.y,
          down: pointer.down,
          device: pointer.device,
        },
      };
    }
    for (const sample of samples) {
      const result =
        sample.type === "down"
          ? pointerDownState(next, sample.x, sample.y, sample.device)
          : sample.type === "up"
            ? pointerUpState(
                {
                  ...next,
                  pointer: {
                    x: sample.x,
                    y: sample.y,
                    down: true,
                    device: sample.device,
                  },
                },
                sample.device,
              )
            : pointerMoveState(next, sample.x, sample.y, sample.device);
      next = result.state;
      if (result.added) cues.add(CUES.connect);
      if (result.retracted) cues.add(CUES.retract);
      if (result.channelCompleted) cues.add(CUES.channelComplete);
      if (result.solved) cues.add(CUES.solved);
    }
    playCueSet(api, cues);
    return { ...next, muted: api.audio.muted() };
  },

  render(state: DeepReadonly<RefractState>, api: RenderApi): void {
    const ctx = api.ctx;
    drawBench(ctx, state);
    if (
      state.screen === "playing" ||
      state.screen === "solved" ||
      state.screen === "complete"
    )
      drawBoard(ctx, state);
    if (state.screen === "title") drawTitle(ctx, state);
    if (state.screen === "howto") drawHowto(ctx);
    if (state.screen === "select") drawSelect(ctx, state);
    if (state.screen === "playing") drawHud(ctx, state);
    if (state.screen === "solved") drawSolved(ctx, state);
    if (state.screen === "complete") drawComplete(ctx, state);
  },
};

function drawBench(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
): void {
  const pulse = 0.5 + Math.sin(state.simTime * 0.7) * 0.5;
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.strokeStyle = `rgba(120, 160, 190, ${0.08 + pulse * 0.03})`;
  ctx.lineWidth = 1;
  for (let x = 64; x < STAGE_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, STAGE_H);
    ctx.stroke();
  }
  for (let y = 40; y < STAGE_H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(STAGE_W, y);
    ctx.stroke();
  }
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
): void {
  centerText(ctx, TITLE_TEXT, STAGE_W / 2, 180, 76, "#f5fbff", "bold");
  centerText(ctx, TAGLINE_TEXT, STAGE_W / 2, 244, 24, "#8fb4c8", "normal");
  TITLE_ITEMS.forEach((item, index) =>
    drawMenuItem(
      ctx,
      menuTarget(index, TITLE_ITEMS.length),
      item,
      index === state.menuIndex,
    ),
  );
}

function drawHowto(ctx: CanvasRenderingContext2D): void {
  centerText(ctx, "HOW TO PLAY", STAGE_W / 2, 92, 42, "#f5fbff", "bold");
  const lines = [
    "Press an emitter or beam end, then drag from node to node to draw light.",
    "Each channel connects its two emitters and threads every matching lens.",
    "Segments may step to any neighboring node, including diagonals.",
    "A beam cannot touch another channel's emitter or lens, reuse a segment, or cross a diagonal already drawn.",
    "Crystals are shared: spend every charge exactly by passing through them.",
    `Moves that break the rules simply do not take. Press ${BINDINGS.clear[0]} or CLEAR to restart a board.`,
  ];
  ctx.fillStyle = "#d8e7ee";
  ctx.font = "26px system-ui, sans-serif";
  ctx.textAlign = "left";
  lines.forEach((line, index) => ctx.fillText(line, 190, 180 + index * 58));
  drawButton(
    ctx,
    screenTargets({ ...initialState(), screen: "howto" })[0] as Target,
    BACK_LABEL,
  );
}

function drawSelect(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
): void {
  centerText(ctx, "CAMPAIGN", STAGE_W / 2, 86, 44, "#f5fbff", "bold");
  for (let row = 0; row < 4; row += 1) {
    ctx.fillStyle = "#7fa2b6";
    ctx.font = "20px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(SET_LABELS[row] ?? "", 230, 225 + row * 92);
  }
  for (let index = 0; index < CAMPAIGN_LENGTH; index += 1)
    drawBoardTile(ctx, state, index);
  const targets = screenTargets(state);
  drawButton(ctx, targets[targets.length - 1] as Target, BACK_LABEL);
}

function drawBoardTile(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
  index: number,
): void {
  const target = boardTarget(index);
  const solved = state.solvedBoards.includes(index);
  const unlocked = index < state.unlockedCount;
  ctx.fillStyle = solved ? "#123e3a" : unlocked ? "#132d42" : "#141820";
  ctx.strokeStyle =
    index === state.selectIndex
      ? "#f5fbff"
      : solved
        ? "#38e0b0"
        : unlocked
          ? "#56d6ff"
          : "#4c5662";
  ctx.lineWidth = index === state.selectIndex ? 4 : 2;
  roundRect(ctx, target.x, target.y, target.w, target.h, 8, true, true);
  centerText(
    ctx,
    String(index + 1),
    target.x + target.w / 2,
    target.y + 45,
    26,
    unlocked ? "#f5fbff" : "#77818d",
    "bold",
  );
  centerText(
    ctx,
    solved ? "SOLVED" : unlocked ? "OPEN" : "LOCKED",
    target.x + target.w / 2,
    target.y + 64,
    13,
    unlocked ? "#b8ccd8" : "#68717b",
    "normal",
  );
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
): void {
  centerText(
    ctx,
    state.mode === "campaign"
      ? `BOARD ${state.boardIndex + 1}`
      : `${HUD_SOLVED_LABEL} ${state.solvedCount}    ${HUD_TIER_LABEL} ${state.tier}`,
    STAGE_W / 2,
    52,
    28,
    "#e9f7ff",
    "bold",
  );
  const present = channelsInBoard(state.board);
  present.forEach((channel, index) => {
    const beam = beamFor(state.beams, channel);
    drawMiniChannel(
      ctx,
      414 + index * 226,
      96,
      channel,
      Boolean(beam && isChannelComplete(state.board, beam)),
    );
  });
  for (const target of screenTargets(state))
    drawButton(
      ctx,
      target,
      target.id === "clear"
        ? `${CLEAR_LABEL} ${BINDINGS.clear[0]}`
        : BACK_LABEL,
    );
}

function drawSolved(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
): void {
  ctx.fillStyle = "rgba(8, 9, 16, 0.68)";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  centerText(ctx, SOLVED_TITLE_TEXT, STAGE_W / 2, 142, 48, "#f5fbff", "bold");
  const caption =
    state.mode === "cascade"
      ? `SOLVED ${state.solvedCount}  TIER ${state.tier}`
      : `BOARD ${state.boardIndex + 1} SOLVED`;
  centerText(ctx, caption, STAGE_W / 2, 198, 24, "#a9c2d0", "normal");
  solvedItems(state).forEach((item, index, all) =>
    drawMenuItem(
      ctx,
      menuTarget(index, all.length),
      item,
      index === state.menuIndex,
    ),
  );
}

function drawComplete(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
): void {
  ctx.fillStyle = "rgba(8, 9, 16, 0.72)";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  centerText(ctx, "COURSE COMPLETE", STAGE_W / 2, 176, 52, "#f5fbff", "bold");
  centerText(
    ctx,
    `ALL ${CAMPAIGN_LENGTH} BOARDS SOLVED`,
    STAGE_W / 2,
    236,
    24,
    "#a9c2d0",
    "normal",
  );
  ["BACK TO SELECT", "TITLE"].forEach((item, index) =>
    drawMenuItem(ctx, menuTarget(index, 2), item, index === state.menuIndex),
  );
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawBoardFrame(ctx, state.board);
  for (const beam of state.beams) drawBeam(ctx, state.board, beam);
  for (const node of state.board.nodes) drawNode(ctx, state, node);
  ctx.restore();
}

function drawBoardFrame(
  ctx: CanvasRenderingContext2D,
  board: DeepReadonly<BoardState>,
): void {
  ctx.strokeStyle = "rgba(160, 190, 210, 0.16)";
  ctx.lineWidth = 2;
  for (let row = 0; row < board.rows; row += 1) {
    for (let col = 0; col < board.cols; col += 1) {
      ctx.beginPath();
      ctx.arc(
        cellX(col, board.cols),
        cellY(row, board.rows),
        5,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }
}

function drawBeam(
  ctx: CanvasRenderingContext2D,
  board: DeepReadonly<BoardState>,
  beam: DeepReadonly<BeamState>,
): void {
  if (beam.cells.length < 2) return;
  ctx.strokeStyle = CHANNEL_HUES[beam.channel];
  ctx.shadowBlur = 18;
  ctx.shadowColor = CHANNEL_HUES[beam.channel];
  ctx.lineWidth = 12;
  ctx.beginPath();
  beam.cells.forEach((cell, index) => {
    const x = cellX(cell.col, board.cols);
    const y = cellY(cell.row, board.rows);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<RefractState>,
  node: DeepReadonly<NodeState>,
): void {
  const x = cellX(node.col, state.board.cols);
  const y = cellY(node.row, state.board.rows);
  if (node.kind === "crystal") {
    drawCrystal(
      ctx,
      x,
      y,
      node.charges ?? 0,
      spentOnCrystal(state.beams, node),
    );
    return;
  }
  const channel = node.channel ?? "triangle";
  ctx.fillStyle = node.kind === "lens" ? CHANNEL_HUES[channel] : BACKGROUND;
  ctx.strokeStyle = CHANNEL_HUES[channel];
  ctx.lineWidth = node.kind === "emitter" ? 5 : 2;
  channelPath(ctx, channel, x, y, NODE_R);
  ctx.fill();
  ctx.stroke();
}

function channelPath(
  ctx: CanvasRenderingContext2D,
  channel: Channel,
  x: number,
  y: number,
  r: number,
): void {
  ctx.beginPath();
  if (channel === "triangle") {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.9, y + r * 0.62);
    ctx.lineTo(x - r * 0.9, y + r * 0.62);
    ctx.closePath();
  } else if (channel === "square") {
    ctx.rect(x - r * 0.72, y - r * 0.72, r * 1.44, r * 1.44);
  } else {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
  }
}

function drawCrystal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  charges: number,
  spent: number,
): void {
  ctx.fillStyle = "#1a2028";
  ctx.strokeStyle = "#d9fff4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let index = 0; index < 6; index += 1) {
    const angle = Math.PI / 6 + (index * Math.PI) / 3;
    const px = x + Math.cos(angle) * NODE_R;
    const py = y + Math.sin(angle) * NODE_R;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (let index = 0; index < charges; index += 1) {
    ctx.fillStyle = index < spent ? "#6fffd2" : "#33424a";
    ctx.beginPath();
    ctx.arc(x - (charges - 1) * 9 + index * 18, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMiniChannel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  channel: Channel,
  complete: boolean,
): void {
  ctx.fillStyle = complete ? CHANNEL_HUES[channel] : "transparent";
  ctx.strokeStyle = CHANNEL_HUES[channel];
  ctx.lineWidth = 3;
  channelPath(ctx, channel, x, y, 16);
  if (complete) ctx.fill();
  ctx.stroke();
  ctx.fillStyle = complete ? "#eafff9" : "#8aa4b3";
  ctx.font = "18px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(complete ? "COMPLETE" : "OPEN", x + 30, y + 6);
}

function drawMenuItem(
  ctx: CanvasRenderingContext2D,
  target: Target,
  text: string,
  selected: boolean,
): void {
  ctx.fillStyle = selected ? "#e8f9ff" : "#131a23";
  ctx.strokeStyle = selected ? "#ffffff" : "#4f6a7d";
  ctx.lineWidth = selected ? 4 : 2;
  roundRect(ctx, target.x, target.y, target.w, target.h, 8, true, true);
  centerText(
    ctx,
    text,
    target.x + target.w / 2,
    target.y + 46,
    24,
    selected ? "#081019" : "#d6e7ef",
    "bold",
  );
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  target: Target,
  text: string,
): void {
  ctx.fillStyle = "#111923";
  ctx.strokeStyle = "#7c98aa";
  ctx.lineWidth = 2;
  roundRect(ctx, target.x, target.y, target.w, target.h, 8, true, true);
  centerText(
    ctx,
    text,
    target.x + target.w / 2,
    target.y + 46,
    19,
    "#dcecf3",
    "bold",
  );
}

function centerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight: "normal" | "bold",
): void {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
