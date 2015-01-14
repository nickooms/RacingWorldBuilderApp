window.Lines = {
  load: function(callback) {
    for (var i = 0; i < Racing.entries.length; i++) {
      var entry = Racing.entries[i];
      var path = entry.fullPath;
      if (path.indexOf('lines.json') != -1) {
        loadFile(entry, function(fileName, data) {
          Racing.lines = JSON.parse(data);
          var components = fileName.split('-');
          var gemeente = components[0];
          var straat = components[1];
          var layer = components[2];
          callback(Racing.lines, gemeente, straat, layer);
        });
      }
    }
  }
};