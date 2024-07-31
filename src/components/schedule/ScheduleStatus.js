import React from "react";
import { Label, Popup, Icon } from "semantic-ui-react";
import moment from "moment";

const expireWarning = schedule => {
  if (schedule.saved) {
    return null;
  }
  let created = moment(schedule.created);
  let expireAt = created.add(30, "d");
  let timeToExpire = expireAt.diff(moment());
  let timeStr = timeToExpire > 0 ? expireAt.fromNow() : "anytime soon";
  if (timeToExpire < moment.duration(30, "m").asMilliseconds()) {
    return (
      <Popup
        trigger={<Icon name="trash alternate" color="yellow" size="large" />}
        content={`Will be removed ${timeStr}.`}
      />
    );
  } else if (timeToExpire < moment.duration(5, "d").asMilliseconds()) {
    return (
      <Popup
        trigger={<Icon name="clock" color="yellow" size="large" />}
        content={`Expire ${timeStr}.`}
      />
    );
  }
  return null;
};

const ScheduleStatus = props => {
  let { schedule } = props;
  if (props.inline) {
    return (
      <span style={{ marginLeft: "0.5em" }}>
        {schedule.saved && <Icon name="save" color="blue" size="large" />}
        {schedule.public && <Icon name="child" color="green" size="large" />}
        {expireWarning(schedule)}
      </span>
    );
  }
  return (
    <Label.Group style={{ marginTop: 7 }}>
      {schedule.saved && (
        <Label color="blue">
          <Icon name="save" />
          saved
        </Label>
      )}
      {schedule.public && (
        <Label color="green">
          <Icon name="child" />
          {schedule.user ? "public" : "anonymous"}
        </Label>
      )}
      {expireWarning(schedule)}
    </Label.Group>
  );
};

export default ScheduleStatus;
