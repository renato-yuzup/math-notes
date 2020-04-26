'use strict';

class CircleTangentProblem {
  init() {
    document.getElementById('startPointSelectMode').addEventListener('change', () => {
      const setByCoordinate = this.isStartingPointSetByCoordinate();
      this.setElementVisible('startPointFormPoint', setByCoordinate);
      this.setElementVisible('startPointFormAngle', !setByCoordinate);
    });
    document.getElementById('submit').addEventListener('click', () => {
      this.getProblemInput();
      this.showSolution();
    });
  }

  setElementVisible(elementId, isVisible) {
    const element = document.getElementById(elementId);
    element.hidden = !isVisible;
    if (isVisible) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  }

  getInputValue(inputName) {
    const input = document.getElementById(inputName);
    return Number(input.value);
  }

  isStartingPointSetByCoordinate() {
    const element = document.getElementById('startPointSelectMode');
    return element.value === 'coordinate';
  }

  getProblemInput() {
    this.xCenter = this.getInputValue('circleX');
    this.yCenter = this.getInputValue('circleY');
    this.radius = this.getInputValue('circleRadius');
    
    this.xTarget = this.getInputValue('externalPointX');
    this.yTarget = this.getInputValue('externalPointY');

    if (this.isStartingPointSetByCoordinate()) {
      const xStart = this.getInputValue('startingPointX');
      const yStart = this.getInputValue('startingPointY');      
      this.startingAngle = getAngleFromPointNormalized(xStart - this.xCenter, yStart - this.yCenter);
      this.xStart = xStart;
      this.yStart = yStart;
    } else {
      this.startingAngle = this.getInputValue('startingAngle');
      const isRadians = document.getElementById('angleUnit').value === 'radian';
      if (!isRadians) {
        this.startingAngle *= Math.PI / 180;
      }
      this.xStart = this.xCenter + Math.cos(this.startingAngle) * this.radius;
      this.yStart = this.yCenter + Math.sin(this.startingAngle) * this.radius;
    }
  }

  showSolution() {
    const solver = new CircleTangentProblemSolver(
      this.xCenter, this.yCenter, this.radius, this.xTarget, this.yTarget, this.startingAngle
    )
    const solution = solver.solveProblem();

    const animator = new ProblemAnimator(
      document.getElementById('graph'),
      this.xStart,
      this.yStart,
      this.xTarget,
      this.yTarget,
      this.xCenter,
      this.yCenter,
      this.radius,
      solution.tangentX1,
      solution.tangentY1,
      solution.tangentX2,
      solution.tangentY2,
      this.startingAngle,
      solution.tangentAngle,
      solution.tangentIndex,
    );
    animator.start();
  }
}

(new CircleTangentProblem()).init();
