type Key = "bg" | "fg" | "acc" | "shadow";

export function theme(el: HTMLElement, key: Key): string {
    return window.getComputedStyle(el).getPropertyValue(`--${key}`);
}

export const BLACK = "#000";
export const WHITE = "#fff";
export const RED = "#e2000a";
export const GREEN = "#00954d";
export const BLUE = "#008ad1";
export const PINK = "#e5007c";
export const YELLOW = "#f7a71f";
export const BROWN = "#ce7510";
