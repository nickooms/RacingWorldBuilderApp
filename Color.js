window.Color = {
  inverse: function(color) {
    var a = color.split('');
    for (var i = 1; i < 7; i++) {
      a[i] = (15 - parseInt(a[i], 16)).toString(16);
    }
    return a.join('');
  },
  random: function() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  }
};