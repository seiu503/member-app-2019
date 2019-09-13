import React from "react";
import { mount } from "enzyme";
import checkPropTypes from "check-prop-types";

import * as formElements from "../../components/SubmissionFormElements";
import { findByTestAttr } from "../../utils/testUtils";

const {
  getMaxDay,
  dateOptions,
  yearOptions,
  renderTextField,
  renderSelect,
  renderCheckbox,
  renderRadioGroup,
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
    it("returns the correct value for `community members` use case", () => {
      const employerName = "community member";
      const employerObjectsTest = findEmployerObject(
        employerObjects,
        employerName
      );
      expect(typeof employerObjectsTest).toBe("object");
      expect(employerObjectsTest).toEqual(employerObjects[1]);
    });
  });
});

const onChange = jest.fn();
const onChangeMock = jest.fn();
const onClick = jest.fn();
describe("Input Field Render functions", () => {
  afterEach(() => {
    onChangeMock.mockRestore();
    onChange.mockRestore();
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
      id: "testField",
      meta: {
        touched: false,
        error: ""
      },
      classes: {
        input: "testInputClass"
      },
      label: "Test Field",
      localize: {
        languages: [],
        translations: {},
        options: { renderInnerHtml: true }
      }
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
      id: "testField",
      meta: {
        touched: true,
        error: "Required"
      },
      classes: {
        input: "testInputClass"
      },
      label: "Test Field"
    };
    wrapper = mount(renderTextField(initialProps));
    let component = findByTestAttr(wrapper, "component-text-field").first();
    it("renders without errors", () => {
      expect(component).toHaveLength(1);
    });
    it("fills the input with a default value", () => {
      expect(component.prop("name")).toBe("testField");
      expect(component.prop("value")).toBe("Test Value");
    });
    it("updates input value when changed", () => {
      const event = { target: { name: "testField", value: "Test" } };
      component.prop("onChange")(event);
      expect(onChange).toHaveBeenCalledWith(event);
    });
    it("provides helperText and error class when touched and errored", () => {
      wrapper = mount(renderTextField(errorProps));
      component = findByTestAttr(wrapper, "component-text-field").first();
      expect(component.prop("error")).toBe(true);
      expect(component.prop("helperText")).toBe("Required");
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
      id: "testField",
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

    wrapper = mount(renderSelect(initialProps));
    let component = findByTestAttr(wrapper, "component-select").first();
    it("renders without errors", () => {
      expect(component).toHaveLength(1);
    });
    it("fills the input with a default value", () => {
      expect(component.prop("value")).toBe("1");
    });
    it("populates with options", () => {
      expect(wrapper.find("option")).toHaveLength(4);
    });
    it("updates input value when changed", () => {
      const event = { target: { value: "3" } };
      component.prop("onChange")(event);
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
      id: "testField",
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
    let component = findByTestAttr(wrapper, "component-checkbox").first();
    it("renders without errors", () => {
      expect(component).toHaveLength(1);
    });

    it("fills the input with a default value", () => {
      expect(component.prop("checked")).toBe(false);
    });

    it("updates input value when changed", () => {
      component.checked = false;
      component.prop("onChange")({ target: { checked: true } });
      expect(onChange).toHaveBeenCalled();
    });

    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderCheckbox, initialProps);
    });
  });

  describe("renderRadioGroup", () => {
    let wrapper;

    const initialProps = {
      input: {
        name: "testRadio",
        onBlur: jest.fn(),
        onChange,
        onDragStart: jest.fn(),
        onDrop: jest.fn(),
        onFocus: jest.fn(),
        value: false
      },
      id: "testField",
      meta: {
        touched: false,
        error: ""
      },
      classes: {
        input: "testCheckboxClass"
      },
      label: "Test Field",
      options: ["test"],
      additionalOnChange: jest.fn()
    };

    wrapper = mount(renderRadioGroup(initialProps));
    let component = findByTestAttr(wrapper, "component-radio-group").first();
    it("renders without errors", () => {
      expect(component).toHaveLength(1);
    });

    it("updates input value when changed", () => {
      component.checked = false;
      component.prop("onChange")({ target: { checked: true } });
      expect(onChange).toHaveBeenCalled();
    });

    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderRadioGroup, initialProps);
    });
  });

  describe("renderCAPERadioGroup", () => {
    let wrapper;

    const initialProps = {
      input: {
        name: "testRadio",
        onBlur: jest.fn(),
        onChange,
        onDragStart: jest.fn(),
        onDrop: jest.fn(),
        onFocus: jest.fn(),
        value: false
      },
      id: "testField",
      meta: {
        touched: false,
        error: ""
      },
      classes: {
        input: "testCheckboxClass"
      },
      label: "Test Field",
      options: ["test"],
      additionalOnChange: jest.fn()
    };

    wrapper = mount(renderCAPERadioGroup(initialProps));
    let component = findByTestAttr(
      wrapper,
      "component-cape-radio-group"
    ).first();
    it("renders without errors", () => {
      expect(component).toHaveLength(1);
    });

    it("updates input value when changed", () => {
      component.checked = false;
      component.prop("onChange")({ target: { checked: true } });
      expect(onChange).toHaveBeenCalled();
    });

    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderCAPERadioGroup, initialProps);
    });
  });
});
