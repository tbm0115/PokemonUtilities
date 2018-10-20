﻿"use strict";

var ComparisonDTO = function ComparisonDTO(name, id, clr, stats, iconURL) {
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
    if (!("fncOnMouseMove" in el)) {
      el["fncGetMousePos"] = (function (ev) {
        var rect = this.getBoundingClientRect();
        return {
          x: ev.clientX - rect.left,
          y: ev.clientY - rect.top
        };
      }).bind(el);
      el["fncOnMouseMove"] = (function (ev) {
        var mousePos = this.fncGetMousePos(ev);
        //console.log("Canvas mousemove: ", mousePos);
        this.Draw(mousePos);
      }).bind(el);
      el.onmousemove = el.fncOnMouseMove;
    }
    el["elImageContainer"] = {};

    el["Draw"] = (function (mouseCoords) {
      var arr = this.Options.items;
      var r = this.getBoundingClientRect();
      this.width = r.width;
      this.height = r.height;
      var objMessage = {
        pokemon: null,
        stat: "",
        val: ""
      };
      var stats = this.Options.properties;
      var md = Math.min(r.width, r.height) / 2 * 0.75; // Max Diameter
      var thickness = md / (stats.length - 1); // Thickness of each segment
      var segmentWidth = 360 / arr.length;
      var ctx = this.getContext("2d");

      var polarPoint = function polarPoint(r, t) {
        this.Radius = r;
        this.Theta = t;
        this.toCartesian = (function () {
          return {
            x: Math.floor(this.Radius * Math.cos(this.Theta)),
            y: Math.floor(this.Radius * Math.sin(this.Theta))
          };
        }).bind(this);
        this.Cartesian = this.toCartesian();

        return this;
      };

      if (arr.length > 0) {
        ctx.translate(r.width / 2, r.height / 2);
        for (var plen = arr.length, p = 0; p < plen; p++) {
          //console.log("Drawing '" + arr[p].name + "'");
          //ctx.restore(origin);
          ctx.rotate(2 * (p + 1 / plen) * Math.PI);

          for (var slen = stats.length, s = 0; s < slen; s++) {
            ctx.strokeStyle = "silver";
            ctx.fillStyle = arr[p].color;
            ctx.lineWidth = 1;
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
            var rEnd = s * thickness + thickness;
            var aCenter = segmentWidth2;
            var aLeft = aCenter - segmentWidth * prcnt.left;
            var aRight = aCenter + segmentWidth * prcnt.right;
            var sp1 = new polarPoint(rStart, aLeft * Math.PI / 180); // Lower Left
            var sp2 = new polarPoint(rEnd, aLeft * Math.PI / 180); // Upper Left
            // This is where we Arc Over
            var sp3 = new polarPoint(rEnd, aRight * Math.PI / 180); // Upper Right
            var sp4 = new polarPoint(rStart, aRight * Math.PI / 180); // Lower Right
            ctx.beginPath();
            ctx.moveTo(sp1.Cartesian.x, sp1.Cartesian.y); // Move to Lower Left
            ctx.lineTo(sp2.Cartesian.x, sp2.Cartesian.y); // Draw to Upper Left
            ctx.arc(0, 0, rEnd, aLeft * Math.PI / 180, aRight * Math.PI / 180);
            ctx.lineTo(sp3.Cartesian.x, sp3.Cartesian.y);
            ctx.arc(0, 0, rStart, aRight * Math.PI / 180, aLeft * Math.PI / 180, true); // Close the segment
            // Before done with path, check if mouse was in path?
            if (typeof mouseCoords !== "undefined" && mouseCoords !== null) {
              if (ctx.isPointInPath(mouseCoords.x, mouseCoords.y)) {
                objMessage.stat = k;
                objMessage.val = statVal;
                objMessage.pokemon = arr[p].name;
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "navyblue";
              }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          var p1 = new polarPoint(md, 0);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p1.Cartesian.x, p1.Cartesian.y);
          ctx.arc(0, 0, md + thickness, 0, segmentWidth * Math.PI / 180);
          ctx.lineTo(0, 0);
          ctx.stroke();
          ctx.closePath();
        }
        ctx.restore();
      } else {
        ctx.restore();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Add Pokemon", Math.floor(this.width / 2), Math.floor(this.height / 2), Math.floor(this.width * 0.75));
      }
      // Draw Images
      for (var alen = arr.length, a = 0; a < alen; a++) {
        var size = Math.min(96, thickness * 4);
        var imgPoint = new polarPoint(Math.min(this.width, this.height) * 0.9 / 2, (segmentWidth / 2 + segmentWidth * (a + 1)) * Math.PI / 180);
        var imgItem = this.elImageContainer[arr[a].id]; //.querySelector("img[src='" + arr[a].icon + "']");
        var pt = {
          x: Math.floor(imgPoint.Cartesian.x) - size / 2,
          y: Math.floor(imgPoint.Cartesian.y) - size / 2
        };
        if (typeof imgItem === "undefined" || imgItem === null || imgItem.data === null) {
          this.elImageContainer[arr[a].id] = {
            img: new Image(size, size),
            canv: document.createElement("canvas")
          };
          imgItem = this.elImageContainer[arr[a].id];
          imgItem.canv.width = size;
          imgItem.canv.height = size;
          imgItem.img.onload = (function (ev) {
            console.log("\tReceived new image data!", this);
            ctx.drawImage(this.data.img, this.point.x, this.point.y, size, size);
          }).bind({ point: pt, data: this.elImageContainer[arr[a].id] });
          console.log("Requesting new image data...");
          imgItem.img.src = arr[a].icon;
        } else {
          ctx.drawImage(imgItem.img, pt.x, pt.y, size, size);
        }
      }
      if (objMessage.pokemon !== null && objMessage.pokemon !== "") {
        $(this).trigger("message", [objMessage]);
      }

      return arr;
    }).bind(el);
    el.Draw();

    return $this;
  });
};

