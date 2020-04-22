const animationDurationInMillis = 500;
const pointSizeInPixels = 16;

const PointAnimator = function(x, y, color, layerIndex) {
  this.x = x;
  this.y = y;
  this.color = `#${color.toString(16)}`;
  this.layerIndex = layerIndex;
};

PointAnimator.prototype = {
  startTime: 0,
  x: 0,
  y: 0,
  color: '',
  haloColor: '',
  haloSizeAtLastFrame: 0,
  pointSizeAtLastFrame: 0,
  layerIndex: 0,

  start(context, before, after, done) {
    this.startTime = Date.now();
    const animateFn = this.animate.bind(this, context, before, after, done);
    window.requestAnimationFrame(animateFn);
  },

  animate(context, before, after, done) {
    const time = this.getAnimationTime();
    const T = animationDurationInMillis;
    const normalT = time / T;

    // Do any thing that might be needed before drawing current frame (like clearing previous frame)
    if (before) {
      before();    
    }

    // Our size function (f): sine function
    const maxAngle = Math.PI * 130 / 180;
    const theta = normalT * maxAngle;
    const haloTheta = theta + (Math.PI / 6);
    const S = Math.sin(maxAngle); // f(theta) where we want the animation end
    const size = Math.sin(theta) / S * pointSizeInPixels;
    const haloSize = Math.max(Math.sin(haloTheta), 0) / S * (pointSizeInPixels*2);    

    const alphaTheta = normalT * Math.PI;
    const alpha = Math.abs(Math.sin(alphaTheta));
    this.haloColor = addTransparencyToColor(this.color, alpha);
    console.log(this.haloColor);
    this.drawFrame(context, haloSize, size);

    if (after) {
      after();      
    }

    if (this.getAnimationTime() >= animationDurationInMillis) {
      this.haloSizeAtLastFrame = haloSize;
      this.pointSizeAtLastFrame = size;
      if (done) {
        done();
      }
    } else {
      const animateFn = this.animate.bind(this, context, before, after, done);
      window.requestAnimationFrame(animateFn);
    }
  },

  drawFrame(context, haloSize, pointSize) {
    context.save();

    // Draw halo
    context.beginPath();
    context.arc(this.x, this.y, haloSize / 2, 0, 2*Math.PI);
    context.strokeStyle = this.haloColor;
    context.stroke();    

    // Draw point
    context.beginPath();
    context.arc(this.x, this.y, pointSize / 2, 0, 2*Math.PI);
    context.fillStyle = this.color;
    context.fill();

    context.restore();
  },

  drawStatic(context) {
    this.drawFrame(context, this.haloSizeAtLastFrame, this.pointSizeAtLastFrame);
  },

  getAnimationTime() {
    const curTime = Date.now();
    return Math.max(curTime - this.startTime, 0);
  },
};
