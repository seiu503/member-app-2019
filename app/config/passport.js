import passport from "passport";
import Auth from "../config/auth.js";

export default passportConfig => {
  passport.use("jwt", Auth.jwtStrategy);
  passport.use("google", Auth.googleStrategy);
};
