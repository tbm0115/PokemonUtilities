"use strict";

var ComparisonDTO = function ComparisonDTO(name, id, clr, stats, iconURL) {
  this.name = name;
  this.id = id;
  this.color = clr;
  this.stats = stats;
  this.icon = iconURL;

  return this;
};
var name2hsl = function name2hsl(name) {
  var hsl = function hsl(h, s, l) {
    l = l + (100 - l) / 2; // Manipulate HSL Lightness
    return "hsl(" + h.toString() + ", " + s.toString() + "%, " + l.toFixed(0).toString() + "%)";
    //return num + ((100 - num) / 2);
  };
  var dictionary = {};
  dictionary["black"] = hsl(0, 0, 0); //"hsl(0, 0%, 0%)",
  dictionary["blue"] = hsl(240, 100, 50); //"hsl(240, 100%, 50%)",
  dictionary["brown"] = hsl(0, 59, 41); //"hsl(0, 59%, 41%)",
  dictionary["gray"] = hsl(0, 0, 50); //"hsl(0, 0%, 50%)",
  dictionary["green"] = hsl(120, 100, 25); //"hsl(120, 100%, 25%)",
  dictionary["pink"] = hsl(350, 100, 88); //"hsl(350, 100%, 88%)",
  dictionary["purple"] = hsl(300, 100, 25); //"hsl(300, 100%, 25%)",
  dictionary["red"] = hsl(0, 100, 50); //"hsl(0, 100%, 50%)",
  dictionary["white"] = hsl(0, 0, 100); //"hsl(0, 0%, 100%)",
  dictionary["yellow"] = hsl(60, 100, 50); //"hsl(60, 100%, 50%)"

  if (name in dictionary) {
    return dictionary[name];
  } else {
    return dictionary["black"];
  }
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
            ctx.strokeStyle = "black"; //"silver";
            ctx.fillStyle = name2hsl(arr[p].color); // arr[p].color;
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
            ctx.stroke();
            ctx.closePath();
            ctx.fill();
          }
          ctx.strokeStyle = "black";
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

// Page handlers
var ComparePokemon = new Array(); // Global List of Pokemon to compare
$(document).ready(function () {
  $("#pokeComparison").on("message", function (ev, msg) {
    $("#compareMessage").html("<strong>" + msg.pokemon.substr(0, 1).toUpperCase() + msg.pokemon.substr(1) + "</strong> " + msg.stat.substr(0, 1).toUpperCase() + msg.stat.substr(1) + " = " + msg.val.toString());
  });

  BuildComparison();
});
function BuildComparison() {
  //console.log("Compare Clicked!");
  //var container = $("#pokeContainer")[0];
  //container.innerHTML = ""; // Clear All Pokemon Items in list
  $("#compareMessage").html("");
  var pdto = new Array();
  var data = {
    items: null,
    properties: ["speed", "special-defense", "special-attack", "defense", "attack", "hp"]
  };
  for (var len = ComparePokemon.length, n = 0; n < len; n++) {
    var pokemon = ComparePokemon[n];
    //var li = container.appendChild(document.createElement("li"));
    //li.setAttribute("data-id", pokemon.id.toString());
    //var i = li.appendChild(document.createElement("i"));
    //i.setAttribute("class", "icon-sprite-" + pokemon.id.toString());
    //i.style.display = "inline-block";
    //var spn = li.appendChild(document.createElement("span"));
    //spn.innerText = pokemon.name.substr(0, 1).toUpperCase() + pokemon.name.substr(1);
    //var aView = li.appendChild(document.createElement("a"));
    //aView.setAttribute("href", "/pokemon/" + pokemon.name);
    //aView.setAttribute("target", "_blank");
    //aView.style.marginLeft = "5px";
    //aView.setAttribute("title", "View Entry");
    //aView.setAttribute("role", "link");
    //aView.setAttribute("aria-label", "View Entry");
    //aView.innerHTML = "<i class='fa fa-external-link'></i>";
    //var aClose = li.appendChild(document.createElement("a"));
    //aClose.setAttribute("class", "close");
    //aClose.innerHTML = "&times;";
    //aClose.onclick = function (ev) {
    //  var id = $(ev.currentTarget).closest("li[data-id]").attr("data-id");
    //  ComparePokemon = ComparePokemon.filter(function (e, i) {
    //    return e.id.toString() !== id.toString();
    //  });
    //  BuildComparison();
    //};
    if (typeof pokemon !== "undefined" && pokemon !== null) {
      var stats = {
        "speed": 0,
        "special-defense": 0,
        "special-attack": 0,
        "defense": 0,
        "attack": 0,
        "hp": 0
      };
      for (var slen = pokemon.stats.length, s = 0; s < slen; s++) {
        stats[pokemon.stats[s].stat.name] = pokemon.stats[s].base_stat;
      }
      var dto = new ComparisonDTO(pokemon.name, pokemon.id, pokemon.species.color.name, stats, "/PokeApi" + pokemon.sprites.front_default);
      pdto.push(dto);
    }
  }
  data.items = pdto;
  //console.log("\tCompare DTO: ", data);
  if ($("#pokeComparison").length > 0) {
    var $comp = $("#pokeComparison").Comparison(data);
    if ($comp !== null && $comp.length > 0) {
      $comp[0].Draw();
      $("#pokeComparison").trigger("compared", [ComparePokemon]);
    }
  }
}
$(document).ready(function () {
  //drawFavoritePokemonPanel();

  $(window).on("resize", function () {
    // Re-Draw Canvas
    var comp = document.querySelector("#pokeComparison");
    if (typeof comp !== "undefined" && comp !== null) {
      comp.Draw();
    }
  });
});

