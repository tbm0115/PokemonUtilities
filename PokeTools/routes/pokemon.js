'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');

class Pokedex {
  constructor(id) {
    if (typeof (id) === "undefined" || id === null) {
      id = 1;
    }
    var pdRaw = fs.readFileSync(__dirname + '/../public/PokeApi/api/v2/pd/' + id.toString() + '/index.json');
    var pd1 = JSON.parse(pdRaw);
    this.entries = new Array();
    for (var len = pd1.pokemon_entries.length, n = 0; n < len; n++) {
      this.entries.push({ id: pd1.pokemon_entries[n].entry_number, name: pd1.pokemon_entries[n].pokemon_species.name });
    }
  }
  findByName(name) {
    name = name.toLowerCase();
    var entry = this.entries.findIndex(function (entry) {
      return entry.name.toLowerCase() === name;
    });
    if (entry < 0) {
      return 0;
    } else {
      return this.entries[entry];
    }
  }
}
var nationalDex = new Pokedex();
var gameTitles = { "red-blue": { games: ["red", "blue"], generation: "i", console: "gameboy" }, "yellow": { games: ["yellow"], generation: "i", console: "gameboy" }, "stadium": { games: ["stadium"], generation: "i", console: "nintendo 64" }, "snap": { games: ["snap"], generation: "i", console: "nintendo 64" }, "gold-silver": { games: ["gold", "silver"], generation: "ii", console: "gameboy-color" }, "crystal": { games: ["crystal"], generation: "ii", console: "gameboy-color" }, "stadium-2": { games: ["stadium-2"], generation: "ii", console: "nintendo 64" }, "ruby-sapphire": { games: ["ruby", "sapphire"], generation: "iii", console: "gameboy-advance" }, "emerald": { games: ["emerald"], generation: "iii", console: "gameboy-advance" }, "firered-leafgreen": { games: ["fire-red", "leaf-green"], generation: "iii", console: "gameboy-advance" }, "diamond-pearl": { games: ["diamond", "pearl"], generation: "iv", console: "ds" }, "platinum": { games: ["platinum"], generation: "iv", console: "ds" }, "heartgold-soulsilver": { games: ["heart-gold", "soul-silver"], generation: "iv", console: "ds" }, "black-white": { games: ["black", "white"], generation: "v", console: "ds" }, "colosseum": { games: ["colosseum"], generation: "iii", console: "game-cube" }, "xd": { games: ["xd"], generation: "iii", console: "game-cube" }, "black-2-white-2": { games: ["black-2", "white-2"], generation: "v", console: "ds" }, "x-y": { games: ["x", "y"], generation: "vi", console: "3ds" }, "omega-ruby-alpha-sapphire": { games: ["omega-ruby", "alpha-sapphire"], generation: "vi", console: "3ds" }, "sun-moon": { games: ["sun", "moon"], generation: "vii", console: "3ds" }, "ultra-sun-ultra-moon": { games: ["ultra-sun", "ultra-moon"], generation: "vii", console: "3ds" } };
class Pokemon {
  constructor(id) {
    if (!isFinite(id)) {
      id = nationalDex.findByName(id).id;
    }
    if (typeof (id) !== "undefined" && id !== null) {
      var fncFillBaseProperties = (function (data) {
        var dProps = Object.getOwnPropertyNames(data);
        for (var len = dProps.length, n = 0; n < len; n++) {
          this[dProps[n]] = data[dProps[n]];
        }
        return this;
      });
      var pRaw = fs.readFileSync(__dirname + '/../public/PokeApi/api/v2/p/' + id + '/index.json');
      fncFillBaseProperties.apply(this, [JSON.parse(pRaw)]);
      //this.data = JSON.parse(pRaw);
      this['nameUpper'] = this['name'].substr(0, 1).toUpperCase() + this['name'].substr(1);

      var pspRaw = fs.readFileSync(__dirname + '/../public/PokeApi/api/v2' + this.species.url + 'index.json');
      fncFillBaseProperties.apply(this.species, [JSON.parse(pspRaw)]);
      //this.data.species['data'] = JSON.parse(pspRaw);

      var evcRaw = fs.readFileSync(__dirname + '/../public/PokeApi/api/v2' + this.species.evolution_chain.url + 'index.json');
      fncFillBaseProperties.apply(this.species.evolution_chain, [JSON.parse(evcRaw)]);
    //this.data.species.data.evolution_chain['data'] = JSON.parse(evcRaw);

    }

  }
  getCurrentEvolutionChain(overrideName) {
    if (typeof (overrideName) === "undefined" || overrideName === null) {
      overrideName = this.name;
    }
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
    return fncRecFind(this.species.evolution_chain.chain, overrideName);
  }
  getNextEvolutions() {
    var cur = this.getCurrentEvolutionChain();
    if (typeof cur !== "undefined" && cur !== null) {
      return cur.evolves_to;
    } else {
      return [];
    }
  }
  getPreviousEvolutions() {
    if (this.species.evolves_from_species !== null) {
      return this.getCurrentEvolutionChain(this.species.evolves_from_species.name);
    } else {
      return null;
    }
  }
  buildEvolutionTerm(evolution) {
    var strOut = evolution.species.name.substr(0, 1).toUpperCase() + evolution.species.name.substr(1);
    //strOut += " by ";
    strOut = "By ";
    if ('trigger' in evolution.evolution_details) {
      switch (evolution.evolution_details.trigger.name) {
        case "level-up":
          strOut += " leveling ";
          break;
        case "trade":
          strOut += " trading ";
          break;
        case "use-item":
          strOut += " using ";
          break;
        case "shed":
          strOut += " shedding ";
          break;
        default:
          strOut += " doing something ";
          break;
      }
    } else {
      strOut += " leveling ";
    }
    var conditions = {
      "gender": {
        "label": " as a "
      },
      "held_item": {
        "label": " while holding a(n) "
      },
      "item": {
        "label": " a(n) "
      },
      "known_move": {
        "label": " and knowing the move "
      },
      "known_move_type": {
        "label": " and knowing a move type of "
      },
      "location": {
        "label": " while at "
      },
      "min_affection": {
        "label": " with an affection rating greater than "
      },
      "min_beauty": {
        "label": " with a beauty greater than "
      },
      "min_happiness": {
        "label": " with a happiness greater than "
      },
      "min_level": {
        "label": " to at least "
      },
      "needs_overworld_rain": {
        "label": " while it is raining"
      },
      "party_species": {
        "label": " while accompanied by "
      },
      "party_type": {
        "label": " while accompanied by Pokemon type of "
      },
      "relative_physical_stats": {
        "label": " with a stat of "
      },
      "time_of_day": {
        "label": " at "
      },
      "trade_species": {
        "label": " with "
      },
      "turn_upside_down": {
        "label": " when turned upside down"
      }
    };
    var ok = Object.getOwnPropertyNames(conditions);

    var arrTriggers = new Array();
    for (var elen = evolution.evolution_details.length, e = 0; e < elen; e++) {
      for (var tlen = ok.length, t = 0; t < tlen; t++) {
        var tks = ok[t];
        var trigger = evolution.evolution_details[e][tks];
        if (trigger !== null && trigger !== false) {
          if (typeof (trigger) === "object") {
            var triggerName = trigger.name;
            var triggerNameSplit = triggerName.split("-");
            triggerName = "";
            for (var tnslen = triggerNameSplit.length, tns = 0; tns < tnslen; tns++) {
              triggerName += triggerNameSplit[tns].substr(0, 1).toUpperCase() + triggerNameSplit[tns].substr(1) + " ";
            }
            triggerName = triggerName.trim();
            arrTriggers.push(conditions[ok[t]].label + " " + triggerName.toString());
          } else if ((typeof (trigger) === "string" && trigger !== "") || typeof (trigger) === "number") {
            arrTriggers.push(conditions[ok[t]].label + " " + trigger.toString().substr(0, 1).toUpperCase() + trigger.toString().substr(1));
          }
        }
      }
    }
    strOut += arrTriggers.join(" and ");
    return strOut;
  }
  getLevelMoveSet() {
    var fncFilterMethod = function (e, i) {
      return e.move_learn_method.name === "level-up" && e.level_learned_at > 1;
    };
    var tmp = this.moves.filter(function (e, i) {
      return e.version_group_details.filter(fncFilterMethod).length > 0;
    });
    //var rtnMoves = new Array();
    var rtnMoves = {};
    for (var len = tmp.length, n = 0; n < len; n++) {
      var tmpNew = {
        name: tmp[n].move.name,
        url: tmp[n].move.url,
        levels: {}
      };
      var vgd = tmp[n].version_group_details.filter(fncFilterMethod);
      for (var llen = vgd.length, l = 0; l < llen; l++) {
        var level = vgd[l].level_learned_at;
        //if (typeof (tmpNew.levels[level]) === "undefined") {
        //  tmpNew.levels[level] = new Array();
        //}
        //tmpNew.levels[level].push(vgd[l].version_group.name);
        if (typeof (rtnMoves[level]) === "undefined") {
          rtnMoves[level] = new Array();
        }
        if (rtnMoves[level].filter(function (e) { return e.name === tmp[n].move.name; }).length <= 0) {
          rtnMoves[level].push({
            name: tmp[n].move.name,
            versions: new Array()
          });
        }
        if (rtnMoves[level].filter(function (e) { return e.versions.indexOf(vgd[l].version_group.name) > 0; }).length <= 0) {
          rtnMoves[level].filter(function (e) { return e.name === tmp[n].move.name; })[0].versions.push(vgd[l].version_group.name);
        }
      }
      //rtnMoves.push(tmpNew);
    }


    return rtnMoves;
  }
}
module.exports = Pokemon;

