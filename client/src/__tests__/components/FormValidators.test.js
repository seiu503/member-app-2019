import { Translate } from "react-localize-redux";
import React from "react";

import { validate, capeValidate } from "../../utils/validators";
import {
  generateSampleValidate,
  generatePage2Validate,
  generateCAPEValidateFrontEnd
} from "../../../../app/utils/fieldConfigs";

let testData, testDataPage2, testDataCAPE, combinedData;

describe("Redux-Form custom Validators", () => {
  beforeEach(() => {
    testData = generateSampleValidate();
    testDataPage2 = generatePage2Validate();
    testDataCAPE = generateCAPEValidateFrontEnd();
    combinedData = { ...testData, ...testDataPage2 };
  });
  afterAll(() => {
    testData = generateSampleValidate();
    testDataPage2 = generatePage2Validate();
    testDataCAPE = generateCAPEValidateFrontEnd();
  });
  test("no errors on well formed values", () => {
    expect(validate(testData)).toStrictEqual({});
  });
  test("adds required field to errors returned", () => {
    delete testData.firstName;
    expect(validate(testData)).toStrictEqual({
      firstName: <Translate id="requiredError" />
    });
  });
  test("validates properly formed phone numbers", () => {
    testData.mobilePhone = 55;
    expect(validate(testData)).toStrictEqual({
      mobilePhone: <Translate id="invalidPhoneError" />
    });
    testDataCAPE.mobilePhone = 55;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      mobilePhone: <Translate id="invalidPhoneError" />
    });
    combinedData.workPhone = 55;
    expect(validate(combinedData)).toStrictEqual({
      workPhone: <Translate id="invalidPhoneError" />
    });
    testData.mobilePhone = "phone number";
    expect(validate(testData)).toStrictEqual({
      mobilePhone: <Translate id="invalidPhoneError" />
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
      homeEmail: <Translate id="invalidEmailError" />
    });
    testDataCAPE.homeEmail = "fake@email";
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      homeEmail: <Translate id="invalidEmailError" />
    });
    combinedData.workEmail = "fake@email";
    combinedData.homeEmail = "fake@good.com";
    expect(validate(combinedData)).toStrictEqual({
      workEmail: <Translate id="invalidEmailError" />
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
      homeZip: <Translate id="charLength5Error" />
    });
    testDataCAPE.homeZip = 4444;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      homeZip: <Translate id="charLength5Error" />
    });
    combinedData.mailToZip = 4444;
    expect(validate(combinedData)).toStrictEqual({
      mailToZip: <Translate id="charLength5Error" />
    });
  });
  test("validates conditional required fields", () => {
    testDataCAPE.capeAmount = "Other";
    testDataCAPE.capeAmountOther = null;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      capeAmountOther: <Translate id="requiredError" />
    });
  });
  test("validates capeAmountOther as positive integer", () => {
    testDataCAPE.capeAmount = "Other";
    testDataCAPE.capeAmountOther = -12;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      capeAmountOther: <Translate id="wholeDollarError" />
    });
  });
});
