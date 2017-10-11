import React from 'react';
import Head from 'next/head';
import * as firebase from 'firebase';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import { CSVLink } from 'react-csv';

import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Badge from 'material-ui/Badge';
import Grid from 'material-ui/Grid';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import { withStyles } from 'material-ui/styles';
import { FormControl } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import TextField from 'material-ui/TextField';
import { SnackbarContent } from 'material-ui/Snackbar';
import List, {
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
} from 'material-ui/List';

import AddIcon from 'material-ui-icons/Add';
import DeleteIcon from 'material-ui-icons/Delete';

import OneIcon from 'material-ui-icons/LooksOne';
import TwoIcon from 'material-ui-icons/LooksTwo';
import ThreeIcon from 'material-ui-icons/Looks3';
import FourIcon from 'material-ui-icons/Looks4';
import FiveIcon from 'material-ui-icons/Looks5';
import FolderIcon from 'material-ui-icons/Folder';
import InputIcon from 'material-ui-icons/Input';

const ACTIVITIES = {
    WASH: 'wassen',
    SHOWER: 'douchen',
    DRESS: 'aankleden',
    BREAKFAST: 'ontbijten',
    READ_NEWSPAPER: 'krant lezen',
    CHECK_MAIL: 'email checken',
    TRAVEL_BY_BIKE: 'per fiets reizen',
    TRAVEL_BY_CAR: 'per auto reizen',
    TRAVEL_BY_PUBLIC_TRANSPORT: 'per ov reizen',
    DROP_OFF_KIDS: 'kids wegbrengen',
};

const MAX_ACTIVITIES = 5;

const defaultFormState = {
    activity: Object.values(ACTIVITIES)[0],
    time: '08:00',
};

const styles = theme => ({
    container: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    flex: {
        flex: 1,
    },
    button: {
        position: 'fixed',
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
    },
  });

if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyCUFNT7c7Eur0zWgY77ywEDp4DLxPW4R7U",
        authDomain: "process-mining-8734a.firebaseapp.com",    
        databaseURL: "https://process-mining-8734a.firebaseio.com/",
    });
}

const transformCases = cases => 
    cases
        ? Object.keys(cases).reduce((carry, key) => {
            return [
                ...carry,
                {
                    id: key,
                    ...cases[key]
                }
            ];
        }, [])
        : [];

const getIcon = index => [
    <OneIcon />,
    <TwoIcon />,
    <ThreeIcon />,
    <FourIcon />,
    <FiveIcon />,
][index] || <FolderIcon />;

class App extends React.Component {
    static async getInitialProps() {
        const snap = await firebase.database().ref('cases').once('value');
        
        return {
            uuid: uuidv4(),
            cases: transformCases(snap.val()),
            activities: Object.values(ACTIVITIES),
         };
    }

    constructor(props) {
        super(props);
        
        this.state = {
            cases: props.cases,
            form: defaultFormState,
            list: [],
            open: false,
        };
    }

    componentDidMount() {
        firebase.database().ref('cases').on('value', snap => {
            const cases = snap.val();
            if (cases) {
                this.setState({ cases: transformCases(cases) });
            }
        });
    }

    handleChange = name => event => {
        this.setState({
            form: {
                ...this.state.form,
                [name]: event.target.value,
            }
        });
    };

    handleSubmit = event => {
        event.preventDefault();

        if (this.state.cases.filter(this.ownActivities).length > MAX_ACTIVITIES) {
            return false;
        }

        const [hour, minute] = this.state.form.time.split(':');
        firebase.database().ref('cases').push({
            uuid: this.props.uuid,
            activity: this.state.form.activity,
            time: moment({ hour, minute }).format('YYYY-MM-DD HH:mm:ss'),
        });
        
        this.setState({
            form: defaultFormState,
            open: false,
        });
    }
    
    handleDelete = event => {
        const id = event.currentTarget.getAttribute('id');
        firebase.database().ref('cases').child(id).remove();
    }

    handleClear = event => {
        firebase.database().ref('cases').remove();
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleRequestClose = () => {
        this.setState({ open: false });
    };

    ownActivities = ({ uuid }) => {
        return uuid === this.props.uuid;
    }

    render() {
        const { classes } = this.props;        
        const { cases, form } = this.state;

        const ownActivities = cases.filter(this.ownActivities);
        
        return (
            <div>
                <Head>
                    <title>Process Mining</title>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
                </Head>
                <Grid container className={classes.container}>
                    <Grid item xs={12}>
                        <Toolbar color="accent">
                            <Typography type="title" color="inherit" className={classes.flex}>
                                Activiteiten
                            </Typography>
                            <CSVLink data={this.state.cases} filename="process-mining">
                                <Badge badgeContent={cases.length} color="accent">
                                    <InputIcon color="black" />
                                </Badge>
                            </CSVLink>
                        </Toolbar>
                        <Divider />
                        <List>
                            {ownActivities.length
                                ? ownActivities.map(({ id, activity, time }, index) => (
                                    <ListItem key={id}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                {getIcon(index)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={activity}
                                            secondary={moment(time).format('HH:mm')}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton id={id} onClick={this.handleDelete} aria-label="Delete">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                                : <ListItem>
                                    <ListItemText primary={<em>Nog geen activiteiten</em>} />
                                </ListItem>}
                        </List>

                        {ownActivities.length < MAX_ACTIVITIES
                            ? (
                                <Button fab color="primary" aria-label="add" color="primary" onClick={this.handleClickOpen} className={classes.button}>
                                    <AddIcon />
                                </Button>
                            )
                            : (
                                <Grid container className={classes.container}>
                                    <Grid item xs={8} style={{ textAlign: 'center', color: 'red' }}>
                                        <small>
                                            <em>Je hebt het maximale aantal van {MAX_ACTIVITIES} activiteiten bereikt.</em>
                                        </small>
                                    </Grid>
                                </Grid>
                            )}
                        <Dialog
                            fullWidth
                            open={this.state.open}
                            onRequestClose={this.handleRequestClose}
                        >
                            <DialogTitle>Activiteit toevoegen</DialogTitle>
                            <DialogContent>
                                <form>
                                    <Grid container>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel htmlFor="activity">Activiteit</InputLabel>
                                                <Select
                                                    onChange={this.handleChange('activity')}
                                                    value={form.activity}
                                                    input={<Input id="activity" />}
                                                    fullWidth
                                                    required
                                                >
                                                    {this.props.activities
                                                        .map(activity => (
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
                                                    onChange={this.handleChange('time')}
                                                    id="time"
                                                    label="Tijd"
                                                    type="time"
                                                    value={form.time}
                                                    fullWidth
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </form>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.handleRequestClose} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={this.handleSubmit} color="primary">
                                    Ok
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>
                </Grid>
                <style global jsx>{`
                body {
                    font-family: 'Roboto', sans-serif;
                }
                `}</style>
            </div>
        );
    }
}

export default withStyles(styles)(App);
