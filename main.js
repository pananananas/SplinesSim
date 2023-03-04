// Curves intro: mouse interaction and drawing curves

const canvasSketch = require('canvas-sketch');
const math         = require('canvas-sketch-util/math');
const random       = require('canvas-sketch-util/random');
const color        = require('canvas-sketch-util/color');
const Tweakpane    = require('tweakpane');
const risoColors   = require('riso-colors');


const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
};

const params = {
  lineType:   1,
  gradient1:  '#2b928d',
  gradient2:  '#b26d6d',
  line:       '#000000'
}
let elCanvas;
let points;


const sketch = ({ canvas }) => {
  points = [
    new Point({ x: 200, y: 500 }),
    new Point({ x: 200, y: 200 }),
    new Point({ x: 800, y: 200 }),
    new Point({ x: 800, y: 800 }),
    new Point({ x: 200, y: 800 }),

  ];

  canvas.addEventListener('mousedown', onMouseDown );
  elCanvas = canvas;

  return ({ context, width, height }) => {

    const fill = context.createLinearGradient(0, 0, width, height);   // Create gradient
    fill.addColorStop(0, params.gradient1);
    fill.addColorStop(1, params.gradient2);
    context.fillStyle = fill;
    context.fillRect(0, 0, width, height);


    switch (parseInt(params.lineType)) {
      case 1:
        drawBezier(context);
        break;
      case 2:
        drawHermite(context);
        break;

      default:
        console.log('Error: wrong line type')
        break;
    }    
  };
};

const drawBezier = (context) => {

  context.strokeStyle = params.line;
  context.beginPath();
  
  context.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++)    // Drawing helping lines
    context.lineTo(points[i].x, points[i].y);
  
  context.stroke();
  context.beginPath();
  for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
    const next = points[(i + 1) % points.length];
    
    const mx = curr.x + (next.x - curr.x) / 2;
    const my = curr.y + (next.y - curr.y) / 2;
    // Drawing curves
    if ( i == 0 )                    context.moveTo(curr.x, curr.y);
    else if (i == points.length - 2) context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
    else                             context.quadraticCurveTo(curr.x, curr.y, mx, my);
}
  context.lineWidth = 4;
  context.stroke();
  points.forEach(point => { point.draw(context); });    // Drawing points  
}


const drawHermite = (context) => {

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
  folder.addInput(params, 'lineType', { options: {Bezier: '1', Hermite: '2', 'Catmull-Rom': '3', 'B-Spline': '4' }});

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
}