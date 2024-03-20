export function ManhattanDistance(from, to) {
  let sum = 0;
  for (let i = 0; i < from.length; i++) {
    const dst = Math.abs(to[i] - from[i]);
    sum = sum + dst;
  }
  return sum;
}
