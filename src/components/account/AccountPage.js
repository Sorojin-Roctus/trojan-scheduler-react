import React from "react";
import {
  Segment,
  Message,
  Header,
  Item,
  Form,
  Label,
  Input,
  Icon,
  Divider,
  Grid,
  Responsive,
  Container
} from "semantic-ui-react";
import { connect } from "react-redux";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  matchStatusCode,
  formatTitle
} from "../../util";
import { setUserProfile, clearUserState } from "../../actions";
import AvatarSelect from "./AvatarSelect";
import { toast } from "react-semantic-toasts";
import ProfileCard from "./ProfileCard";
import moment from "moment";
import { Helmet } from "react-helmet";

const errorFormatter = errorFormatterCreator(
  matchStatusCode("Your session has expired. Please log in to continue.", [
    401
  ]),
  responseDataFormatter,
  statusCodeFormatter
);

class AccountPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: props.profile,
      loading: false,
      sendEmailLoading: false,
      old_password: "",
      password: "",
      password2: "",
      changePassword: false,
      passwordUpdated: false
    };
    this.cancelSource = axios.CancelToken.source();
  }

  handleChange = (e, { name, value }) => {
    if (this.state.profile[name] !== undefined) {
      this.setState(state => ({
        profile: { ...state.profile, [name]: value }
      }));
    }
  };

  handlePasswordChange = (e, { name, value }) => {
    if (this.state[name] !== undefined) {
      this.setState({ [name]: value });
    }
  };

  getUserProfile = () => {
    let { id } = this.props.profile;
    this.setState({ loading: true });
    axios
      .get(`/api/users/${id}/`, { cancelToken: this.cancelSource.token })
      .then(response => {
        this.props.setUserProfile(response.data);
        this.setState({ loading: false });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Load Profile`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState({ loading: false });
      });
  };

  saveUserProfile = () => {
    let {
      profile,
      changePassword,
      password,
      password2,
      old_password
    } = this.state;
    if (changePassword) {
      if (password !== password2) {
        toast({
          type: "error",
          icon: "times",
          title: `Passwords Do Not Match`,
          time: 30000
        });
        return;
      } else {
        profile = { ...profile, password, old_password };
      }
    }
    this.setState({ loading: true });
    axios
      .patch(`/api/users/${this.props.profile.id}/`, profile, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.props.setUserProfile(response.data);
        toast({
          type: "success",
          icon: "check",
          title: `Profile Updated`,
          description: "Your settings are saved.",
          time: 10000
        });
        this.setState(
          {
            loading: false,
            profile: response.data,
            password: "",
            password2: "",
            old_password: "",
            changePassword: false,
            passwordUpdated: changePassword
          },
          () => {
            if (changePassword) this.props.clearUserState();
          }
        );
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Update Profile`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState({
          loading: false,
          password: "",
          password2: "",
          old_password: ""
        });
      });
  };

  sendEmailVerification = () => {
    this.setState({ sendEmailLoading: true });
    axios
      .post(
        `/api/verify-email/request-token/`,
        {},
        {
          cancelToken: this.cancelSource.token
        }
      )
      .then(() => {
        toast({
          type: "success",
          icon: "send",
          title: "Email Verification Link Sent",
          description: "Check your inbox for the verification email.",
          time: 30000
        });
        this.setState({ sendEmailLoading: false });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Send Email`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState({ sendEmailLoading: false });
      });
  };

  signOutFromAllDevices = () => {
    this.setState({ loading: true });
    axios
      .post(
        `/api/token/invalidate/`,
        {},
        {
          cancelToken: this.cancelSource.token
        }
      )
      .then(() => {
        this.props.clearUserState();
        this.setState({ loading: false, profile: null });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Sign Out`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState({ loading: false });
      });
  };

  toggleChangePassword = () => {
    this.setState({
      old_password: "",
      password: "",
      password2: "",
      changePassword: !this.state.changePassword
    });
  };

  componentDidMount() {
    if (this.props.profile) this.getUserProfile();
  }

  componentDidUpdate(prevProps) {
    let prevHasProfile = Boolean(prevProps.profile),
      hasProfile = Boolean(this.props.profile);
    if (prevHasProfile && !hasProfile) {
      this.setState({ profile: this.props.profile });
    }
    if (!prevHasProfile && hasProfile) {
      this.setState({ profile: this.props.profile, passwordUpdated: false });
    }
  }

  componentWillUnmount() {
    this.cancelSource.cancel(
      "axios requests cancelled on account page unmount"
    );
  }

  render() {
    if (this.state.passwordUpdated) {
      return (
        <Header icon textAlign="center">
          <Icon name="check" />
          Password Updated
          <Header.Subheader>
            Log in with your new credentials to continue.
          </Header.Subheader>
        </Header>
      );
    } else if (!this.state.profile) {
      return (
        <Message info>Please log in to change your account settings.</Message>
      );
    }
    let {
      avatar,
      username,
      email,
      email_verified,
      show_email,
      nickname,
      first_name,
      last_name,
      display_name_choice,
      show_name,
      date_joined,
      show_date_joined
    } = this.state.profile;
    let { password, password2, old_password } = this.state;

    let displayNameOptions = [{ key: "username", text: username, value: "US" }];
    let full_name = first_name + " " + last_name;
    if (first_name)
      displayNameOptions.push({
        key: "first_name",
        text: first_name,
        value: "FR"
      });
    if (last_name)
      displayNameOptions.push({
        key: "last_name",
        text: last_name,
        value: "LS"
      });
    if (first_name && last_name)
      displayNameOptions.push({
        key: "full_name",
        text: full_name,
        value: "FL"
      });
    if (nickname)
      displayNameOptions.push({ key: "nickname", text: nickname, value: "NC" });
    return (
      <Container className="main-content">
        <Segment className="dynamic" padded="very">
          <Helmet>
            <title>{formatTitle("Account")}</title>
          </Helmet>
          <Grid stackable>
            <Grid.Column width="6">
              <Header>My Profile</Header>
              <ProfileCard {...this.props.profile} />
            </Grid.Column>
            <Grid.Column width="10">
              <Header>Account Settings</Header>

              <Form loading={this.state.loading}>
                <Form.Input fluid value={username} label="Username" readOnly />
                <Form.Button
                  content="Change Password"
                  onClick={this.toggleChangePassword}
                />
                {this.state.changePassword && (
                  <>
                    <Form.Input
                      required
                      fluid
                      value={old_password}
                      label="Old password"
                      name="old_password"
                      onChange={this.handlePasswordChange}
                      type="password"
                    />
                    <Form.Input
                      required
                      fluid
                      value={password}
                      label="Password"
                      name="password"
                      onChange={this.handlePasswordChange}
                      type="password"
                    />
                    <Form.Input
                      required
                      fluid
                      value={password2}
                      label="Confirm password"
                      name="password2"
                      onChange={this.handlePasswordChange}
                      type="password"
                      error={
                        password !== password2
                          ? "Passwords do not match."
                          : null
                      }
                    />
                  </>
                )}
                <Form.Field>
                  <label>Email</label>
                  <Input
                    value={email}
                    labelPosition="right"
                    name="email"
                    onChange={this.handleChange}
                  >
                    <input />
                    {email_verified && (
                      <Label color="green">
                        <Icon name="check" style={{ margin: "0 0.2em" }} />
                      </Label>
                    )}
                    {!email_verified && email && (
                      <Label color="red">
                        <Responsive as="span" minWidth={350}>
                          not verified
                        </Responsive>
                        <Responsive
                          as={Icon}
                          maxWidth={349}
                          name="times"
                          style={{ margin: "0 0.2em" }}
                        />
                      </Label>
                    )}
                  </Input>
                </Form.Field>

                <Form.Checkbox
                  label="show my email on my profile page"
                  checked={show_email}
                  onChange={e =>
                    this.handleChange(e, {
                      name: "show_email",
                      value: !show_email
                    })
                  }
                />

                <Form.Input
                  fluid
                  value={first_name}
                  label="First name"
                  name="first_name"
                  onChange={this.handleChange}
                />
                <Form.Input
                  fluid
                  value={last_name}
                  label="Last name"
                  name="last_name"
                  onChange={this.handleChange}
                />
                <Form.Input
                  fluid
                  value={nickname}
                  label="Nickname"
                  name="nickname"
                  onChange={this.handleChange}
                />
                <Form.Checkbox
                  label="show my name on my profile page"
                  checked={show_name}
                  onChange={e =>
                    this.handleChange(e, {
                      name: "show_name",
                      value: !show_name
                    })
                  }
                />
                <Form.Select
                  fluid
                  options={displayNameOptions}
                  value={display_name_choice}
                  label="Display Name"
                  name="display_name_choice"
                  onChange={this.handleChange}
                />
                <Form.Input
                  fluid
                  value={moment(date_joined).format("LL")}
                  label="Date Joined"
                  name="nickname"
                  readOnly
                />
                <Form.Checkbox
                  label="show date joined on my profile page"
                  checked={show_date_joined}
                  onChange={e =>
                    this.handleChange(e, {
                      name: "show_date_joined",
                      value: !show_date_joined
                    })
                  }
                />
                <Item.Group>
                  <Item>
                    <Item.Image
                      size="tiny"
                      src={avatar}
                      rounded
                      className="schedule-user-avatar"
                    />
                    <Item.Content verticalAlign="middle">
                      <AvatarSelect
                        default={avatar}
                        buttonProps={{
                          content: "Change Avatar",
                          type: "button"
                        }}
                        onSubmit={avatar =>
                          this.handleChange(null, {
                            name: "avatar",
                            value: avatar
                          })
                        }
                      />
                    </Item.Content>
                  </Item>
                </Item.Group>
                <Form.Button
                  content="Update"
                  type="submit"
                  color="green"
                  fluid
                  onClick={this.saveUserProfile}
                />
                {!email_verified && (
                  <Form.Button
                    fluid
                    color="blue"
                    content="Verify Email"
                    loading={this.state.sendEmailLoading}
                    disabled={this.state.sendEmailLoading}
                    onClick={this.sendEmailVerification}
                  />
                )}
                <Form.Button
                  fluid
                  color="black"
                  content="Sign out From All Devices"
                  onClick={this.signOutFromAllDevices}
                />
                <Divider horizontal section>
                  Danger Zone
                </Divider>
                <Form.Button
                  fluid
                  color="red"
                  content="Delete Account (does not work)"
                />
              </Form>
            </Grid.Column>
          </Grid>
        </Segment>
      </Container>
    );
  }
}

export default connect(
  state => ({
    profile: state.user.profile
  }),
  {
    setUserProfile,
    clearUserState
  }
)(AccountPage);
