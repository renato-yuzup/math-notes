function init() {    
  $('#startPointSelectMode').on('change', function () {
    const element = $('#startPointSelectMode')[0];      
    const setByCoordinate = element.value === 'coordinate';
    setElementVisible($('#startPointFormPoint'), setByCoordinate);
    setElementVisible($('#startPointFormAngle'), !setByCoordinate);
  });
  $('#submit').on('click', function () {
    const solver = new CircleTangentProblem();
    solver.getProblemInput();
    solver.solveProblem();
  });
}

function setElementVisible(element, isVisible) {
  element[0].hidden = !isVisible;
  if (isVisible) {
    element.show();
  } else {
    element.hide();
  }
}

function getInputValue(inputName) {
  const input = document.getElementById(inputName);
  return Number(input.value);
}

const CircleTangentProblem = function(){};
CircleTangentProblem.prototype = {
  xCenter: 0,
  yCenter: 0,
  xTarget: 0,
  yTarget: 0,
  radius: 0,
  xStart: 0,
  yStart: 0,
  startingAngle: 0,
  radiusColor: '#EB984E',
  circleColor: '#D5D8DC',
  powerLineColor: '#ABEBC6',
  tangentColor: '##F5B7B1',
  circlePathColor: '#1ABC9C',
  startDotColor: 0x28B463,
  pathColor: 0xF39C12,

  getProblemInput: function () {
    console.log('OK!');
    this.xCenter = getInputValue('circleX');
    this.yCenter = getInputValue('circleY');
    this.radius = getInputValue('circleRadius');
    
    this.xTarget = getInputValue('externalPointX');
    this.yTarget = getInputValue('externalPointY');
  },

  solveProblem: function () {
    const canvas = document.getElementById('graph');
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1);

    ctx.beginPath();
    console.log(this.xCenter, this.yCenter, this.radius);
    ctx.arc(this.xCenter, this.yCenter, this.radius, 0, 2 * Math.PI);    
    this.setStrokeColor(ctx, this.circleColor);
    ctx.stroke();
    
    let xP = this.xTarget - this.xCenter;
    let yP = this.yTarget - this.yCenter;
    const s = this.squaredDistance(0, 0, xP, yP);
    const r = this.radius;
    const h = s - r*r;

    let yTangent = [];
    yTangent[0] = (r*r*yP + r*xP*Math.sqrt(h)) / s;
    yTangent[1] = (r*r*yP - r*xP*Math.sqrt(h)) / s;

    let xTangent = [];
    if (xP === 0) {
      xTangent[0] = Math.sqrt(r*r - yTangent[0]*yTangent[0]);
      xTangent[1] = -xTangent[0];
    } else {
      xTangent[0] = (r*r - yP*yTangent[0]) / xP;
      xTangent[1] = (r*r - yP*yTangent[1]) / xP;
    }

    xP += this.xCenter;
    yP += this.yCenter;

    for (i = 0; i < 2; i++) {
      xTangent[i] += this.xCenter;
      yTangent[i] += this.yCenter;

      const dx = xTangent[i] - xP;
      const dy = yTangent[i] - yP;
      const length = Math.sqrt(dx*dx + dy*dy);
      const ux = dx / length;
      const uy = dy / length;
      const outerX = xP + ux*(length + 2*r);
      const outerY = yP + uy*(length + 2*r);

      ctx.beginPath();
      ctx.moveTo(xP, yP);
      this.setStrokeColor(ctx, this.tangentColor);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.xCenter, this.yCenter);
      this.setStrokeColor(ctx, this.radiusColor);
      ctx.lineTo(xTangent[i], yTangent[i]);
      ctx.stroke();

      console.log(xTangent[i], yTangent[i]);
    }
    ctx.beginPath();
    ctx.moveTo(xP, yP);
    this.setStrokeColor(ctx, this.powerLineColor);
    ctx.lineTo(this.xCenter, this.yCenter);
    ctx.stroke();

    this.startingAngle = this.getStartingAngle();
    let tangentAngle = [];
    tangentAngle[0] = this.getAngleFromPoint(xTangent[0], yTangent[0], r);
    tangentAngle[1] = this.getAngleFromPoint(xTangent[1], yTangent[1], r);

    let tangentIndex = 0;
    const a = this.isTangentSmoothPath(tangentAngle[1], r, xP - this.xCenter, yP - this.yCenter);
    const b = this.isTangentSmoothPath(tangentAngle[0], r, xP - this.xCenter, yP - this.yCenter);
    console.log(a, b);
    if (this.isTangentSmoothPath(tangentAngle[1], r, xP - this.xCenter, yP - this.yCenter) &&
       (!this.isTangentSmoothPath(tangentAngle[0], r, xP - this.xCenter, yP - this.yCenter))
    ) {
      tangentIndex = 1;
    }
    console.log('CHOSE TANGENT INDEX=', tangentIndex);
    ctx.beginPath();
    ctx.arc(this.xCenter, this.yCenter, this.radius, this.startingAngle, tangentAngle[tangentIndex]);
    this.setStrokeColor(ctx, this.circlePathColor);
    ctx.lineWidth = 3;
    ctx.stroke();

    const anim = new CompositeAnimator(
      canvas,
      new PointAnimator(this.xStart, this.yStart, this.startDotColor, 0),
      new ArcAnimator(this.xCenter, this.yCenter, r, this.startingAngle, tangentAngle[tangentIndex], 2, this.pathColor, 1),
      new LineAnimator(xTangent[tangentIndex], yTangent[tangentIndex], xP, yP, 2, this.pathColor, 1),
    );

    anim.start();
  },

  isTangentSmoothPath: function(tangentAngle, radius, xi, yi) {
    const oneDegree = Math.PI / 180;
    const angle = tangentAngle + oneDegree;
    const xTest = Math.cos(angle)*radius;
    const yTest = Math.sin(angle)*radius;
    const xTan = Math.cos(tangentAngle)*radius;
    const yTan = Math.sin(tangentAngle)*radius;

    const dTest = Math.sqrt(Math.pow(xTan - xi, 2) + Math.pow(yTan - yi, 2));
    const dRef = Math.sqrt(Math.pow(xTest - xi, 2) + Math.pow(yTest - yi, 2));

    return dTest > dRef;
  },

  squaredDistance: function (x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx*dx + dy*dy;
  },

  getAngleFromPoint: function (x, y, radius) {
    const xi = x - this.xCenter;
    const yi = y - this.yCenter;
    const cos = xi / radius;
    let angle = Math.acos(cos);
    if (yi < 0) {
      angle = 2*Math.PI - angle;
    }
    return angle;
  },

  getStartingAngle: function() {
    const inputByAngle = document.getElementById('startPointSelectMode').value === 'angle';
    let angle;
    if (inputByAngle) {
      angle = Number(document.getElementById('startingAngle').value);
      const isRadians = document.getElementById('angleUnit').value === 'radian';
      if (!isRadians) {
        angle = angle / 180 * Math.PI;
      }
    } else {
      const x = Number(document.getElementById('startingPointX').value);
      const y = Number(document.getElementById('startingPointY').value);
      angle = this.getAngleFromPoint(x, y, this.radius);
    }
    return angle;
  },

  setStrokeColor: function (ctx, color) {
    ctx.strokeStyle = color;
  },
};

init();
