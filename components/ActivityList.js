import React from 'react';
import moment from 'moment';

import Avatar from 'material-ui/Avatar';
import List, {
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';

import DeleteIcon from 'material-ui-icons/Delete';

const ActivityList = ({ activities, onDelete }) => {
    const handleDelete = event => {
        onDelete(event.currentTarget.getAttribute('id'));
    }

    return (
        <List>
            {activities.length
                ? activities.map(({ id, activity, time }, index) => (
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
                            <IconButton id={id} onClick={handleDelete} aria-label="Delete">
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))
                : <ListItem>
                    <ListItemText primary={<em>Nog geen activiteiten</em>} />
                </ListItem>}
        </List>
    );
}

export default ActivityList;
