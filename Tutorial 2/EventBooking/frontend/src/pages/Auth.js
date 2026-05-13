import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
  state = {
    isLogin: true,
    isLoading: false,
    error: null
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => ({
      isLogin: !prevState.isLogin,
      error: null
    }));
  };

  submitHandler = event => {
    event.preventDefault();

    const email = this.emailEl.current.value.trim();
    const password = this.passwordEl.current.value.trim();

    if (email.length === 0 || password.length === 0) {
      this.setState({ error: 'Please enter a valid email and password.' });
      return;
    }

    this.setState({ isLoading: true, error: null });

    let requestBody;

    if (this.state.isLogin) {
      requestBody = {
        query: `
          query Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              userId
              token
              tokenExpiration
            }
          }
        `,
        variables: { email, password }
      };
    } else {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: { email: $email, password: $password }) {
              _id
              email
            }
          }
        `,
        variables: { email, password }
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Server error. Please try again.');
        }
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error(resData.errors[0].message);
        }

        if (this.state.isLogin) {
          const { token, userId, tokenExpiration } = resData.data.login;
          if (!token) {
            throw new Error('No token received. Please try again.');
          }
          this.context.login(token, userId, tokenExpiration);
        } else {
          if (resData.data && resData.data.createUser) {
            this.setState({ isLogin: true, isLoading: false });
            alert(`Account created for ${resData.data.createUser.email}. Please log in.`);
          }
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({ error: err.message, isLoading: false });
      });
  };

  render() {
    const { isLogin, isLoading, error } = this.state;

    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

        {error && <p className="auth-error">{error}</p>}

        <div className="form-control">
          <label htmlFor="email">E-Mail</label>
          <input type="email" id="email" ref={this.emailEl} />
        </div>

        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordEl} />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : 'Submit'}
          </button>
          <button type="button" onClick={this.switchModeHandler} disabled={isLoading}>
            Switch to {isLogin ? 'Signup' : 'Login'}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;