import React from "react";
import { Segment, Header, Icon, Container } from "semantic-ui-react";
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

class EmailVerificationPage extends React.Component {
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
      success
    };
    this.cancelSource = axios.CancelToken.source();
  }

  verifyEmail = () => {
    let { token } = this.state;
    this.setState({ loading: true });
    axios
      .post(
        `/api/verify-email/`,
        {},
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

  componentDidMount() {
    if (this.state.token) {
      this.verifyEmail();
    }
  }

  render() {
    let { success, loading, error, token } = this.state;
    return (
      <Container className="main-content">
        <Segment
          className="dynamic"
          padded="very"
          loading={loading}
          style={{ maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}
        >
          <Helmet>
            <title>{formatTitle("Verify Email")}</title>
          </Helmet>
          <Header size="large" as="h1" textAlign="center">
            Verify Your Email
          </Header>
          {success && (
            <Header icon textAlign="center">
              <Icon name="check" />
              Email Verified
              <Header.Subheader>Log in to continue.</Header.Subheader>
            </Header>
          )}
          {error && error === 401 && (
            <Header icon textAlign="center">
              <Icon name="times" />
              Invalid Token
              <Header.Subheader>
                The token is not valid or has expired. Are you sure you copied
                the entire link?
              </Header.Subheader>
            </Header>
          )}
          {error && error !== 401 && (
            <Header icon textAlign="center">
              <Icon name="times" />
              Failed to Verify
              <Header.Subheader>{error}</Header.Subheader>
            </Header>
          )}
          {!success && !token && (
            <Header icon textAlign="center">
              <Icon name="expand" />
              No Token
              <Header.Subheader>
                Please use the link in the email.
              </Header.Subheader>
            </Header>
          )}
        </Segment>
      </Container>
    );
  }
}

export default EmailVerificationPage;
