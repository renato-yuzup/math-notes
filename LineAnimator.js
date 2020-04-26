//const durationPerPixelInMillis = 1.01;

class LineAnimator {
  constructor(xStart, yStart, xEnd, yEnd, strokeWidth, color, layerIndex, problemViewport, screenViewport) {
    this.xStart = xStart;
    this.yStart = yStart;
    this.xEnd = xEnd;
    this.yEnd = yEnd;
    this.strokeWidth = strokeWidth;    
    this.strokeColor = `#${color.toString(16)}`;
    this.animationDuration = distance(xStart, yStart, xEnd, yEnd) / LineAnimator.velocity() * 1000;
    this.layerIndex = layerIndex;
    this.problemViewport = problemViewport;
    this.screenViewport = screenViewport;
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
    const x = lerp(this.xStart, this.xEnd, proportion);
    const y = lerp(this.yStart, this.yEnd, proportion);

    if (before) {
      before();
    }    

    this.drawFrame(context, this.xStart, this.yStart, x, y, this.strokeWidth, this.strokeColor);

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

  drawFrame(context, xStart, yStart, xEnd, yEnd, strokeWidth, strokeColor) {
    context.save();

    context.beginPath();
    drawLineOnViewport(context, xStart, yStart, xEnd, yEnd, this.problemViewport, this.screenViewport);
    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeColor;
    context.stroke();

    context.restore();
  }

  drawStatic(context) {
    this.drawFrame(context, this.xStart, this.yStart, this.xEnd, this.yEnd, this.strokeWidth, this.strokeColor);
  }

  getAnimationTime() {
    const curTime = Date.now();
    return Math.max(curTime - this.startTime, 0);
  }
}
