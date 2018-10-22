$.fn.pokedex = function (options) {
  var $thises = $(this).filter(function (i, e) {
    return e.classList.contains("pokedex");
  }).each(function (e, i) {
    var $this = $(this);
    var el = $this[0];
    if (typeof (options) === "undefined" || options === null) {
      options = {};
    }

    if ("data" in options) {
      el["pokedex"] = options.data;
      delete options.data;
      el["options"] = options;
      el["draw"] = (function (q) {
        this.innerHTML = "";
        var arr = new Array();

        if ("pokedex" in this && this.pokedex !== null) {
          arr = this.pokedex.pokemon_entries;
          if (typeof (q) !== "undefined" && q !== null && q !== "") {
            arr = arr.filter(function (e, i) {
              return e.entry_number.toString() === q || e.pokemon_species.name.toLowerCase().indexOf(q.toLowerCase()) >= 0;
            });
          }
          if (arr.length > 0) {
            for (var len = arr.length, n = 0; n < len; n++) {
              var p = arr[n];
              var pn = p.pokemon_species.name;
              var a = this.appendChild(document.createElement("a"));
              a.setAttribute("class", "pokedex-result");
              a.setAttribute("data-id", p.entry_number.toString());
              a.setAttribute("data-name", pn.substr(0, 1).toUpperCase() + pn.substr(1));

              var i = a.appendChild(document.createElement("i"));
              i.setAttribute("class", "icon-sprite-" + p.entry_number.toString());

              $(a).on("click", (function (ev) {
                $(this).trigger("pokemon.clicked", [ev.currentTarget]);
              }).bind(this));

              $(this).trigger("pokemon.added", [a]);
            }
          }
        }

        return arr;
      }).bind(el);
      el.draw();
    } else {
      if (!('pokedex' in options)) {
        options['pokedex'] = "/pd/1/";
      }
      $.getJSON("/PokeApi/api/v2" + options.pokedex + "index.json", (function (d) {
        if (typeof (this["options"]) !== "undefined" || this.options !== null) {
          this.options = {};
        }
        this.options["data"] = d;
        $(this.element).pokedex(this.options);
      }).bind({ element: el, options: options }));
    }


    return $this;
  });

  $thises["search"] = (function (q) {
    $thises.each(function (i, e) {
      return $(this)[0].draw(q);
    });
  }).bind($thises);
  $thises["reset"] = (function (q) {
    $thises.each(function (i, e) {
      return $(this)[0].draw();
    });
  }).bind($thises);

  return $thises;
};