import { unpack } from "msgpackr";
import TinyQueue from "tinyqueue";
import RBush, { type BBox } from "rbush";
import knn from "rbush-knn";

const TILE_SIZE = 10_000;
const LOAD_MARGIN = 2_000;
const SNAP_RADIUS = 50;

export type Line = Point[];
export type Point = [number, number];
type Vertex = bigint;

function distance([ax, ay]: Point, [bx, by]: Point): number {
    return Math.hypot(bx - ax, by - ay);
}

function vertexToPoint(v: Vertex): Point {
    return [Number(v >> 32n), Number(v & 0xffffffffn)];
}

function pointToVertex([x, y]: Point) {
    return (BigInt(Math.floor(x)) << 32n) | BigInt(Math.floor(y));
}

class Tree {
    bush: RBush<FwdEdge>;

    public constructor(edges: FwdEdge[]) {
        this.bush = new RBush();
        this.bush.load(edges);
    }

    public closest([x, y]: Point): [FwdEdge, number] {
        const close = knn(this.bush, x, y, 10) as FwdEdge[];
        let bestDist = Infinity;
        let bestEdge: FwdEdge;
        let bestI: number;
        for (const edge of close) {
            edge.walk((i, p) => {
                const dist = distance([x, y], p);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestEdge = edge;
                    bestI = i;
                }
            });
        }
        return [bestEdge!, bestI!];
    }
}

class Graph {
    adj: Map<Vertex, Edge[]>;

    public constructor(edges: FwdEdge[]) {
        this.adj = new Map();
        for (const fwd of edges) {
            const bwd = new BwdEdge(fwd);
            this.addEdge(fwd);
            this.addEdge(bwd);
        }
    }

    public getAdj(v: Vertex): Edge[] | undefined {
        return this.adj.get(v);
    }

    public addEdge(edge: Edge) {
        if (!this.adj.has(edge.u)) {
            this.adj.set(edge.u, []);
        }
        this.adj.get(edge.u)!.push(edge);
    }
}

interface Edge {
    u: Vertex;
    v: Vertex;
    length: number;
    ascent: number;
    descent: number;
    hikingTrail: boolean;
    paved: boolean;
    walk(fn: (i: number, p: Point) => void): void;
}

class FwdEdge implements Edge, BBox {
    public constructor(
        public u: Vertex,
        public v: Vertex,
        public minX: number,
        public maxX: number,
        public minY: number,
        public maxY: number,
        public length: number,
        public ascent: number,
        public descent: number,
        public line: Line,
        public hikingTrail: boolean,
        public paved: boolean,
    ) {}

    public static fromLine(
        u: Vertex,
        v: Vertex,
        line: Line,
        hikingTrail: boolean,
        paved: boolean,
    ): FwdEdge {
        const edge = new FwdEdge(
            u,
            v,
            Infinity,
            -Infinity,
            Infinity,
            -Infinity,
            0,
            0,
            0,
            line,
            hikingTrail,
            paved,
        );
        let last: Point;
        edge.walk((i, [x, y]) => {
            edge.minX = Math.min(x, edge.minX);
            edge.maxX = Math.max(x, edge.maxX);
            edge.minY = Math.min(y, edge.minY);
            edge.maxY = Math.max(y, edge.maxY);
            if (i !== 0) {
                edge.length += distance([x, y], last);
            }
            last = [x, y];
        });
        return edge;
    }

    public walk(fn: (i: number, p: Point) => void) {
        for (const [i, p] of this.line.entries()) {
            fn(i, p);
        }
    }
}

class BwdEdge implements Edge {
    constructor(private fwd: FwdEdge) {}

    get u(): bigint {
        return this.fwd.v;
    }

    get v(): bigint {
        return this.fwd.u;
    }

    get length(): number {
        return this.fwd.length;
    }

    get ascent(): number {
        return this.fwd.descent;
    }

    get descent(): number {
        return this.fwd.ascent;
    }

    get hikingTrail(): boolean {
        return this.fwd.hikingTrail;
    }

    get paved(): boolean {
        return this.fwd.paved;
    }

