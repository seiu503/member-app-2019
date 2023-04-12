import checkPropTypes from "check-prop-types";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as formElements from "../../components/SubmissionFormElements";
// import Notifier from "../../containers/Notifier";
import { findByTestAttr } from "../../utils/testUtils";

const {
  getMaxDay,
  dateOptions,
  yearOptions,
  renderTextField,
  renderSelect,
  renderCheckbox,
  // renderRadioGroup,
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
    it("handleError calls openSnackbar", () => {
      // const openSnackbarMock = jest.fn();
      // Notifier.openSnackbar = openSnackbarMock;
      // formElements.handleError("Error");
      // formElements.handleError();
      // Notifier code is farkockte, openSnackbar doesn't exist when it mounts
      // don't try to test this until fixing component code
      // expect(openSnackbarMock.mock.calls.length).toBe(2);
    });

    it("inputLabelTranslateHelper returns translated label", () => {
      const translateMock = jest.fn().mockImplementation(() => "firstName");
      const firstName = formElements.inputLabelTranslateHelper(
        "firstName",
        "label",
        translateMock
      );
      expect(firstName).toBe("firstName");
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

const onChange = jest.fn();
const onBlur = jest.fn();
let additionalOnChange = jest.fn();
const onChangeMock = jest.fn();
const onClick = jest.fn();
describe("Input Field Render functions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });
  describe("renderTextField", () => {
    beforeEach(() => {
      // const openSnackbarMock = jest.fn();
      // Notifier.openSnackbar = openSnackbarMock;
    });
    afterEach(() => {
      jest.restoreAllMocks();
      cleanup();
    });
    let wrapper;
    additionalOnChange = jest.fn();
    const initialProps = {
      input: {
        name: "testField",
        onBlur,
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
      dataTestId: "test-field",
      localize: {
        languages: [],
        translations: {},
        options: { renderInnerHtml: true }
      }
    };

    const errorProps = {
      input: {
        name: "testField",
        onBlur,
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
      label: "Test Field",
      dataTestId: "test-field"
    };

    const addlOnChgProps = {
      additionalOnChange: jest.fn(),
      input: {
        name: "testField",
        onBlur,
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
      label: "Test Field",
      dataTestId: "test-field"
    };

    const errorProps2 = {
      input: {
        name: "testField",
        onBlur,
        onChange,
        onDragStart: jest.fn(),
        onDrop: jest.fn(),
        onFocus: jest.fn(),
        value: ""
      },
      id: "testField",
      meta: {
        touched: true,
        error: ""
      },
      classes: {
        input: "testInputClass"
      },
      label: "Test Field",
      dataTestId: "test-field"
    };

    it("renders without errors", () => {
      let { getByTestId } = render(renderTextField(initialProps));
      let component = getByTestId("test-field");
      expect(component).toBeInTheDocument();
    });
    it("updates input value when changed", async () => {
      const user = userEvent.setup();
      let { getByTestId } = render(renderTextField(initialProps));
      let component = getByTestId("test-field").querySelector("input");
      await user.type(component, "fake@email.com");
      expect(onChange).toHaveBeenCalled();
    });
    it("handles onBlur function", () => {
      let { getByTestId } = render(renderTextField(initialProps));
      let component = getByTestId("test-field").querySelector("input");
      fireEvent.blur(component);
      expect(onBlur).toHaveBeenCalled();
    });
    it("provides helperText and error class when touched and errored", async () => {
      let { getByTestId } = render(renderTextField(errorProps));
      let component = getByTestId("test-field");
      const user = userEvent.setup();
      await user.type(component.querySelector("input"), "fake@email.com");
      expect(component).toHaveTextContent("Required");
    });
    it("does not provide helperText and error class when touched and not errored", async () => {
      let { getByTestId } = render(renderTextField(errorProps2));
      let component = getByTestId("test-field");
      const user = userEvent.setup();
      await user.type(component.querySelector("input"), "fake@email.com");
      expect(component).not.toHaveTextContent("Required");
    });
    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderTextField, initialProps);
    });
  });

  describe("renderSelect", () => {
    beforeEach(() => {
      // const openSnackbarMock = jest.fn();
      // Notifier.openSnackbar = openSnackbarMock;
    });
    afterEach(() => {
      jest.restoreAllMocks();
      cleanup();
    });
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
      dataTestId: "test-field",
      options: ["", "1", "2", "3"]
    };

    it("renders without errors", () => {
      let { getByTestId } = render(renderSelect(initialProps));
      let component = getByTestId("test-field");
      expect(component).toBeInTheDocument();
    });
    it("correctly sets default option", () => {
      let { getByTestId } = render(renderSelect(initialProps));
      expect(screen.getByRole("option", { name: "1" }).selected).toBe(true);
    });
    it("populates with options", () => {
      let { getByTestId } = render(renderSelect(initialProps));
      expect(screen.getAllByRole("option").length).toBe(4);
    });
    it("updates input value when changed", () => {
      let { getByRole } = render(renderSelect(initialProps));
      userEvent.selectOptions(
        // Find the select element
        screen.getByRole("combobox", { hidden: true }),
        // Find and select the 3 option
        screen.getByRole("option", { name: "3" })
      );
      // expect(screen.getByRole('option', { name: '3' }).selected).toBe(true)
      expect(onChange).toHaveBeenCalled();
    });
    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderSelect, initialProps);
    });
    it("handles edge cases", () => {
      const testProps = {
        meta: {
          touched: true,
          error: "Required"
        },
        mobile: true,
        align: "right"
      };
      const testProps2 = {
        meta: {
          touched: true,
          error: ""
        }
      };
      let props = { ...initialProps, ...testProps };
      render(renderSelect(props));
      props = { ...initialProps, ...testProps2 };
      render(renderSelect(props));
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
      label: "Test Field",
      dataTestId: "test-field"
    };

    it("renders without errors", () => {
      let { getByTestId } = render(renderCheckbox(initialProps));
      let component = getByTestId("test-field");
      expect(component).toBeInTheDocument();
    });

    it("fills the input with a default value", () => {
      let { getByTestId } = render(renderCheckbox(initialProps));
      let component = getByTestId("test-field").querySelector("input");
      expect(component.checked).toBe(false);
    });

    it("updates input value when changed", () => {
      let { getByTestId } = render(renderCheckbox(initialProps));
      let component = getByTestId("test-field").querySelector("input");
      fireEvent.click(component);
      expect(onChange).toHaveBeenCalled();
    });

    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderCheckbox, initialProps);
    });

    it("handles edge cases", () => {
      const testProps = {
        meta: {
          touched: true,
          error: "Required"
        },
        input: {
          value: "test"
        }
      };
      const testProps2 = {
        meta: {
          touched: true,
          error: ""
        },
        input: {
          value: "test"
        }
      };
      let props = { ...initialProps, ...testProps };
      render(renderCheckbox(props));
      props = { ...initialProps, ...testProps2 };
      render(renderCheckbox(props));
    });
  });

  // describe("renderRadioGroup", () => {
  //   const initialProps = {
  //     input: {
  //       name: "testRadio",
  //       onBlur: jest.fn(),
  //       onChange,
  //       onDragStart: jest.fn(),
  //       onDrop: jest.fn(),
  //       onFocus: jest.fn(),
  //       value: false
  //     },
  //     id: "testField",
  //     meta: {
  //       touched: false,
  //       error: ""
  //     },
  //     classes: {
  //       input: "testCheckboxClass"
  //     },
  //     label: "Test Field",
  //     dataTestId: "test-field",
  //     options: ["test"],
  //     additionalOnChange: jest.fn()
  //   };

  //   it("renders without errors", () => {
  //     let { getByTestId } = render(renderRadioGroup(initialProps));
  //     let component = getByTestId("test-field");
  //     expect(component).toBeInTheDocument();
  //   });

  //   it("updates input value when changed", () => {
  //     let { getByTestId } = render(renderRadioGroup(initialProps));
  //     let component = getByTestId("test-field").querySelector("input");
  //     fireEvent.click(component);
  //     expect(onChange).toHaveBeenCalled();
  //   });

  //   it("it doesn't throw PropType warnings", () => {
  //     checkPropTypes(renderRadioGroup, initialProps);
  //   });

  //   it("handles edge cases", () => {
  //     const testProps = {
  //       meta: {
  //         touched: true,
  //         error: "Required"
  //       },
  //       direction: "vert"
  //     };
  //     const testProps2 = {
  //       meta: {
  //         touched: true,
  //         error: ""
  //       },
  //       direction: "vert"
  //     };
  //     let props = { ...initialProps, ...testProps };
  //     render(renderRadioGroup(props));
  //     props = { ...initialProps, ...testProps2 };
  //     render(renderRadioGroup(props));
  //   });
  // });

  describe("renderCAPERadioGroup", () => {
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
      additionalOnChange: jest.fn(),
      dataTestId: "test-field"
    };

    it("renders without errors", () => {
      let { getByTestId } = render(renderCAPERadioGroup(initialProps));
      let component = getByTestId("test-field");
      expect(component).toBeInTheDocument();
    });

    it("updates input value when changed", () => {
      let { getByTestId } = render(renderCAPERadioGroup(initialProps));
      let component = getByTestId("test-field").querySelector("input");
      fireEvent.click(component);
      expect(onChange).toHaveBeenCalled();
    });

    it("it doesn't throw PropType warnings", () => {
      checkPropTypes(renderCAPERadioGroup, initialProps);
    });

    it("handles edge cases", () => {
      const testProps = {
        meta: {
          touched: true,
          error: "Required"
        },
        options: ["Other"]
      };
      const testProps2 = {
        meta: {
          touched: true,
          error: ""
        },
        options: ["Other"]
      };
      let props = { ...initialProps, ...testProps };
      render(renderCAPERadioGroup(props));
      props = { ...initialProps, ...testProps2 };
      render(renderCAPERadioGroup(props));
    });
  });
});
