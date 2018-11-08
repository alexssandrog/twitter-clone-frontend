import React, { Component } from 'react';
import socket from 'socket.io-client';

import api from '../services/api';
import Tweet from '../components/Tweet';

import twitterLogo from '../twitter.svg';
import './Timeline.css';

export default class Timeline extends Component {
    state = {
        tweets: [],
        newTweet: ''
    }

    handleInputChange = (e) => {
        this.setState({
            newTweet: e.target.value
        });
    }

    handleNewTweet = async (e) => {
        if (e.keyCode !== 13) return;

        const newTweet = this.state.newTweet;
        const author = localStorage.getItem('@GoTwitter:username');

        await api.post('tweets', {
            author: author,
            content: newTweet
        });

        this.setState({ newTweet: '' });
    }

    subscribeToEvents = () => {
        const io = socket('http://localhost:3000');

        io.on('tweet', data => {
            this.setState({ tweets: [data, ...this.state.tweets] });
        });
        io.on('like', data => {
            this.setState({ 
                tweets: this.state.tweets.map(tweet => {
                    if (tweet._id === data._id) {
                        tweet.likes = data.likes;
                    }
                    return tweet;
                })
            });
        });
    }

    async componentDidMount() {
        this.subscribeToEvents();

        const response = await api.get('tweets');

        this.setState({ tweets: response.data });
    }

    render() {
        return (
            <div className="timeline-wrapper">
                <img height={24} src={twitterLogo} alt="Logo" />

                <form>
                    <textarea
                        value={this.state.newTweet}
                        onChange={this.handleInputChange}
                        onKeyDown={this.handleNewTweet}
                        placeholder="O que está ocorrendo?"
                    >
                    </textarea>
                </form>

                <ul className="tweet-list">
                    {this.state.tweets.map(tweet => (
                        <Tweet key={tweet._id} tweet={tweet} />
                    ))}
                </ul>
            </div>
        );
    }
}
