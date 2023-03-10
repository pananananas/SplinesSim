function setup() {
    createCanvas(400, 400);
  }
  
  function draw() {
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

      bezier(points[0].givebackX(), points[0].givebackY(), points[1].givebackX(), points[1].givebackY(), points[2].givebackX(), points[2].givebackY(), points[3].givebackX(), points[3].givebackY());
  }

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