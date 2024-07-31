import React from "react";
import {
  Segment,
  Header,
  Icon,
  Message,
  Form,
  Container
} from "semantic-ui-react";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  matchStatusCode,
  formatTitle
} from "../../util";
import { Helmet } from "react-helmet";

const errorFormatter = errorFormatterCreator(
  matchStatusCode(() => 401, [401]),
  responseDataFormatter,
  statusCodeFormatter
);

class PasswordResetPage extends React.Component {
  constructor(props) {
    super(props);
    let token = null;
    let success = false;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      if (params.has("success")) success = true;
    }
    if (this.props.location && this.props.location.state) {
      token = this.props.location.state.token;
    }
    this.state = {
      token,
      loading: false,
      error: null,
      success,
      password: "",
      password2: ""
    };
    this.cancelSource = axios.CancelToken.source();
  }

  resetPassword = () => {
    let { token, password, password2 } = this.state;
    if (password !== password2) {
      this.setState({ error: "Passwords do not match" });
      return;
    }
    this.setState({ loading: true, error: null });
    axios
      .post(
        `/api/password/reset/`,
        { password },
        {
          headers: {
            Authorization: "Bearer " + token
          },
          cancelToken: this.cancelSource.token,
          skipAuthRefresh: true,
          NoJWT: true
        }
      )
      .then(response => {
        this.setState({ loading: false, success: true }, () => {
          this.props.history.replace("./?success");
        });
      })
      .catch(error => {
        this.setState({ loading: false, error: errorFormatter(error) });
      });
  };

  handlePasswordChange = (e, { name, value }) => {
    if (this.state[name] !== undefined) {
      this.setState({ [name]: value });
    }
  };

  render() {
    let { success, loading, error, token, password, password2 } = this.state;
    let invalid_token = error === 401;

    return (
      <Container className="main-content">
        <Segment
          className="dynamic"
          padded="very"
          loading={loading}
          style={{ maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}
        >
          <Helmet>
            <title>{formatTitle("Password Reset")}</title>
          </Helmet>
          <Header size="large" as="h1" textAlign="center">
            Password Reset
          </Header>
          {success && (
            <Header icon textAlign="center">
              <Icon name="check" />
              Password Updated
              <Header.Subheader>Log in to continue.</Header.Subheader>
            </Header>
          )}
          {!invalid_token && error && <Message error>{error}</Message>}
          {invalid_token && (
            <Header icon textAlign="center">
              <Icon name="times" />
              Invalid Token
              <Header.Subheader>
                The token is not valid or has expired. Are you sure you copied
                the entire link?
              </Header.Subheader>
            </Header>
          )}
          {!success && !token && (
            <Header icon textAlign="center">
              <Icon name="expand" />
              No Token
              <Header.Subheader>
                Please use the link in the email to reset password.
              </Header.Subheader>
            </Header>
          )}
          {!invalid_token && !success && token && (
            <Form>
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
                  password !== password2 ? "Passwords do not match." : null
                }
              />
              <Form.Button
                type="submit"
                fluid
                loading={loading}
                disabled={loading}
                onClick={this.resetPassword}
                content="Submit"
              />
            </Form>
          )}
        </Segment>
      </Container>
    );
  }
}

export default PasswordResetPage;
