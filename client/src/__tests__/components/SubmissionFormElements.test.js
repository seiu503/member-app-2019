import React from "react";
import { shallow, mount } from "enzyme";

import * as formElements from "../../components/SubmissionFormElements";
import { checkProps } from "../../utils/testUtils";
import checkPropTypes from "check-prop-types";

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

const onChange = jest.fn();
const onChangeMock = jest.fn();
const onClick = jest.fn();
describe("Input Field Render functions", () => {
  afterEach(() => {
    onChangeMock.mockRestore();
  });
  describe("renderTextField", () => {
    let wrapper;

    const initialProps = {
      input: {
        name: "testField",
        onBlur: jest.fn(),
        onChange,
        onDragStart: jest.fn(),
        onDrop: jest.fn(),
        onFocus: jest.fn(),
        value: "Test Value"
      },
      meta: {
        touched: false,
        error: ""
      },
      classes: {
        input: "testInputClass"
      },
      label: "Test Field"
    };

    const errorProps = {
      input: {
        name: "testField",
        onBlur: jest.fn(),
        onChange,
        onDragStart: jest.fn(),
        onDrop: jest.fn(),
        onFocus: jest.fn(),
        value: ""
      },
      meta: {
        touched: true,
        error: "Required"
      },
      classes: {
        input: "testInputClass"
      },
      label: "Test Field"
    };

    wrapper = shallow(renderTextField(initialProps));

    it("renders without errors", () => {
      expect(wrapper.find(`[data-test="component-text-field"]`)).toHaveLength(
        1
      );
    });
    it("fills the input with a default value", () => {
      expect(
        wrapper.find(`[data-test="component-text-field"]`).prop("name")
      ).toBe("testField");
      expect(
        wrapper.find(`[data-test="component-text-field"]`).prop("value")
      ).toBe("Test Value");
    });
    it("updates input value when changed", () => {
      const event = { target: { value: "Test" } };
      wrapper
        .find(`[data-test="component-text-field"]`)
        .simulate("change", event);
      expect(onChange).toHaveBeenCalledWith(event);
    });
    it("provides helperText and error class when touched and errored", () => {
      wrapper = shallow(renderTextField(errorProps));
      expect(
        wrapper.find(`[data-test="component-text-field"]`).prop("error")
      ).toBe(true);
      expect(
        wrapper.find(`[data-test="component-text-field"]`).prop("helperText")
      ).toBe("Required");
    });
    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderTextField, initialProps);
    });
  });

  describe("renderSelect", () => {
    let wrapper;

    const initialProps = {
      input: {
        name: "testField",
        onBlur: jest.fn(),
        onChange,
        onClick,
        onDragStart: jest.fn(),
        onDrop: jest.fn(),
        onFocus: jest.fn(),
        value: "1"
      },
      meta: {
        touched: false,
        error: ""
      },
      classes: {
        input: "testInputClass"
      },
      label: "Test Select",
      options: ["", "1", "2", "3"]
    };

    wrapper = shallow(renderSelect(initialProps));

    it("renders without errors", () => {
      expect(wrapper.find(`[data-test="component-select"]`)).toHaveLength(1);
    });
    it("fills the input with a default value", () => {
      expect(wrapper.find(`[data-test="component-select"]`).prop("value")).toBe(
        "1"
      );
    });
    it("populates with options", () => {
      expect(wrapper.find("option")).toHaveLength(4);
    });
    it("updates input value when changed", () => {
      const event = { target: { value: "3" } };
      wrapper.find(`[data-test="component-select"]`).simulate("change", event);
      expect(onChange).toHaveBeenCalled();
    });
    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderSelect, initialProps);
    });
  });

  describe("renderCheckbox", () => {
    let wrapper;

    const initialProps = {
      input: {
        name: "testCheckbox",
        onBlur: jest.fn(),
        onChange,
        onDragStart: jest.fn(),
        onDrop: jest.fn(),
        onFocus: jest.fn(),
        value: false
      },
      meta: {
        touched: false,
        error: ""
      },
      classes: {
        input: "testCheckboxClass"
      },
      label: "Test Field"
    };

    wrapper = mount(renderCheckbox(initialProps));

    it("renders without errors", () => {
      expect(
        wrapper.find(`[data-test="component-checkbox"]`).first()
      ).toHaveLength(1);
    });

    it("fills the input with a default value", () => {
      expect(
        wrapper
          .find(`[data-test="component-checkbox"]`)
          .first()
          .prop("checked")
      ).toBe(false);
    });

    it("updates input value when changed", () => {
      const checkbox = wrapper.find(`[data-test="component-checkbox"]`).first();
      checkbox.checked = false;
      checkbox.simulate("change", { target: { checked: true } });
      expect(onChange).toHaveBeenCalled();
    });

    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderCheckbox, initialProps);
    });
  });
});
