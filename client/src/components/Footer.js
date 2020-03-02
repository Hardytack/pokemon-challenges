import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Footer extends Component {
    render() {
        return (
            <div id="footer">
                <span>Pokemon Challenges - v.0.4.7.0 - </span>
                <Link to={'/feedback'}>Send Feedback!</Link>
            </div>
        )
    }
}
