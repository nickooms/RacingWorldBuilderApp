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
  },
  analyze: function(imageData) {
    var data = imageData.data;
    var length = data.byteLength;
    var colors = {};
    var foundR = {};
    var foundG = {};
    var foundB = {};
    var foundA = {};
    for (var i = 0; i < length; i += 4) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var a = data[i + 3];
      var avg = (r + g + b) / 3;
      var color = r + ',' + g + ',' + b + ',' + a;
      if (colors[color] == null) {
        colors[color] = {
          count: 0,
          value: color
        }
      }
      colors[color].count++;

      /*if (foundR[r] == null) {
        foundR[r] = {
          count: 0,
          value: r,
          matches: {}
        };
      }
      foundR[r].count++;
      var index = r + ',' + g + ',' + b + ',' + a;
      var matches = foundR[r].matches;
      var match = matches[index];
      if (match == null) {
        matches[index] = 0;
      }
      matches[index]++;

      if (foundG[g] == null) {
        foundG[g] = {
          count: 0,
          value: g,
          matches: {}
        };
      }
      foundG[g].count++;
      var index = r + ',' + g + ',' + b + ',' + a;
      var matches = foundG[g].matches;
      var match = matches[index];
      if (match == null) {
        matches[index] = 0;
      }
      matches[index]++;

      if (foundB[b] == null) {
        foundB[b] = {
          count: 0,
          value: b,
          matches: {}
        };
      }
      foundB[b].count++;
      var index = r + ',' + g + ',' + b + ',' + a;
      var matches = foundB[b].matches;
      var match = matches[index];
      if (match == null) {
        matches[index] = 0;
      }
      matches[index]++;

      if (foundA[a] == null) {
        foundA[a] = {
          count: 0,
          value: a,
          matches: {}
        };
      }
      foundA[a].count++;
      var index = r + ',' + g + ',' + b + ',' + a;
      var matches = foundA[a].matches;
      var match = matches[index];
      if (match == null) {
        matches[index] = 0;
      }
      matches[index]++;*/
    }
    var C = [];
    var R = [];
    var G = [];
    var B = [];
    var A = [];
    for (var color in colors) {
      C.push(colors[color]);
    }
    for (var r in foundR) {
      R.push(foundR[r]);
    }
    for (var g in foundG) {
      G.push(foundG[g]);
    }
    for (var b in foundB) {
      B.push(foundB[b]);
    }
    for (var a in foundA) {
      A.push(foundA[a]);
    }
    var sort = function(a, b) {
      return a.count < b.count ? 1 : -1;
    };
    C.sort(sort);
    R.sort(sort);
    G.sort(sort);
    B.sort(sort);
    A.sort(sort);
    return {
      colors: C,
      red: R,
      green: G,
      blue: B,
      alpha: A
    };
  }
};