/* eslint-disable */

function sinMod(secondsFrac) {
  return 0.55 * Math.sin(4 * secondsFrac + 4.283) + 0.5
}

export default {
  /**
   * Takes a set x and y and a desination x and y and paths them together.
   * @param {object} options Sin Interp options
   */
  sinInterp(options) {
    let {
      x,
      y,
      toX,
      toY,
      s,
      fps,
      func
    } = options

    var seconds = 0
    const originalX = x
    const originalY = y
    const totalDistanceX = toX - originalX
    const totalDistanceY = toY - originalY

    var intervalFunction = setInterval(() => {
      seconds += 1 / fps
      const secondsFraction = (seconds / s)

      x = originalX + totalDistanceX * sinMod(secondsFraction)
      y = originalY + totalDistanceY * sinMod(secondsFraction)
      if (seconds >= s) {
        x = toX
        y = toY
        seconds = s
        func(x, y)
        clearInterval(intervalFunction)
        intervalFunction = undefined
        return;
      }
      func(x, y)
    }, 1000 / fps);
  },
  /**
   * Takes a set x and y and a desination x and y and paths them together.
   * @param {object} options Exp interp options
   */
  expInterp(options) {
    let {
      x,
      y,
      toX,
      toY,
      s,
      f,
      fps,
      func
    } = options

    var seconds = 0
    const originalX = x
    const originalY = y
    const totalDistanceX = toX - originalX
    const totalDistanceY = toY - originalY

    var intervalFunction = setInterval(() => {
      seconds += 1 / fps
      const secondsFraction = (seconds / s)

      x = originalX + totalDistanceX * Math.pow(secondsFraction, f)
      y = originalY + totalDistanceY * Math.pow(secondsFraction, f)
      if (seconds >= s) {
        x = toX
        y = toY
        seconds = s
        func(x, y)
        clearInterval(intervalFunction)
        intervalFunction = undefined
        return;
      }
      func(x, y)
    }, 1000 / fps);
  },
  /**
   * Takes a set x and y and a desination x and y and paths them together.
   * @param {object} options Linear interp options
   */
  linearInterp(options) {
    let {
      x,
      y,
      toX,
      toY,
      s,
      fps,
      func
    } = options
    const distanceX = toX - x
    const distanceY = toY - y
    const perX = distanceX / (s * fps)
    const perY = distanceY / (s * fps)
    var intervalFunction = setInterval(() => {
      x += perX
      y += perY
      if (x >= toX && y >= toY) {
        x = toX
        y = toY
        func(x, y)
        clearInterval(intervalFunction)
        intervalFunction = undefined
        return;
      }
      func(x, y)
    }, 1000 / fps);
  }
}