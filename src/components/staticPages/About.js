import React from "react";
import { Segment, Header, Container } from "semantic-ui-react";

const About = () => {
  return (
    <Container text className="main-content">
      <Segment padded="very" className="dynamic larger-text">
        <Header as="h1">About</Header>
        <p>
          Trojan Scheduler is the third iteration of the scheduler apps I have
          been working on. I created{" "}
          <a href="https://www.yichiyang.com/usc-course-planner/">
            my first scheduler app
          </a>{" "}
          in the summer of 2019 because I was extremely frustrated by the USC
          Web Registration System, which does not have any builtin feature that
          helps students fix schedule conflicts.{" "}
          <a href="https://chrome.google.com/webstore/detail/usc-schedule-helper/gchplemiinhmilinflepfpmjhmbfnlhk">
            USC Schedule Helper
          </a>
          , a very popular Chrome extension made by a fellow Trojan, does point
          out time conflicts, but users do have to solve these conflicts
          themselves. When sessions start to fill up, this manual labor becomes
          very tedious. Additionally, I like the idea that given certain
          constraints, I can somehow be sure that my schedule is indeed the best
          possible. After spending a few days coding, I came up with a PyQt5 app
          that solves most of my problems.
        </p>
        <p>
          A few months later, my teammates and I worked on a similar app as our
          CSCI 201 final project, except it is a web app this time. During the
          final presentation, a classmate asked us if we would make the app
          available to all USC students. I liked the idea of deploying the app,
          but since it was a class project, it had to meet some requirements
          that honestly didn't make sense to me, and the app itself was hacked
          together in a short amount of time (you know how typical class project
          works). Given the less than ideal usability and lack of polish, I
          didn't think it was worth it to host it on a server.
        </p>
        <p>
          In the last few months, I started from scratch and coded a completely
          new web app (the one you see now) with Django and React.js. Part of
          the goal was to make the project more polished and maintainable, and
          to implements additional features that I wanted the app to have. On
          the other hand, I just wanted to play with popular backend and
          frontend frameworks and see what I can come up with. I indeed had lots
          of fun working on this project.
        </p>
        <p>
          Now I have deployed the project, I intend to host it as long as there
          are people who use the app. If you like Trojan Scheduler, please share
          it with your friends!
        </p>
        <Header as="h2" id="contact">
          Contact
        </Header>
        <p>
          Email:{" "}
          <a href="mailto:scheduler@yichiyang.com">scheduler@yichiyang.com</a>{" "}
          (bug reports, feature requests, etc.)
        </p>
        <p>
          Email: <a href="mailto:yichiyan@usc.edu">yichiyan@usc.edu</a> (things
          not related to the scheduler app)
        </p>
        <p>
          GitHub repo:{" "}
          <a href="https://github.com/yichi-yang/trojan-scheduler-django">
            trojan-scheduler-django
          </a>
        </p>
        <p>
          Other fun projects:{" "}
          <a href="https://www.yichiyang.com/">yichiyang.com</a>
        </p>
      </Segment>
    </Container>
  );
};

export default About;
