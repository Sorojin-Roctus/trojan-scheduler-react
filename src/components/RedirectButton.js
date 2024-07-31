import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import { Redirect } from "react-router-dom";

const RedirectButton = props => {
  const [clicked, setClicked] = useState(false);
  if (!clicked) {
    return <Button {...props.button} onClick={() => setClicked(true)} />;
  } else {
    return <Redirect {...props.redirect} />;
  }
};

export default RedirectButton;
