import '@testing-library/jest-dom';
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as formElements from "../../components/SubmissionFormElements";
import { findByTestAttr } from "../../utils/testUtils";
import { I18nextProvider } from "react-i18next";
import i18n from "../../translations/i18n";

const {
  getMaxDay,
  dateOptions,
  yearOptions,
  renderTextField,
  renderSelect,
  renderCheckbox,
  renderCAPERadioGroup,
  getKeyByValue,
  findEmployerObject
} = formElements;

let props;
const arrayIsSorted = arr => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }
  return true;
};

const arrayIsReverseSorted = arr => {
  for (let i = 0; i > arr.length; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }
  return true;
};

describe("Helper Functions", () => {
  describe("getMaxDay", () => {
    it("returns correct max day given any possible month", () => {
      expect(getMaxDay("02")).toBe(29);
      expect(getMaxDay("04")).toBe(30);
      expect(getMaxDay("12")).toBe(31);
    });
  });

  describe("dateOptions", () => {
    it("returns an array of all possible dates for given month in order", () => {
      props = { formValues: { mm: 31 } };
      const dateOptionsTest = dateOptions(props);
      expect(Array.isArray(dateOptionsTest)).toBe(true);
      expect(dateOptionsTest.length).toBe(32);
      expect(dateOptionsTest[0]).toBe("");
      expect(dateOptionsTest[31]).toBe("31");
      expect(arrayIsSorted(dateOptionsTest)).toBe(true);
    });
  });

  describe("yearOptions", () => {
    it("returns array of all years for last 110 years", () => {
      const yearOptionsTest = yearOptions();
      const thisYear = new Date().getFullYear();
      const oldestYear = new Date().getFullYear() - 109;
      expect(Array.isArray(yearOptionsTest)).toBe(true);
      expect(yearOptionsTest.length).toBe(111);
      expect(yearOptionsTest[0]).toBe("");
      expect(yearOptionsTest[1]).toBe(thisYear.toString());
      expect(yearOptionsTest[110]).toBe(oldestYear.toString());
      expect(arrayIsReverseSorted(yearOptionsTest)).toBe(true);
    });
  });

  describe("getKeyByValue", () => {
    it("returns first key of value.toLowerCase", () => {
      const testObject = {
        key1: "VALUE",
        key2: "value1",
        key3: true,
        key4: 57,
        key5: "value"
      };
      const getKeyByValueTest = getKeyByValue(testObject, "ValUe");
      expect(typeof getKeyByValueTest).toBe("string");
      expect(getKeyByValueTest).toBe("key1");
    });
  });

  describe("findEmployerObject", () => {
    const employerObjects = [
      { Name: "homecare workers" },
      { Name: "community members" }
    ];
    it("returns the matching object", () => {
      const employerName = "homecare workers";
      const employerObjectsTest = findEmployerObject(
        employerObjects,
        employerName
      );
      expect(typeof employerObjectsTest).toBe("object");
      expect(employerObjectsTest).toEqual(employerObjects[0]);
    });
  });

  describe("generateCAPEOptions", () => {
    it("returns correct options when currentCAPE is passed", () => {
      const result = formElements.generateCAPEOptions(20);
      expect(result).toEqual({
        monthlyOptions: [23, 25, 28, "Other"],
        oneTimeOptions: [25, 30, 40, "Other"]
      });
    });
    it("returns correct options when no currentCAPE is passed", () => {
      const result = formElements.generateCAPEOptions();
      expect(result).toEqual({
        monthlyOptions: [10, 13, 15, "Other"],
        oneTimeOptions: [15, 20, 25, "Other"]
      });
    });
  });

  describe("misc methods", () => {
    it("inputLabelTranslateHelper returns translated label when translation exists", () => {
      const translateMock = jest
        .fn()
        .mockImplementation(text => `trans_${text}`);
      const firstName = formElements.inputLabelTranslateHelper(
        "firstName",
        "label",
        translateMock
      );
      expect(firstName).toBe("trans_firstName");
    });

    it("inputLabelTranslateHelper returns English label when no translation exists", () => {
      const translateMock = jest.fn().mockImplementation(text => text);
      const firstName = formElements.inputLabelTranslateHelper(
        "firstName",
        "label",
        translateMock
      );
      expect(firstName).toBe("label");
    });

    it("optionsLabelTranslateHelper returns translated option", () => {
      const translateMock = jest.fn().mockImplementation(() => "firstName");
      const firstName = formElements.optionsLabelTranslateHelper(
        "firstName",
        "label",
        translateMock
      );
      expect(firstName).toBe("firstName");
    });

    it("formatBirthdate returns a date in YYYY-MM-DD format", () => {
      const result = formElements.formatBirthdate({
        mm: "01",
        dd: "01",
        yyyy: "2000"
      });
      expect(result).toBe("2000-01-01");
    });

    it("calcEthnicity handles 'declined' edge case", () => {
      const result = formElements.calcEthnicity({
        declined: true
      });
      expect(result).toBe("declined");
    });

    it("renderText returns text content", () => {
      const result = formElements.renderText({
        content: "blah",
        content_type: "bodyCopy"
      });
      expect(result).toBe("blah");
    });

    it("renderText returns an image url", () => {
      const result = formElements.renderText({
        content: "http://blah.s3-us-west-2.amazonaws.com/filename",
        content_type: "image"
      });
      expect(result).toBe("filename");
    });

    it("renderImage returns an image if passed an image", () => {
      const image = {
        content: "http://blah.s3-us-west-2.amazonaws.com/filename",
        content_type: "image"
      };
      const result = formElements.renderImage(image);
      expect(result.props.src).toBe(image.content);
    });

    it("renderImage returns an empty string if not passed an image", () => {
      const image = {
        content: "blah",
        content_type: "headline"
      };
      const result = formElements.renderImage(image);
      expect(result).toBe("");
    });

    it("renderDate returns a formatted date", () => {
      const result = formElements.renderDate({
        updated_at: new Date("1/1/2019")
      });
      console.log(result);
      expect(result).toBe("1/1/2019, 12:00:00 AM");
    });
  });
});

const onChange = jest.fn().mockImplementation(() => console.log("onChange"));
const onBlur = jest.fn();
let additionalOnChange = jest.fn();
const onChangeMock = jest.fn();
const onClick = jest.fn();
