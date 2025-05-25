type Key = "background" | "text" | "accent" | "shadow";

export function theme(key: Key): string {
    return window.getComputedStyle(document.body).getPropertyValue(`--${key}`);
}
