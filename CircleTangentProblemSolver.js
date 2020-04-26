class CircleTangentProblemSolver {
  constructor(xCenter, yCenter, radius, xTarget, yTarget, startingAngle) {
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.radius = radius;
    this.xTarget = xTarget;
    this.yTarget = yTarget;
    this.startingAngle = startingAngle;
  }

  solveProblem() {
    // Solve for circle center in (0, 0)
    let xP = this.xTarget - this.xCenter;
    let yP = this.yTarget - this.yCenter;
    const s = squaredDistance(xP, yP);
    const r = this.radius;
    const h = s - r*r;
    
    let xTangent = [], yTangent = [];
    yTangent[0] = (r*r*yP + r*xP*Math.sqrt(h)) / s;
    yTangent[1] = (r*r*yP - r*xP*Math.sqrt(h)) / s;
    
    if (xP === 0) {
      // line (O, P) is parallel to y-axis
      xTangent[0] = Math.sqrt(r*r - yTangent[0]*yTangent[0]);
      xTangent[1] = -xTangent[0];
    } else {
      xTangent[0] = (r*r - yP*yTangent[0]) / xP;
      xTangent[1] = (r*r - yP*yTangent[1]) / xP;
    }
    
    let tangentAngle = [];
    tangentAngle[0] = getAngleFromPoint(xTangent[0], yTangent[0], r);
    tangentAngle[1] = getAngleFromPoint(xTangent[1], yTangent[1], r);
    
    const tangent1IsSmoother =
      isSmoothPath(tangentAngle[1], r, xP, yP)
      && !isSmoothPath(tangentAngle[0], r, xP, yP);
    const tangentIndex = tangent1IsSmoother ? 1 : 0;

    return {
      tangentX1: xTangent[0] + this.xCenter,
      tangentY1: yTangent[0] + this.yCenter,
      tangentX2: xTangent[1] + this.xCenter,
      tangentY2: yTangent[1] + this.yCenter,
      tangentAngle: tangentAngle[tangentIndex],
      tangentIndex,
    };
  }
}
