import React from "react";
import {
  Button,
  Message,
  Modal,
  Form,
  Image,
  Placeholder,
  Dropdown
} from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserTokens, setUserProfile, clearUserState } from "../../actions";
import jwtDecode from "jwt-decode";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  matchStatusCode,
  str2para
} from "../../util";
import { toast } from "react-semantic-toasts";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { Link } from "react-router-dom";

const errorFormatter = errorFormatterCreator(
  matchStatusCode(
    () => "Your session has expired. Please log in to continue.",
    [401]
  ),
  responseDataFormatter,
  statusCodeFormatter
);

const loginErrorFormatter = errorFormatterCreator(
  responseDataFormatter,
  statusCodeFormatter
);

class LoginButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loginError: "",
      loadingLogin: false,
      modalOpen: false
    };
    this.cancelSource = axios.CancelToken.source();
  }

  handleStateChange = (event, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  };

  login = () => {
    let { username, password } = this.state;
    let { setUserTokens, clearUserState } = this.props;
    this.setState({ loadingLogin: true });
    axios
      .post(
        "/api/token/",
        {
          username,
          password
        },
        {
          skipAuthRefresh: true,
          cancelToken: this.cancelSource.token,
          NoJWT: true
        }
      )
      .then(response => {
        let { data } = response;
        setUserTokens(data);
        this.setState({
          loginError: "",
          modalOpen: false,
          loadingLogin: false,
          username: "",
          password: ""
        });
        this.getUserProfile(data);
      })
      .catch(error => {
        this.setState({
          loginError: loginErrorFormatter(error),
          modalOpen: true,
          loadingLogin: false
        });
        clearUserState();
      });
  };

  getUserProfile = tokens => {
    if (!tokens || !tokens.access) {
      console.log("No access token.");
      return;
    }
    let { user_id } = jwtDecode(tokens.access);
    axios
      .get(`/api/users/${user_id}/`, { cancelToken: this.cancelSource.token })
      .then(response => {
        this.props.setUserProfile(response.data);
      })
      .catch(error => {
        if (
          moment().diff(this.mountedAt) >
          moment.duration(5, "s").asMilliseconds()
        ) {
          toast({
            type: "error",
            icon: "times",
            title: `Failed to Load User Information`,
            list: errorFormatter(error).split("\n"),
            time: 10000
          });
        }
      });
  };

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () =>
    this.setState({ modalOpen: false, username: "", password: "" });

  handleSignOut = () => {
    this.props.clearUserState();
    this.setState({ userProfile: {} });
  };

  delayLoadProfile = props => {
    if (props.location && props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      return params.has("no-update");
    }
    return false;
  };

  componentDidMount() {
    this.mountedAt = moment();
    if (!this.delayLoadProfile(this.props)) {
      let { tokens } = this.props;
      if (tokens) {
        this.getUserProfile(tokens);
      }
    }
  }

  componentWillUnmount() {
    this.cancelSource.cancel(
      "axios requests cancelled on login button unmount"
    );
  }

  render() {
    let button = null;
    let { loginError, loadingLogin } = this.state;
    if (!this.props.tokens) {
      button = (
        <Modal
          trigger={
            <Button onClick={this.handleOpen} primary>
              Sign In
            </Button>
          }
          size="tiny"
          onClose={this.handleClose}
          open={this.state.modalOpen}
        >
          <Modal.Header>Sign In</Modal.Header>
          <Modal.Content>
            <Form error={Boolean(loginError)} size="large">
              <Message error>{str2para(loginError)}</Message>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Username"
                name="username"
                value={this.state.username}
                onChange={(e, props) => this.handleStateChange(e, props)}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                name="password"
                value={this.state.password}
                onChange={(e, props) => this.handleStateChange(e, props)}
              />

              <Button
                content="Forget password?"
                fluid
                onClick={() => {
                  this.handleClose();
                  this.props.history.push("/password/forget/");
                }}
                style={{ backgroundColor: "#0000", marginTop: "-1em" }}
                type="button"
              />

              <Button
                color="teal"
                fluid
                size="large"
                onClick={this.login}
                loading={loadingLogin}
                type="submit"
              >
                Login
              </Button>
            </Form>
          </Modal.Content>
        </Modal>
      );
    } else {
      let { profile } = this.props;
      let avatar = null;
      let placeholder = null;
      if (profile && profile.avatar) {
        avatar = profile.avatar;
      } else {
        placeholder = (
          <Placeholder inverted>
            <Placeholder.Image square />
          </Placeholder>
        );
      }
      let avatarWidget = (
        <Image src={avatar} size="mini" rounded>
          {placeholder}
        </Image>
      );
      let display_name = profile ? profile.display_name : "?";

      button = (
        <Dropdown trigger={avatarWidget} icon={null} value={null}>
          <Dropdown.Menu>
            <Dropdown.Item disabled>
              Signed in as <strong>{display_name}</strong>
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/account/">
              My Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={this.handleSignOut}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    }
    return button;
  }
}

export default connect(
  state => ({
    tokens: state.user.tokens,
    profile: state.user.profile
  }),
  {
    setUserTokens,
    clearUserState,
    setUserProfile
  }
)(withRouter(LoginButton));
