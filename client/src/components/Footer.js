import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Footer extends Component {
    render() {
        return (
            <div id="footer">
                <span>Michael Boro - Pokemon Challenges - 2020 - </span>
                <Link to={'/feedback'}>Send Feedback!</Link>
            </div>
        )
    }
}
