import React from "react";
import {
  Segment,
  Header,
  Container,
  Card,
  Image,
  Responsive
} from "semantic-ui-react";
import { Helmet } from "react-helmet";
import { formatTitle } from "../util";
import RedirectButton from "./RedirectButton";

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>{formatTitle("Home")}</title>
      </Helmet>
      <Segment
        vertical
        inverted
        className="landing-page-segment"
        style={{ minHeight: "60vh", paddingLeft: "2em", paddingRight: "2em" }}
        textAlign="center"
      >
        <Responsive as="div" minWidth={495} style={{ height: "10vh" }} />
        <Header as="h1" inverted style={{ fontSize: "4em", marginTop: "8vh" }}>
          Trojan Scheduler
        </Header>
        <Header
          as="h2"
          inverted
          style={{ fontSize: "1.7em", marginTop: "1.5em" }}
        >
          Make schedules the easy way.
        </Header>
        <RedirectButton
          redirect={{ to: "/guide/", push: true }}
          button={{
            content: "Getting Started",
            size: "huge",
            basic: true,
            inverted: true,
            style: { marginBottom: 8 }
          }}
        />
        <RedirectButton
          redirect={{ to: "/app/", push: true }}
          button={{
            content: "Open Scheduler",
            size: "huge",
            basic: true,
            inverted: true,
            style: { marginBottom: 8 }
          }}
        />
      </Segment>
      <Container style={{ padding: "3em", paddingBottom: "9em" }}>
        <Card.Group itemsPerRow="3" stackable>
          <Card href="/guide/">
            <Image
              src="https://source.unsplash.com/random/600x400/?clock"
              wrapped
              ui={false}
            />
            <Card.Content>
              <Card.Header>Getting Started</Card.Header>
              <Card.Meta>bla bla bla</Card.Meta>
              <Card.Description>
                Learn how to use Trojan Scheduler. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Sed risus ultricies tristique
                nulla aliquet enim tortor. Felis eget velit aliquet sagittis id
                consectetur. Sit amet tellus cras adipiscing. Convallis aenean
                et tortor at.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card href="/faq/">
            <Image
              src="https://source.unsplash.com/random/600x400/?schedule"
              wrapped
              ui={false}
            />
            <Card.Content>
              <Card.Header>FAQ</Card.Header>
              <Card.Meta>bla bla bla</Card.Meta>
              <Card.Description>
                Learn how to use the scheduler. Elementum nisi quis eleifend
                quam adipiscing vitae proin sagittis nisl. Turpis egestas
                pretium aenean pharetra magna. Sed arcu non odio euismod lacinia
                at quis risus. Aliquam ultrices sagittis orci a scelerisque
                purus. Et tortor consequat id porta nibh venenatis cras. Aliquet
                risus feugiat in ante.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card href="/schedule/random/">
            <Image
              src="https://source.unsplash.com/random/600x400/?time"
              wrapped
              ui={false}
            />
            <Card.Content>
              <Card.Header>Feeling Lucky</Card.Header>
              <Card.Meta>go to a random schedule</Card.Meta>
              <Card.Description>
                Check out a random schedule made by other students!
              </Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>
      </Container>
    </>
  );
};

export default LandingPage;
