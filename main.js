const canvasSketch = require('canvas-sketch');
const Tweakpane    = require('tweakpane');
const hermite        = require('cubic-hermite-spline');

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
};

let params = {
  splineType:   1,
  drawPoints: true,
  drawLines:  true,
  resolution: 0.001,
  gradient1:  '#2b928d',
  gradient2:  '#c18484',
  lineColor:  '#000000'
}
let elCanvas;
let points;
let BSplinePoints;
let HermitePoints;
let Hpoints;
let Htangents;

const sketch = ({ canvas }) => {
  points = [
    new Point({ x: 100, y: 600 }),    // P0 start point
    new Point({ x: 400, y: 300 }),    // P3 second pass point
    new Point({ x: 800, y: 800 }),    // P6 third pass point
    new Point({ x: 950, y: 250 }),    // P9 end point
  ];

  BSplinePoints = [
    new Point({ x: 100, y: 600 }),    // P0 start point
    new Point({ x: 125, y: 500 }),    // P1 control point

    new Point({ x: 300, y: 200 }),    // P2 control point
    new Point({ x: 400, y: 300 }),    // P3 second pass point
    new Point({ x: 500, y: 400 }),    // P4 control point

    new Point({ x: 720, y: 750 }),    // P5 control point
    new Point({ x: 800, y: 800 }),    // P6 third pass point
    new Point({ x: 880, y: 850 }),    // P7 control point

    new Point({ x: 1000, y: 300 }),   // P8 control point
    new Point({ x: 950, y: 250 }),    // P9 end point
  ];
  
  HermitePoints = [
    new Point({ x: 100, y: 600 }),    // P0 start point
    new Point({ x: 175, y: 300 }),    // P1 control point

    new Point({ x: 400, y: 300 }),    // P2 second pass point
    new Point({ x: 700, y: 600 }),    // P3 control point

    new Point({ x: 800, y: 800 }),    // P4 third pass point
    new Point({ x: 1040, y: 950 }),    // P5 control point

    new Point({ x: 950, y: 250 }),    // P6 end point
    new Point({ x: 800, y: 100 }),    // P7 control point
  ];


  canvas.addEventListener('mousedown', onMouseDown );
  elCanvas = canvas;

  return ({ context, width, height }) => {

    const fill = context.createLinearGradient(0, 0, width, height);   // Create gradient
    fill.addColorStop(0, params.gradient1);
    fill.addColorStop(1, params.gradient2);
    context.fillStyle = fill;
    context.fillRect(0, 0, width, height);

    switch (parseInt(params.splineType)) {
      case 1:
        drawQuadraticBezier(context);
        break;

      case 2:
         BezierSpline(context);
        break;

      case 3:
        drawHermite(context);
        break;

      default:
        console.log('Error: wrong line type') 
        break;
    }    
  };
};

function drawQuadraticBezier(context) {
  const n = points.length - 1;

if (params.drawLines) {
    context.beginPath();
  context.strokeStyle = params.lineColor;
  context.moveTo(points[0].x, points[0].y);
  context.lineWidth = 2;
  for (let i = 1; i < points.length; i++)    // Drawing helping lines
    context.lineTo(points[i].x, points[i].y);
  context.stroke();
}

  context.beginPath();
  for (let t = 0; t <= 1; t += params.resolution) {
    let x = 0;
    let y = 0;
    for (let i = 0; i <= n; i++) {
      const binomialCoeff = binomialCoefficient(n, i);
      const point = points[i];
      const bernsteinPolynomial = binomialCoeff * Math.pow(1 - t, n - i) * Math.pow(t, i);
      x += bernsteinPolynomial * point.x;
      y += bernsteinPolynomial * point.y;
    }
    context.lineTo(x, y);
  }
  context.strokeStyle = params.lineColor;
  context.lineWidth = 4;
  context.stroke();

  if (params.drawPoints)  points.forEach(point => { point.draw(context); });    // Drawing points  
}

