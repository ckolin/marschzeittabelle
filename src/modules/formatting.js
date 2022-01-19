export function formatDuration(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${pad(m)}`;
}

function pad(number) {
    return number < 10 ? `0${number}` : number.toString();
}
