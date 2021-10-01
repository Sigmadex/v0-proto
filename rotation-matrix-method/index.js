console.log('hello quaternion')

// get basic x,y
// perform rotation matrix
//

//let t = 0
let t0 = 90
let A = 0.28
let l = 404.53
let b = 180.63
let s = -1.104
console.log(Math.PI)
let phase = (2 * Math.PI) / l
//let y = A*t0*Math.sin(phase*t)
function test(t) {
  return A*t0*Math.sin(phase*t)
}
console.log(test(0))

function rotate(angle, x, y) {
  let x1 = x*Math.cos(angle) - y*Math.sin(angle)
  let y1 = x*Math.sin(angle) + y*Math.cos(angle)
  return [x1, y1]
}

function shift(yIntercept, x, y) {
  x = x + 0
  y = y + b
  return  [x, y]
}
  /*
for (let i = 0; i<t0*3; i++) {
  let xi = i
  let yi = test(xi)
  let [x1, y1] = rotate(s, xi, yi)
  let [x2, y2] = shift(b, x1, y1)
  console.log(x2, y2)
}
*/
let j = 0;
while (true) {
  let xi = j
  let yi = test(xi)
  let [x1, y1] = rotate(s, xi, yi)
  let [x2, y2] = shift(b, x1, y1)
  console.log(x2, y2)
  if (y2 < 0) break
  j++
}

