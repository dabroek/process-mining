import React from 'react';

import { withStyles } from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    flex: {
        flex: 1,
    },
  });

const Header = ({ title, classes, children }) => (
    <Toolbar>
        <Typography type="title" color="inherit" className={classes.flex}>
            {title}
        </Typography>
        {children}
    </Toolbar>
);

export default withStyles(styles)(Header);