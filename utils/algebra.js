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

const getClippingRect = function(initialRect, x, y) {
  let rect = initialRect;
  if (Object.keys(initialRect).length === 0) {
    rect = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    };
  }
  if (x < rect.x1) rect.x1 = x;
  if (y < rect.y1) rect.y1 = y;
  if (x > rect.x2) rect.x2 = x;
  if (y > rect.y2) rect.y2 = y;
  return rect;
}

const expandRect = function(rect, percent) {
  const dw = (rect.x2 - rect.x1) * percent;
  const dh = (rect.y2 - rect.y1) * percent;
  return {
    x1: rect.x1 - Math.abs(dw / 2),
    y1: rect.y1 - Math.abs(dw / 2),
    x2: rect.x2 + Math.abs(dh / 2),
    y2: rect.y2 + Math.abs(dh / 2),
  };
}

const getAngleFromPointNormalized = function (x, y) {
  const distance = Math.sqrt(squaredDistance(x, y));
  const cos = x / distance;
  let angle = Math.acos(cos);
  if (y < 0) {
    angle = 2*Math.PI - angle;
  }
  return angle;
};

const snapPointToCircle = function (x, y, radius, tolerance) {
  const pointRadius = Math.sqrt(x*x + y*y);
  if (radius === 0 || pointRadius === 0 || normalizedRatio(radius, pointRadius) < (1-tolerance)) {
    return false;
  }
  const ratio = pointRadius / radius;  
  return {
    x: x / ratio,
    y: y / ratio,
  };
};

const normalizedRatio = function (a, b) {
  return a > b? b/a : a/b;
};

const isSmoothPath = function(tangentAngle, radius, xi, yi) {
  const oneDegree = Math.PI / 180;
  const angle = tangentAngle + oneDegree;
  const xTest = Math.cos(angle)*radius;
  const yTest = Math.sin(angle)*radius;
  const xTan = Math.cos(tangentAngle)*radius;
  const yTan = Math.sin(tangentAngle)*radius;
  
  const dTest = Math.sqrt(Math.pow(xTan - xi, 2) + Math.pow(yTan - yi, 2));
  const dRef = Math.sqrt(Math.pow(xTest - xi, 2) + Math.pow(yTest - yi, 2));
  
  return dTest > dRef;
};
