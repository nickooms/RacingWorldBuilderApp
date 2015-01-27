window.Points = {
  load: function(callback) {
    if (Racing.points != null) {
      callback(Racing.points, Racing.gemeente, Racing.straat, Racing.layer);
    } else {
      for (var i = 0; i < Racing.entries.length; i++) {
        var entry = Racing.entries[i];
        var path = entry.fullPath;
        if (path.indexOf('points.json') != -1) {
          loadFile(entry, function(fileName, data) {
            Racing.points = JSON.parse(data);
            var components = fileName.split('-');
            var gemeente = components[0];
            var straat = components[1];
            var layer = components[2];
            callback(Racing.points, gemeente, straat, layer);
          });
        }
      }
    }
  },
  unique: function(points) {
    var uniquePoints = {};
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      uniquePoints[JSON.stringify(point)] = point;
    }
    var points = [];
    for (uniquePoint in uniquePoints) {
      var point = uniquePoints[uniquePoint];
      points.push(point);
    }
    return points;
  },
  setContext: function(context) {
    this.context = context;
  },
  setDrawingColor: function(color) {
    this.drawingColor = color;
    this.context.fillStyle = color;
  },
  setDrawingSize: function(size) {
    this.drawingSize = size;
  },
  draw: function(x, y, size, color) {
    size = size || this.drawingSize || 1;
    color = color || this.drawingColor || '#000000';
    var ctx = this.context;
    ctx.beginPath();
    ctx.arc(x, y, size, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }
};