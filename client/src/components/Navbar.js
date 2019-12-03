import React, { Component } from 'react'
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Link } from 'react-router-dom';

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hardy: 'tack',
            list: ''
        }
    }
    async componentDidMount() {
        const gameList = await this.callGames();
        const linkList = gameList.map(game => {
            return <li key={game.id}><Link to={`/game/${game.gameCode}`}>{game.name}</Link></li>
        })
        this.setState({
            list: linkList
        })
    }

    callGames = async () => {
        return fetch('/games/all')
        .then(res => res.json())
        .then(games => games);
    }

    render() {
        return (
            <div>
                <nav className='navbar'>
                <h1>P.C.</h1>
                <ul>
                    <li><Link to={'/'}>Home</Link></li>
                    <li><Link to={'/game-list'}>Games</Link></li>
                    <li><Link to={'/about'}>About</Link></li>
                    {/* {this.state.list} */}
                </ul>
            </nav>
            </div>
        )
    }
}


export default Navbar;



