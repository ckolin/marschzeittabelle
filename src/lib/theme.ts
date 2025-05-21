type Key =
    | "background"
    | "text"
    | "primary-light"
    | "primary"
    | "secondary-light"
    | "secondary"
    | "shadow";

export function theme(key: Key): string {
    return window.getComputedStyle(document.body).getPropertyValue(`--${key}`);
}
