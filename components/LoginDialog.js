import React from 'react';
import moment from 'moment';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import { FormControl } from 'material-ui/Form';
import TextField from 'material-ui/TextField';

class LoginDialog extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            email: '',
            password: '',
            error: null,
        };
    }

    handleEmailChange = event => {
        this.setState({ email: event.target.value });
    }

    handlePasswordChange = event => {
        this.setState({ password: event.target.value });
    }

    handleCancel = event => {
        event.preventDefault();
        
        this.props.onClose();
    }

    handleSubmit = event => {
        event.preventDefault();

        const { email, password } = this.state;

        this.props.onSubmit(email, password)
            .then(() => this.setState({
                email: '',
                password: '',
                error: null,
            }))
            .catch(error => this.setState({ error }));
    }
    
    render() {
        return (
            <Dialog
                fullWidth
                open={this.props.open}
                onRequestClose={this.props.onClose}>
                <form>
                    <DialogTitle>Inloggen</DialogTitle>
                    <DialogContent>
                        <Grid container>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        id="email"
                                        name="email"
                                        onChange={this.handleEmailChange}
                                        label="Email"
                                        type="email"
                                        value={this.state.email}
                                        fullWidth
                                        required />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        id="password"
                                        name="password"
                                        onChange={this.handlePasswordChange}
                                        label="Wachtwoord"
                                        type="password"
                                        value={this.state.password}
                                        fullWidth
                                        required />
                                </FormControl>
                            </Grid>
                            {this.state.error && 
                                <Grid item xs={12} style={{ color: 'red' }}>
                                    <small>
                                        {this.state.error.message}
                                    </small>
                                </Grid>}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={this.handleSubmit} color="primary">
                            Login
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default LoginDialog;
