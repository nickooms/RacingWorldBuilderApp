window.Lines = {
  load: function(callback) {
    var lines = Racing.lines;
    if (lines != null) {
      callback(lines, Racing.gemeente, Racing.straat, Racing.layer);
    } else {
      var entries = Racing.entries;
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var path = entry.fullPath;
        if (path.indexOf('lines.json') != -1) {
          loadFile(entry, function(fileName, data) {
            var lines = JSON.parse(data);
            Racing.lines = lines;
            var components = fileName.split('-');
            var gemeente = components[0];
            var straat = components[1];
            var layer = components[2];
            callback(lines, gemeente, straat, layer);
          });
        }
      }
    }
  }
};