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
