var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var React = require('react');
var ReactDOM = require('react-dom');
var PokeCard = /** @class */ (function (_super) {
    __extends(PokeCard, _super);
    function PokeCard(props) {
        var _this = _super.call(this, props) || this;
        _this.pokemon = null; //new Pokemon(props.pokemon);
        return _this;
    }
    PokeCard.prototype.render = function () {
        if (this.pokemon !== null) {
            return (React.createElement("div", { class: "poke-card" },
                React.createElement("img", { src: "{this.pokemon.sprites.front_default}" }),
                React.createElement("h1", { title: "Name" },
                    React.createElement("span", { "aria-label": "National 'Dex Number", name: "{this.pokemon.id}" }, this.pokemon.id),
                    React.createElement("span", { "aria-label": "Name", name: "{this.pokemon.name}" }, this.pokemon.name)),
                React.createElement("h4", { title: "Genus Name" },
                    React.createElement("span", { "aria-label": "Genus Name", name: "{this.pokemon.species.genera[2].genus}" }, this.pokemon.species.genera[2].genus))));
        }
        else {
            return null;
        }
    };
    return PokeCard;
}(React.Component));
//# sourceMappingURL=app.js.map