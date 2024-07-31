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
  formatTitle
} from "../../util";
import { Helmet } from "react-helmet";

const errorFormatter = errorFormatterCreator(
  responseDataFormatter,
  statusCodeFormatter
);

class PasswordForgetPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      success: false,
      email: ""
    };
    this.cancelSource = axios.CancelToken.source();
  }

  requestToken = () => {
    let { email } = this.state;
    this.setState({ loading: true, error: null });
    axios
      .post(
        `/api/password/forget/`,
        { email },
        {
          cancelToken: this.cancelSource.token,
          skipAuthRefresh: true,
          NoJWT: true
        }
      )
      .then(() => {
        this.setState({ loading: false, success: true });
      })
      .catch(error => {
        this.setState({ loading: false, error: errorFormatter(error) });
      });
  };

  handleEmailChange = (e, { name, value }) => {
    if (this.state[name] !== undefined) {
      this.setState({ [name]: value });
    }
  };

  render() {
    let { success, loading, error, email } = this.state;

    return (
      <Container className="main-content">
        <Segment
          className="dynamic"
          padded="very"
          loading={loading}
          style={{ maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}
        >
          <Helmet>
            <title>{formatTitle("Forget Password")}</title>
          </Helmet>
          <Header size="large" as="h1" textAlign="center">
            Forget Password
            <Header.Subheader>
              Please enter the email you used to register account with.
            </Header.Subheader>
          </Header>
          {success && (
            <Header icon textAlign="center">
              <Icon name="send" />
              Email Sent
              <Header.Subheader>
                Follow the instructions in the email to reset your password.
              </Header.Subheader>
            </Header>
          )}
          {error && <Message error>{error}</Message>}
          {!success && (
            <Form style={{ marginTop: "1em", marginBottom: "1em" }}>
              <Form.Input
                required
                fluid
                value={email}
                label="Email"
                name="email"
                onChange={this.handleEmailChange}
                type="email"
                icon="mail"
                iconPosition="left"
              />
              <Form.Button
                type="submit"
                fluid
                loading={loading}
                disabled={loading}
                onClick={this.requestToken}
                content="Submit"
              />
            </Form>
          )}
        </Segment>
      </Container>
    );
  }
}

export default PasswordForgetPage;
