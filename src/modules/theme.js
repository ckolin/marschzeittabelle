export const theme = {
    backgroundColor: null,
    textColor: null,
    darkerAccentColor: null,
    accentColor: null,
    lighterAccentColor: null
};

export function applyStyles() {
    for (let key of Object.keys(theme)) {
        const property = "--" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
        theme[key] = window.getComputedStyle(document.body).getPropertyValue(property);
    }
}
