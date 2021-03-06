import React, { Component } from 'react';
import { checkFilter, capitalizeString } from '../utils/common';

import Pokemon from './Pokemon';
import Comment from './Comment';
import RunOwnerPanel from './RunOwnerPanel';

export default class Run extends Component {
    constructor(props) {
        super(props);
        this.state = {
            runId: this.props.match.params.id,
            runPokemon: [],
            runGame: '',
            runUser: '',
            runStatus: '',
            runVariation: '',
            runComments: [],
            pokemonList: <tr><td>loading...</td></tr>,
            commentText: '',
            comments: [],
            runNotes: '',
            runRandomized: ''
        }
        this.goBack = this.goBack.bind(this);
    }

    async componentDidMount() {
        await fetch(`/runs/view/${this.state.runId}`)
            .then(res => res.json())
            .then(data => {
                this.setState({
                    runPokemon: data.pokemon,
                    runGame: data.game,
                    runUser: data.user,
                    runStatus: capitalizeString(data.completed),
                    runVariation: capitalizeString(data.variation),
                    runComments: data.comments,
                    runNotes: data.runNotes,
                    runRandomized: capitalizeString(data.randomized),
                })
            });
        await fetch(`/games/gameName/${this.state.runGame}`)
            .then(res => res.json())
            .then(data => this.setState({ runGame: data.game }));
        this.listPokemon();
        this.loadComment();
        if (document.getElementById('runNote').offsetHeight < 300) {
            document.getElementById('showMoreButton').classList.add('hideButton');
        }
    }

    handleComment = async (e) => {
        e.preventDefault();

        const submitButton = document.getElementById('submitComment');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting...';

        const commentCheck = await checkFilter(this.state.commentText);
        if (commentCheck.check) {
            submitButton.disabled = false;
            submitButton.innerHTML = "Submit";
            return alert(`Comment contains banned word: ${commentCheck.value}`);
        }

        const regex = /^[\w\s.,&!"'#&{}%€$^()-_@\\\r\n/$ ]+$/i;
        const confirmComment = this.state.commentText.match(regex);
        if (!confirmComment) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit';
            return alert('Your comment contains unsupported characters!')
        }

        if (this.state.commentText.length > 1000) {
            submitButton.innerHTML = 'Submit';
            submitButton.disabled = false;
            return alert('Notes are longer than character limit of 500');
        }

        const data = {
            runId: this.state.runId,
            username: localStorage.getItem('user'),
            message: this.state.commentText,
            posted: Date.now()
        }

        await fetch('/runs/newComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Username': `${localStorage.getItem('user')}`
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => window.location.reload(true))
    }

    listPokemon = async () => {
        const list = this.state.runPokemon.map(poke => {
            return <Pokemon key={poke.pokemon} data={poke} />
        })
        this.setState({ pokemonList: list })
    }

    handleCommentText = (e) => {
        this.setState({
            commentText: e.target.value
        })
    }

    loadComment = () => {
        const comments = this.state.runComments.map(com => {
            return <Comment key={com._id} user={com.user} time={com.posted} message={com.message} runId={this.state.runId} commentId={com._id} />
        })
        this.setState({ comments: comments })
    }

    toggleMore = (e) => {
        document.getElementById('runNote').classList.toggle('max-height');
        if (e.target.innerHTML === 'Show More') {
            e.target.innerHTML = "Show Less"
        } else {
            e.target.innerHTML = "Show More"
        }
    }

    goBack() {
        this.props.history.goBack();
    }

    renderComment = () => {
        if (localStorage.getItem('user') !== null && localStorage.getItem('token') !== null) {
            return (
                <form id="newcomment" onSubmit={this.handleComment}>
                    <label>Leave a Comment!</label>
                    <textarea onChange={this.handleCommentText} value={this.state.commentText} placeholder="Write a comment"></textarea>
                    <button id="submitComment">Submit</button>
                </form>
            )
        } else {
            return ('')
        }
    }


    render() {
        return (
            <div>
                <p className="goBack" onClick={this.goBack}>Go back</p>
                {this.state.runUser === localStorage.getItem('user') ? <RunOwnerPanel user={this.state.runUser} runId={this.state.runId} /> : ''}
                <table className="runTable">
                    <thead>
                        <tr>
                            <td colSpan='2'>Run Info</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>User</td>
                            <td>{this.state.runUser}</td>
                        </tr>
                        <tr>
                            <td>Game</td>
                            <td>{this.state.runGame}</td>
                        </tr>
                        <tr>
                            <td>Mode</td>
                            <td>{this.state.runVariation}</td>
                        </tr>
                        <tr>
                            <td>Randomized</td>
                            <td>{this.state.runRandomized}</td>
                        </tr>
                        <tr>
                            <td>Status</td>
                            <td>{this.state.runStatus}</td>
                        </tr>
                        <tr>
                            <td>Pokemon Caught</td>
                            <td>{this.state.runPokemon.length}</td>
                        </tr>
                    </tbody>
                </table>
                <table>
                    <thead>
                        <tr>
                            <td>Pokemon Used</td>
                            <td>Status</td>
                            <td className="nonMobile">Nickname</td>
                            <td className="nonMobile"></td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.pokemonList}
                    </tbody>
                </table>
                <div id="runNotes">
                    <h3>User Notes:</h3>
                    <p id="runNote" className="max-height">{this.state.runNotes}</p>
                    <button id="showMoreButton" className="showMore" onClick={this.toggleMore}>Show More</button>
                    <hr></hr>
                </div>
                <div id="commentContainer">
                    {this.renderComment()}
                    <h5>All Comments! ({this.state.runComments.length})</h5>
                    {this.state.comments}
                </div>
            </div>
        )
    }
}
