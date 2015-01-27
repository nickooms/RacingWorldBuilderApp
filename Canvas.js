function createCanvas(cols, rows) {
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.zIndex = 100;
  canvas.style.left = '0px';
  canvas.style.top = '0px';
  canvas.width = (cols.length - 1) * Racing.tileSize;
  canvas.height = (rows.length - 1) * Racing.tileSize;
  Racing.canvas = canvas;
  document.body.appendChild(canvas);
  Racing.context = canvas.getContext('2d');
  return canvas;
}
function clearCanvas() {
  Racing.context.clearRect(0, 0, Racing.canvas.width, Racing.canvas.height);
  Racing.canvas.width = (Tiles.cols.length - 1) * Racing.tileSize;
  Racing.canvas.height = (Tiles.rows.length - 1) * Racing.tileSize;
}