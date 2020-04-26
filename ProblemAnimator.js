const StartPointColor = 0x60FF90;
const EndPointColor = 0xFF6090;
const ProblemLineColor = 0xB8C1C4;
const PathColor = 0xFF6E1B;

class ProblemAnimator {
  constructor(canvas, xStart, yStart, xEnd, yEnd, xCenter, yCenter, radius, xTangent1, yTangent1, xTangent2 , yTangent2, startAngle, endAngle, tangentIndex) {
    this.canvas = canvas;
    let clipRect = getClippingRect({}, xStart, yStart);
    clipRect = getClippingRect(clipRect, xStart, yStart);
    clipRect = getClippingRect(clipRect, xEnd, yEnd);
    clipRect = getClippingRect(clipRect, xCenter, yCenter);
    clipRect = getClippingRect(clipRect, xTangent1, yTangent1);
    clipRect = getClippingRect(clipRect, xTangent2, yTangent2);
    clipRect = getClippingRect(clipRect, xCenter - radius, yCenter);
    clipRect = getClippingRect(clipRect, xCenter + radius, yCenter);
    clipRect = getClippingRect(clipRect, xCenter, yCenter - radius);
    clipRect = getClippingRect(clipRect, xCenter, yCenter + radius);
    clipRect = expandRect(clipRect, 0.33);    
    this.clippingRect = clipRect;
    const screenViewport = {
      x1: -this.canvas.width / 2,
      y1: -this.canvas.height / 2,
      x2: this.canvas.width / 2,
      y2: this.canvas.height / 2,
    };
    console.log(this.clippingRect);
    
    const startPointAnimator = new PointAnimator(xStart, yStart, StartPointColor, 0, clipRect, screenViewport);
    const endPointAnimator = new PointAnimator(xEnd, yEnd, EndPointColor, 0, clipRect, screenViewport);
    const circleAnimator = new ArcAnimator(xCenter, yCenter, radius, 0, Math.PI*2, 1, ProblemLineColor, 10, clipRect, screenViewport);
    const tangentAnimator1 = new LineAnimator(xEnd, yEnd, xTangent1, yTangent1, 1, ProblemLineColor, 10, clipRect, screenViewport);
    const tangentAnimator2 = new LineAnimator(xEnd, yEnd, xTangent2, yTangent2, 1, ProblemLineColor, 10, clipRect, screenViewport);

    const pathArcAnimator = new ArcAnimator(xCenter, yCenter, radius, startAngle, endAngle, 3, PathColor, 5, clipRect, screenViewport);
    let x = xTangent1, y = yTangent1;
    if (tangentIndex == 1) {
      x = xTangent2;
      y = yTangent2;
    }
    const pathLineAnimator = new LineAnimator(x, y, xEnd, yEnd, 3, PathColor, 5, clipRect, screenViewport);
    this.animator = new CompositeAnimator(
      canvas,
      startPointAnimator,
      endPointAnimator,
      circleAnimator,
      tangentAnimator1,
      tangentAnimator2,
      pathArcAnimator,
      pathLineAnimator,
    );
  }

  start(before, after) {
    return new Promise((resolve) => {
      this.animator.start(
        () => {
          const rect = this.clippingRect;
          const context = this.canvas.getContext('2d');          
          context.lineWidth = 1;
          context.translate(this.canvas.width / 2, this.canvas.height / 2);
          context.scale(1, -1);
          if (before) {
            before();
          }
        },
        after,
      ).then(resolve);
    });
  }
}
