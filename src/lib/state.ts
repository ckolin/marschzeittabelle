import type { Line2 } from "./points";
import { RouteMode, type RoutePoint } from "./routing";

export class State {
    constructor(
        public routing: RoutingState | undefined,
        public line: Line2 | undefined = undefined,
        public title: string = "",
        public author: string = "",
        public start: number = 0,
        public speed: number = 4,
        public mapScale: 25 | 50 | 100 = 25,
    ) {}

    static new(): State {
        return new State(new RoutingState());
    }

    static import(line: Line2): State {
        return new State(undefined, line);
    }
}

interface Insert {
    kind: "insert";
    index: number;
    point: RoutePoint;
}

interface Remove {
    kind: "remove";
    index: number;
    point: RoutePoint;
}

interface Replace {
    kind: "replace";
    index: number;
    old: RoutePoint;
    new: RoutePoint;
}

type Command = Insert | Remove | Replace;

export class RoutingState {
    constructor(
        public mode: RouteMode = RouteMode.PreferRoads,
        public points: RoutePoint[] = [],
        private history: Command[] = [],
        private future: Command[] = [],
    ) {}

    public insert(point: RoutePoint, index: number = this.points.length) {
        this.execute({ kind: "insert", index, point }, true);
    }

    public remove(index: number = this.points.length - 1) {
        this.execute({ kind: "remove", index, point: this.points[index] });
    }

    public replace(index: number, point: RoutePoint) {
        this.execute({
            kind: "replace",
            index,
            old: this.points[index],
            new: point,
        });
    }

    public undo() {
        if (this.history.length > 0) {
            const cmd = RoutingState.reverse(this.history.pop()!);
            this.execute(cmd);
            this.future.push(cmd);
        }
    }

    public redo() {
        if (this.future.length > 0) {
            const cmd = RoutingState.reverse(this.future.pop()!);
            this.execute(cmd);
            this.history.push(cmd);
        }
    }

    private execute(cmd: Command, track: boolean = false) {
        if (cmd.kind === "insert") {
            this.points.splice(cmd.index, 0, cmd.point);
        } else if (cmd.kind === "remove") {
            this.points.splice(cmd.index, 1);
        } else if (cmd.kind === "replace") {
            this.points[cmd.index] = cmd.new;
        }
        if (track) {
            this.history.push(cmd);
            this.future = [];
        }
    }

    private static reverse(cmd: Command): Command {
        switch (cmd.kind) {
            case "insert":
                return { kind: "remove", index: cmd.index, point: cmd.point };
            case "remove":
                return { kind: "insert", index: cmd.index, point: cmd.point };
            case "replace":
            default:
                return {
                    kind: "replace",
                    index: cmd.index,
                    old: cmd.new,
                    new: cmd.old,
                };
        }
    }
}
