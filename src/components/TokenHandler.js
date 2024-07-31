import React from "react";
import { Redirect } from "react-router-dom";

const TokenHandler = props => {
  let params = new URLSearchParams(props.location.search);
  let token = params.get("token");
  params.delete("token");
  return (
    <Redirect
      to={{
        pathname: props.to,
        search: "?" + params.toString(),
        state: { token }
      }}
    />
  );
};

export default TokenHandler;
