type Key =
    | "backgroundColor"
    | "textColor"
    | "darkerAccentColor"
    | "accentColor"
    | "lighterAccentColor"
    | "lineColor"
    | "shadowColor";

export function theme(key: Key): string {
    const prop = "--" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    return window.getComputedStyle(document.body).getPropertyValue(prop);
}
