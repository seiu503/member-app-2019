/*
   routes to handle database queries
*/

/* ================================= SETUP ================================= */

const router = require("express").Router();
const passport = require("passport");

/* =========================== LOAD CONTROLLERS ============================ */

const userCtrl = require("../controllers/users.ctrl");
const authCtrl = require("../controllers/auth.ctrl");
const contentCtrl = require("../controllers/content.ctrl");
const submissionCtrl = require("../controllers/submissions.ctrl");
const imageCtrl = require("../controllers/image.ctrl");
const sfCtrl = require("../controllers/sf.ctrl");

/* =========================== ROUTE MIDDLEWARE ============================ */

const requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.log(`apiRoutes.js > 24: ${err}`);
      return res.status(422).send({ success: false, message: err.message });
    }
    if (!user) {
      console.log(`apiRoutes.js > 28: no user found`);
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

/* ============================= CONTENT ROUTES ============================ */

// CREATE A CONTENT RECORD
//   Example: POST >> /api/content
//   Secured: yes
//   Expects:
//     request body properties : {
//           content_type  : String
//           content       : String
//        }
//   Returns: JSON content object on success.
//
router.post("/content", requireAuth, contentCtrl.createContent);

// UPDATE A CONTENT RECORD
//   Example: PUT >> /api/content/:id
//   Secured: yes
//   Expects:
//     1) request body properties : {
//          updates         : Object {
//              content_type  : String
//              content       : String
//             }
//        }
//      2) request params         : {
//          id              : String
//      }
//   Returns: JSON updated content object on success.
//

router.put("/content/:id", requireAuth, contentCtrl.updateContent);

// GET ONE CONTENT RECORD BY ID
//   Example: GET >> /api/content/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON content object on success.
//
router.get("/content/:id", contentCtrl.getContentById);

// GET CONTENT BY TYPE
//   Example: GET >> /api/content/headline
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: Array of content objects on success.
//
router.get("/content/:content_type", contentCtrl.getContentByType);

// GET ALL CONTENT
//   Example: GET >> /api/content/
//   Secured: yes
//   Expects: null
//   Returns: Array of content objects on success.
//
router.get("/content/", requireAuth, contentCtrl.getContent);

// DELETE CONTENT
//   Example: DELETE >> /api/content/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: success message on success.
//
router.delete("/content/:id", requireAuth, contentCtrl.deleteContent);

/* ========================= IMAGE ROUTES =========================== */

// UPLOAD A SINGLE IMAGE
//   Example: POST >> /api/image/single
//   Secured: yes
//   Expects:
//     file upload
//   Returns: Object
//   {
//     image: imageName,
//     location: imageLocation
//   }
//
router.post("/image/single", requireAuth, imageCtrl.singleImgUpload);

// DELETE AN IMAGE FROM S3 BUCKET
// (this route is hit after the content is delete from the postgres database)
//   Example: DELETE >> /api/image/
//   Secured: yes
//   Expects:
//     request body: {
//        key: S3 object key
//     }
//   Returns: Success or Error message
//
router.delete("/image/:key", requireAuth, imageCtrl.deleteImage);

/* =========================== SUBMISSION ROUTES =========================== */

// CREATE A SUBMISSION
// This route calls 3 controller functions:
// (1) Creates a submission in the Postgres DB
// (2) Creates an 'OnlineMemberApp__c' object in Salesforce
// (3) Updates the corresponding contact record in Salesforce with any
//     new or changed fields from the submission
//
//   Example: POST >> /api/submission/
//   Secured: No
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
router.post(
  "/submission",
  submissionCtrl.createSubmission,
  sfCtrl.createSFOnlineMemberApp,
  sfCtrl.updateSFContact
);

// UPDATE A SUBMISSION
//   Example: PUT >> /api/submission/:id
//   Secured: no
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
router.put(
  "/submission/:id",
  submissionCtrl.updateSubmission,
  sfCtrl.updateSFContact
);
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
// router.get("/submission/:id", submissionCtrl.getSubmissionById);
router.get("/submission/:id", requireAuth, submissionCtrl.getSubmissionById);

// GET ALL SUBMISSIONS
//   Example: GET >> /api/submission/
//   Secured: yes
//   Expects: null
//   Returns: Array of submission objects on success.
//
router.get("/submission/", requireAuth, submissionCtrl.getSubmissions);

// DELETE SUBMISSION
//   Example: DELETE >> /api/submission/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: success message on success.
//
// router.delete("/submission/:id", submissionCtrl.deleteSubmission);
router.delete("/submission/:id", requireAuth, submissionCtrl.deleteSubmission);

/* =========================== SALESFORCE ROUTES =========================== */

// GET ONE SALESFORCE CONTACT RECORD BY ID
//   Example: GET >> /api/sf/0036100001gYL0HAAW
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON selected fields from salesforce contact object on success.
//
router.get("/sf/:id", sfCtrl.getSFContactById);

// GET ALL ACTIVE EMPLOYER NAMES
//   Example: GET >> /api/sfaccts
//   Secured: no
//   Expects: nada
//   Returns: Array of SF Account objects including:
//      Id, Name, Sub_Division__c, Agency_Number__c.
//
router.get("/sfaccts", sfCtrl.getAllEmployers);

/* ================================ EXPORT ================================= */

module.exports = router;
