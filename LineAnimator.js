const durationPerPixelInMillis = 1.01;

class LineAnimator {
  constructor(xStart, yStart, xEnd, yEnd, strokeWidth, color, layerIndex) {
    this.xStart = xStart;
    this.yStart = yStart;
    this.xEnd = xEnd;
    this.yEnd = yEnd;
    this.strokeWidth = strokeWidth;    
    this.strokeColor = `#${color.toString(16)}`;
    this.animationDuration = distance(xStart, yStart, xEnd, yEnd)*durationPerPixelInMillis;
    this.layerIndex = layerIndex;
}

  start(context, before, after, done) {
    this.startTime = Date.now();
    const animateFn = this.animate.bind(this, context, before, after, done);
    window.requestAnimationFrame(animateFn);
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
    context.moveTo(xStart, yStart);
    context.lineTo(xEnd, yEnd);
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
