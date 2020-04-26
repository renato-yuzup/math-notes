const alphaBlend = (color1, color2, weightTowardColor2) => {
  let c1 = color1, c2 = color2;
  if (typeof color1 === 'string') {
    c1 = colorStringToLong(color1);
  }
  if (typeof color2 === 'string') {
    c2 = colorStringToLong(color2);
  }

  const p1 = decomposeRGB(c1);
  const p2 = decomposeRGB(c2);
  const components = {};
  components.r = lerp(p1.r, p2.r, weightTowardColor2);
  components.g = lerp(p1.g, p2.g, weightTowardColor2);
  components.b = lerp(p1.b, p2.b, weightTowardColor2);
  return rgbToColor(components.r, components.g, components.b);
};

const addTransparencyToColor = (color, alphaChannel) => {
  let c = color;
  if (typeof color === 'string') {
    c = colorStringToLong(color);
  }
  const components = decomposeRGB(c);
  return `rgba(${components.r}, ${components.g}, ${components.b}, ${alphaChannel})`;
};

const colorStringToLong = (color) => {
  let colorStr = color;
  let base = 10;
  const hashPos = color.indexOf('#');
  if (hashPos !== -1) {
    colorStr = color.substr(hashPos + 1);
    base = 16;
  }

  return Number.parseInt(colorStr, base);
};

const decomposeRGB = (color) => {
  let r = (color & 0xFF0000) >> 16;
  let g = (color & 0xFF00FF00) >> 8;
  let b = color % 0x100;
  return { r, g, b };
};

const rgbToColor = (r, g, b) => {
  return (r << 16) + (g << 8) + b;
};

const lerp = (a, b, t) => {
  return a + (b-a) * t;
};

const distance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx*dx + dy*dy);
};

const getViewportCenter = (viewport) => {
  return {
    x: (viewport.x1 + viewport.x2) / 2,
    y: (viewport.y1 + viewport.y2) / 2,
  };
};

const getAspectRatio = (virtualViewport, screenViewport) => {
  const vw = virtualViewport.x2 - virtualViewport.x1;
  const vh = virtualViewport.y2 - virtualViewport.y1;
  const sw = screenViewport.x2 - screenViewport.x1;
  const sh = screenViewport.y2 - screenViewport.y1;
  const dw = vw / sw;
  const dh = vh / sh;
  return dw > dh ? dw : dh;
};

const drawArcOnViewport = (context, x, y, radius, startAngle, endAngle, virtualViewport, screenViewport) => {
  if (!virtualViewport) {
    context.arc(x, y, radius, startAngle, endAngle);
    return;
  }
  const virtualCenter = getViewportCenter(virtualViewport);
  const screenCenter = getViewportCenter(screenViewport);
  const aspectRatio = getAspectRatio(virtualViewport, screenViewport);
  const xt = (x - virtualCenter.x) / aspectRatio + screenCenter.x;
  const yt = (y - virtualCenter.y) / aspectRatio + screenCenter.y;
  const rt = radius / aspectRatio;
  context.arc(xt, yt, rt, startAngle, endAngle);
};

const drawLineOnViewport = (context, x1, y1, x2, y2, virtualViewport, screenViewport) => {
  if (!virtualViewport) {
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    return;
  }
  const virtualCenter = getViewportCenter(virtualViewport);
  const screenCenter = getViewportCenter(screenViewport);
  const aspectRatio = getAspectRatio(virtualViewport, screenViewport);
  const x1t = (x1 - virtualCenter.x) / aspectRatio + screenCenter.x;
  const y1t = (y1 - virtualCenter.y) / aspectRatio + screenCenter.y;
  const x2t = (x2 - virtualCenter.x) / aspectRatio + screenCenter.x;
  const y2t = (y2 - virtualCenter.y) / aspectRatio + screenCenter.y;
  context.moveTo(x1t, y1t);
  context.lineTo(x2t, y2t);
};

const transformPoint = (x, y, virtualViewport, screenViewport) => {
  if (!virtualViewport) {
    return {x, y};
  }
  const virtualCenter = getViewportCenter(virtualViewport);
  const screenCenter = getViewportCenter(screenViewport);
  const aspectRatio = getAspectRatio(virtualViewport, screenViewport);
  const xt = (x - virtualCenter.x) / aspectRatio + screenCenter.x;
  const yt = (y - virtualCenter.y) / aspectRatio + screenCenter.y;
  return {
    x: xt,
    y: yt,
  };
}
