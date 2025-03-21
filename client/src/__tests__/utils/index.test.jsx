import { Trans } from "react-i18next";
import React from "react";
import { validate, capeValidate } from "../../utils/validators";
import {
  generateSampleValidate,
  generatePage2Validate,
  generateCAPEValidateFrontEnd
} from "../../../../app/utils/fieldConfigs";

let testData, testDataPage2, testDataCAPE, combinedData;
import * as utils from "../../utils";

describe("utils/index", () => {
  it("`formatDate` formats dates correctly", () => {
    const date = utils.formatDate(new Date("7/7/2019"));
    expect(date).toBe("Jul 7, 2019");
  });
  it("`randomInt` generates a random number between 100 and 999", () => {
    const number = utils.randomInt();
    expect(number).toBeGreaterThan(99);
    expect(number).toBeLessThan(999);
  });
  it("`skip` switches focus to targeted element", () => {
    const dummyElement = document.createElement("div");
    document.getElementById = jest.fn().mockImplementation(() => dummyElement);
    utils.skip("div");
  });
  it("`scrollToFirstError` scrolls to first error", () => {
    const dummyElement = document.createElement("div");
    document.getElementById = jest.fn().mockImplementation(() => dummyElement);
    const scrollToSpy = jest.fn();
    global.scrollTo = scrollToSpy;
    const errors = [{ test: "testError" }];
    utils.scrollToFirstError(errors);
    expect(scrollToSpy).toHaveBeenCalled();
  });
  it("`scrollToFirstError` doesn't scroll if no errors passed", () => {
    const dummyElement = document.createElement("div");
    document.getElementById = jest.fn().mockImplementation(() => dummyElement);
    const scrollToSpy = jest.fn();
    global.scrollTo = scrollToSpy;
    const errors = null;
    utils.scrollToFirstError(errors);
    expect(scrollToSpy).not.toHaveBeenCalled();
  });
  it("`scrollToFirstError` doesn't scroll if no element exists", () => {
    document.getElementById = jest.fn().mockImplementation(() => null);
    const scrollToSpy = jest.fn();
    global.scrollTo = scrollToSpy;
    const errors = [{ test: "testError" }];
    utils.scrollToFirstError(errors);
    expect(scrollToSpy).not.toHaveBeenCalled();
  });
  it("`removeURLParam` removes params when more than 2 passed", () => {
    const url = "http://test.com?p1=1&p2=2&p3=3";
    const param = "p3";
    expect(utils.removeURLParam(url, param)).toEqual(
      "http://test.com?p1=1&p2=2"
    );
  });
  describe("`detectDefaultLanguage` returns language set by browser", () => {
    let languageGetter, languageArrGetter;
    it("defaults to `en`", () => {
      languageArrGetter = jest.spyOn(window.navigator, "languages", "get");
      languageArrGetter.mockReturnValue(null);
      languageGetter = jest.spyOn(window.navigator, "language", "get");
      languageGetter.mockReturnValue(null);
      expect(utils.detectDefaultLanguage()).toEqual({"lang": "en", "other": true});
    });
    it("detects on window.languages array", () => {
      languageGetter = jest.spyOn(window.navigator, "language", "get");
      languageGetter.mockReturnValue(null);
      languageArrGetter = jest.spyOn(window.navigator, "languages", "get");
      languageArrGetter.mockReturnValue(["de", "ja", "es"]);
      expect(utils.detectDefaultLanguage()).toEqual({"lang": "es", "other": false});
    });
    it("detects on window.language", () => {
      languageGetter = jest.spyOn(window.navigator, "language", "get");
      languageGetter.mockReturnValue("es");
      expect(utils.detectDefaultLanguage()).toEqual({"lang": "es", "other": false});
    });
    it("buildquery returns query string (edge case test)", () => {
      expect(utils.buildQuery(null)).toEqual("");
      expect(utils.buildQuery({ a: 1, b: null })).toEqual("a=1");
    });
    it("ordinalSuffix returns correct suffix for input", () => {
      expect(utils.ordinalSuffix(1)).toEqual("st");
      expect(utils.ordinalSuffix(2)).toEqual("nd");
      expect(utils.ordinalSuffix(3)).toEqual("rd");
      expect(utils.ordinalSuffix(4)).toEqual("th");
    });
  });
});

describe("utils/validators", () => {
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
      firstName: <Trans i18nKey="requiredError" />
    });
  });
  test("validates properly formed phone numbers", () => {
    testData.mobilePhone = 55;
    expect(validate(testData)).toStrictEqual({
      mobilePhone: <Trans i18nKey="invalidPhoneError" />
    });
    testDataCAPE.mobilePhone = 55;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      mobilePhone: <Trans i18nKey="invalidPhoneError" />
    });
    combinedData.workPhone = 55;
    expect(validate(combinedData)).toStrictEqual({
      workPhone: <Trans i18nKey="invalidPhoneError" />
    });
    testData.mobilePhone = "phone number";
    expect(validate(testData)).toStrictEqual({
      mobilePhone: <Trans i18nKey="invalidPhoneError" />
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
      homeEmail: <Trans i18nKey="invalidEmailError" />
    });
    testDataCAPE.homeEmail = "fake@email";
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      homeEmail: <Trans i18nKey="invalidEmailError" />
    });
    combinedData.workEmail = "fake@email";
    combinedData.homeEmail = "fake@good.com";
    expect(validate(combinedData)).toStrictEqual({
      workEmail: <Trans i18nKey="invalidEmailError" />
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
      homeZip: <Trans i18nKey="charLength5Error" />
    });
    testDataCAPE.homeZip = 4444;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      homeZip: <Trans i18nKey="charLength5Error" />
    });
    combinedData.mailToZip = 4444;
    expect(validate(combinedData)).toStrictEqual({
      mailToZip: <Trans i18nKey="charLength5Error" />
    });
  });
  test("validates conditional required fields", () => {
    testDataCAPE.capeAmount = "Other";
    testDataCAPE.capeAmountOther = null;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      capeAmountOther: <Trans i18nKey="requiredError" />
    });
  });
  test("validates capeAmountOther as positive integer", () => {
    testDataCAPE.capeAmount = "Other";
    testDataCAPE.capeAmountOther = -12;
    expect(capeValidate(testDataCAPE)).toStrictEqual({
      capeAmountOther: <Trans i18nKey="wholeDollarError" />
    });
  });
});
