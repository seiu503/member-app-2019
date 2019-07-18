import validate from "../../utils/validators";
import { generateSampleValidate } from "../../../../app/utils/fieldConfigs";

let testData;

describe("Redux-Form custom Validators", () => {
  beforeEach(() => {
    testData = generateSampleValidate();
  });
  afterAll(() => {
    testData = generateSampleValidate();
  });
  test("no errors on well formed values", () => {
    console.log(testData);
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
  });
  test("validates properly formed emails", () => {
    testData.homeEmail = "fake@email";
    expect(validate(testData)).toStrictEqual({
      homeEmail: "Invalid email address (e.g. sample@email.com)"
    });
  });
  test("validates properly formed zip codes", () => {
    testData.homePostalCode = 4444;
    expect(validate(testData)).toStrictEqual({
      homePostalCode: "Must be at exactly 5 characters long"
    });
  });
});