/* GET Pokemon Entry page. */
router.get('/', function (req, res){
  res.render('pokemon/index', {
    title: 'PokeTools'
  });
});

router.get('/compare/stats', function (req, res) {
  res.render('pokemon/compare-stats', {
    title: 'Compare Base Stats',
  });
});

router.get('/:entry', function (req, res) {
  var pokemon = new Pokemon(req.params['entry']);
  if (typeof (pokemon) !== "undefined" && pokemon !== null && typeof (pokemon.nameUpper) !== "undefined" && pokemon.nameUpper !== null) {
    res.render('pokemon/pokemon', {
      title: '#' + pokemon.id + ' ' + pokemon.nameUpper,
      pokemon: pokemon,
      nationalDex: nationalDex,
      gameTitles: gameTitles
    });
  } else {
    res.status(400);
    res.render('error', { error: new Error("Pokemon '" + req.params["entry"] + "' not found!") });
  }
});
router.get('/lite/:entry', function (req, res) {
  var pokemon = new Pokemon(req.params['entry']);
  if (typeof (pokemon) !== "undefined" && pokemon !== null && typeof (pokemon.nameUpper) !== "undefined" && pokemon.nameUpper !== null) {
    res.render('pokemon/pokemon-lite', {
      title: '#' + pokemon.id + ' ' + pokemon.nameUpper,
      pokemon: pokemon,
      nationalDex: nationalDex,
      gameTitles: gameTitles
    });
  } else {
    res.status(400);
    res.render('error', { error: new Error("Pokemon '" + req.params["entry"] + "' not found!") });
  }
});

module.exports = router;



