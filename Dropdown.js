window.Dropdown = {
	fromArray: function(array, valueField, textField) {
		valueField = valueField || 'id';
		textField = textField || 'name';
		var select = document.createElement('select');
		array.forEach(function(item) {
			var option = document.createElement('option');
			option.value = item[valueField];
			option.text = item[textField];
			select.add(option);
		});
		return select;
	}
};