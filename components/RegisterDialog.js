import React from 'react';
import moment from 'moment';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import { FormControl } from 'material-ui/Form';
import TextField from 'material-ui/TextField';

class RegisterDialog extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            displayName: '',
            email: '',
            password: '',
        };
    }

    handleFieldChange = name => event => {
        this.setState({ [name]: event.target.value });
    }

    handleCancel = event => {
        event.preventDefault();
        
        this.props.onClose();
    }

    handleSubmit = event => {
        event.preventDefault();

        const { displayName, email, password } = this.state;

        this.props.onSubmit(displayName, email, password);
    }
    
    render() {
        return (
            <Dialog
                fullWidth
                open={this.props.open}
                onRequestClose={this.props.onClose}
            >
                <form>
                    <DialogTitle>Registreren</DialogTitle>
                    <DialogContent>
                            <Grid container>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="displayName"
                                            name="displayName"
                                            onChange={this.handleFieldChange('displayName')}
                                            label="Naam"
                                            type="text"
                                            value={this.state.displayName}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="email"
                                            name="email"
                                            onChange={this.handleFieldChange('email')}
                                            label="Email"
                                            type="email"
                                            value={this.state.email}
                                            fullWidth
                                            required
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="password"
                                            name="password"
                                            onChange={this.handleFieldChange('password')}
                                            label="Wachtwoord"
                                            type="password"
                                            value={this.state.password}
                                            fullWidth
                                            required
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={this.handleSubmit} color="primary">
                            Registreer
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default RegisterDialog;
