class CompositeAnimator {
  constructor(canvas, ...animators) {
    this.canvas = canvas;
    this.animators = animators;
  }

  addAnimator(animator) {
    this.animators.push(animator);
  }

  start(before, after) {
    this.animationQuery = this.animators.slice();
    this.staticQuery = [];
    this.currentAnimator = null;
    return new Promise((resolve) => {
      this.animate(before, after, resolve);
    });
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
    const beforeFn = () => {
      this.clearCanvas();
      if (before) {
        before();
      }
      this.drawStatic((layerIndex) => layerIndex >= currentLayerIndex);
    };
    const afterFn = () => {
      this.drawStatic((layerIndex) => layerIndex < currentLayerIndex);
      if (after) {
        after();
      }
    };

    this.currentAnimator.start(context, beforeFn, afterFn).then(() => {
      this.pullNextAnimation(before, after, done);
    });
  }

  pullNextAnimation(before, after, done) {
    console.log('PROXIMO!!');
    this.staticQuery.push(this.currentAnimator);
    this.currentAnimator = null;
    this.animate(before, after, done);
  }

  drawStatic(layerPredicate) {
    const context = this.canvas.getContext('2d');
    const layerIndexes = this.staticQuery.map(animator => animator.layerIndex);
    const layersToRender = layerIndexes.filter((value, index, self) => {
      return layerPredicate(value) && self.indexOf(value) === index;
    }).sort(
      (a, b) => a > b // sort layer from the deepest one to the topmost
    );
    //console.log(shouldResetCanvas? 'BEFORE':'AFTER', 'LAYERS COUNT=', layersToRender.length, 'STATICS=', this.staticQuery.length);
    layersToRender.forEach((layerIndex) => {
      const animators = this.staticQuery.filter(animator => animator.layerIndex === layerIndex);
      animators.forEach(animator => animator.drawStatic(context));
    });
  }

  clearCanvas() {
    const canvas = this.canvas;
    const context = canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}
