export const theme = {
    backgroundColor: "#fff",
    textColor: "#222",
    darkerAccentColor: "#214B00",
    accentColor: "#3C7113",
    lighterAccentColor: "#87BC5E"
};

// Set theme styles
for (let key of Object.keys(theme)) {
    const property = "--" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    document.documentElement.style.setProperty(property, theme[key]);
}