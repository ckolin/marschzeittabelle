export function formatCoordinates(point) {
    const fmt = (n) => Math.round(n);//.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${fmt(point.x)}/${fmt(point.y)}`;
}

export function formatRelative(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = diff / 1000 / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const months = days / 30;
    const years = months / 12;

    if (minutes < 1) {
        return "gerade eben";
    } else if (hours < 1) {
        return `vor ${Math.round(minutes)} Minuten`;
    } else if (days < 1) {
        return `vor ${Math.round(hours)} Stunden`;
    } else if (months < 1) {
        return `vor ${Math.round(days)} Tagen`;
    } else if (years < 1) {
        return `vor ${Math.round(months)} Monaten`;
    } else {
        return `vor ${Math.round(years)} Jahren`;
    }
}

export function formatDuration(hours) {
    const {h, m} = getParts(hours);
    return `${h}:${pad(m)}`;
}

export function formatTime(hours) {
    const {h, m} = getParts(hours);
    return `${pad(h % 24)}:${pad(m)}`;
}

function getParts(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return {h, m};
}

function pad(number) {
    return number < 10 ? `0${number}` : number.toString();
}
