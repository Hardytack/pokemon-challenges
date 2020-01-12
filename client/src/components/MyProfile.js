import React, { Component } from 'react';


import RunTable from './RunTable';

export default class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: localStorage.getItem('user'),
            runs: [],
            runTable: <tr><td>loading...</td></tr>
        }
    }

    componentDidMount = async () => {
        await this.fetchUserData();
        await this.createTable();
    }

    fetchUserData = async () => {
        await fetch(`/runs/${this.state.user}`)
        .then(res => res.json())
        .then(data => this.setState({runs: data}))
    }

    logoutUser = async () => {
        const logoutData = {
            username: localStorage.getItem('user'),
            token: localStorage.getItem('token')
        }
        await fetch('/users/logout', {
            method: 'POST',
            body: JSON.stringify(logoutData),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status === 200) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                this.props.history.push('/');
                window.location.reload(true);
            } else {
                console.log('error logging out');
            }
        })
    }

    logoutAll = async () => {
        const logoutData = {
            username: localStorage.getItem('user'),
            token: localStorage.getItem('token')
        }
        await fetch('/users/logoutAll', {
            method: 'POST',
            body: JSON.stringify(logoutData),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status === 200) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                this.props.history.push('/');
                window.location.reload(true);
            } else {
                console.log('error logging out');
            }
        })
    }

    deleteRun = (id) => {

        const deleteData = {
            id: id
        }
        
        fetch(`/runs/delete`, {
            method: 'DELETE',
            body: JSON.stringify(deleteData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.status === 200) {
                window.location.reload(true);
            } else {
                alert('Error deleting')
            }
        })
    }

    createTable = async () => {
        const runTable = await this.state.runs.map(run => {
            return <RunTable run={run} owned={true} key={run._id}></RunTable>
        })
        this.setState({runTable: runTable});
    }

    render() {
        return (
            <div id="userPage">
                <h1>Welcome, {this.state.user}</h1>
                <img src={localStorage.getItem('avatar')} alt={this.state.user}></img>
                <h3>You have completed {this.state.runs.length} run(s)!</h3>
                <table className="myRuns">
                    <thead>
                        <tr>
                            <td>Game</td>
                            <td>Status</td>
                            <td>Pokemon</td>
                            <td>Edit</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.runTable}
                    </tbody>
                    </table>
                <div id="logoutGroup">
                    <button onClick={this.logoutUser}>Logout</button>
                    <button onClick={this.logoutAll}>Logout Everywhere</button>
                </div>
            </div>
        )
    }
}
