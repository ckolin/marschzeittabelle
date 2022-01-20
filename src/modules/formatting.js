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
    const m = Math.round((hours - h) * 60);
    return {h, m};
}

function pad(number) {
    return number < 10 ? `0${number}` : number.toString();
}
