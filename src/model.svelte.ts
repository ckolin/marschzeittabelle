import type { Line2, Point2 } from "./lib/points";
import { RouteMode, type RoutePoint } from "./lib/routing";

export interface Waypoint {
    name: string;
    comment: string;
    point: Point2;
}

export interface Model {
    routing: RoutingModel | undefined;
    line: Line2 | undefined;
    title: string;
    author: string;
    start: number;
    speed: number;
    mapScale: 25 | 50 | 100;
    waypoints: Waypoint[];
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

export class RoutingModel {
    mode: RouteMode = $state(RouteMode.PreferRoads);
    points: RoutePoint[] = $state([]);
    history: Command[] = $state([]);
    future: Command[] = $state([]);

    public insert(point: RoutePoint, index: number = this.points.length) {
        this.execute({ kind: "insert", index, point });
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
            const cmd = RoutingModel.reverse(this.history.pop()!);
            this.execute(cmd, false);
            this.future.push(cmd);
        }
    }

    public redo() {
        if (this.future.length > 0) {
            const cmd = RoutingModel.reverse(this.future.pop()!);
            this.execute(cmd, false);
            this.history.push(cmd);
        }
    }

    private execute(cmd: Command, track: boolean = true) {
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

export const model = $state({
    routing: new RoutingModel(),
    line: undefined,
    title: "",
    author: "",
    start: 0,
    speed: 4,
    mapScale: 25,
    waypoints: [],
});
