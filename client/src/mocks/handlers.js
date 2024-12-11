/* istanbul ignore file */
import { http, HttpResponse  } from "msw";
import { employersPayload } from "../utils/testUtils";

const handlers = [
  http.post("http://localhost:8080/api/verify", () => {
    console.log("this.props.apiSubmission.verify mock");
    return HttpResponse.json({ score: 0.9 });
  }),

  http.get("http://localhost:8080/api/sfaccts", () => {
    console.log("this.props.apiSF.getSFEmployers mock");
    return HttpResponse.json(employersPayload);
  }),

  http.post("http://localhost:8080/api/sfCAPE", () => {
    console.log("this.props.apiSF.createSFCAPE mock");
    return HttpResponse.json({ salesforce_id: "123" });
  }),

  http.post("http://localhost:8080/api/cape", () => {
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost:8080/api/cape/12345678", () => {
    return HttpResponse.json({ id: "testid" });
  }),

  http.get(`http://localhost:8080/api/sfdid/1/2`, () => {
    console.log("getSFContactByDoubleId mock");
    return HttpResponse.json({ 
        id: "testid",
        FirstName: "test",
        LastName: "test",
        Account: { id: "test" },
        Ethnicity__c: "Declined"
      });
  }),

  http.get(`http://localhost:8080/api/sf/12345678`, () => {
    console.log("getSFContactById mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost:8080/api/sflookup", () => {
    console.log("sflookup mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.post("http://localhost:8080/api/sf", () => {
    console.log("createSFContact mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.post("http://localhost:8080/api/sfOMA", () => {
    console.log("createSFOMA mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.post("http://localhost:8080/api/submission", () => {
    console.log("addSubmission mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost:8080/api/submission/12345678", () => {
    console.log("updateSubmission mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost:8080/api/sf/12345678", () => {
    console.log("updateSFContact mock");
    return HttpResponse.json({ id: "testid" });
  }),






    http.post("http://localhost/undefined/api/verify", () => {
    console.log("this.props.apiSubmission.verify mock");
    return HttpResponse.json({ score: 0.9 });
  }),

  http.get("http://localhost/undefined/api/sfaccts", () => {
    console.log("this.props.apiSF.getSFEmployers mock");
    return HttpResponse.json(employersPayload);
  }),

  http.post("http://localhost/undefined/api/sfCAPE", () => {
    console.log("this.props.apiSF.createSFCAPE mock");
    return HttpResponse.json({ salesforce_id: "123" });
  }),

  http.post("http://localhost/undefined/api/cape", () => {
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost/undefined/api/cape/12345678", () => {
    return HttpResponse.json({ id: "testid" });
  }),

  http.get(`http://localhost/undefined/api/sfdid/1/2`, () => {
    console.log("getSFContactByDoubleId mock");
    return HttpResponse.json({ 
        id: "testid",
        FirstName: "test",
        LastName: "test",
        Account: { id: "test" },
        Ethnicity__c: "Declined"
      });
  }),

  http.get(`http://localhost/undefined/api/sf/12345678`, () => {
    console.log("getSFContactById mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost/undefined/api/sflookup", () => {
    console.log("sflookup mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.post("http://localhost/undefined/api/sf", () => {
    console.log("createSFContact mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.post("http://localhost/undefined/api/sfOMA", () => {
    console.log("createSFOMA mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.post("http://localhost/undefined/api/submission", () => {
    console.log("addSubmission mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost/undefined/api/submission/12345678", () => {
    console.log("updateSubmission mock");
    return HttpResponse.json({ id: "testid" });
  }),

  http.put("http://localhost/undefined/api/sf/12345678", () => {
    console.log("updateSFContact mock");
    return HttpResponse.json({ id: "testid" });
  })
];

export default handlers;
