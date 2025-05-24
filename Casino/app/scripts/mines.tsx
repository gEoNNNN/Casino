export function mines(bombs: number) {
    const arr = Array(25).fill(0);
    let i = 0;
    while (i !== bombs) {
        const randomInt = Math.floor(Math.random() * 25);
        if (arr[randomInt] === 0) {
            arr[randomInt] = 1;
            i++;
        }
    }
    return arr;
}