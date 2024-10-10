/*
   routes to handle database queries
*/

/* ================================= SETUP ================================= */

import express from "express";
const router = express.Router();
import passport from "passport";

/* =========================== LOAD CONTROLLERS ============================ */

import userCtrl from "../controllers/users.ctrl.js";
import authCtrl from "../controllers/auth.ctrl.js";
import contentCtrl from "../controllers/content.ctrl.js";
import submissionCtrl from "../controllers/submissions.ctrl.js";
import sfCtrl from "../controllers/sf.ctrl.js";
import capeCtrl from "../controllers/cape.ctrl.js";
import utils from "../utils/index.js";

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
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/noaccess"
  }),
  authCtrl.googleCallback
);

// GOOGLE LOGIN FAILURE
//   Example: GET >> /auth/google/noaccess
//   Secured: no
//   Expects: null
//   Returns: Redirect to client noaccess route with message.
//
router.get("/auth/google/noaccess", authCtrl.noAccess);

/* ============================== CAPTCHA  ================================ */

// VERIFY CAPTCHA
//   Example: POST >> /api/verify
//   Secured: no
//   Expects:
//     1) request body properties : {
//          Object {
//              ip_address    : String
//              token         : String
//             }
//   Returns: { score } or error message.
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

// GET ONE USER BY EMAIL
//   Example: GET >> /api/user/80f5ad9a-9c1f-4df0-813b-c7bdc339d7b3
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON user object on success.
//
router.get("/user/email/:email", userCtrl.getUserByEmail);

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
router.get(
  "/contenttype/:content_type",
  authCtrl.requireAuth,
  contentCtrl.getContentByType
);

// GET ALL CONTENT
//   Example: GET >> /api/content/
//   Secured: yes
//   Expects: null
//   Returns: Array of content objects on success.
//
router.get("/content", authCtrl.requireAuth, contentCtrl.getContent);

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
router.get("/submission", authCtrl.requireAuth, submissionCtrl.getSubmissions);

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

/* ============================== CAPE ROUTES =========================== */

// CREATE A CAPE RECORD
//   Example: POST >> /api/cape
//   Secured: no
//   Expects:
//     request body properties : {
//        ip_address             : String
//        submission_date        : Timestamp
//        agency_number          : String
//        cell_phone             : String
//        employer_id            : String
//        first_name             : String
//        last_name              : String
//        home_street            : String
//        home_city              : String
//        home_state             : String
//        home_zip               : String
//        home_email             : String
//        job_title              : String
//        paymentMethod          : String ('Checkoff' || 'Unionise')
//        online_campaign_source : String
//        cape_legal             : Text
//        capeAmount             : Number
//        donationFrequency      : String ('Monthly' || 'One-time')
//        memberShortId          : String
//        }
//   Returns: JSON new CAPE object on success.
//
router.post("/cape", capeCtrl.createCAPE);

// UPDATE A CAPE RECORD
//   Example: PUT >> /api/cape/:id
//   Secured: no
//   Expects:
//     request params: {
//        id: String
//     }
//     request body properties : {
//        cape_status            : String ('Pending' || 'Success' || 'Error')
//        cape_errors            : String
//        memberShortId          : String
//        }
//   Returns: JSON new CAPE object on success.
//
router.put("/cape/:id", capeCtrl.updateCAPE);

// GET A CAPE RECORD BY SF CONTACT ID
//   Example: GET >> /api/capeBySF/0036100001gYL0HAAW
//   Secured: no
//   Expects:
//     1) request params : {
//          id : String
//        }
//   Returns: JSON CAPE object on success.
//
router.get("/capeBySF/:id", capeCtrl.getCAPEBySFId);

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

// GET ONE SALESFORCE CONTACT RECORD BY DOUBLE ID
//   Example: GET >> /api/sfdid/0036100001gYL0HAAW/0016100000Kdn9yAAB
//   Secured: no
//   Expects:
//     1) request params : {
//          cId : String,
//          aId : String
//        }
//   Returns: JSON selected fields from salesforce contact object on success.
//
router.get("/sfdid/:cId/:aId", sfCtrl.getSFContactByDoubleId);

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

/* ============================== CAPE ROUTES =========================== */

// CREATE A CAPE RECORD
//   Example: POST >> /api/sfCAPE
//   Secured: no
//   Expects:
//     request body properties : {
//        ip_address             : String
//        submission_date        : Timestamp
//        agency_number          : String
//        cell_phone             : String
//        employer_id            : String
//        first_name             : String
//        last_name              : String
//        home_street            : String
//        home_city              : String
//        home_state             : String
//        home_zip               : String
//        home_email             : String
//        job_title              : String
//        paymentMethod          : String ('Checkoff' || 'Unionise')
//        online_campaign_source : String
//        cape_legal             : Text
//        capeAmount             : Number
//        donationFrequency      : String ('Monthly' || 'One-time')
//        memberShortId          : String
//        }
//   Returns: JSON new CAPE object on success.
//
router.post("/sfCAPE", sfCtrl.createSFCAPE);

/* =============================== ACCOUNTS ================================ */

// GET ALL ACTIVE EMPLOYER NAMES
//   Example: GET >> /api/sfaccts
//   Secured: no
//   Expects: nada
//   Returns: Array of SF Account objects including:
//      Id, Name, Sub_Division__c, Agency_Number__c.
//
router.get("/sfaccts", sfCtrl.getAllEmployers);

/* =========================== NOSCRIPT ROUTES =========================== */
// routes created for noscript version of front-end and form
// all data processing and sequential SF calls moved to server side

router.post("/noscript", sfCtrl.handleTab1);

router.post("/noscript2", sfCtrl.handleTab2);

/* ================================ EXPORT ================================= */

export default router;
