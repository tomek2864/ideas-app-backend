/* eslint-disable @typescript-eslint/no-explicit-any */
import * as utils from "./utils";
import * as strategies from "./auth/strategies";

const pipe = (...functions: any) => (args: any) => functions.reduce((arg: any, fn: any) => fn(arg), args);

const initialiseAuthentication = (app: any) => {
  utils.setup();

  pipe(strategies.JWTStrategy)(app);
};

export { utils, initialiseAuthentication, strategies };
