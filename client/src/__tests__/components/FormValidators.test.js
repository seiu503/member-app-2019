import { validate } from "../../utils/validators";
import {
  generateSampleValidate,
  generatePage2Validate
} from "../../../../app/utils/fieldConfigs";

let testData, testDataPage2, combinedData;

describe("Redux-Form custom Validators", () => {
  beforeEach(() => {
    testData = generateSampleValidate();
    testDataPage2 = generatePage2Validate();
    combinedData = { ...testData, ...testDataPage2 };
  });
  afterAll(() => {
    testData = generateSampleValidate();
    testDataPage2 = generatePage2Validate();
  });
  test("no errors on well formed values", () => {
    expect(validate(testData)).toStrictEqual({});
  });
  test("adds required field to errors returned", () => {
    delete testData.firstName;
    expect(validate(testData)).toStrictEqual({ firstName: "Required" });
  });
  test("validates properly formed phone numbers", () => {
    testData.mobilePhone = 55;
    expect(validate(testData)).toStrictEqual({
      mobilePhone: "Invalid phone number (e.g. 555-123-456)"
    });
    combinedData.workPhone = 55;
    expect(validate(combinedData)).toStrictEqual({
      workPhone: "Invalid phone number (e.g. 555-123-456)"
    });
    testData.mobilePhone = "phone number";
    expect(validate(testData)).toStrictEqual({
      mobilePhone: "Invalid phone number (e.g. 555-123-456)"
    });
    testData.mobilePhone = "5555555555";
    expect(validate(testData)).toStrictEqual({});
    combinedData.workPhone = "5555555555";
    expect(validate(combinedData)).toStrictEqual({});
    testData.mobilePhone = "(503) 555-5555";
    expect(validate(testData)).toStrictEqual({});
    testData.mobilePhone = "555.555.5555";
    expect(validate(testData)).toStrictEqual({});
    testData.mobilePhone = "555-555-5555";
    expect(validate(testData)).toStrictEqual({});
    testData.mobilePhone = "555 555 5555";
    expect(validate(testData)).toStrictEqual({});
    combinedData.workPhone = "(503) 555-5555";
    expect(validate(combinedData)).toStrictEqual({});
    combinedData.workPhone = "555.555.5555";
    expect(validate(combinedData)).toStrictEqual({});
    combinedData.workPhone = "555-555-5555";
    expect(validate(combinedData)).toStrictEqual({});
    combinedData.workPhone = "555 555 5555";
    expect(validate(combinedData)).toStrictEqual({});
  });
  test("validates properly formed emails", () => {
    testData.homeEmail = "fake@email";
    expect(validate(testData)).toStrictEqual({
      homeEmail: "Invalid email address (e.g. sample@email.com)"
    });
    combinedData.workEmail = "fake@email";
    combinedData.homeEmail = "fake@good.com";
    expect(validate(combinedData)).toStrictEqual({
      workEmail: "Invalid email address (e.g. sample@email.com)"
    });
    testData.homeEmail = "fake@email.co";
    expect(validate(testData)).toStrictEqual({});
    combinedData.workEmail = "fake@email.co";
    expect(validate(combinedData)).toStrictEqual({});
    testData.homeEmail = "fake@email.co";
    expect(validate(testData)).toStrictEqual({});
    combinedData.workEmail = "fake@email.co";
    expect(validate(combinedData)).toStrictEqual({});
    testData.homeEmail = "f@g.org";
    expect(validate(testData)).toStrictEqual({});
    combinedData.workEmail = "f@g.org";
    expect(validate(combinedData)).toStrictEqual({});
  });
  test("validates properly formed zip codes", () => {
    testData.homeZip = 4444;
    expect(validate(testData)).toStrictEqual({
      homeZip: "Must be at exactly 5 characters long"
    });
    combinedData.mailToZip = 4444;
    expect(validate(combinedData)).toStrictEqual({
      mailToZip: "Must be at exactly 5 characters long"
    });
  });
  test("validates properly formed hire dates", () => {
    combinedData.hireDate = "11/11/2019";
    expect(validate(combinedData)).toStrictEqual({
      hireDate: "Invalid Date (please us 'yyyy-mm-dd' format)"
    });
    combinedData.hireDate = "11-11-2019";
    expect(validate(combinedData)).toStrictEqual({
      hireDate: "Invalid Date (please us 'yyyy-mm-dd' format)"
    });
    combinedData.hireDate = "January, 10th 2019";
    expect(validate(combinedData)).toStrictEqual({
      hireDate: "Invalid Date (please us 'yyyy-mm-dd' format)"
    });
    combinedData.hireDate = "2019-11-1";
    expect(validate(combinedData)).toStrictEqual({
      hireDate: "Invalid Date (please us 'yyyy-mm-dd' format)"
    });
    combinedData.hireDate = "2019-11-11";
    expect(validate(combinedData)).toStrictEqual({});
  });
});
