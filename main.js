// Curves intro: mouse interaction and drawing curves

const canvasSketch = require('canvas-sketch');
const math         = require('canvas-sketch-util/math');
const random       = require('canvas-sketch-util/random');
const color        = require('canvas-sketch-util/color');
const Tweakpane    = require('tweakpane');
const risoColors   = require('riso-colors');
const pfive        = require('p5');
const p5 = require('p5');


const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
};

let params = {
  lineType:   1,
  gradient1:  '#2b928d',
  gradient2:  '#b26d6d',
  line:       '#000000'
}
let elCanvas;
let points;


const sketch = ({ canvas }) => {
  points = [
    new Point({ x: 100, y: 600 }),    // P0 start point
    new Point({ x: 140, y: 400 }),    // P1 control point
    new Point({ x: 300, y: 200 }),    // P2 control point
    new Point({ x: 400, y: 300 }),    // P3 second pass point
    new Point({ x: 500, y: 400 }),    // P4 control point
    new Point({ x: 800, y: 200 }),    // P5 control point
    new Point({ x: 800, y: 800 }),    // P6 third pass point
    new Point({ x: 800, y: 200 }),    // P7 control point
    new Point({ x: 800, y: 200 }),    // P8 control point
    new Point({ x: 800, y: 1000 }),   // P9 end point
  ];

  controlPoints = [
    new Point({ x: 200, y: 500 }),
    new Point({ x: 200, y: 200 }),
  ];
  canvas.addEventListener('mousedown', onMouseDown );
  elCanvas = canvas;
    
  // params.lineType = 2;                // Delete me later

  return ({ context, width, height }) => {
    pointsCubic = [];
    for (let i = 0; i < points.length; i++)
      if (i % 3 === 0) pointsCubic.push(points[i]);

    const fill = context.createLinearGradient(0, 0, width, height);   // Create gradient
    fill.addColorStop(0, params.gradient1);
    fill.addColorStop(1, params.gradient2);
    context.fillStyle = fill;
    context.fillRect(0, 0, width, height);

    switch (parseInt(params.lineType)) {
      case 1:
        drawCubicBezier(context);

        break;
      case 2:
        // drawBezierSpline(context)

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

function drawCubicBezier(context) {
  const n = pointsCubic.length - 1;
  context.beginPath();
  context.moveTo(pointsCubic[0].x, pointsCubic[0].y);
  context.lineWidth = 2;

  for (let i = 1; i < pointsCubic.length; i++)    // Drawing helping lines
    context.lineTo(pointsCubic[i].x, pointsCubic[i].y);
  context.stroke();

  context.beginPath();
  for (let t = 0; t <= 1; t += 0.01) {
    let x = 0;
    let y = 0;
    for (let i = 0; i <= n; i++) {
      const binomialCoeff = binomialCoefficient(n, i);
      const point = pointsCubic[i];
      const bernsteinPolynomial = binomialCoeff * Math.pow(1 - t, n - i) * Math.pow(t, i);
      x += bernsteinPolynomial * point.x;
      y += bernsteinPolynomial * point.y;
    }
    context.lineTo(x, y);
  }
  context.lineWidth = 4;
  context.stroke();
  pointsCubic.forEach(point => { point.draw(context); });    // Drawing points  
}

function binomialCoefficient(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i++) 
    result *= (n - (k - i)) / i;
  return result;
}

function drawBezierSpline(context) {
  const n = controlPoints.length - 1;
  const points = [];

  for (let i = 0; i < n; i++) {
    const p0 = controlPoints[i];
    const p3 = controlPoints[i + 1];

    const m0 = i === 0 ? controlPoints[0].subtract(controlPoints[0]) : controlPoints[i].subtract(controlPoints[i - 1]);
    const m1 = i === n - 1 ? controlPoints[n - 1].subtract(controlPoints[n - 2]) : controlPoints[i + 1].subtract(controlPoints[i]);

    for (let t = 0; t <= 1; t += 0.01) {
      const tMatrix = [t * t * t, t * t, t, 1];
      const hermiteMatrix = [        
        [2, -2, 1, 1],
        [-3, 3, -2, -1],
        [0, 0, 1, 0],
        [1, 0, 0, 0],
      ];
      const x = dotProduct(dotProduct(tMatrix, hermiteMatrix), [p0.x, p3.x, m0.x, m1.x]);
      const y = dotProduct(dotProduct(tMatrix, hermiteMatrix), [p0.y, p3.y, m0.y, m1.y]);
      points.push(new Point({ x, y }));
    }
  }

  context.beginPath();
  context.moveTo(controlPoints[0].x, controlPoints[0].y);
  context.lineWidth = 2;

  controlPoints.forEach(point => { point.draw(context); });

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    context.lineTo(point.x, point.y);
  }
  context.stroke();
}

// function drawHermite(context) {
//   const segments = points.length - 1;
//   context.beginPath();
//   context.moveTo(points[0].x, points[0].y);
//   context.lineWidth = 2;

//   for (let i = 1; i < points.length; i++)    // Drawing helping lines
//     context.lineTo(points[i].x, points[i].y);
//   context.stroke();


//   context.beginPath();
//   const curvePoints = [];

//   // Calculate curve points
//   for (let i = 0; i < segments; i++) {
//     const p0 = points[i];
//     const p1 = points[i + 1];
//     const m0 = i > 0 ? points[i].subtract(points[i - 1]) : p1.subtract(p0);
//     const m1 = i < segments - 1 ? points[i + 2].subtract(p0) : p1.subtract(p0);
//     const curve = calculateHermiteCurve(p0, m0, p1, m1);
//     curvePoints.push(...curve);
//     // console.log(curve);
//   }
//   // console.log(curvePoints);
//   // Draw curve
//   context.beginPath();
//   context.moveTo(curvePoints[0].x, curvePoints[0].y);
//   for (let i = 1; i < curvePoints.length; i++) {
//     context.lineTo(curvePoints[i].x, curvePoints[i].y);
//   }
//   context.lineWidth = 4;
//   context.stroke();

//   // Draw control points
//   context.strokeStyle = 'black';
//   context.setLineDash([5, 10]);
//   context.beginPath();
//   for (let i = 0; i < points.length - 1; i++) {
//     context.moveTo(points[i].x, points[i].y);
//     context.lineTo(points[i + 1].x, points[i + 1].y);
//   }
//   context.stroke();

//   points.forEach(point => { point.draw(context); });    // Drawing points 
// }

function drawHermite(context) {
  const segments = points.length - 1;
  const curvePoints = [];
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  context.lineWidth = 2;
  for (let i = 1; i < points.length; i++)    // Drawing helping lines
    context.lineTo(points[i].x, points[i].y);
  context.stroke();

  // Calculate curve points
  for (let i = 0; i < segments; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const m0 = i > 0 ? points[i].subtract(points[i - 1]) : p1.subtract(p0);
    const m1 = i < segments - 1 ? points[i + 2].subtract(p0) : p1.subtract(p0);
    const curve = calculateHermiteCurve(p0, m0, p1, m1, segments);
    curvePoints.push(...curve);
  }

  // Draw curve
  context.beginPath();
  context.moveTo(curvePoints[0].x, curvePoints[0].y);
  for (let i = 1; i < curvePoints.length; i++) 
    context.lineTo(curvePoints[i].x, curvePoints[i].y);
  
  context.strokeStyle = params.line;
  context.lineWidth = 4;
  context.stroke();

  // Draw points
  points.forEach(point => { point.draw(context); });
}

function calculateHermiteCurve(p0, m0, p1, m1, segments) {
  const hermiteMatrix = [
    [2, -2, 1, 1],
    [-3, 3, -2, -1],
    [0, 0, 1, 0],
    [1, 0, 0, 0],
  ];
  const points = [];

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const tMatrix = [t * t * t, t * t, t, 1];
    const x = dotProduct(dotProduct(tMatrix, hermiteMatrix), [p0.x, p1.x, m0.x, m1.x]);
    const y = dotProduct(dotProduct(tMatrix, hermiteMatrix), [p0.y, p1.y, m0.y, m1.y]);
    points.push(new Point({ x, y }));
  }
  return points;
}

