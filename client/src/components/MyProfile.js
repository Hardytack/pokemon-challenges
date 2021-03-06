import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import Loading from '../img/Loading.png';

import TableGenerator from '../utils/TableGenerator';
import { fetchUserFeatRun, fetchUserPic, fetchBadges, confirmPassword, logoutUser, logoutAll } from '../utils/userFunction';
import { capitalizeString } from '../utils/common';

export default class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: localStorage.getItem('user'),
            runs: [],
            runTable: <tr><td>loading...</td></tr>,
            newAvatar: null,
            userAvatar: '',
            badges: '',
            featuredRun: {
                img: <img src={Loading} alt='Placeholder' />,
                variation: 'Loading',
                name: 'Loading',
                id: '',
                completed: 'Loading'
            }
        }
        this.fetchUserFeatRun = fetchUserFeatRun.bind(this);
        this.fetchUserPic = fetchUserPic.bind(this);
        this.fetchBadges = fetchBadges.bind(this);
        this.logoutUser = logoutUser.bind(this);
        this.logoutAll = logoutAll.bind(this);
    }

    componentDidMount = async () => {
        await this.fetchUserPic(this.state.user);
        await this.fetchUserRuns();
        await this.fetchBadges(this.state.user);
        await this.createTable();
        await this.fetchUserFeatRun(this.state.user);
    }

    fetchUserRuns = async () => {
        await fetch(`/runs/${this.state.user}`)
            .then(res => res.json())
            .then(data => this.setState({ runs: data }))
    }

    createTable = async () => {
        const runTable = await this.state.runs.map(run => {
            return <TableGenerator type='myRuns' run={run} key={run._id} />
        })
        this.setState({ runTable: runTable });
    }

    handleImage = (e) => {
        this.setState({
            newAvatar: e.target.files[0]
        })
    }

    deleteProfile = async () => {
        const confirm = await confirmPassword();
        if (confirm) {
            const deleteData = {
                username: this.state.user
            }

            await fetch('/users/deleteProfile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Username': `${localStorage.getItem('user')}`
                },
                body: JSON.stringify(deleteData)
            })
                .then(res => {
                    if (res.status === 200) {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        this.props.history.push('/');
                        window.location.reload(true);
                    } else {
                        console.log('error deleting profile');
                    }
                })
        } else {
            alert('Your password is incorrect');
            return
        }
    }

    uploadNewAvatar = async (e) => {
        e.preventDefault();

        if (this.state.newAvatar === null) {
            return alert('Please select a file!');
        }

        if (this.state.newAvatar.size > 2000000) {
            return alert('File size is too large');
        }

        if (this.state.newAvatar.type !== 'image/png' && this.state.newAvatar.type !== 'image/jpeg') {
            return alert('Please select a png or jpeg file!');
        }

        const fd = new FormData();
        fd.append('name', this.state.user);
        fd.append('type', 'users');
        fd.append('image', this.state.newAvatar, 'avatar.png');
        await fetch('/users/newAvatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Username': `${localStorage.getItem('user')}`
            },
            body: fd
        })
            .then(res => res.json())
            .then(data => {
                window.location.reload(true);
            });
    }

    render() {
        return (
            <div id="userPage">
                <h1>Welcome, {this.state.user}</h1>
                <img src={this.state.userAvatar} alt={this.state.user}></img>
                <h3 className='countedRuns'>You have submitted {this.state.runs.length} run(s)!</h3>
                <div id="userBadges">
                    <h2>Badges</h2>
                    <div id="badgeBox">
                        {this.state.badges}
                    </div>
                </div>
                <div id="featGame">
                    <h2>Featured Run!</h2>
                    {this.state.featuredRun.img}
                    <h3>{capitalizeString(this.state.featuredRun.variation)}<span>{capitalizeString(this.state.featuredRun.completed)}</span></h3>
                </div>
                <table className="myRuns">
                    <thead>
                        <tr>
                            <td>Game</td>
                            <td className="nonMobile">Status</td>
                            <td className="nonMobile">Pokemon</td>
                            <td>Edit</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.runTable}
                    </tbody>
                </table>
                <form onSubmit={this.uploadNewAvatar} id="newAvatar">
                    <label>Upload New Avatar</label>
                    <input type="file" id="avatarUpload" name="upload" onChange={this.handleImage}></input>
                    <button>Upload</button>
                </form>
                <div id="changePasswordGroup">
                    <button><Link to='/change-password'>Change Password</Link></button>
                </div>
                <div id="logoutGroup">
                    <button onClick={this.logoutUser}>Logout</button>
                    <button onClick={this.logoutAll}>Logout Everywhere</button>
                </div>
                <button id="deleteProfile" onClick={this.deleteProfile}>Delete Profile</button>
            </div>
        )
    }
}
