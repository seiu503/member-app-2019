import * as utils from "../../utils";

describe("utils/index", () => {
  it("`formatDate` formats dates correctly", () => {
    const date = utils.formatDate(new Date("7/7/2019"));
    expect(date).toBe("Jul 7, 2019");
  });
  it("`randomInt` generates a random number between 100 and 999", () => {
    const number = utils.randomInt();
    expect(number).toBeGreaterThan(100);
    expect(number).toBeLessThan(999);
  });
  it("`skip` switches focus to targeted element", () => {
    const dummyElement = document.createElement("div");
    document.getElementById = jest.fn().mockImplementation(() => dummyElement);
    utils.skip("div");
    it("`scrollToFirstError` scrolls to first error", () => {
      const dummyElement = document.createElement("div");
      document.getElementById = jest
        .fn()
        .mockImplementation(() => dummyElement);
      const scrollToSpy = jest.fn();
      global.scrollTo = scrollToSpy;
      const errors = [{ test: "testError" }];
      utils.scrollToFirstError(errors);
      expect(scrollToSpy).toHaveBeenCalled();
    });
  });
  describe("`detectDefaultLanguage` returns language set by browser", () => {
    let languageGetter, languageArrGetter;
    it("defaults to `en`", () => {
      languageArrGetter = jest.spyOn(window.navigator, "languages", "get");
      languageArrGetter.mockReturnValue(null);
      languageGetter = jest.spyOn(window.navigator, "language", "get");
      languageGetter.mockReturnValue(null);
      expect(utils.detectDefaultLanguage()).toEqual("en");
    });
    it("detects on window.languages array", () => {
      languageGetter = jest.spyOn(window.navigator, "language", "get");
      languageGetter.mockReturnValue(null);
      languageArrGetter = jest.spyOn(window.navigator, "languages", "get");
      languageArrGetter.mockReturnValue(["de", "ja", "es"]);
      expect(utils.detectDefaultLanguage()).toEqual("es");
    });
    it("detects on window.language", () => {
      languageGetter = jest.spyOn(window.navigator, "language", "get");
      languageGetter.mockReturnValue("es");
      expect(utils.detectDefaultLanguage()).toEqual("es");
    });
  });
});
