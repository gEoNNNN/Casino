export function findthebobr(level: number) {
    const rows = 9;
    const cols = 4;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let row = 0; row < matrix.length; row++) {   
        let i = 0;
        while (i !== 4 - level) {
            const random = Math.floor(Math.random() * cols);
            if (matrix[row][random] === 0) {
                matrix[row][random] = 1;
                i++;
            }
        }
    }
    return matrix;
}