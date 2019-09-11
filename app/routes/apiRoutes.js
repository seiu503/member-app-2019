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

/* =========================== VERIFY CAPTCHA  ============================= */

// VERIFY CAPTCHA
//   Example: POST >> /api/verify
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              ip_address    : String
//              token         : String
//             }
//   Returns: { cardAddingUrl } or error message.
//
router.post("/verify", submissionCtrl.verifyHumanity);

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
router.put("/user/:id", authCtrl.requireAuth, userCtrl.updateUser);

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

router.delete("/user/:id", authCtrl.requireAuth, userCtrl.deleteUser);

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
router.post("/content", authCtrl.requireAuth, contentCtrl.createContent);

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

router.put("/content/:id", authCtrl.requireAuth, contentCtrl.updateContent);

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
//   Example: GET >> /api/contenttype/headline
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: Array of content objects on success.
//
router.get("/contenttype/:content_type", contentCtrl.getContentByType);

// GET ALL CONTENT
//   Example: GET >> /api/content/
//   Secured: yes
//   Expects: null
//   Returns: Array of content objects on success.
//
router.get("/content/", authCtrl.requireAuth, contentCtrl.getContent);

// DELETE CONTENT
//   Example: DELETE >> /api/content/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: yes
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: success message on success.
//
router.delete("/content/:id", authCtrl.requireAuth, contentCtrl.deleteContent);

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
router.post("/image/single", imageCtrl.singleImgUpload);
// router.post("/image/single", authCtrl.requireAuth, imageCtrl.singleImgUpload);

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
router.delete("/image/:key", authCtrl.requireAuth, imageCtrl.deleteImage);

/* =========================== SUBMISSION ROUTES =========================== */

// CREATE A SUBMISSION
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
router.post("/submission", submissionCtrl.createSubmission);

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
router.put("/submission/:id", submissionCtrl.updateSubmission);

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
router.get(
  "/submission/:id",
  authCtrl.requireAuth,
  submissionCtrl.getSubmissionById
);

// GET ALL SUBMISSIONS
//   Example: GET >> /api/submission/
//   Secured: yes
//   Expects: null
//   Returns: Array of submission objects on success.
//
router.get("/submission/", authCtrl.requireAuth, submissionCtrl.getSubmissions);

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
router.delete(
  "/submission/:id",
  authCtrl.requireAuth,
  submissionCtrl.deleteSubmission
);

/* =========================== SALESFORCE ROUTES =========================== */

/* =============================== CONTACTS ================================ */

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

// GET ONE SALESFORCE CONTACT RECORD BY FIRST, LAST, EMAIL
//   Example: GET >> /api/sflookup
//   Secured: no
//   Expects:
//     1) request params : {
//          body : {
//            first_name: string,
//            last_name: string,
//            home_email: string
//           }
//        }
//   Returns: JSON object with salesforce id on success.
//
router.put("/sflookup", sfCtrl.lookupSFContactByFLE);

// CREATE SALESFORCE CONTACT RECORD
//   Example: POST >> /api/sfcontact
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              agency_number                    : String
//              employer_id                      : String
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
//              text_auth_opt_out                : Boolean
//             }
//   Returns: Contact Id or error message.
//
router.post("/sf", sfCtrl.createSFContact);

// UPDATE A SALESFORCE CONTACT RECORD
//   Example: PUT >> /api/sf/0035500000VFAE9AAP
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              ip_address                       : String
//              submission_date                  : Timestamp
//              agency_number                    : String
//              employer_id                      : String
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
//   Returns: Salesforce contact id (if called as standalone)
//   OR passes contact ID to next middleware.
//
router.put("/sf/:id", sfCtrl.updateSFContact);

// DELETE ONE SALESFORCE CONTACT RECORD BY ID
// This is really only needed for cleanup after testing...
//   Example: DELETE >> /api/sf/0036100001gYL0HAAW
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: Success or error message.
//
router.delete("/sf/:id", sfCtrl.deleteSFContactById);

/* ========================== ONLINE MEMBER APPS =========================== */

// CREATE ONE SALESFORCE ONLINE MEMBER APP RECORD BY ID
// This is really only needed for testing...
//   Example: POST >> /api/sfOMA/0036100001gYL0HAAW
//   Secured: no
//   Expects:
//     1) request params : {
//          body : Object { ...submission fields }
//        }
//   Returns: OMA object or error message.
//
router.post("/sfOMA", sfCtrl.createSFOnlineMemberApp);

// DELETE ONE SALESFORCE ONLINE MEMBER APP RECORD BY ID
// This is really only needed for cleanup after testing...
//   Example: DELETE >> /api/sfOMA/0036100001gYL0HAAW
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: Success or error message.
//
router.delete("/sfOMA/:id", sfCtrl.deleteSFOnlineMemberApp);

/* =============================== ACCOUNTS ================================ */

// GET ALL ACTIVE EMPLOYER NAMES
//   Example: GET >> /api/sfaccts
//   Secured: no
//   Expects: nada
//   Returns: Array of SF Account objects including:
//      Id, Name, Sub_Division__c, Agency_Number__c.
//
router.get("/sfaccts", sfCtrl.getAllEmployers);

/* ========================== DIRECT JOIN RATES =========================== */

// GET ONE SALESFORCE DJR RECORD BY SF CONTACT ID
//   Example: GET >> /api/sfDJR/0036100001gYL0HAAW
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON selected fields from salesforce DJR object on success.
//
router.get("/sfDJR/:id", sfCtrl.getSFDJRById);

// CREATE SALESFORCE DJR RECORD
//   Example: POST >> /api/sfDJR
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              sf_contact_id                    : String
//              memberShortId                    : String
//              paymentMethod                    : String
//             }
//   Returns: { sf_djr_id } or error message.
//
router.post("/sfDJR", sfCtrl.createSFDJR);

// UPDATE A SALESFORCE DJR RECORD BY SF CONTACT ID
//   Example: PUT >> /api/sfDJR/0035500000VFAE9AAP
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              memberShortId                    : String
//              paymentMethod                    : String
//             }
//   Returns: { sf_djr_id } or error message.
//   OR passes contact ID to next middleware.
//
router.put("/sfDJR/:id", sfCtrl.updateSFDJR);

/* =========================== UNIONISE ROUTES ============================= */

/* ================== GET IFRAME URL FOR EXISTING MEMBER =================== */

// GET IFRAME URL FOR EXISTING MEMBER
//   Example: POST >> /api/unionise/iframe
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              memberShortId                    : String
//             }
//     2) request headers : {
//          Authorization : Bearer ${token}
//     }
//   Returns: { cardAddingUrl } or error message.
//
router.post("/unionise/iframe", sfCtrl.getIframeExisting);

/* ======================= GET UNIONISE ACCESS TOKEN ======================= */

// GET UNIONISE ACCESS TOKEN
//   Example: POST >> /api/unionise/gettoken
//   Secured: no
//   Expects: null
//   Returns: { access_token } or error message.
//
router.post("/unionise/gettoken", sfCtrl.getUnioniseToken);

/* ================================ EXPORT ================================= */

module.exports = router;
