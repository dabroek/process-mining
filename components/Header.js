import React from 'react';
import { CSVLink } from 'react-csv';

import { withStyles } from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Badge from 'material-ui/Badge';
import Menu, { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';

import FaceIcon from 'material-ui-icons/Face';
import AnswerIcon from 'material-ui-icons/QuestionAnswer';
import MoreVertIcon from 'material-ui-icons/MoreVert';

const styles = theme => ({
    flex: {
        flex: 1,
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

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            menuOpen: false,
        };
    }

    handleClickOpen = event => {
        this.setState({ menuOpen: true, anchorEl: event.currentTarget });
    };

    handleRequestClose = event => {
        this.setState({ menuOpen: false });
    };

    render() {
        const { title, userCount, activityCount, cases, classes } = this.props;

        return (
            <Toolbar>
                <Typography type="title" color="inherit" className={classes.flex}>
                    {title}
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
            </Toolbar>
        );
    }
}

export default withStyles(styles)(Header);