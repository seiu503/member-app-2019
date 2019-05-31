/*
   routes to handle database queries
*/

/* ================================= SETUP ================================= */

const router = require("express").Router();
const passport = require("passport");

/* =========================== LOAD CONTROLLERS ============================ */

const userCtrl = require("../controllers/users.ctrl");
const authCtrl = require("../controllers/auth.ctrl");
const submissionCtrl = require("../controllers/submissions.ctrl");

/* =========================== ROUTE MIDDLEWARE ============================ */

const requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    console.log("requireAuth");
    if (err) {
      console.log(`apiRoutes.js > 21: ${err}`);
      return res.status(422).send({ success: false, message: err.message });
    }
    if (!user) {
      return res.status(422).send({
        success: false,
        message: "Sorry, you must log in to view this page."
      });
    }
    if (user) {
      console.log(`apiRoutes.js > 31: user found`);
      req.login(user, loginErr => {
        if (loginErr) {
          console.log(`apiRoutes.js > 34: ${loginErr}`);
          return next(loginErr);
        } else {
          console.log(`apiRoutes.js > 37: returning next`);
          return next(loginErr, user);
        }
      }); // req.login
    }
  })(req, res, next);
};

/* ============================== AUTH ROUTES =========================== */

// GOOGLE AUTH WITH PASSPORT
//   Example: GET >> /auth/google
//   Secured: no
//   Expects: null
//   Returns: Redirect to google callback route on success.
//
router.get(
  "/auth/google",
  passport.authenticate(
    "google",
    { session: false },
    { scope: ["profile", "email"] }
  )
);

// GOOGLE CALLBACK ROUTE
//   Example: GET >> /auth/google/callback
//   Secured: no
//   Expects: null
//   Returns: User object and token.
//
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  authCtrl.googleCallback
);

/* ============================== USER ROUTES =========================== */

router.post("/user", userCtrl.createUser);

// UPDATE A USER
//   Example: PUT >> /api/user/:id
//   Secured: yes
//   Expects:
//     1) request body properties : {
//          updates         : Object {
//              email           : String
//              name            : String
//              avatar_url      : String
//             }
//        }
//      2) request params         : {
//          id              : String
//      }
//   Returns: JSON updated user object on success.
//
router.put("/user/:id", userCtrl.updateUser);
// router.put("/user/:id", requireAuth, userCtrl.updateUser);

// GET ONE USER
//   Example: GET >> /api/user/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON user object on success.
//
router.get("/user/:id", userCtrl.getUserById);

// GET ALL USERS
//   Example: GET >> /api/user/
//   Secured: no
//   Expects: null
//   Returns: Array of user objects on success.
//
router.get("/user/", userCtrl.getUsers);

// DELETE USER
//   Example: DELETE >> /api/user/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: success message on success.
//
router.delete("/user/:id", userCtrl.deleteUser);
// router.delete("/user/:id", requireAuth, userCtrl.deleteUser);

/* ============================== SUBMISSION ROUTES =========================== */

// CREATE A SUBMISSION
//   Example: POST >> /api/submission/
//   Secured: yes
//   Expects:
//     1) request body properties : {
//          Object {
//              ip_address                       : String
//              submission_date                  : Timestamp
//              agency_number                    : String
//              birthdate                        : String
//              cell_phone                       : String
//              employer_name                    : String
//              first_name                       : String
//              last_name                        : String
//              home_street                      : String
//              home_city                        : String
//              home_state                       : String
//              home_zip                         : String
//              home_email                       : String
//              preferred_language               : String
//              terms_agree                      : Boolean
//              Signature                        : String
//              text_auth_opt_out                : Boolean
//              online_campaign_source           : String
//              contact_id                       : String
//              legal_language                   : String
//              maintenance_of_effort            : Date
//              seiu503_cba_app_date             : Date
//              direct_pay_auth                  : Date
//              direct_deposit_auth              : Date
//              immediate_past_member_status     : String
//             }
//        }
//   Returns: JSON created submission object on success.
//
router.post("/submission", submissionCtrl.createSubmission);

// UPDATE A SUBMISSION
//   Example: PUT >> /api/submission/:id
//   Secured: yes
//   Expects:
//     1) request body properties : {
//          updates         : Object {
//              ip_address         : String
//              submission_date    : Timestamp
//              agency_number      : String
//              birthdate          : String
//             }
//        }
//      2) request params         : {
//          id              : String
//      }
//   Returns: JSON updated submission object on success.
//
router.put("/submission/:id", submissionCtrl.updateSubmission);
// router.put("/submission/:id", requireAuth, submissionCtrl.updateSubmission);

// GET ONE SUBMISSION
//   Example: GET >> /api/submission/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON submission object on success.
//
router.get("/submission/:id", submissionCtrl.getSubmissionById);
// router.get("/submission/:id", requireAuth, submissionCtrl.getSubmissionById);

// GET ALL SUBMISSIONS
//   Example: GET >> /api/submission/
//   Secured: no
//   Expects: null
//   Returns: Array of submission objects on success.
//
router.get("/submission/", userCtrl.getSubmissions);

// GET SUBMISSIONS BY CONTACT_ID
//   Example: GET >> /api/submission/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: Array of submission objects on success.
//
router.get("/submission/contact/:id", submissionCtrl.getSubmissionsByContactId);
// router.get("/submission/contact/:id", requireAuth, submissionCtrl.getSubmissionsById);

// GET ALL SUBMISSIONS
//   Example: GET >> /api/submission/
//   Secured: no
//   Expects: null
//   Returns: Array of submission objects on success.
//
router.get("/submission/", userCtrl.getSubmissions);

// DELETE SUBMISSION
//   Example: DELETE >> /api/submission/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: success message on success.
//
router.delete("/submission/:id", submissionCtrl.deleteSubmission);
// router.delete("/submission/:id", requireAuth, submission.deleteSubmission);

/* ================================ EXPORT ================================= */

module.exports = router;