    walk(fn: (i: number, p: Point) => void) {
        for (let i = 0; i < this.fwd.line.length; i++) {
            const p = this.fwd.line[this.fwd.line.length - i - 1];
            fn(i, p);
        }
    }
}

export enum RouteMode {
    OffRoad,
    PreferRoads,
    PreferPaved,
    PreferHikingTrails,
}

export interface RoutePoint {
    point: Point;
    onRoad: boolean;
    edge: FwdEdge;
    i: number;
}

export interface RouteSegment {
    path: Line;
    onRoads: boolean;
}

export class Router {
    constructor(
        public graph: Graph = new Graph([]),
        public tree: Tree = new Tree([]),
        public tiles: Map<string, FwdEdge[]> = new Map(),
        public aStarMemo: Map<
            [Vertex, Vertex, RouteMode],
            Line | undefined
        > = new Map(),
    ) {}

    public async snap(point: Point): Promise<RoutePoint> {
        await this.ensureLoaded([point]);
        const [edge, i] = this.tree.closest(point);
        const onRoad = distance(point, edge.line[i]) < SNAP_RADIUS;
        const snapped = onRoad ? edge.line[i] : point;
        return { point: snapped, onRoad, edge, i };
    }

    public async route(
        points: RoutePoint[],
        mode: RouteMode,
    ): Promise<RouteSegment[]> {
        await this.ensureLoaded(points.map((rp) => rp.point));
        let route: RouteSegment[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const from = points[i];
            const to = points[i + 1];
            const [path, onRoads] = this.shortestPath(from, to, mode);
            route.push({ path, onRoads });
        }
        return route;
    }

    private async ensureLoaded(points: Point[]): Promise<void> {
        const toLoad: Set<string> = new Set();
        const dense = Router.densify(points);
        for (const [x, y] of dense) {
            toLoad.add(Router.getTileId([x - LOAD_MARGIN, y - LOAD_MARGIN]));
            toLoad.add(Router.getTileId([x + LOAD_MARGIN, y - LOAD_MARGIN]));
            toLoad.add(Router.getTileId([x - LOAD_MARGIN, y + LOAD_MARGIN]));
            toLoad.add(Router.getTileId([x + LOAD_MARGIN, y + LOAD_MARGIN]));
        }
        for (const loaded of this.tiles.keys()) {
            toLoad.delete(loaded);
        }
        if (toLoad.size > 0) {
            const loads: Promise<any>[] = [];
            for (const id of toLoad) {
                loads.push(
                    Router.loadTile(id).then((edges) =>
                        this.tiles.set(id, edges),
                    ),
                );
            }
            await Promise.all(loads);
            const edges = [...this.tiles.values()].flat();
            this.graph = new Graph(edges);
            this.tree = new Tree(edges);
        }
    }

    private static densify([p, ...[q, ...qs]]: Point[]): Point[] {
        if (p == null) {
            return [];
        } else if (q == null) {
            return [p];
        } else if (distance(p, q) > TILE_SIZE) {
            const [px, py] = p;
            const [qx, qy] = q;
            const m: Point = [(px + qx) / 2, (py + qy) / 2];
            return [
                ...Router.densify([p, m]),
                ...Router.densify([m, q, ...qs]).slice(1),
            ];
        } else {
            return [p, q, ...Router.densify(qs)];
        }
    }

    private static getTileId([x, y]: Point): string {
        const minX = Math.floor(x / TILE_SIZE) * TILE_SIZE;
        const minY = Math.floor(y / TILE_SIZE) * TILE_SIZE;
        return `${minX}_${minY}`;
    }

    private static async loadTile(id: string): Promise<FwdEdge[]> {
        const res = await fetch(`/tiles/${id}.msgpack`);
        const buf = await res.arrayBuffer();
        const arrs = unpack(buf);
        // @ts-ignore
        return arrs.map((a) => new FwdEdge(...a));
    }

