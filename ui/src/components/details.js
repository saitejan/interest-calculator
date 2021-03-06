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
            editIndex: 0,
            totalInterestPerDay: 0

        }
    }

    closePopup = () => {
        this.setState({ show: false })
    }


    calculateInterest = (txns, needtotals) => {
        let totalAmount = 0, totalInterest = 0, totalInterestPerDay = 0;
        txns = txns.map(txn => {
            let interest = 0;
            let interestPerDay = 0;
            let months;
            let d1 = new Date(txn.date), d2 = new Date();
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            let dts = d2.getDate() - d1.getDate()
            if (dts < 0) {
                months -= 1;
                dts = 30 + dts
            }
            months += dts / 30
            interestPerDay = txn.amount * (txn.interest / 100) * (1 / 30)
            interest = txn.amount * (txn.interest / 100) * months

            interest = +(interest % 1 !== 0 ? interest.toFixed(2) : interest)
            interestPerDay = +(interestPerDay % 1 !== 0 ? interestPerDay.toFixed(2) : interestPerDay)
            txn.interestPerDay = interestPerDay
            txn.interestValue = interest
            totalInterestPerDay += interestPerDay
            totalAmount += txn.amount
            totalInterest += interest
            return txn;
        })
        if (!needtotals) return txns;
        totalAmount = +(totalAmount % 1 !== 0 ? totalAmount.toFixed(2) : totalAmount)
        totalInterest = +(totalInterest % 1 !== 0 ? totalInterest.toFixed(2) : totalInterest)
        totalInterestPerDay = +(totalInterestPerDay % 1 !== 0 ? totalInterestPerDay.toFixed(2) : totalInterestPerDay)

        return {
            txns,
            totalAmount,
            totalInterest,
            totalInterestPerDay
        }
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
                let localData = JSON.parse(localStorage[tkn])
                let txns = localData.data || []
                const resp = this.calculateInterest(txns, 1)
                txns = resp.txns
                localData.data = txns
                localStorage[tkn] = JSON.stringify(localData)
                this.setState({
                    txns,
                    totalAmount: resp.totalAmount,
                    totalInterestPerDay: resp.totalInterestPerDay,
                    totalInterest: resp.totalInterest,
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


    edit = (i) => {
        this.setState({ show: 'Edit', editIndex: i, txn: { ...this.state.txns[i] } })
    }

    Add = () => {
        this.setState({ show: 'Add', txn: { name: "", interest: "", amount: 0, date: '' } })
    }


    import = () => {

    }

    export = () => {
        let filename = localStorage.token + " " + new Date().toDateString() + ".csv"
        var csv = [];
        var rows = document.querySelectorAll("table#exportTable tr");
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td, th");
            for (var j = 0; j < cols.length - 1; j++) {
                var tempText = cols[j]['innerText'].replace(',', '');
                row.push(tempText);
            }
            csv.push(row.join(","));
        }

        csv = csv.join("\n")
        var csvFile;
        var downloadLink;
        // CSV file
        csvFile = new Blob([csv], { type: "text/csv" });
        // Download link
        downloadLink = document.createElement("a");
        // File name
        downloadLink.download = filename;
        // Create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);
        // Hide download link
        downloadLink.style.display = "none";
        // Add the link to DOM
        document.body.appendChild(downloadLink);
        // Click download link
        downloadLink.click();
    }

    cleared = index => {
        let vl = window.confirm('Do you really want to clear')
        if(!vl) return;
        let tkn = localStorage.token
        let txns = JSON.parse(localStorage[tkn])
        txns.data.splice(index, 1)
        let resp = this.calculateInterest(txns.data, 1)
        txns.data = resp.txns
        localStorage[tkn] = JSON.stringify(txns);
        this.setState({
            totalAmount: resp.totalAmount,
            totalInterest: resp.totalInterest,
            totalInterestPerDay: resp.totalInterestPerDay,
            txns: txns.data
        })
    }


    handleSubmit = async (event) => {
        event.preventDefault();
        let txn = JSON.parse(JSON.stringify(this.state.txn))
        txn.amount = Number(txn.amount)
        let tkn = localStorage.token
        let txns = JSON.parse(localStorage[tkn])
        if (this.state.show === 'Edit') {
            txns.data[this.state.editIndex] = txn;
        } else txns.data.push(txn)
        let resp = this.calculateInterest(txns.data, 1)
        txns.data = resp.txns
        localStorage[tkn] = JSON.stringify(txns);
        this.setState({
            totalAmount: resp.totalAmount,
            totalInterest: resp.totalInterest,
            totalInterestPerDay: resp.totalInterestPerDay,
            txns: txns.data, show: false, txn: { name: "", interest: "", amount: 0, date: '' }
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
                            <Button variant="primary" onClick={this.export}>Export</Button>
                            {/* <Button variant="primary" onClick={this.import}>Import</Button> */}
                            {localStorage.role !== "admin" ? (<Button variant="danger" onClick={this.logOut}>Log Out</Button>) : ""}
                        </div>
                    </Row>

                    <div>
                        <Table id="exportTable" responsive striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>IRate</th>
                                    <th>Date</th>
                                    <th>IValue</th>
                                    <th>IPerDay</th>
                                    <th>Desc</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.txns ? this.state.txns.map((txn, i) => <tr>
                                    <td>{txn.name}</td>
                                    <td>{txn.amount}</td>
                                    <td>{txn.interest}</td>
                                    <td>{txn.date}</td>
                                    <td>{txn.interestValue}</td>
                                    <td>{txn.interestPerDay}</td>
                                    <td>{txn.desc}</td>
                                    <td>
                                        <Button variant="primary" onClick={() => this.edit(i)}>Edit</Button>
                                        <Button variant="primary" onClick={() => this.cleared(i)}>Cleared</Button>
                                    </td>
                                </tr>) : null}
                                <tr>
                                    <td>Total</td>
                                    <td>{this.state.totalAmount}</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>{this.state.totalInterest}</td>
                                    <td>{this.state.totalInterestPerDay}</td>
                                    <td>-</td>
                                </tr>
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
                            {this.state.show} Transaction
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
