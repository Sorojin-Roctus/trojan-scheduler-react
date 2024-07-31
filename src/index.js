import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { allReducers } from "./reducers";
import persistState from "redux-localstorage";
import setupJwtRefresh from "./axiosJwtRefresh";

const store = configureStore({
  reducer: allReducers,
  enhancers: [
    persistState(["user", "course", "preference", "setting", "task_result"])
  ]
});

setupJwtRefresh(store);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
