import React, { Component } from 'react';
import axios from 'axios';
import constants from "./config"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import "./login.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      password: "",
      lname: "",
      lpassword: "",
      localorcloud: "Cloud",
      loginorsignup: 0,
      localorcloudmap: {
        "Local": "Cloud",
        "Cloud": "Local",
      }
    }
  }

  localSave = () => {
    let { lname, lpassword } = this.state
    if (!lname) return alert('Account Name is required')
    else if (!lpassword) return alert('Password is required')
    if (localStorage[lname]) {
      return alert('Account Already Exists')
    }
    localStorage[lname] = JSON.stringify({ password: lpassword, data: [] })
    this.setState({ loginorsignup: !this.state.loginorsignup, lname: "", lpassword: "" });
    localStorage.loginType = 'Local';
    localStorage.token = lname;
    this.props.history.push('/details');
  }

  switchToSignUp = () => {
    let loginorsignup = !this.state.loginorsignup
    return this.setState({ loginorsignup, lname: "", lpassword: "" });
  }

  localLogin = () => {
    let { lname, lpassword } = this.state
    if (!lname) return alert('Name is required')
    else if (!lpassword) return alert('Password is required')
    if (!localStorage[lname]) {
      return alert('Account Doesn\'t Exists')
    }
    localStorage.loginType = 'Local';
    localStorage.token = lname;
    this.props.history.push('/details');
  }



  validateForm = () => {
    return this.state.name.length > 0 && this.state.password.length > 0;
  }


  switchTo = (name) => {
    let localorcloud = this.state.localorcloudmap[name]
    return this.setState({ localorcloud });
  }


  componentDidMount() {
    if (localStorage.token && localStorage.token !== "false") {
      if (localStorage.role !== "admin") {
        this.props.history.push('/details');
      } else {
        this.props.history.push('/home');
      }
    }
  }

  changeState = (event, param) => {
    this.setState({
      [param]: event
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios({
      method: "POST",
      url: constants.url + "login",
      data: {
        username: this.state.name,
        password: this.state.password
      },
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer `
      }
    });
    if (response.status === 200) {
      if (response.data) {
        localStorage.role = response.data.role
        localStorage.token = response.data.token
        if (response.data.role === "admin") {
          this.props.history.push('/home');
        } else {
          let [name, number] = localStorage.token.split(',?,')
          localStorage.uname = name
          localStorage.number = number
          this.props.history.push('/details');
        }
      }
    }
  }

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          {/* <div>
            <Button variant="primary" onClick={() => this.switchTo(this.state.localorcloud)}>
              Switch to {this.state.localorcloud}
            </Button>
          </div> */}
          {(this.state.localorcloud === "Local") ? <>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Name</Form.Label>
              <Form.Control value={this.state.name} onChange={e => this.changeState(e.target.value, 'name')} type="text" placeholder="Enter name" />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="text" value={this.state.password}
                onChange={e => this.changeState(e.target.value, 'password')} placeholder="Password" />
            </Form.Group>
            <Button variant="primary" disabled={!this.validateForm()} type="submit">
              Login
            </Button>
          </> : <>

            {(this.state.loginorsignup) ? <>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Name</Form.Label>
                <Form.Control value={this.state.lname} onChange={e => this.changeState(e.target.value, 'lname')} type="text" placeholder="Enter name" />
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="text" value={this.state.lpassword}
                  onChange={e => this.changeState(e.target.value, 'lpassword')} placeholder="Password" />
              </Form.Group>
              <Button variant="primary" onClick={() => this.localLogin()}>
                Login
              </Button>

              <Button variant="primary" onClick={() => this.switchToSignUp()}>
                Sign Up/Create New Account
              </Button>
            </> : <>

              <Form.Group controlId="formBasicEmail">
                <Form.Label>Name</Form.Label>
                <Form.Control value={this.state.lname} onChange={e => this.changeState(e.target.value, 'lname')} type="text" placeholder="Enter name" />
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="text" value={this.state.lpassword}
                  onChange={e => this.changeState(e.target.value, 'lpassword')} placeholder="Password" />
              </Form.Group>
              <Button variant="primary" onClick={() => this.localSave()}>
                Create and Login
              </Button>
              <Button variant="primary" onClick={() => this.localLogin()}>
                Login
              </Button>
            </>
            }
          </>
          }
        </Form>
      </div>
    );
  }
}

export default App;
