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