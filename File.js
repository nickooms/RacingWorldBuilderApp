File.load = function(fileName, callback) {
	Racing.entries.filter(function(entry) {
		return entry.name == fileName ? entry : null
	})[0].file(function(file) {
		var url = URL.createObjectURL(file);
    var img = document.createElement('img');
    img.style.width = '512px';
    img.style.height = '512px';
    img.onload = function(evt) {
    	callback(evt.target);
    };
    img.src = url;
  });
};
File.loadImage = function(fileName) {
  return new Promise(function(resolve, reject) {
    Racing.chosenEntry.getFile(fileName, {}, function(imageFile) {
      imageFile.file(function(file) {
        var url = URL.createObjectURL(file);
        var img = document.createElement('img');
        img.name = fileName;
        img.onload = function(evt) {
          resolve(evt.target);
        };
        img.src = url;
      }, function(eee) {
        alert(eee);
      });
    }, function(ee) {
      alert(ee);
    });
  });
};
File.loadJSON = function(fileName) {
  return new Promise(function(resolve, reject) {
    $R.chosenEntry.getFile(fileName, {}, function(fileEntry) {
      getTextFile(fileEntry).then(JSON.parse).then(function(data) {
        resolve(data);
      });
    });
  });
};
File.saveImage = function(fileName, imageData, callback, type) {
  type = type || 'image/png';
  chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
    entry.getFile(fileName, { create: true }, function(writableEntry) {
      var blob = new Blob([imageData], { type: type });
      writableEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
          callback();
        };
        fileWriter.onerror = function(e) {
          console.log('Save failed: ' + e.toString());
        };
        fileWriter.write(blob);
      });
    }, function(e) {
      console.log(e);
    });
  });
};
File.save = function(fileName, data, callback) {
  chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
    entry.getFile(fileName, { create: true }, function(writableEntry) {
      var blob = new Blob([data], { type: 'text/plain' });
      writableEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
          callback();
        };
        fileWriter.onerror = function(e) {
          console.log('Save failed: ' + e.toString());
        };
        fileWriter.write(blob);
      });
    });
  });
};
File.createFolder = function(folderName, callback) {
  chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
    entry.getDirectory(folderName, { create: true }, function() {
      callback();
    }, function(error) {
      console.log(errror);
    });
  });
};
File.folder = function(folderName) {
  return new Promise(function(resolve, reject) {
    chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
      entry.getDirectory(folderName, { create: true }, function(dirEntry) {
        resolve(dirEntry);
      }, function(error) {
        reject(error);
      });
    });
  });
};