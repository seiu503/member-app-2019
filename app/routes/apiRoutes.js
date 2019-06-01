/*
   routes to handle database queries
*/

/* ================================= SETUP ================================= */

const router = require("express").Router();
const passport = require("passport");

/* =========================== LOAD CONTROLLERS ============================ */

const userCtrl = require("../controllers/users.ctrl");
const authCtrl = require("../controllers/auth.ctrl");
const formMetaCtrl = require("../controllers/formMeta.ctrl");

/* =========================== ROUTE MIDDLEWARE ============================ */

const requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.log(`apiRoutes.js > 21: ${err}`);
      return res.status(422).send({ success: false, message: err.message });
    }
    if (!user) {
      console.log(`apiRoutes.js > 25: no user found`);
      return res.status(422).send({
        success: false,
        message: "Sorry, you must log in to view this page."
      });
    }
    if (user) {
      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        } else {
          return next(null, user);
        }
      });
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

// CREATE A USER
//   Example: POST >> /api/user
//   Secured: no
//   Expects:
//     request body properties : {
//           email           : String
//           name            : String
//           avatar_url      : String
//           google_id       : String
//           google_token    : String
//        }
//   Returns: JSON new user object on success.
//
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

router.put("/user/:id", requireAuth, userCtrl.updateUser);

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

router.delete("/user/:id", requireAuth, userCtrl.deleteUser);

/* ============================== FORM META ROUTES ========================= */

// CREATE A FORM META RECORD
//   Example: POST >> /api/form-meta
//   Secured: yes
//   Expects:
//     request body properties : {
//           form_meta type  : String
//           content         : String
//        }
//   Returns: JSON form meta object on success.
//
router.post("/form-meta", requireAuth, formMetaCtrl.createFormMeta);

// UPDATE A FORM META RECORD
//   Example: PUT >> /api/form-meta/:id
//   Secured: yes
//   Expects:
//     1) request body properties : {
//          updates         : Object {
//              form_meta type  : String
//              content         : String
//             }
//        }
//      2) request params         : {
//          id              : String
//      }
//   Returns: JSON updated form meta object on success.
//

router.put("/form-meta/:id", requireAuth, formMetaCtrl.updateFormMeta);

// GET ONE FORM META RECORD BY ID
//   Example: GET >> /api/form-meta/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON form meta object on success.
//
router.get("/form-meta/:id", formMetaCtrl.getFormMetaById);

// GET FORM META CONTENT BY TYPE
//   Example: GET >> /api/form-meta/headline
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: Array of form meta objects on success.
//
router.get("/form-meta/:form_meta_type", formMetaCtrl.getFormMetaById);

// GET ALL FORM META CONTENT
//   Example: GET >> /api/form-meta/
//   Secured: yes
//   Expects: null
//   Returns: Array of form meta objects on success.
//
router.get("/form-meta/", requireAuth, formMetaCtrl.getFormMeta);

// DELETE FORM META
//   Example: DELETE >> /api/form-meta/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: success message on success.
//
router.delete("/form-meta/:id", requireAuth, formMetaCtrl.deleteFormMeta);

/* ================================ EXPORT ================================= */

module.exports = router;
