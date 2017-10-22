import React from 'react';
import moment from 'moment';
import * as firebase from 'firebase';
import { CSVLink } from 'react-csv';

import { withStyles } from 'material-ui/styles';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';
import Badge from 'material-ui/Badge';
import Menu, { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';

import FaceIcon from 'material-ui-icons/Face';
import AnswerIcon from 'material-ui-icons/QuestionAnswer';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import AddIcon from 'material-ui-icons/Add';

import config from '../config';

import App from '../components/App';
import Header from '../components/Header';
import ActivityList from '../components/ActivityList';
import AddActivityDialog from '../components/AddActivityDialog';
import LoginDialog from '../components/LoginDialog';
import RegisterDialog from '../components/RegisterDialog';

if (!firebase.apps.length) {
    firebase.initializeApp(config.firebase);
}

const MAX_ACTIVITIES = 5;

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

const styles = theme => ({
    container: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    badgeIcon: {
        marginLeft: 12,
        marginRight: 12,
    },
    downloadLink: {
        color: 'black',
        textDecoration: 'none',
    },
    menuButton: {
        marginRight: -12,
    },
    addActivityButton: {
        position: 'fixed',
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
    },
});

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

class Home extends React.Component {
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
            cases: props.cases,
            menuOpen: false,
            activityDialogOpen: false,
            loginDialogOpen: false,
            registerDialogOpen: false,
            snackbarOpen: false,
        };
    }

    componentDidMount() {
        this.addDatabaseListener();
        this.addAuthenticationListener();
        this.signInAnonymously();
    }

    addDatabaseListener = () => {
        firebase.database().ref('cases').on('value', snap => {
            this.setState({ cases: transformCases(snap.val()) });
        });
    }

    signInAnonymously = () => {
        return firebase.auth().signInAnonymously()
            .catch(({ code, message }) => {
                alert(message);
            });
    }

    handleChangeProfile = ({ displayName }) => {
        return firebase.auth().currentUser.updateProfile({ displayName })
            .then(user => {
                this.setState({ user });
            }).catch(error => {
                console.log("Error updating profile", error);
                this.handleShowMessage(error.message);
            });
    }
    
    handleRegister = (email, password) => {
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);

        return firebase.auth().currentUser.linkWithCredential(credential)
            .then(user => {
                this.handleRequestClose('registerDialog')();
                this.setState({ user });
                this.handleShowMessage('Successvol geregistreerd');
            });
    }

    handleLogin = (email, password) => {
        return firebase.auth().signInWithEmailAndPassword(email, password)
            .then(user => {
                this.handleRequestClose('loginDialog')();
                this.setState({ user });
                this.handleShowMessage('Successvol ingelogd');
            });
    }

    handleLogout = () => {
        return firebase.auth().signOut().then(() => {
            this.signInAnonymously();
        });
    }

    addAuthenticationListener = () => {
        firebase.auth().onAuthStateChanged(user => {
            this.setState({ user });
        });
    }

    handleAddActivity = ({ activity, time }) => {
        firebase.database().ref('cases').push({
            uid: this.state.user.uid,
            activity,
            time,
        });
        this.handleRequestClose('activityDialog')();
    }

    handleDelete = id => {
        firebase.database().ref('cases').child(id).remove();
    }

    handleClear = event => {
        firebase.database().ref('cases').remove();
        this.handleRequestCloseMenu();
    }

    handleShowMessage = message => {
        this.setState({ message, snackbarOpen: true });
    }

    handleOpenMenu = event => {
        this.setState({ menuOpen: true, anchorEl: event.currentTarget });
    }

    handleRequestCloseMenu = event => {
        this.setState({ menuOpen: false });
    }
    
    handleOpen = name => event => {
        this.setState({ menuOpen: false, [`${name}Open`]: true });
    }

    handleRequestClose = name => event => {
        this.setState({ [`${name}Open`]: false });
    }
    
    filterActivities = ({ uid }) => {
        return uid === this.state.user.uid;
    }

    renderActivityButton = ownActivities => {
        return ownActivities.length < MAX_ACTIVITIES
            ? (
                <Button
                    fab
                    color="primary"
                    aria-label="add activity"
                    color="primary"
                    onClick={this.handleOpen('activityDialog')}
                    className={this.props.classes.addActivityButton}>
                    <AddIcon />
                </Button>
            )
            : this.renderMessage(`Je hebt het maximale aantal van ${MAX_ACTIVITIES} activiteiten bereikt.`);
    }

    renderMessage = message => {
        const { classes } = this.props;

        return (
            <Grid container className={classes.container}>
                <Grid item xs={8} style={{ textAlign: 'center', color: 'red' }}>
                    <small>
                        <em>{message}</em>
                    </small>
                </Grid>
            </Grid>
        );
    }

    render() {
        const { activities, classes } = this.props;
        const { user, cases } = this.state;

        const ownActivities = user ? cases.filter(this.filterActivities) : [];

        return (
            <App title="Process Mining">
                <Grid item xs={12}>
                    <Header title="Activiteiten">
                        <span style={{ marginRight: 12 }}>
                            <em>{user && !user.isAnonymous ? user.displayName || user.email : 'anonymous'}</em>
                        </span>
                        <Badge badgeContent={(new Set(cases.map(activity => activity.uid))).size} className={classes.badgeIcon} color="accent">
                            <FaceIcon color="black" />
                        </Badge>
                        <Badge badgeContent={cases.length} className={classes.badgeIcon} color="accent">
                            <AnswerIcon color="black" />
                        </Badge>
                        <IconButton
                            aria-label="More"
                            aria-owns={this.state.menuOpen ? 'long-menu' : null}
                            aria-haspopup="true"
                            onClick={this.handleOpenMenu}
                            className={classes.menuButton}>
                            <MoreVertIcon color="black" />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            anchorEl={this.state.anchorEl}
                            open={this.state.menuOpen}
                            onRequestClose={this.handleRequestCloseMenu}
                        >
                            {user && user.isAnonymous &&
                                <MenuItem onClick={this.handleOpen('loginDialog')}>
                                    Inloggen
                                </MenuItem>}
                            {/* user && user.isAnonymous &&
                                <MenuItem onClick={this.handleOpen('registerDialog')}>
                                    Registreren
                                </MenuItem> */}
                            <MenuItem onClick={this.handleRequestCloseMenu}>
                                <CSVLink data={cases} className={classes.downloadLink} filename="process-mining">
                                    Download CSV
                                </CSVLink>
                            </MenuItem>
                            {user && !user.isAnonymous &&
                                <MenuItem onClick={this.handleClear}>
                                    Alles verwijderen
                                </MenuItem>}
                            {user && !user.isAnonymous && 
                                <MenuItem onClick={this.handleLogout}>
                                    Uitloggen
                                </MenuItem>}
                        </Menu>
                    </Header>
                    <Divider />
                    <ActivityList
                        activities={ownActivities}
                        onDelete={this.handleDelete}
                    />
                    {user ? this.renderActivityButton(ownActivities) : this.renderMessage('Even geduld a.u.b.')}
                </Grid>
                <AddActivityDialog
                    activities={ACTIVITIES}
                    open={this.state.activityDialogOpen}
                    onSubmit={this.handleAddActivity}
                    onClose={this.handleRequestClose('activityDialog')} />
                <LoginDialog
                    open={this.state.loginDialogOpen}
                    onSubmit={this.handleLogin}
                    onClose={this.handleRequestClose('loginDialog')} />
                {/* <RegisterDialog
                    open={this.state.registerDialogOpen}
                    onSubmit={this.handleRegister}
                    onClose={this.handleRequestClose('registerDialog')} /> */}
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={this.state.snackbarOpen}
                    autoHideDuration={3000}
                    onRequestClose={this.handleRequestClose('snackbar')}
                    SnackbarContentProps={{ 'aria-describedby': 'message-id' }}
                    message={<span id="message-id">{this.state.message}</span>} />
            </App>
        );
    }
}

export default withStyles(styles)(Home);