function binomialCoefficient(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i++) 
    result *= (n - (k - i)) / i;
  return result;
}

function BezierSpline(context) {

  // Drawing helping lines
  if (params.drawLines) {
    context.beginPath();
    context.moveTo(BSplinePoints[0].x, BSplinePoints[0].y);
    context.lineWidth = 2;
    context.strokeStyle = params.lineColor;
    for (let i = 1; i < BSplinePoints.length; i++)   
      if (i % 3 == 1 || i % 3 == 0)   context.lineTo(BSplinePoints[i].x, BSplinePoints[i].y);
      else                            context.moveTo(BSplinePoints[i].x, BSplinePoints[i].y);
    context.stroke();
  }
  if (params.drawPoints)  // Drawing points
    for (let i = 0; i < BSplinePoints.length; i++) 
      if (i % 3 == 0)   BSplinePoints[i].draw(context);
      else              BSplinePoints[i].draw(context, 5);
  
  // Draw B-spline
  for (let i = 0; i < BSplinePoints.length - 3; i += 3) {
    const startPoint = [BSplinePoints[i].x, BSplinePoints[i].y];
    const controlPoint1 = [BSplinePoints[i+1].x, BSplinePoints[i+1].y];
    const controlPoint2 = [BSplinePoints[i+2].x, BSplinePoints[i+2].y];
    const endPoint = [BSplinePoints[i+3].x, BSplinePoints[i+3].y];
    drawCubicBezierCurve(context, startPoint, controlPoint1, controlPoint2, endPoint);
  }
}

function drawCubicBezierCurve(context, P0, P1, P2, P3) {
  context.beginPath();
  context.moveTo(P0[0], P0[1]);
  context.strokeStyle = params.lineColor;
  for (let t = 0; t <= 1; t += params.resolution) {
    const point = getCubicBezierPoint(t, P0, P1, P2, P3);
    context.lineTo(point[0], point[1]);
  }
  context.lineWidth = 4;
  context.stroke();
}

function getCubicBezierPoint(t, P0, P1, P2, P3) {
  const x =
    Math.pow(1 - t, 3) * P0[0] +
    3 * Math.pow(1 - t, 2) * t * P1[0] +
    3 * (1 - t) * Math.pow(t, 2) * P2[0] +
    Math.pow(t, 3) * P3[0];
  const y =
    Math.pow(1 - t, 3) * P0[1] +
    3 * Math.pow(1 - t, 2) * t * P1[1] +
    3 * (1 - t) * Math.pow(t, 2) * P2[1] +
    Math.pow(t, 3) * P3[1];
  return [x, y];
}

function drawHermite(context) { 

  if (params.drawLines) {   // Drawing helping lines
    context.beginPath();
    context.strokeStyle = params.lineColor;
    context.moveTo(HermitePoints[0].x, HermitePoints[0].y);
    context.lineWidth = 2;
    for (let i = 1; i < HermitePoints.length; i++)   
      if (i % 2 == 1)   context.lineTo(HermitePoints[i].x, HermitePoints[i].y);
      else                            context.moveTo(HermitePoints[i].x, HermitePoints[i].y);
    context.stroke();
  }
  context.strokeStyle = params.lineColor;
  if (params.drawPoints)  // Drawing points
    for (let i = 0; i < HermitePoints.length; i++) 
      if (i % 2 == 0)   HermitePoints[i].draw(context);
      else              HermitePoints[i].draw(context, 5);
  
  Hpoints = [];
  Htangents = [];
  let j = 0, k = 0;
  for (let i = 0; i < HermitePoints.length; i++) {
    if (i % 2 == 0) {
      Hpoints[j] = [HermitePoints[i].x, HermitePoints[i].y];
      j++;
    } else {
      Htangents[k] = [HermitePoints[i].x - HermitePoints[i-1].x, HermitePoints[i].y - HermitePoints[i-1].y];
      k++;
    }
  }
  if (j > k)              Hpoints.pop();
  if (Hpoints.length < 2) return;

  context.beginPath();
  context.moveTo(Hpoints[0], Hpoints[1]);
  for (var t = 0; t < 1; t += params.resolution) {
    var point = hermite(t, Hpoints, Htangents);
    // var tangent = hermite(t, Hpoints, Htangents, null, true);
    context.lineTo(point[0], point[1]);
  }
  context.lineWidth = 4;
  context.stroke();
}

