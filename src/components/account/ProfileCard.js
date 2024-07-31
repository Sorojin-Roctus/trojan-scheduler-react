import React from "react";
import { Card, Image } from "semantic-ui-react";
import moment from "moment";

const ProfileCard = props => {
  let {
    id,
    avatar,
    display_name,
    date_joined,
    show_date_joined,
    first_name,
    last_name,
    nickname,
    show_name,
    email,
    show_email,
    email_verified,
    style
  } = props;

  if (show_date_joined !== null && !show_date_joined) date_joined = null;

  nickname = nickname ? `(${nickname})` : "";
  let name = null;
  if (
    (show_name === undefined || show_name) &&
    (first_name || last_name || nickname)
  )
    name = `${first_name} ${last_name} ${nickname}`;
  if (!email_verified || (show_email !== undefined && !show_email))
    email = null;

  return (
    <Card style={style}>
      <Image src={avatar} wrapped ui={false} />
      <Card.Content>
        <Card.Header>{display_name}</Card.Header>
        {(name || email) && (
          <Card.Description>
            {name && <p>{name}</p>}
            {email && <a href={`mailto:${email}`}>{email}</a>}
          </Card.Description>
        )}
      </Card.Content>
      {id && (
        <Card.Content extra>
          U#{id}
          {date_joined && ` | Joined on ${moment(date_joined).format("LL")}`}
        </Card.Content>
      )}
    </Card>
  );
};

export default ProfileCard;
