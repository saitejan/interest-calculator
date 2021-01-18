import React, { Component } from 'react';
import axios from 'axios';
import constants from ".././config"
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'

class Details extends Component {
    constructor(props) {
        super(props);
        this.state = {
            txns: [],
            txn: {},
            show: false,

        }
    }

    closePopup = () => {
        this.setState({ show: false })
    }


    calculateInterest = txn => {
        let interest = 0;
        let months;
        let d1 = new Date(txn.date), d2 = new Date();
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        let dts = d2.getDate() - d1.getDate()
        if (dts < 0) {
            months -= 1;
            dts = 30+dts
        }
        months += dts / 30
        interest = txn.amount * (txn.interest / 100) * months
        return interest;
    }

    getUsers = async () => {
        let [name, number] = [localStorage.uname, localStorage.number]
        const response = await axios({
            method: "GET",
            url: constants.url + "users/" + name + "/" + number,
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${localStorage.token}`
            }
        });
        if (response.status === 200) {
            if (response.data) {
                this.setState({
                    user: response.data.user
                })
                localStorage.user = JSON.stringify(response.data.user)
            }
        }
    }


    componentDidMount() {
        const tkn = localStorage.token
        if (tkn && tkn !== "false") {
            if (localStorage.loginType === 'Local') {
                let txns = JSON.parse(localStorage[tkn]).data || []
                this.setState({
                    txns
                })
            } else {
                // for cloud
            }
        } else {
            this.props.history.push('/')
        }
    }

    changeState = (event, param) => {
        this.setState({
            [param]: event
        })
    }

    logOut = () => {
        localStorage.token = false;
        this.props.history.push('/')
    }

    goBack = () => {
        this.props.history.push('/home')
    }

    changeUserState = (event, param) => {
        let txn = JSON.parse(JSON.stringify(this.state.txn))
        if (param === "amount") event = Number(event)
        txn[param] = event
        this.setState({
            txn
        })
    }

    validateForm = () => {
        if (!this.state.txn.name) return false
        return this.state.txn.name.length > 0 && this.state.txn.amount > 0 && this.state.txn.interest && this.state.txn.date;
    }

    Add = () => {
        this.setState({ show: true, user: { name: "", interest: "", amount: 0, date: '' } })
    }

    cleared = index => {
        let tkn = localStorage.token
        let txns = JSON.parse(localStorage[tkn])
        txns.data.splice(index,1)
        localStorage[tkn] = JSON.stringify(txns);
        this.setState({
            txns: txns.data
        })
    }


    handleSubmit = async (event) => {
        event.preventDefault();
        let txn = JSON.parse(JSON.stringify(this.state.txn))
        txn.amount = Number(txn.amount)
        let tkn = localStorage.token
        let txns = JSON.parse(localStorage[tkn])
        txns.data.push(txn)
        localStorage[tkn] = JSON.stringify(txns);
        this.setState({
            txns: txns.data
        })

        // const response = await axios({
        //     method: "POST",
        //     url: constants.url + "users",
        //     data: user,
        //     headers: {
        //         'content-type': 'application/json',
        //         Authorization: `Bearer ${localStorage.token}`
        //     }
        // });
        // if (response.status === 201) {
        //     if (response.data) {
        //         let users = JSON.parse(JSON.stringify(this.state.txns))
        //         users.push(response.data.user)
        //         localStorage.users = JSON.stringify(users)
        //         this.setState({ users: users, show: false })
        //     }
        // }
    }


    render() {
        return (
            <div className="">

                <Container>
                    <Row>
                        <div>
                            {localStorage.role === "admin" ? (<Button variant="info" onClick={this.goBack}>Back</Button>) : ""}
                            <Button variant="primary" onClick={this.Add}>Add Transaction</Button>
                            {localStorage.role !== "admin" ? (<Button variant="danger" onClick={this.logOut}>Log Out</Button>) : ""}
                        </div>
                    </Row>

                    <div>
                        <Table responsive striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Interest Rate</th>
                                    <th>Date</th>
                                    <th>Interest Value</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.txns ? this.state.txns.map((txn,i) => <tr>
                                    <td>{txn.name}</td>
                                    <td>{txn.amount}</td>
                                    <td>{txn.interest}</td>
                                    <td>{txn.date}</td>
                                    <td>{this.calculateInterest(txn)}</td>
                                    <td>{txn.desc}</td>
                                    <td>
                            <Button variant="primary" onClick={()=>this.cleared(i)}>Cleared</Button>
                                    </td>
                                </tr>) : null}
                            </tbody>
                        </Table>
                    </div>
                </Container>


                <Modal
                    show={this.state.show}
                    onHide={() => this.closePopup(false)}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Add Transaction
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Name</Form.Label>
                                <Form.Control value={this.state.txn.name} onChange={e => this.changeUserState(e.target.value, 'name')} type="text" placeholder="Enter name" />
                            </Form.Group>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Interest</Form.Label>
                                <Form.Control type="text" value={this.state.txn.interest}
                                    onChange={e => this.changeUserState(e.target.value, 'interest')} placeholder="Interest Rate" />
                            </Form.Group>
                            <Form.Group controlId="formBasicAmount">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control type="text" value={this.state.txn.amount}
                                    onChange={e => this.changeUserState(e.target.value, 'amount')} placeholder="amount" />
                            </Form.Group>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Date</Form.Label>
                                <Form.Control type="date" value={this.state.txn.date}
                                    onChange={e => this.changeUserState(e.target.value, 'date')} placeholder="date" />
                            </Form.Group>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Description</Form.Label>
                                <Form.Control type="text" value={this.state.txn.desc}
                                    onChange={e => this.changeUserState(e.target.value, 'desc')} placeholder="Description" />
                            </Form.Group>

                            <Button variant="primary" disabled={!this.validateForm()} type="submit">
                                Save
                             </Button>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closePopup}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}

export default Details;