onMouseDown = (e) => {

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup',   onMouseUp);

  const x = (e.offsetX / elCanvas.offsetWidth)  * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  let hit = false;

  points.forEach(point => {
    point.isDragging = point.hitTest(x, y);
    if ( !hit && point.isDragging )   hit = true;
  });

  BSplinePoints.forEach(point => {
    point.isDragging = point.hitTest(x, y);
    if ( !hit && point.isDragging )   hit = true;
  });

  HermitePoints.forEach(point => {
    point.isDragging = point.hitTest(x, y);
    if ( !hit && point.isDragging )   hit = true;
  });

  if ( !hit && params.splineType == 1 ) {
    points.push(new Point({ x, y }));
  } else if ( !hit && params.splineType == 2 ) {
    BSplinePoints.push(new Point({ x, y }));
  } else if ( !hit && params.splineType == 3 ) {
    HermitePoints.push(new Point({ x, y }));
  }
};
onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth)  * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  if ( params.splineType == 1 ) {
    points.forEach(point => {
      if (point.isDragging) {
        point.x = x;
        point.y = y;
      }
    });
  } else if ( params.splineType == 2 ) {
    BSplinePoints.forEach(point => {
      if (point.isDragging) {
        point.x = x;
        point.y = y;
      }
    });
  } else if ( params.splineType == 3 ) {
    HermitePoints.forEach(point => {
      if (point.isDragging) {
        point.x = x;
        point.y = y;
      }
    });
  }
};
onMouseUp = (e) => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup',   onMouseUp);
};

const createPane = () => {    // Control panel settings
  const pane = new Tweakpane.Pane();

  folder = pane.addFolder({title:'Spline'})
  folder.addButton({title: 'Delete All Points'}).on('click', () => { points = []; BSplinePoints = []; HermitePoints = [];});
  folder.addInput(params, 'splineType', { options: {'Bezier': '1','B-Spline': '2', Hermite: '3'}});
  // folder.addInput(params, 'resolution', { min: 0.0001, max: 0.5, step: 0.001 });
  folder.addInput(params, 'drawPoints');
  folder.addInput(params, 'drawLines');
  // folder.addButton({title: 'Convert B-Spline to Hermite'}).on('click', () => { });
  // folder.addButton({title: 'Convert Hermite to B-Spline'}).on('click', () => { });

  folder = pane.addFolder({title:'Style'})
  folder.addInput(params, 'gradient1',  { picker: 'inline', expanded: false, });
  folder.addInput(params, 'gradient2',  { picker: 'inline', expanded: false, });
  folder.addInput(params, 'lineColor',  { picker: 'inline', expanded: false, });
}

createPane();
canvasSketch(sketch, settings);

class Point {
  constructor({x, y, control = false}) {
    this.x = x;
    this.y = y;
    this.control = control;
  }

  draw(context, radius = 8) {
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fillStyle   = params.lineColor;  
    context.strokeStyle = params.lineColor;
    context.fill();
    context.restore();
  }

  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 20;
  }

  add(point) {
    return new Point({x: this.x + point.x, y: this.y + point.y});
  }
  
  subtract(point) {
    return new Point({x: this.x - point.x, y: this.y - point.y});
  }
  
  multiply(scalar) {
    return new Point({x: this.x * scalar, y: this.y * scalar});
  }
  divide(scalar) {
    return new Point({x: this.x / scalar, y: this.y / scalar});
  }
  negate() {
    return new Point({x: -this.x, y: -this.y});
  }

  givebackX() {
    return this.x;
  }

  givebackY() {
    return this.y;
  }
}