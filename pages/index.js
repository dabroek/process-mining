import React from 'react';
import Head from 'next/head';
import * as firebase from 'firebase';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import { CSVLink } from 'react-csv';

import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Badge from 'material-ui/Badge';
import Menu, { MenuItem } from 'material-ui/Menu';

import Grid from 'material-ui/Grid';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import { withStyles } from 'material-ui/styles';
import { FormControl } from 'material-ui/Form';
import Divider from 'material-ui/Divider';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import TextField from 'material-ui/TextField';
import List, {
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
} from 'material-ui/List';

import FaceIcon from 'material-ui-icons/Face';
import AnswerIcon from 'material-ui-icons/QuestionAnswer';
import MoreVertIcon from 'material-ui-icons/MoreVert';

import AddIcon from 'material-ui-icons/Add';
import DeleteIcon from 'material-ui-icons/Delete';

const ACTIVITIES = {
    WASH: 'wassen',
    SHOWER: 'douchen',
    DRESS: 'aankleden',
    BREAKFAST: 'ontbijten',
    BRUSH_TEETH: 'tanden poetsen',
    READ_NEWSPAPER: 'krant lezen',
    CHECK_MAIL: 'email checken',
    TRAVEL_BY_BIKE: 'per fiets reizen',
    TRAVEL_BY_CAR: 'per auto reizen',
    TRAVEL_BY_PUBLIC_TRANSPORT: 'per ov reizen',
    DROP_OFF_KIDS: 'kids wegbrengen',
};

const MAX_ACTIVITIES = 5;

const DEFAULT_FORM_STATE = {
    activity: Object.values(ACTIVITIES)[0],
    time: '07:00',
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
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
    },
    badgeIcon: {
        marginLeft: 12,
        marginRight: 12,
    },
    downloadLink: {
        color: 'black',
        textDecoration: 'none',
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
        ? Object.keys(cases).reduce((carry, key) => ([
            ...carry,
            {
                id: key,
                ...cases[key]
            }
        ]), []).sort((a, b) => moment(a.time) - moment(b.time))
        : [];

class App extends React.Component {
    static async getInitialProps() {
        const snap = await firebase.database().ref('cases').once('value');
        
        return {
            cases: transformCases(snap.val()),
            activities: Object.values(ACTIVITIES),
         };
    }

    constructor(props) {
        super(props);
        
        this.state = {
            uuid: uuidv4(),
            cases: props.cases,
            form: DEFAULT_FORM_STATE,
            menuOpen: false,
            dialogOpen: false,
        };
    }

    componentDidMount() {
        firebase.database().ref('cases').orderByChild('time').on('value', snap => {
            this.setState({ cases: transformCases(snap.val()) });
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
            uuid: this.state.uuid,
            activity: this.state.form.activity,
            time: moment({ hour, minute }).format('YYYY-MM-DD HH:mm:ss'),
        });
        
        this.setState({
            form: DEFAULT_FORM_STATE,
            dialogOpen: false,
        });
    }
    
    handleDelete = event => {
        const id = event.currentTarget.getAttribute('id');
        firebase.database().ref('cases').child(id).remove();
    }

    handleClear = event => {
        firebase.database().ref('cases').remove();
    }

    handleClickOpen = component => event => {
        this.setState({ [`${component}Open`]: true, anchorEl: event.currentTarget });
    };

    handleRequestClose = component => event => {
        this.setState({ [`${component}Open`]: false });
    };

    ownActivities = ({ uuid }) => {
        return uuid === this.state.uuid;
    }

    render() {
        const { classes } = this.props;        
        const { cases, form } = this.state;

        const userCount = (new Set(cases.map(activity => activity.uuid))).size;
        const activityCount = cases.length;

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
                        <Toolbar>
                            <Typography type="title" color="inherit" className={classes.flex}>
                                Activiteiten
                            </Typography>
                            <Badge badgeContent={userCount} className={classes.badgeIcon} color="accent">
                                <FaceIcon color="black" />
                            </Badge>
                            <Badge badgeContent={activityCount} className={classes.badgeIcon} color="accent">
                                <AnswerIcon color="black" />
                            </Badge>
                            <IconButton
                                aria-label="More"
                                aria-owns={this.state.menuOpen ? 'long-menu' : null}
                                aria-haspopup="true"
                                onClick={this.handleClickOpen('menu')}>
                                <MoreVertIcon color="black" />
                            </IconButton>
                            <Menu
                                id="long-menu"
                                anchorEl={this.state.anchorEl}
                                open={this.state.menuOpen}
                                onRequestClose={this.handleRequestClose('menu')}
                            >
                                <MenuItem onClick={this.handleRequestClose('menu')}>
                                    <CSVLink data={this.state.cases} className={classes.downloadLink} filename="process-mining">
                                        Download CSV
                                    </CSVLink>
                                </MenuItem>
                            </Menu>
                        </Toolbar>
                        <Divider />
                        <List>
                            {ownActivities.length
                                ? ownActivities.map(({ id, activity, time }, index) => (
                                    <ListItem key={id}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                {index + 1}
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
                                <Button fab color="primary" aria-label="add" color="primary" onClick={this.handleClickOpen('dialog')} className={classes.button}>
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
                            open={this.state.dialogOpen}
                            onRequestClose={this.handleRequestClose('dialog')}
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
                                <Button onClick={this.handleRequestClose('dialog')} color="primary">
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
