import React from 'react';
import moment from 'moment';

import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import MenuItem from 'material-ui/Menu/MenuItem';
import TextField from 'material-ui/TextField';

import AddIcon from 'material-ui-icons/Add';

const styles = theme => ({
    button: {
        position: 'fixed',
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
    },
  });

const getDefaultState = activities => ({
    activity: Object.values(activities)[0],
    time: '07:00',
});

class AddActivityButton extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            dialogOpen: false,
            ...getDefaultState(props.activities),
        };
    }

    handleActivityChange = event => {
        this.setState({
            activity: event.target.value,
        });
    };

    handleTimeChange = event => {
        this.setState({
            time: event.target.value,
        });
    };

    handleSubmit = event => {
        event.preventDefault();

        const { activity, time } = this.state;
        const [hour, minute] = time.split(':');

        this.props.onSubmit({
            activity,
            time: moment({ hour, minute }).format('YYYY-MM-DD HH:mm:ss'),
        });

        this.setState({ dialogOpen: false });
    }

    handleClickOpen = event => {
        this.setState({ dialogOpen: true, anchorEl: event.currentTarget });
    };

    handleRequestClose = event => {
        this.setState({ dialogOpen: false });
    };
    
    render() {
        const { activities, classes } = this.props;
        
        return (
            <div>
                <Button fab color="primary" aria-label="add" color="primary" onClick={this.handleClickOpen} className={classes.button}>
                    <AddIcon />
                </Button>
                <Dialog
                    fullWidth
                    open={this.state.dialogOpen}
                    onRequestClose={this.handleRequestClose}
                >
                    <form>
                        <DialogTitle>Activiteit toevoegen</DialogTitle>
                        <DialogContent>
                                <Grid container>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel htmlFor="activity">Activiteit</InputLabel>
                                            <Select
                                                name="activity"
                                                onChange={this.handleActivityChange}
                                                value={this.state.activity}
                                                input={<Input id="activity" />}
                                                fullWidth
                                                required
                                            >
                                                {Object.values(activities).map(activity => (
                                                    <MenuItem key={activity} value={activity}>
                                                        {activity}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <TextField
                                                id="time"
                                                name="time"
                                                onChange={this.handleTimeChange}
                                                label="Tijd"
                                                type="time"
                                                value={this.state.time}
                                                fullWidth
                                                required
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleRequestClose}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={this.handleSubmit} color="primary">
                                Ok
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(AddActivityButton);
