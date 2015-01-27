window.JSONFiles = {
  save: function() {
    if (JSONFiles.toSave == null) {
      JSONFiles.toSave = [];
      for (var name in Racing.jsonFiles) {
        JSONFiles.toSave.push(name);
      }
    }
    var fileName = JSONFiles.toSave[0].split('-').join('_').split(':').join('-');
    chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
      entry.getFile(fileName, { create: true }, function(writableEntry) {
        var s = Racing.jsonFiles[JSONFiles.toSave[0]];
        var blob = new Blob([s], { type: 'text/plain' });
        writableEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Saved ' + fileName);
            JSONFiles.toSave = JSONFiles.toSave.splice(1);
            if (JSONFiles.toSave.length > 0) {
              setTimeout(JSONFiles.save, 0);
            } else {
              Tiles.save();
            }
          };
          fileWriter.onerror = function(e) {
            console.log('Save failed: ' + e.toString());
          };
          fileWriter.write(blob);
        });
      });
    });
  }
};