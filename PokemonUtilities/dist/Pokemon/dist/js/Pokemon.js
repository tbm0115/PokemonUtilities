﻿jQuery.extend({
  /** @description - Same as $.getJSON(), but forces cache to localStorage.
   *  @param {string} url - The URL to send the GET request.
   * @param {function} callback - The callback function to execute on a successful request. Single parameter function responds with JSON data.
   */
  getCachedJSON: function (url, callback) {
    /* Developer's Note - 09-30-2018
     *  Parts of the following is commented out while testing caching from the Service Worker (sw.js)
     */
    //var cacheTimeInMs = 3600000; // Part of deprecation
    //var currentTimeInMs = new Date().getTime(); // Part of deprecation
    url = url.replace("//index.json", "/index.json");
    var cache = {
      data: null,
      timestamp: null
    };

    //if (typeof window.localStorage[url] !== "undefined") {
    //  cache = JSON.parse(window.localStorage[url]);

    //  var validCache = (currentTimeInMs - cache.timestamp) < cacheTimeInMs;

    //  if (validCache) {
    //    callback(cache.data);
    //    return true;
    //  }
    //}

    $.getJSON(url, function (data) {
      cache.data = data;
      cache.timestamp = new Date().getTime();

      window.localStorage[url] = JSON.stringify(cache);

      callback(cache.data);
    });
  }
});
const gtet = "greater than or equal to";
const ltet = "less than or equal to";
const gt = "greater than";
const lt = "less than";
const et = "equal to";

/**
 * @description - Gets the Key-Value-Pair of the requested Evolution Trigger info.
 */
const EvolveOptions = {
  "gender": {
    "label": "Gender Equals:"
  },
  "held_item": {
    "label": "Holding Item:"
  },
  "item": {
    "label": "Holding Item:"
  },
  "known_move": {
    "label": "Knows Move:"
  },
  "known_move_type": {
    "label": "Knows Move-Type:"
  },
  "location": {
    "label": "At Location:"
  },
  "min_affection": {
    "label": "Gaining Affection " + gtet
  },
  "min_beauty": {
    "label": "Building Beauty " + gtet
  },
  "min_happiness": {
    "label": "Gaining Happiness " + gtet
  },
  "min_level": {
    "label": "Gaining at least Level:"
  },
  "needs_overworld_rain": {
    "label": "When Raining"
  },
  "party_species": {
    "label": "Accompanied By Species:"
  },
  "party_type": {
    "label": "Accompanied By Pokemon Type:"
  },
  "relative_physical_stats": {
    "label": "Stats:"
  },
  "time_of_day": {
    "label": "Time of Day:"
  },
  "trade_species": {
    "label": "When Traded"
  }
};

/**
 * @description - Gets the Key-Value-Pair of the requested Base Stats info.
 */
const StatsOptions = {
  "speed": {
    "label": "Speed"
  },
  "special-defense": {
    "label": "Special Defense"
  },
  "special-attack": {
    "label": "Special Attack"
  },
  "defense": {
    "label": "Defense"
  },
  "attack": {
    "label": "Attack"
  },
  "hp": {
    "label": "HP"
  }
};

/**
 * @description - Initializes ".poke-card" element(s) to gather info on a specified pokemon and display in a standard format.
 * @param {any} data - See documentation for options. The primary option "pokemon" must specify the target pokemon id # if the element does not contain the "data-pokemon" attribute with the id #.
 * @returns {any} - Returns jQuery elements.
 */
