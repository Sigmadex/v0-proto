console.log('hello quaternion')
const stringify = require('csv-stringify')
const fs = require('fs')

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
  return A*t0*Math.sin(-phase*t)
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
let input = []
for (let i = 0; i<l/2; i++) {
  let xi = i
  let yi = test(xi)
  let [x1, y1] = rotate(s, xi, yi)
  let [x2, y2] = shift(b, x1, y1)
  input.push([x2, y2])
}

stringify(input, (err, output) => {
  fs.writeFileSync('curve-test.csv', output, (err2) => {
    if (err2) {
      throw err2
    }
    console.log("artifact written to the web artifacts directory")
  })
})
