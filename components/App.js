import React from 'react';
import Head from 'next/head';

import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';

const styles = theme => ({
    container: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
  });

const App = ({ title, children, classes }) => (
    <div>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
        </Head>
        <Grid container className={classes.container}>
            {children}
        </Grid>
        <style global jsx>{`
        body {
            font-family: 'Roboto', sans-serif;
        }
        `}</style>
    </div>
);

export default withStyles(styles)(App);
