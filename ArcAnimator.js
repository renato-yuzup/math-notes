//const durationPerDegressInMillis = 6 * (180 / Math.PI);
//const velocityInPixelsPerSecond = 96;

class ArcAnimator {

  constructor(x, y, radius, startAngle, endAngle, strokeWidth, color, layerIndex, problemViewport, screenViewport) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.strokeWidth = strokeWidth;    
    this.strokeColor = `#${color.toString(16)}`;
    this.problemViewport = problemViewport;
    this.screenViewport = screenViewport;
    if (endAngle < startAngle) {
      this.endAngle += 2*Math.PI;
    }
    this.animationDuration = (this.endAngle - this.startAngle) * radius / ArcAnimator.velocity() * 1000;
    console.log(this.startAngle, this.endAngle, this.animationDuration);
    this.layerIndex = layerIndex;
  }

  static velocity() {
    if (typeof velocityInPixelsPerSecond === 'undefined') {
      return 256;
    }
    return velocityInPixelsPerSecond;
  }

  start(context, before, after) {
    this.startTime = Date.now();
    return new Promise((resolve) => {
      const animateFn = this.animate.bind(this, context, before, after, resolve);
      window.requestAnimationFrame(animateFn);
    });
  }

  animate(context, before, after, done) {
    const time = this.getAnimationTime();
    const T = this.animationDuration;
    const proportion = time / T;
    const currentAngle = lerp(this.startAngle, this.endAngle, proportion);

    if (before) {
      before();
    }    

    this.drawFrame(context, this.x, this.y, this.radius, this.startAngle, currentAngle, this.strokeWidth, this.strokeColor);

    if (after) {
      after();
    }

    if (this.getAnimationTime() >= this.animationDuration) {
      if (done) {
        done();
      }
    } else {
      const animateFn = this.animate.bind(this, context, before, after, done);
      window.requestAnimationFrame(animateFn);
    }
  }

  drawFrame(context, x, y, radius, startAngle, endAngle, strokeWidth, strokeColor) {
    context.save();

    context.beginPath();
    drawArcOnViewport(context, x, y, radius, startAngle, endAngle, this.problemViewport, this.screenViewport);
    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeColor;
    context.stroke();

    context.restore();
  }

  drawStatic(context) {
    this.drawFrame(context, this.x, this.y, this.radius, this.startAngle, this.endAngle, this.strokeWidth, this.strokeColor);
  }

  getAnimationTime() {
    const curTime = Date.now();
    return Math.max(curTime - this.startTime, 0);
  }
}
