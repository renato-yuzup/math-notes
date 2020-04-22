const squaredDistance = function (x1, y1, x2, y2) {
  if (x2 === undefined) {
    return x1*x1 + y1*y1;
  }
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx*dx + dy*dy;
};

const getAngleFromPoint = function (x, y, radius) {
  const cos = x / radius;
  let angle = Math.acos(cos);
  if (y < 0) {
    angle = 2*Math.PI - angle;
  }
  return angle;
};