$.fn.pokeCard = function (data) {
  return $(this).filter(function (i, e) {
    //console.log("Checking pokeCard class: ", e);
    return e.classList.contains("poke-card");
  }).each(function (i, e) {
    //console.log("Initializing Poke-Card: ", data);
    var $this = $(this);
    var el = $this[0];

    /** @description - Checks whether this target element (el) contains the specified property. If not, a function is called to create it
     * @param {string} prop - Name of the property to add to the target element.
     * @param {function} fncCreate - Function to be called when the property is created. Must return the appropriate object to apply to the target element.
     * */
    var fncHasProp = (function (prop, fncCreate) {
      if (!(prop in this)) {
        this[prop] = fncCreate.apply(this);
      }
    }).bind(el);

    // Build .poke-card with Vanilla JS
    fncHasProp("elSprite", function () {
      var e = this.appendChild(document.createElement("img"));
      e.setAttribute("class", "sprite");
      e.setAttribute("src", "");
      e.setAttribute("alt", "Pokemon Image");

      /** @description - Draws this element to the UI.
       * @returns {any} - This element.
       */
      e["Draw"] = (function () {
        var ap = this["ActivePokemon"];
        if (typeof ap !== "undefined" && ap !== null) {
          this.elSprite.src = "./dist/PokeAPI" + ap.sprites.front_default;
        } else {
          this.elSprite.src = "./dist/images/404-pokemon.png";
        }
        return this.elSprite;
      }).bind(this);

      return e;
    });
    fncHasProp("elName", function () {
      var e = this.appendChild(document.createElement("h1"));
      e.innerText = "#";
      var sDexNum = e.appendChild(document.createElement("span"));
      sDexNum.setAttribute("title", "National Pokedex #");
      sDexNum.setAttribute("aria-label", "National Dex Number");
      sDexNum.setAttribute("name", "{['id']}");
      e.innerHTML += "&nbsp;";
      var sName = e.appendChild(document.createElement("span"));
      sName.setAttribute("title", "Pokemon Name");
      sName.setAttribute("aria-label", "Name");
      sName.setAttribute("name", "{['name']}");

      /** @description - Draws this element to the UI.
       * @returns {any} - This element.
       */
      e["Draw"] = (function () {
        var ap = this["ActivePokemon"];
        if (typeof ap !== "undefined" && ap !== null) {
          // Set 'Dex Number
          this.elName.querySelector("[aria-label='National Dex Number']").innerText = ap.id.toString();
          // Set Name
          this.elName.querySelector("[aria-label='Name']").innerText = ap.name.substr(0, 1).toUpperCase() + ap.name.substr(1);
        } else {
          // Set 'Dex Number
          this.elName.querySelector("[aria-label='National Dex Number']").innerHTML = "&mdash;";
          // Set Name
          this.elName.querySelector("[aria-label='Name']").innerHTML = "&mdash;";
        }

        return this.elName;
      }).bind(this);

      return e;
    });
    fncHasProp("elGenus", function () {
      var e = this.appendChild(document.createElement("h4"));
      e.setAttribute("title", "Genuse Name");
      e.setAttribute("aria-label", "Genus Name");
      e.setAttribute("name", "{['species']['genera'][2]['genus']}");

      /** @description - Draws this element to the UI.
       * @returns {any} - This element.
       */
      e["Draw"] = (function () {
        var ap = this["ActivePokemon"];
        if (typeof ap !== "undefined" && ap !== null) {
          this.elGenus.innerText = ap.species.genera[2].genus;
        } else {
          this.elGenus.innerHTML = "&mdash;";
        }
        return this.elGenus;
      }).bind(this);

      return e;
    });
    fncHasProp("elPokeEvolutions", function () {
      var e = this.appendChild(document.createElement("div"));
      e.setAttribute("class", "poke-evolutions");
      var elLabel = e.appendChild(document.createElement("h6"));
      elLabel.innerText = "Next Evolutionary Form(s)";
      var elUL = e.appendChild(document.createElement("ul"));

      /** @description - Draws this element to the UI.
       * @returns {any} - This element.
       */
      e["Draw"] = (function () {
        var ap = this["ActivePokemon"];
        this.elPokeEvolutions.classList.toggle("hidden", true);
        this.removeAttribute("data-evolves-from-id");
        this.removeAttribute("data-evolves-from-name");
        this.removeAttribute("data-evolves-to-id");
        this.removeAttribute("data-evolves-to-name");
        if (typeof ap !== "undefined" && ap !== null) {
          // Focus on next evolutionary form(s)
          var ul = this.elPokeEvolutions.querySelector("ul");
          ul.innerHTML = "";
          var nextPokemons = ap.Get.Evolution.Next();
          if (nextPokemons !== null && nextPokemons.length > 0) {
            var tks = Object.getOwnPropertyNames(EvolveOptions);
            for (var len = nextPokemons.length, n = 0; n < len; n++) {
              if (nextPokemons[n].evolution_details.length > 0) {
                var evolution = nextPokemons[n].evolution_details[0];
                var li = ul.appendChild(document.createElement("li"));
                li.setAttribute("data-evolves-to", nextPokemons[n].species.name);
                var arrTriggers = new Array();
                for (var tlen = tks.length, t = 0; t < tlen; t++) {
                  var trigger = evolution[tks[t]];
                  if (trigger !== null && trigger !== false && trigger !== "") {
                    arrTriggers.push(EvolveOptions[tks[t]].label + " <strong>" + trigger.toString()) + "</strong>";
                  }
                }
                li.innerHTML = "<strong>" + nextPokemons[n].species.name.substr(0, 1).toUpperCase() + nextPokemons[n].species.name.substr(1) + "</strong> by " + arrTriggers.join("<br/>&mdash; ");
                var lia = li.appendChild(document.createElement("a"));
                lia.setAttribute("class", "btn btn-xs btn-default");
                lia.innerHTML = "<i class=\"glyphicon glyphicon-circle-arrow-right\"></i>";
                var nwid = nextPokemons[n].species.url;
                if (nwid[nwid.length - 1] === "/") {
                  nwid = nwid.substr(0, nwid.length - 1);
                }
                nwid = nwid.substr(nwid.lastIndexOf("/") + 1);

                lia.setAttribute("data-evolves-to-id", nwid);
                // Add functionality to button to select this Pokemon
                lia["data"] = data;
                lia.onclick = function (ev) {
                  var el = ev.currentTarget;
                  $(".poke-loader").toggleClass("show", true);
                  el.data.pokemon = el.getAttribute("data-evolves-to-id");
                  $(el).closest(".poke-card").pokeCard(el.data);
                };
              }
            }
            this.elPokeEvolutions.classList.toggle("hidden", false);
          }
        }
        return this.elPokeEvolutions;
      }).bind(this);

      return e;
    });
    fncHasProp("elPokeStats", function () {
      var e = this.appendChild(document.createElement("div"));
      e.setAttribute("class", "poke-stats");
      var elCanv = e.appendChild(document.createElement("canvas"));
      elCanv.innerText = "This browser does not support HTML5 Canvas!";

      /** @description - Draws this element to the UI.
       * @returns {any} - This element.
       */
      e["Draw"] = (function () {
        var ap = this["ActivePokemon"];
        var canv = this.elPokeStats.querySelector("canvas");
        var ctx;
        var blnCanv = typeof canv !== "undefined" && canv !== null;
        if (typeof ap !== "undefined" && ap !== null && blnCanv) {
          delete this.elPokeStats["_timeout"];
          if ("stats" in ap) {
            var r = canv.getBoundingClientRect();
            canv.width = r.width;
            canv.height = r.height;
            ctx = canv.getContext("2d");

            var sh = r.height / (ap.stats.length);
            var sa = sh * 0.5;
            var sw = r.width * 0.5;
            var fs = sh * 0.5;
            ctx.font = fs.toString() + "px Arial";
            for (var len = ap.stats.length, n = 0; n < len; n++) {
              var stat = ap.stats[n];
              var ba = {
                x: r.width * 0.5,
                y: (sh * n) + (sh / 2) - (sa / 2),
                w: sw * (stat.base_stat / 255),
                h: sa
              };
              var bb = {
                x: ba.x,
                y: ba.y,
                w: sw,
                h: ba.h
              };
              var bt = {
                x: r.width * 0.45,
                y: (sh * n) + (sh / 2),
                w: r.width * 0.5,
                h: fs
              };
              ctx.fillStyle = ap.species.color ? ap.species.color.name : "black";
              ctx.fillRect(ba.x, ba.y, ba.w, ba.h);
              ctx.strokeStyle = "black";
              ctx.strokeRect(bb.x, bb.y, bb.w, bb.h);
              ctx.fillStyle = "black";
              ctx.textAlign = "right";
              ctx.textBaseline = "middle";
              ctx.fillText(StatsOptions[stat.stat.name].label + " (" + stat.base_stat.toString() + "): ", bt.x, bt.y, bt.w);
            }
          } else {
            if (typeof this.elPokeStats["_timeout"] === "undefined" || this.elPokeStats._timeout === null) {
              // Try to give the page a little time to gather additional data if necessary.
              this.elPokeStats["_timeout"] = setTimeout((function () {
                this.Draw();
              }).bind(this.elPokeStats), 100);
            }
          }
        } else if (blnCanv) {
          ctx = canv.getContext("2d");
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("No Base Stats Available", canv.width / 2, canv.height / 2, canv.width * 0.75);
          if (typeof this.elPokeStats["_timeout"] === "undefined" || this.elPokeStats._timeout === null) {
          // Try to give the page a little time to gather additional data if necessary.
            this.elPokeStats["_timeout"] = setTimeout((function () {
              this.Draw();
            }).bind(this.elPokeStats), 100);
          }
        }
        return this.elPokeStats;
      }).bind(this);

      return e;
    });

    /** @description - Draws this element to the UI.
      * @returns {any} - This element.
      */
    el["Draw"] = (function () {
      var ap = this["ActivePokemon"];
      if (typeof ap !== "undefined" && ap !== null) {
        // Set Species Color
        if ("color" in ap.species) {
          this.setAttribute("data-species-color", ap.species.color.name);
        } else if (this.hasAttribute("data-species-color")) {
          this.removeAttribute("data-species-color");
        }

      }
      // Set Sprite image(s)
      this.elSprite.Draw();

      // Set Name Header
      this.elName.Draw();
      this.elGenus.Draw();
      this.elPokeEvolutions.Draw();
      this.elPokeStats.Draw();

      return this;
    }).bind(el);

    // Check for data
    if (typeof data === "undefined" || data === null) {
      data = {};
    }
    if (!("options" in data)) {
      data["options"] = {};
    }
    var pid = null;
    if (el.hasAttribute("data-pokemon")) {
      pid = el.getAttribute("data-pokemon");
    } else if ("pokemon" in data) {
      pid = data.pokemon;
    }
    data.options["jqueryPokeCardCallback"] = (function () {
      this.Draw();
    }).bind(el);
    if (typeof pid !== "undefined" && pid !== null) {
      this["ActivePokemon"] = new Pokemon(pid, data.options);
    }

    return $this;
  });
};

