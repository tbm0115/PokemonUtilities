var ComparisonDTO = function (name, id, clr, stats, iconURL) {
  this.name = name;
  this.id = id;
  this.color = clr;
  this.stats = stats;
  this.icon = iconURL;

  return this;
};
$.fn.Comparison = function (options) {
  return $(this).filter(function (i, e) {
    return e.nodeName === "CANVAS";
  }).each(function (i, e) {
    var $this = $(this);
    var el = $this[0];

    el["Options"] = options;
    el["Draw"] = (function () {
      var arr = this.Options.items;
      var r = this.getBoundingClientRect();
      this.width = r.width;
      this.height = r.height;

      var stats = this.Options.properties;
      var md = (r.width / 2) * 0.75;
      var thickness = md / (stats.length - 1);
      var segmentWidth = 360 / (arr.length);
      var ctx = this.getContext("2d");
      ctx.translate(r.width / 2, r.height / 2);
      var origin = ctx.save();

      var polarPoint = function (r, t) {
        this.Radius = r;
        this.Theta = t;
        this.toCartesian = (function () {
          return {
            x: this.Radius * Math.cos(this.Theta),
            y: this.Radius * Math.sin(this.Theta)
          };
        }).bind(this);
        this.Cartesian = this.toCartesian();

        return this;
      };

      for (var plen = arr.length, p = 0; p < plen; p++) {
        //console.log("Drawing '" + arr[p].name + "'");
        //ctx.restore(origin);
        ctx.rotate((2 * (p + 1 / plen)) * Math.PI);
        ctx.strokeStyle = "whitesmoke";
        ctx.fillStyle = arr[p].color;

        for (var slen = stats.length, s = 0; s < slen; s++) {
          var k = stats[s];
          var statVal = arr[p].stats[k];
          var pPoke = p > 0 ? arr[p - 1] : arr[arr.length - 1];
          var nPoke = p < arr.length - 1 ? arr[p + 1] : arr[0];
          var prcnt = {
            left: statVal / (statVal + pPoke.stats[k]),
            right: statVal / (statVal + nPoke.stats[k])
          };
          var segmentWidth2 = segmentWidth / 2;
          var rStart = s * thickness;
          var rEnd = (s * thickness) + thickness;
          var aCenter = segmentWidth2;
          var aLeft = (aCenter - (segmentWidth * prcnt.left));
          var aRight = (aCenter + (segmentWidth * prcnt.right));
          var sp1 = new polarPoint(rStart, aLeft * Math.PI / 180); // Lower Left
          var sp2 = new polarPoint(rEnd, aLeft * Math.PI / 180); // Upper Left
          // This is where we Arc Over
          var sp3 = new polarPoint(rEnd, aRight * Math.PI / 180); // Upper Right
          var sp4 = new polarPoint(rStart, aRight * Math.PI / 180); // Lower Right
          ctx.filleStyle = arr[p].color;
          ctx.beginPath();
          ctx.moveTo(sp1.Cartesian.x, sp1.Cartesian.y); // Move to Lower Left
          ctx.lineTo(sp2.Cartesian.x, sp2.Cartesian.y); // Draw to Upper Left
          ctx.arc(0, 0, rEnd, aLeft * Math.PI / 180, aRight * Math.PI / 180);
          ctx.lineTo(sp3.Cartesian.x, sp3.Cartesian.y);
          ctx.arc(0, 0, rStart, aRight * Math.PI / 180, aLeft * Math.PI / 180, true); // Close the segment
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.strokeStyle = "silver";
        var p1 = new polarPoint(md, 0);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(p1.Cartesian.x, p1.Cartesian.y);
        ctx.arc(0, 0, md + thickness, 0, (segmentWidth) * Math.PI / 180);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.closePath();
      }
      ctx.restore();
      for (var alen = arr.length, a = 0; a < alen; a++) {
        var imgPoint = new polarPoint((this.width * 0.9) / 2, ((segmentWidth / 2) + (segmentWidth * (a + 1))) * Math.PI / 180);
        var size = 96;
        var img = new Image(size, size);
        img.onload = (function (ev) {
          ctx.drawImage(ev.currentTarget, this.x - (size / 2), this.y - (size / 2), size, size);
        }).bind(imgPoint.Cartesian);
        img.src = arr[a].icon;
      }

      return arr;
    }).bind(el);
    el.Draw();

    return $this;
  });
}