    private shortestPath(
        from: RoutePoint,
        to: RoutePoint,
        mode: RouteMode,
    ): [Line, boolean] {
        if (mode === RouteMode.OffRoad || !from.onRoad || !to.onRoad) {
            return [[from.point, to.point], false];
        }
        if (from.edge === to.edge) {
            const line = from.edge.line.slice(
                Math.min(from.i, to.i),
                Math.max(from.i, to.i) + 1,
            );
            if (from.i > to.i) {
                line.reverse();
            }
            return [line, true];
        }
        const [start, startAdded] = this.getOrAddVertex(from.edge, from.i);
        const [end, endAdded] = this.getOrAddVertex(to.edge, to.i);
        const path = this.memoizedAStar(start, end, mode);
        if (startAdded) {
            this.removeVertex(start);
        }
        if (endAdded) {
            this.removeVertex(end);
        }
        if (path == null) {
            return [[vertexToPoint(start), vertexToPoint(end)], false];
        } else {
            return [path, true];
        }
    }

    private getOrAddVertex(edge: FwdEdge, i: number): [Vertex, boolean] {
        const v = pointToVertex(edge.line[i]);
        if (v === edge.u || v === edge.v) {
            return [v, false];
        }
        const fromU = FwdEdge.fromLine(
            edge.u,
            v,
            edge.line.slice(0, i + 1),
            edge.hikingTrail,
            edge.paved,
        );
        const toV = FwdEdge.fromLine(
            v,
            edge.v,
            edge.line.slice(i),
            edge.hikingTrail,
            edge.paved,
        );
        this.graph.addEdge(fromU);
        this.graph.addEdge(new BwdEdge(fromU));
        this.graph.addEdge(toV);
        this.graph.addEdge(new BwdEdge(toV));
        return [v, true];
    }

    private removeVertex(v: Vertex) {
        for (const edge of this.graph.adj.get(v)!) {
            const rem = this.graph.adj.get(edge.v)!.filter((e) => e.v !== v);
            this.graph.adj.set(edge.v, rem);
        }
        this.graph.adj.delete(v);
    }

    private memoizedAStar(
        start: Vertex,
        end: Vertex,
        mode: RouteMode,
    ): Line | undefined {
        const key: [Vertex, Vertex, RouteMode] = [start, end, mode];
        const result = this.aStarMemo.get(key) ?? this.aStar(start, end, mode);
        this.aStarMemo.set(key, result);
        return result;
    }

    private aStar(
        start: Vertex,
        end: Vertex,
        mode: RouteMode,
    ): Line | undefined {
        const cost = (e: Edge) => {
            const base = e.length + 10 * e.ascent;
            const preferred =
                mode === RouteMode.PreferRoads ||
                (mode === RouteMode.PreferPaved && e.paved) ||
                (mode === RouteMode.PreferHikingTrails && e.hikingTrail);
            return preferred ? base : 10 * base;
        };
        const h = (v: Vertex) => {
            const p = vertexToPoint(v);
            const e = vertexToPoint(end);
            return distance(p, e);
        };
        const incoming: Map<Vertex, Edge> = new Map();
        const gScore: Map<Vertex, number> = new Map();
        gScore.set(start, 0);
        const fScore: Map<Vertex, number> = new Map();
        fScore.set(start, h(start));
        const open: TinyQueue<Vertex> = new TinyQueue(
            [],
            (a, b) => fScore.get(a)! - fScore.get(b)!,
        );
        open.push(start);
        while (open.length > 0) {
            const curr = open.pop()!;
            if (curr === end) {
                return Router.reconstruct(incoming, start, end);
            }
            for (const edge of this.graph.getAdj(curr)!) {
                const g = gScore.get(curr)! + cost(edge);
                if (g < (gScore.get(edge.v) ?? Infinity)) {
                    incoming.set(edge.v, edge);
                    gScore.set(edge.v, g);
                    fScore.set(edge.v, g + h(edge.v));
                    open.push(edge.v);
                }
            }
        }
        return undefined;
    }

    private static reconstruct(
        incoming: Map<Vertex, Edge>,
        start: Vertex,
        end: Vertex,
    ): Line {
        const edges: Edge[] = [];
        let v = end;
        while (v !== start) {
            const e = incoming.get(v)!;
            edges.push(e);
            v = e.u;
        }
        const line: Line = [];
        for (let i = edges.length - 1; i >= 0; i--) {
            edges[i].walk((_, p) => line.push(p));
        }
        return line;
    }
}