function dotProduct(a, b) {
  a = Array.from(a);
  return a.reduce((acc, val, i) => acc + val * b[i], 0);
}

const subtract = (other) => {
  return new Point({ x: this.x - other.x, y: this.y - other.y });
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

  if ( !hit ) {
    points.push(new Point({ x, y }));
  }
};

onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth)  * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  points.forEach(point => {
    if (point.isDragging) {
      point.x = x;
      point.y = y;
    }
  });
};
onMouseUp = (e) => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup',   onMouseUp);
};

const createPane = () => {    // Control panel settings
  const pane = new Tweakpane.Pane();

  folder = pane.addFolder({title:'Spline'})
  folder.addButton({title: 'Delete All Points'}).on('click', () => { points = []; });
  folder.addInput(params, 'lineType', { options: {'Cubic Bezier': '1','Bezier Spline': '2', Hermite: '3', 'Catmull-Rom': '4', 'B-Spline': '5' }});

  folder = pane.addFolder({title:'Style'})
  folder.addInput(params, 'gradient1',  { picker: 'inline', expanded: false, });
  folder.addInput(params, 'gradient2',  { picker: 'inline', expanded: false, });
  folder.addInput(params, 'line',       { picker: 'inline', expanded: false, });
}

createPane();
canvasSketch(sketch, settings);

class Point {
  constructor({x, y, control = false}) {
    this.x = x;
    this.y = y;
    this.control = control;
  }
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.arc(0, 0, 6, 0, Math.PI * 2);
    context.fillStyle = this.control ? 'red' : 'black';  
    context.fill();
    context.restore();
  }
  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 20;
  }
  subtract(point) {
    return new Point({x: this.x - point.x, y: this.y - point.y});
  }
  givebackX() {
    return this.x;
  }
  givebackY() {
    return this.y;
  }
}