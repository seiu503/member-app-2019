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
const contactCtrl = require("../controllers/contacts.ctrl");
// const imageCtrl = require("../controllers/imageUpload.ctrl");

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
// router.put("/submission/:id", submissionCtrl.updateSubmission);
router.put("/submission/:id", requireAuth, submissionCtrl.updateSubmission);

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

/* ============================== CONTACT ROUTES =========================== */

// CREATE A CONTACT
//   Example: POST >> /api/contact/
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              display_name                  : String
//              account_name                  : String
//              agency_number                 : String
//              mail_to_city                  : String
//              mail_to_state                 : String
//              mail_to_street                : String
//              mail_to_postal_code           : String
//              first_name                    : String
//              last_name                     : String
//              dd                            : String
//              mm                            : String
//              yyyy                          : String
//              dob                           : String
//              preferred_language            : String
//              home_street                   : String
//              home_postal_code              : String
//              home_state                    : String
//              home_city                     : String
//              home_email                    : String
//              mobile_phone                  : String
//              text_auth_opt_out             : Boolean
//              terms_agree                   : Boolean
//              signature                     : String
//              online_campaign_source        : String
//              signed_application            : Boolean
//              ethnicity                     : String
//              lgbtq_id                      : Boolean
//              trans_id                      : Boolean
//              disability_id                 : Boolean
//              deaf_or_hard_of_hearing       : Boolean
//              blind_or_visually_impaired    : Boolean
//              gender                        : String
//              gender_other_description      : String
//              gender_pronoun                : String
//              job_title                     : String
//              hire_date                     : Date
//              worksite                      : String
//              work_email                    : String
//             }
//        }
//   Returns: JSON created contact object on success.
//
router.post("/contact", contactCtrl.createContact);

// UPDATE A CONTACT
//   Example: PUT >> /api/contact/:id
//   Secured: yes
//   Expects:
//     1) request body properties : {
//          updates         : Object {
//              account_name          : String
//              agency_number         : String
//              mail_to_city          : String
//              first_name            : String
//              text_auth_opt_out     : Boolean
//             }
//        }
//      2) request params         : {
//          id              : String
//      }
//   Returns: JSON updated contact object on success.
//
// router.put("/contact/:id", contactCtrl.updateContact);
router.put("/contact/:id", requireAuth, contactCtrl.updateContact);

// GET ONE CONTACT
//   Example: GET >> /api/contact/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON contact object on success.
//
// router.get("/contact/:id", contactCtrl.getContactById);
router.get("/contact/:id", requireAuth, contactCtrl.getContactById);

// GET ALL CONTACTS
//   Example: GET >> /api/contact/
//   Secured: yes
//   Expects: null
//   Returns: Array of contact objects on success.
//
// router.get("/contact/", contactCtrl.getContacts);

// GET CONTACT_SUBMISSIONS BY CONTACT_ID
//   Example: GET >> /api/contacts/submissions/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: Object with contact and Array of related submission objects on success.
//
// router.get("/contact/submissions/:id", contactCtrl.getContactSubmissionsById);
router.get("/contact/", requireAuth, contactCtrl.getContacts);

// DELETE CONTACT
//   Example: DELETE >> /api/contact/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: success message on success.
//
// router.delete("/contact/:id", contactCtrl.deleteContact);
router.delete("/contact/:id", requireAuth, contactCtrl.deleteContact);

/* ================================ EXPORT ================================= */

module.exports = router;
