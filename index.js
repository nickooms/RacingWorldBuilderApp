function convertDataURIToBinary(dataURI) {
  var BASE64_MARKER = ';base64,';
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));
  for (i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
var errorHandler = function(err) {
  console.log(err);
}
var fs;

function onInitFs(theFS) {
  fs = theFS;
}
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
requestFileSystem(PERSISTENT, 0, onInitFs, errorHandler);
(function(context) {
  document.getElementById('appid').value = chrome.runtime.id;
  var logField = document.getElementById('log');
  var sendText = document.getElementById('sendText');
  var sendText = document.getElementById('sendText');
  var sendId = document.getElementById('sendId');
  var send = document.getElementById('send');
  send.addEventListener('click', function() {
    appendLog('sending to ' + sendId.value);
    chrome.runtime.sendMessage(sendId.value, {
      myCustomMessage: sendText.value
    }, function(response) {
      appendLog('response: ' + JSON.stringify(response));
    })
  });
  blacklistedIds = ['none'];
  chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if (sender.id in blacklistedIds) {
      sendResponse({
        result: 'sorry, could not process your message'
      });
      return;
    } else if (request.base64) {
      appendLog('from ' + sender.id + ': ' + request.url);
      var ui8a = convertDataURIToBinary(request.base64);
      var path = request.url + '.png';
      fs.root.getFile(path, {
        create: true
      }, function(fileEntry) {
        var url = request.url;
        var blob = new Blob([ui8a], {
          type: 'image/png'
        });
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function(e) {
            console.log('Write completed.' + url + '.png');
          };
          fileWriter.onerror = function(e) {
            console.log('Write failed: ' + e.toString());
          };
          fileWriter.write(blob);
        });
      });
      sendResponse({
        result: 'Ok, got your message'
      });
    } else {
      sendResponse({
        result: "Oops, I don't understand this message"
      });
    }
  });
  var appendLog = function(message) {
    logField.innerText += "\n" + message;
  }
  context.appendLog = appendLog;
})(window)

function readDir() {
  fs.root.getDirectory('', {}, function(dirEntry) {
    var dirReader = dirEntry.createReader();
    dirReader.readEntries(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isDirectory) {
          console.log('Directory: ' + entry.fullPath);
        } else if (entry.isFile) {
          console.log('File: ' + entry.fullPath);
          loadImageFile(entry.fullPath);
        }
      }
    }, errorHandler);
  }, errorHandler);
}

function deleteAll() {
  fs.root.getDirectory('', {}, function(dirEntry) {
    var dirReader = dirEntry.createReader();
    dirReader.readEntries(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isDirectory) {
        } else if (entry.isFile) {
          deleteFile(entry.fullPath);
          //console.log('File: ' + entry.fullPath);
        }
      }
    }, errorHandler);
  }, errorHandler);
}

function loadImageFile(fileName) {
  fs.root.getFile(fileName, {}, function(file) {
    var img = document.createElement('img');
    img.src = file.toURL();
    document.body.appendChild(img); //or document.body
  });
}

function deleteFile(fileName){
  fs.root.getFile(fileName, {create: false}, function(fileEntry) {
    fileEntry.remove(function() {
      //displayDirectory();
    }, errorHandler);
  }, function(e) {
    if (e.code == FileError.INVALID_MODIFICATION_ERR){
      alert('Filename does not exists');
    }
  });
}

function deleteFolder(fileName){
  fs.root.getDirectory(fileName, {create: false}, function(dirEntry) {
    dirEntry.removeRecursively(function() {
      //displayDirectory();
    }, errorHandler);
  }, function(e) {
    if (e.code == FileError.INVALID_MODIFICATION_ERR){
      alert('Folder does not exists');
    }
  });
}