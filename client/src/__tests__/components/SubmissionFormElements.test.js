import React from "react";
import { shallow } from "enzyme";

import * as formElements from "../../components/SubmissionFormElements";
const {
  getMaxDay,
  dateOptions,
  yearOptions,
  renderTextField,
  renderSelect,
  renderCheckbox
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
});

describe("Input Field Render functions", () => {
  describe("renderTextField", () => {
    it("returns an textField with correct attributes", () => {});

    it("provides helperText and error class when touched and errored", () => {});

    it("sets value on input", () => {});
  });

  describe("renderSelect", () => {
    it("returns a select with correct attributes", () => {});

    it("populates options correctly", () => {});

    it("provides helperText and error class when touched and errored", () => {});

    it("sets value on input", () => {});
  });

  describe("renderCheckbox", () => {
    it("returns a checkbox with correct attributes", () => {});

    it("provides helperText and error class when touched and errored", () => {});
    it("sets value on input", () => {});
  });
});
