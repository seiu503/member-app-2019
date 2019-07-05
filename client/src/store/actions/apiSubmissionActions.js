import { RSAA } from "redux-api-middleware";
import BASE_URL from "./apiConfig.js";

export const ADD_SUBMISSION_REQUEST = "ADD_SUBMISSION_REQUEST";
export const ADD_SUBMISSION_SUCCESS = "ADD_SUBMISSION_SUCCESS";
export const ADD_SUBMISSION_FAILURE = "ADD_SUBMISSION_FAILURE";
// export const UPDATE_SUBMISSION_REQUEST = "UPDATE_SUBMISSION_REQUEST";
// export const UPDATE_SUBMISSION_SUCCESS = "UPDATE_SUBMISSION_SUCCESS";
// export const UPDATE_SUBMISSION_FAILURE = "UPDATE_SUBMISSION_FAILURE";

export function addSubmission(body) {
  return {
    [RSAA]: {
      endpoint: `${BASE_URL}/api/submission/`,
      method: "POST",
      types: [
        ADD_SUBMISSION_REQUEST,
        ADD_SUBMISSION_SUCCESS,
        {
          type: ADD_SUBMISSION_FAILURE,
          payload: (action, state, res) => {
            return res.json().then(data => {
              let message = "Sorry, something went wrong :(";
              if (data) {
                if (data.message) {
                  message = data.message;
                }
                return { message };
              } else {
                return { message };
              }
            });
          }
        }
      ],
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  };
}

// export function updateSubmission(body, id) {
//   return {
//     [RSAA]: {
//       endpoint: `${BASE_URL}/api/submission/${id}`,
//       method: "PUT",
//       types: [
//         ADD_SUBMISSION_REQUEST,
//         ADD_SUBMISSION_SUCCESS,
//         {
//           type: ADD_SUBMISSION_FAILURE,
//           payload: (action, state, res) => {
//             return res.json().then(data => {
//               let message = "Sorry, something went wrong :(";
//               if (data) {
//                 if (data.message) {
//                   message = data.message;
//                 }
//                 return { message };
//               } else {
//                 return { message };
//               }
//             });
//           }
//         }
//       ],
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(body)
//     }
//   };
// }
