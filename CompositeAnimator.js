class CompositeAnimator {
  constructor(canvas, ...animators) {
    this.canvas = canvas;
    this.animators = animators;
  }

  addAnimator(animator) {
    this.animators.push(animator);
  }

  start(before, after, done) {
    this.animationQuery = this.animators.slice();
    this.staticQuery = [];
    this.currentAnimator = null;
    this.animate(before, after, done);    
  }

  animate(before, after, done) {
    if (!this.currentAnimator) {
      if (this.animationQuery.length === 0) {
        console.log('DONE!');
        if (done) {
          done();
        }
        return;
      }
      this.currentAnimator = this.animationQuery.shift();
    }

    const currentLayerIndex = this.currentAnimator.layerIndex;
    const context = this.canvas.getContext('2d');
    const beforeFn = this.drawStatic.bind(this, before, true, (layerIndex) => layerIndex >= currentLayerIndex);
    const afterFn = this.drawStatic.bind(this, after, false, (layerIndex) => layerIndex < currentLayerIndex);
    const doneFn = this.pullNextAnimation.bind(this, before, after, done);

    this.currentAnimator.start(context, beforeFn, afterFn, doneFn);
  }

  pullNextAnimation(before, after, done) {
    console.log('PROXIMO!!');
    this.staticQuery.push(this.currentAnimator);
    this.currentAnimator = null;
    this.animate(before, after, done);
  }

  drawStatic(afterFn, resetCanvas, layerPredicate) {
    if (resetCanvas) {
      this.clearCanvas();      
    }
    const context = this.canvas.getContext('2d');
    const layerIndexes = this.staticQuery.map(animator => animator.layerIndex);
    const layersToRender = layerIndexes.filter((value, index, self) => {
      return layerPredicate() && self.indexOf(value) === index;
    }).sort(
      (a, b) => a > b // sort layer from the deepest one to the topmost
    );
    console.log(resetCanvas? 'BEFORE':'AFTER', 'LAYERS COUNT=', layersToRender.length, 'STATICS=', this.staticQuery.length);
    layersToRender.forEach((layerIndex) => {
      const animators = this.staticQuery.filter(animator => animator.layerIndex === layerIndex);
      animators.forEach(animator => animator.drawStatic(context));
    });

    if (afterFn) {
      afterFn();
    }
  }

  clearCanvas() {
    const canvas = this.canvas;
    const context = canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1;
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(1, -1);
  }
}
