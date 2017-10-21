import React from 'react';
import moment from 'moment';
import * as firebase from 'firebase';
import { CSVLink } from 'react-csv';

import { withStyles } from 'material-ui/styles';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';
import Badge from 'material-ui/Badge';
import Menu, { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';

import FaceIcon from 'material-ui-icons/Face';
import AnswerIcon from 'material-ui-icons/QuestionAnswer';
import MoreVertIcon from 'material-ui-icons/MoreVert';

import config from '../config';

import App from '../components/App';
import Header from '../components/Header';
import ActivityList from '../components/ActivityList';
import AddActivityButton from '../components/AddActivityButton';

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
            menuOpen: false,
         };
    }

    constructor(props) {
        super(props);
        
        this.state = {
            cases: props.cases,
        };
    }

    componentDidMount() {
        this.addDatabaseListener();
        this.signInAnonymously();
        this.addAuthenticationListener();
    }

    addDatabaseListener = () => {
        firebase.database().ref('cases').on('value', snap => {
            this.setState({ cases: transformCases(snap.val()) });
        });
    }

    signInAnonymously = () => {
        firebase.auth().signInAnonymously().catch(({ code, message }) => {});
    }

    addAuthenticationListener = () => {
        firebase.auth().onAuthStateChanged(user => {
            this.setState({ user });
        });
    }

    handleSubmit = ({ activity, time }) => {
        firebase.database().ref('cases').push({
            uid: this.state.user.uid,
            activity,
            time,
        });
    }

    handleDelete = id => {
        firebase.database().ref('cases').child(id).remove();
    }

    handleClear = event => {
        firebase.database().ref('cases').remove();
    }

    handleClickOpen = event => {
        this.setState({ menuOpen: true, anchorEl: event.currentTarget });
    };

    handleRequestClose = event => {
        this.setState({ menuOpen: false });
    };
    
    filterActivities = ({ uid }) => {
        return uid === this.state.user.uid;
    }

    renderActivityButton = ownActivities => {
        return ownActivities.length < MAX_ACTIVITIES
            ? <AddActivityButton activities={ACTIVITIES} onSubmit={this.handleSubmit} />
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
                            onClick={this.handleClickOpen}>
                            <MoreVertIcon color="black" />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            anchorEl={this.state.anchorEl}
                            open={this.state.menuOpen}
                            onRequestClose={this.handleRequestClose}
                        >
                            <MenuItem onClick={this.handleRequestClose}>
                                <CSVLink data={cases} className={classes.downloadLink} filename="process-mining">
                                    Download CSV
                                </CSVLink>
                            </MenuItem>
                        </Menu>
                    </Header>
                    <Divider />
                    <ActivityList
                        activities={ownActivities}
                        onDelete={this.handleDelete}
                    />
                    {user ? this.renderActivityButton(ownActivities) : this.renderMessage('Even geduld a.u.b.')}
                </Grid>
            </App>
        );
    }
}

export default withStyles(styles)(Home);
