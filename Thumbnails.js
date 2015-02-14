$T = window.Thumbnails = {
	generate: function() {
		var canvas = document.createElement('canvas');
		canvas.width = 64;
		canvas.height = 64;
		canvas.style.position = 'absolute';
		canvas.style.left = '0px';
		canvas.style.top = '0px';
		canvas.style.display = 'none';
		document.body.appendChild(canvas);
		var div = document.createElement('div');
		div.style.position = 'absolute';
		div.style.left = '0px';
		div.style.top = '0px';
		div.style.height = '20px';
		div.style.backgroundColor = 'blue';
		document.body.appendChild(div);
		$T.div = div;
		$T.canvas = canvas;
		$T.context = canvas.getContext('2d');
		chrome.fileSystem.getWritableEntry(Racing.chosenEntry, function(entry) {
			$P.rootFolder = entry;
			$T.entries = Images.fromEntries();
			$T.processsed = 0;
			File.folder('Thumbnails').then(function(folder) {
				alert(folder);
			});
			/*$T.entries.forEach(function(image) {
				$P.rootFolder.getFile(image.name, {}, function(imageFile) {
					imageFile.file(function(file) {
						var url = URL.createObjectURL(file);
						var img = document.createElement('img');
						img.onload = function(evt) {
							$T.context.clearRect(0, 0, 64, 64);
							$T.context.drawImage(evt.target, 0, 0, 512, 512, 0, 0, 64, 64);
							var thumbnail = $P.png($T.canvas);
							var name = image.name;
							File.createFolder('Thumbnails', function() {
								File.saveImage('Thumbnails/' + name, thumbnail, function() {
									$T.processsed++;
									$T.div.style.width = parseInt($T.processsed * 100 / $T.entries.length) + '%';
								});
							});
						}
						img.src = url;
					});
				});
			});*/
		});
	}
};