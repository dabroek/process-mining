import React from 'react';

import { withStyles } from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    flex: {
        flex: 1,
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
        const { title, classes, children } = this.props;

        return (
            <Toolbar>
                <Typography type="title" color="inherit" className={classes.flex}>
                    {title}
                </Typography>
                {children}
            </Toolbar>
        );
    }
}

export default withStyles(styles)(Header);