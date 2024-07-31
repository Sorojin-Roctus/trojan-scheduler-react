import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { setUserTokens, clearUserState } from "./actions";
import jwtDecode from "jwt-decode";
import { defaultTimeout } from "./settings";

const statusCodes = [401];

// Creates the function that will be called to refresh authorization
const refreshAuthLogicCreator = store => failedRequest => {
  let { tokens } = store.getState().user;
  let refresh = tokens ? tokens.refresh : null;
  console.log("failed request: " + failedRequest.response.config.url);
  return axios
    .post(
      "/api/token/refresh/",
      { refresh },
      { skipAuthRefresh: true, NoJWT: true, timeout: defaultTimeout }
    )
    .then(tokenRefreshResponse => {
      console.log("refresh token success");
      store.dispatch(setUserTokens(tokenRefreshResponse.data));
      return Promise.resolve();
    })
    .catch(error => {
      console.log("refresh failed, clear tokens");
      store.dispatch(clearUserState());
      return Promise.reject(failedRequest);
    });
};

const isHandlerEnabled = (config = {}) => {
  return config.hasOwnProperty("NoJWT") && config.NoJWT ? false : true;
};

const requestInterceptorCreator = store => request => {
  let { tokens } = store.getState().user;
  if (isHandlerEnabled(request) && tokens && tokens.access) {
    console.log(`add access token for ${request.url}`);
    request.headers["Authorization"] = `Bearer ${tokens.access}`;
  } else {
    console.log(
      `no token for ${request.url}, tokens: ${Boolean(
        tokens
      )}, injection: ${isHandlerEnabled(request)}`
    );
  }
  return request;
};

// only try to refresh access token if the request has access token set
// and the token is no longer valid.
const errorFilter = error => {
  if (error.response && statusCodes.includes(parseInt(error.response.status))) {
    let authHeader = error.response
      ? error.response.config.headers.Authorization
      : null;
    // if the original request doesn't have auth header, do not refresh
    if (authHeader) {
      let token = authHeader.match(
        /Bearer\s+([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/i
      )[1];
      // if valid auth header, proceed, otherwise do not refresh
      if (token) {
        let exp = null;
        // try decode the token to get exp claim, if fails, do not refresh
        try {
          exp = jwtDecode(token).exp;
        } catch (error) {
          // ignore
        }
        if (exp !== null) {
          // if the token has expired, do not modify the response (refresh)
          if (exp * 1000 < new Date().getTime()) {
            return Promise.reject(error);
          }
          // verify the token, if it is valid, do not refresh
          return axios
            .post(
              "/api/token/verify/",
              { token },
              { skipAuthRefresh: true, NoJWT: true, timeout: defaultTimeout }
            )
            .then(() => {
              error.config.skipAuthRefresh = true;
              return Promise.reject(error);
            })
            .catch(() => Promise.reject(error));
        }
      }
    }
  }
  if (error.config) error.config.skipAuthRefresh = true;
  return Promise.reject(error);
};

const setupJwtRefresh = store => {
  axios.defaults.timeout = defaultTimeout;
  axios.interceptors.response.use(success => success, errorFilter);
  axios.interceptors.request.use(requestInterceptorCreator(store));
  createAuthRefreshInterceptor(axios, refreshAuthLogicCreator(store), {
    statusCodes,
    skipWhileRefreshing: false
  });
};

export default setupJwtRefresh;
