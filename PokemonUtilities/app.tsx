declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

class PokeCard extends React.Component {
  constructor(props) {
    super(props);
    this.pokemon = null;//new Pokemon(props.pokemon);
  }

  render() {
    if (this.pokemon !== null) {
      return (
        <div class="poke-card">
          <img src="{this.pokemon.sprites.front_default}" />
          <h1 title="Name">
            <span aria-label="National 'Dex Number" name="{this.pokemon.id}">
              {this.pokemon.id}
            </span>
            <span aria-label="Name" name="{this.pokemon.name}">
              {this.pokemon.name}
            </span>
          </h1>
          <h4 title="Genus Name">
            <span aria-label="Genus Name" name="{this.pokemon.species.genera[2].genus}">
              {this.pokemon.species.genera[2].genus}
            </span>
          </h4>
        </div>
      );
    } else {
      return null;
    }
  }
}