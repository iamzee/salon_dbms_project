import React from 'react';
import {Link} from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import DirectionsIcon from '@material-ui/icons/Directions';
import CallIcon from '@material-ui/icons/Call';
import EmailIcon from '@material-ui/icons/Email';
import WebIcon from '@material-ui/icons/Web';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import {ListItem, ListItemText} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import {readSalon} from '../api/salon.api';
import {listStaffs, removeStaff} from '../api/staff.api';
import {listServices, removeService} from '../api/service.api';
import {listTimeTable} from '../api/salonTimeTable.api';
import {isAuthenticated} from '../helpers/auth.helper';
import {listFeedback} from '../api/feedback.api';
import {readUser} from '../api/user.api';

const styles = theme => ({
  root: {
    maxWidth: 900,
    margin: 'auto',
    marginTop: theme.spacing.unit * 5,
  },
  title: {
    fontWeight: 300,
    marginBottom: theme.spacing.unit * 2,
  },
  section: {
    marginBottom: theme.spacing.unit * 3,
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  detail: {
    paddingLeft: theme.spacing.unit * 2,
  },
  staffItem: {
    marginBottom: theme.spacing.unit * 2,
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    color: theme.palette.tertiary.main,
  },
  link: {
    textDecoration: 'none',
  },
});

class SalonPage extends React.Component {
  state = {
    salon: null,
    staffs: [],
    services: [],
    timeTable: [],
    feedbacks: [],
  };

  componentDidMount () {
    const {token} = isAuthenticated ();
    const {salonId} = this.props.match.params;

    readSalon (token, salonId).then (salon => {
      this.setState (() => ({salon}));
    });

    listStaffs (token, salonId).then (staffs => {
      this.setState (() => ({staffs}));
    });

    listServices (token, salonId).then (services => {
      this.setState (() => ({services}));
    });

    listTimeTable (token, salonId).then (timeTable => {
      this.setState (() => ({timeTable}));
    });

    listFeedback (token, salonId).then (feedbacks => {
      feedbacks.forEach (f => {
        readUser (token, f.user_id).then (user => {
          f.user = user;
        });
      });

      console.log ('feedbacks', feedbacks);

      this.setState (() => ({
        feedbacks,
      }));
    });
  }

  handleRemoveStaff = staffId => {
    return () => {
      const {token} = isAuthenticated ();

      removeStaff (token, staffId).then (() => {
        const {salonId} = this.props.match.params;
        listStaffs (token, salonId).then (staffs => {
          this.setState (() => ({staffs}));
        });
      });
    };
  };

  handleRemoveService = serviceId => {
    return () => {
      const {token} = isAuthenticated ();

      removeService (token, serviceId).then (() => {
        const {salonId} = this.props.match.params;
        listServices (token, salonId).then (services => {
          this.setState (() => ({services}));
        });
      });
    };
  };

  render () {
    const {classes} = this.props;
    const {salon} = this.state;
    return (
      <div className={classes.root}>
        {salon &&
          <div>
            <Typography color="primary" className={classes.title} variant="h3">
              {salon.name}
            </Typography>

            <Link to={`/salon/${salon.id}/appointment`}>
              <Button>Book appointment</Button>
            </Link>

            <div className={classes.section}>
              <Typography color="secondary" variant="h5" gutterBottom>
                Details
              </Typography>
              <Typography variant="body1" className={classes.flex}>
                <DirectionsIcon />
                <span className={classes.detail}>{salon.location}</span>
              </Typography>
              <Typography variant="body1" className={classes.flex}>
                <CallIcon />
                <span className={classes.detail}>{salon.contact_no}</span>
              </Typography>
              <Typography variant="body1" className={classes.flex}>
                <WebIcon />
                <span className={classes.detail}>{salon.website_link}</span>
              </Typography>
              <Typography variant="body1" className={classes.flex}>
                <EmailIcon />
                <span className={classes.detail}>{salon.email}</span>
              </Typography>
              {this.state.salon.user_id === isAuthenticated ().user.id &&
                <Link
                  className={classes.link}
                  to={`/salon/${this.state.salon.id}/edit`}
                >
                  <Button className={classes.button}>Edit Salon Details</Button>
                </Link>}
            </div>

            <div>
              <Typography color="secondary" variant="h5" gutterBottom>
                Staffs
              </Typography>
              {this.state.salon.user_id === isAuthenticated ().user.id &&
                <Link
                  className={classes.link}
                  to={`/salon/${salon.id}/staff/create`}
                >
                  <Button className={classes.button}>Add Staff</Button>
                </Link>}
              {this.state.staffs.map (staff => (
                <div className={classes.staffItem} key={staff.id}>
                  <Typography variant="h6">
                    {staff.first_name} {staff.last_name}
                  </Typography>
                  <Typography variant="body2">{staff.age} Years</Typography>
                  <Typography variant="body2" gutterBottom>
                    {staff.gender === 'M' && 'Male'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {staff.gender === 'F' && 'Female'}
                  </Typography>
                  {this.state.salon.user_id === isAuthenticated ().user.id &&
                    <React.Fragment>
                      <Link
                        className={classes.link}
                        to={`/salon/${this.state.salon.id}/staff/${staff.id}`}
                      >
                        <Button className={classes.button}>Edit</Button>
                      </Link>
                      <Button
                        className={classes.button}
                        onClick={this.handleRemoveStaff (staff.id)}
                      >
                        Remove
                      </Button>
                    </React.Fragment>}
                  <Divider variant="fullWidth" />
                </div>
              ))}
            </div>

            <div>
              <Typography color="secondary" variant="h5" gutterBottom>
                Services
              </Typography>
              {this.state.salon.user_id === isAuthenticated ().user.id &&
                <Link
                  className={classes.link}
                  to={`/salon/${salon.id}/service/create`}
                >
                  <Button className={classes.button}>Add Service</Button>
                </Link>}
              {this.state.services.map (service => (
                <div key={service.id}>
                  <Typography variant="h6">{service.name}</Typography>
                  <Typography variant="subtitle1">
                    Brand: {service.brand}
                  </Typography>
                  <Typography variant="subtitle1">
                    Benefits: {service.benefits}
                  </Typography>
                  <Typography variant="subtitle1">
                    Points To Remember: {service.points_to_remember}
                  </Typography>
                  <Typography variant="subtitle1">
                    Recommended For: {service.recommended_for}
                  </Typography>
                  <Typography variant="subtitle1">
                    Cost: &#8377; {service.cost}
                  </Typography>
                  {this.state.salon.user_id === isAuthenticated ().user.id &&
                    <React.Fragment>
                      <Link
                        className={classes.link}
                        to={`/salon/${this.state.salon.id}/service/${service.id}`}
                      >
                        <Button className={classes.button}>Edit</Button>
                      </Link>
                      <Button
                        className={classes.button}
                        onClick={this.handleRemoveService (service.id)}
                      >
                        Remove
                      </Button>
                    </React.Fragment>}
                </div>
              ))}
            </div>

            <div>
              <Typography color="secondary" variant="h5" gutterBottom>
                Time Table
              </Typography>
              {this.state.salon.user_id === isAuthenticated ().user.id &&
                <React.Fragment>
                  <Link
                    // className={classes.link}
                    to={`/salon/${this.state.salon.id}/time_table/create`}
                  >
                    <Button className={classes.button}>Add Time Table</Button>
                  </Link>
                </React.Fragment>}
              {this.state.timeTable.map (tt => (
                <ListItem key={tt.day}>
                  <ListItemText
                    primary={tt.day}
                    secondary={
                      <Typography>
                        {tt.opening_time} - {tt.closing_time}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </div>

            <div>
              <Typography color="secondary" variant="h5" gutterBottom>
                Feedbacks
              </Typography>
              {this.state.feedbacks.map (f => {
                console.log ('f', f);
                return (
                  <div key={f.id}>
                    {f.user && <Typography>{f.user.firstName}</Typography>}
                    <Typography>{f.feedback_text}</Typography>
                  </div>
                );
              })}
            </div>
          </div>}
      </div>
    );
  }
}

export default withStyles (styles) (SalonPage);