/** @description - Gathers PokeAPI data on the specified pokemon by id #.
 * @param {int} ndid - The ID # of the pokemon to gather data on.
 * @param {any} options - See documentation on which options are available.
 * @returns {any} - This element.
 */
var Pokemon = function (ndid, options) {
  this._includes = {};

  // Perform initial retrieval of core Pokemon information.
  $.getCachedJSON("./dist/PokeAPI/api/v2/pokemon/" + ndid + "/index.json", (function (d) {
    /** @description - Fills the applied object with the provided data. Basically the same as a clone.
     * @param {object} data - An object to clone to the applied object.
     * @returns {object} - The applied object.
     */
    var fncFillBaseProperties = (function (data) {
      var dProps = Object.getOwnPropertyNames(data);
      for (var len = dProps.length, n = 0; n < len; n++) {
        this[dProps[n]] = data[dProps[n]];
      }
      return this;
    });
    fncFillBaseProperties.apply(this, [d]);
    var that = this;
    /** @description - Checks options to perform any recursive retrievals of pokemon data based on URL's in the original retrieval.
     * @param {string} prop - Name of the property to focus on within the applied object.
     * @param {any} options - Pass-thru options from the original retrieval.
     */
    var fncFillProperties = (function (prop, options) {
      this.origin._includes[prop] = "pending";
      var fncCheckIncludes = (function (obj, options) {
        if (typeof (options) !== "undefined" && options !== null && "includes" in options) {
          var iks = Object.getOwnPropertyNames(options.includes);
          if (iks.length > 0) {
            for (var ilen = iks.length, i = 0; i < ilen; i++) {
              if (Object.getOwnPropertyNames(options.includes[iks[i]]).length > 0) {
                fncFillProperties.apply({ origin: this.origin, item: obj }, [iks[i], options.includes[iks[i]]]);
              } else {
                fncFillProperties.apply({ origin: this.origin, item: obj }, [iks[i]]);
              }
            }
          }
        }
      }).bind(this);
      /**
       * @description - Function that will be called upon a successful retrieval. Intended to absorb the retrieved data.
       * @param {object} d - The returned data from the GET request.
       */
      var fncCompletedGET = (function (d) {
        fncFillBaseProperties.apply(this.item, [d]);
        fncCheckIncludes.apply(this.that, [this.item, this.options]);
        this.that.origin._includes[this.prop] = "done";
      });
      // Logic tree to determine exactly if and how recursive data is retrieved.
      var strPrefix = "./dist/PokeAPI";// "/lib/PokeAPI" in the ASP.NET Core app
      if (prop in this.item) {
        if ("length" in this.item[prop] && !("url" in this.item[prop])) {
          for (var len = this.item[prop].length, n = 0; n < len; n++) {
            if (typeof (options) !== "undefined" && options !== null && "target" in options) {
              if ("url" in this.item[prop][n][options.target]) {
                $.getCachedJSON(strPrefix + this.item[prop][n][subProp].url + "/index.json", fncCompletedGET.bind({ that: this, item: this.item[prop][n][options.target], prop: prop, options: options }));
              }
            } else if ("url" in this.item[prop][n]) {
              $.getCachedJSON(strPrefix + this.item[prop][n].url + "/index.json", fncCompletedGET.bind({ that: this, item: this.item[prop][n], prop: prop, options: options }));
            }
          }
        } else if ("url" in this.item[prop]) {
          $.getCachedJSON(strPrefix + this.item[prop].url + "/index.json", fncCompletedGET.bind({ that: this, item: this.item[prop], prop: prop, options: options }));
        } else {
          console.warn("[Pokemon.fncFillProperties] No array detected and no URL property available: ", this.item[prop]);
        }
      } else {
        console.warn("[Pokemon.fncFillProperties] No '" + prop + "' in item: ", this.item);
      }
    });
    // Process Initializing Options
    this["_options"] = options;
    if (typeof (options) !== "undefined" && options !== null) {
      if ("includes" in options) {
        var iks = Object.getOwnPropertyNames(options.includes);
        for (var len = iks.length, n = 0; n < len; n++) {
          if (Object.getOwnPropertyNames(options.includes[iks[n]]).length > 0) {
            fncFillProperties.apply({ origin: this, item: this }, [iks[n], options.includes[iks[n]]]);
          } else {
            fncFillProperties.apply({ origin: this, item: this }, [iks[n]]);
          }
        }
        this._includes["_interval"] = setInterval((function () {
          var ik = Object.getOwnPropertyNames(this._includes);
          var blnGood = true;
          for (var len = ik.length, n = 0; n < len; n++) {
            if (ik[n] !== "_interval" && this._includes[ik[n]] === "pending") {
              blnGood = false;
            }
          }
          if (blnGood) {
            clearInterval(this._includes._interval);
            this._options.callback.apply(this);
          }
        }).bind(this), 100);
      } else if ("callback" in options) {
        options.callback.apply(this);
      }
    }
  }).bind(this));


  // Set Data Simplification Functions
  this["Get"] = {
    Evolution: {
      /** @description - Finds the Pokemon's current position within an evolutionary chain. WARNING - This is a recursive function.
       * @returns {any} - The PokeAPI Evolutionary Chain node. Returns null if none are found or there is no chain.
       */
      _FindCurrent: (function () {
        var that = this;
        if ("species" in this) {
          if ("evolution_chain" in this.species) {
            if ("chain" in this.species.evolution_chain) {
              var fncRecFind = function (obj, name) {
                if (obj.species.name.toLowerCase() === name.toLowerCase()) {
                  return obj;
                } else if (obj["evolves_to"].length > 0) {
                  var tmp = null;
                  for (var len = obj["evolves_to"].length, n = 0; n < len; n++) {
                    tmp = fncRecFind(obj["evolves_to"][n], name);
                    if (typeof tmp !== "undefined" && tmp !== null) {
                      break;
                    }
                  }
                  return tmp;
                }
              };
              return fncRecFind(this.species.evolution_chain.chain, this.name);
            } else {
              console.warn("[Pokemon.Get.Evolution.Next] No Chain data available!");
            }
          } else {
            console.warn("[Pokemon.Get.Evolution.Next] No Evolutionary Chain data available!");
          }
        } else {
          console.warn("[Pokemon.Get.Evolution.Next] No Species data available!");
        }
        return null;
      }).bind(this),
      /** @description - Finds the next Pokemon within an evolutionary chain. WARNING - This is a recursive function.
       * @returns {any} - The PokeAPI Evolutionary Chain node. Returns null if none are found or there is no chain.
       */
      Next: (function () {
        var cur = this.Get.Evolution._FindCurrent("to");
        if (typeof cur !== "undefined" && cur !== null) {
          return cur.evolves_to;
        } else {
          return [];
        }
      }).bind(this),
      /** @deprecated - THIS METHOD IS NOT IMPLEMENTED.
       *  @description - Finds the next Pokemon within an evolutionary chain. WARNING - This is a recursive function.
       * @returns {any} - The PokeAPI Evolutionary Chain node. Returns null if none are found or there is no chain.
       */
      Previous: (function () {
        return null;
      }).bind(this)
    }
  };

  if (typeof options !== "undefined" && options !== null) {
    // Callback to internal UI update routines. The front-end callback is available within here.
    if ("jqueryPokeCardCallback" in options) {
      options.jqueryPokeCardCallback.apply(this);
    }
  }

  return this;
};