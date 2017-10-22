import React from 'react';
import moment from 'moment';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import MenuItem from 'material-ui/Menu/MenuItem';
import TextField from 'material-ui/TextField';

class AddActivityButton extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            activity: Object.values(props.activities)[0],
            time: '07:00',
        };
    }

    handleFieldChange = name => event => {
        this.setState({
            [name]: event.target.value,
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

        this.setState({
            activity: Object.values(this.props.activities)[0],
            time: '07:00',
        });
    }
    
    render() {
        const { activities, classes } = this.props;
        
        return (
            <Dialog
                fullWidth
                open={this.props.open}
                onRequestClose={this.props.onClose}
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
                                        onChange={this.handleFieldChange('activity')}
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
                                        onChange={this.handleFieldChange('time')}
                                        label="Tijd"
                                        type="time"
                                        value={this.state.time}
                                        inputProps={{
                                            step: 300, // 5 min
                                        }}
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
                            Toevoegen
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default AddActivityButton;
