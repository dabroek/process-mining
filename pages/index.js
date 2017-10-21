import React from 'react';
import moment from 'moment';
import * as firebase from 'firebase';
import uuidv4 from 'uuid/v4';

import { withStyles } from 'material-ui/styles';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';

import App from '../components/App';
import Header from '../components/Header';
import ActivityList from '../components/ActivityList';
import AddActivityButton from '../components/AddActivityButton';

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
    flex: {
        flex: 1,
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
            uuid: uuidv4(),
            cases: props.cases,
        };
    }

    componentDidMount() {
        firebase.database().ref('cases').orderByChild('time').on('value', snap => {
            this.setState({ cases: transformCases(snap.val()) });
        });
    }

    handleSubmit = ({ activity, time }) => {
        firebase.database().ref('cases').push({
            uuid: this.state.uuid,
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
    
    filterActivities = ({ uuid }) => {
        return uuid === this.state.uuid;
    }

    render() {
        const { activities, classes } = this.props;        
        const { uuid, cases } = this.state;

        const ownActivities = cases.filter(this.filterActivities);

        return (
            <App title="Process Mining">
                <Grid item xs={12}>
                    <Header
                        title="Activiteiten"
                        userCount={(new Set(cases.map(activity => activity.uuid))).size}
                        activityCount={cases.length}
                        cases={cases}
                    />
                    <Divider />
                    <ActivityList
                        activities={ownActivities}
                        onDelete={this.handleDelete}
                    />
                    {ownActivities.length < MAX_ACTIVITIES
                        ? <AddActivityButton uuid={uuid} activities={ACTIVITIES} onSubmit={this.handleSubmit} />
                        : (
                            <Grid container className={classes.container}>
                                <Grid item xs={8} style={{ textAlign: 'center', color: 'red' }}>
                                    <small>
                                        <em>Je hebt het maximale aantal van {MAX_ACTIVITIES} activiteiten bereikt.</em>
                                    </small>
                                </Grid>
                            </Grid>
                        )}
                </Grid>
            </App>
        );
    }
}

export default withStyles(styles)(Home);
