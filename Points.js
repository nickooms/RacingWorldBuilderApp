window.Points = {
  load: function(callback) {
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
  },
  setContext: function(context) {
    this.context = context;
  },
  setDrawingColor: function(color) {
    this.drawingColor = color;
    this.context.fillStyle = color;
  },
  draw: function(x, y, size) {
    size = size || 1;
    var ctx = this.context;
    ctx.beginPath();
    ctx.arc(x, y, size, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }
};