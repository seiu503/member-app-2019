const options = { year: "numeric", month: "short", day: "numeric" };

export const formatDate = date =>
  new Date(date).toLocaleDateString("en-US", options);

export const formatDateTime = date => new Date(date).toLocaleString();

// force focus on #main when using skip navigation link
// (some browsers will only focus form inputs, links, and buttons)
export const skip = targetId => {
  const removeTabIndex = e => {
    e.target.removeAttribute("tabindex");
  };
  const skipTo = document.getElementById(targetId);
  // Setting 'tabindex' to -1 takes an element out of normal
  // tab flow but allows it to be focused via javascript
  skipTo.tabIndex = -1;
  skipTo.focus(); // focus on the content container
  // console.log(document.activeElement);
  // when focus leaves this element,
  // remove the tabindex attribute
  skipTo.addEventListener("blur", removeTabIndex);
};

export const buildQuery = data => {
  const query = [];
  for (var key in data) {
    if (data.hasOwnProperty(key) && !!data[key]) {
      query.push(`${key}=${data[key]}`);
    }
  }
  return query.join("&");
};

export const removeURLParam = (url, param) => {
  const urlParts = url.split("?");
  if (urlParts.length >= 2) {
    const prefix = `${encodeURIComponent(param)}=`;
    const pars = urlParts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (let i = pars.length; i-- > 0; ) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    return `${urlParts[0]}${pars.length > 0 ? `?${pars.join("&")}` : ""}`;
  }
  return url;
};

export const labelsObj = {
  headline: "headline",
  bodyCopy: "body copy",
  image: "image",
  redirectUrl: "redirect URL"
};

export const randomInt = () => {
  const min = 100;
  const max = 999;
  return Math.floor(Math.random() * (+max - +min)) + +min;
};

export const isPaymentRequired = employerType => {
  if (
    employerType &&
    (employerType.toLowerCase() === "community member" ||
      employerType.toLowerCase() === "retired" ||
      employerType.toLowerCase() === "adult foster home")
  ) {
    return true;
  }
  return false;
};

export const defaultWelcomeInfo = {
  body: `<p>Demonstrate your commitment to your co-workers and the people you serve in a few simple steps. To get started, click “Next.”</p>
<p>Being a part of SEIU 503 means you are fighting for a better life for the people you serve and for yourself. SEIU 503 members have won incredible victories – including increasing our pay and benefits and improving our workplace conditions. </p>
<p>We have strength in numbers. Please complete the following form to join tens of thousands of public service workers and care providers who make Oregon a great place to work and live. By doing so, you will commit to maintaining your membership for at least one year, or paying a non-member fee equivalent. No renewals are required. Dues are 1.7% of your salary + $2.75/month. Your full name, network address, and a timestamp of your submission will serve as your signature.</p>`,
  headline: `SEIU 503 Membership signup and Recommit form`
};

// detects browser settings defaultLanguage. If that language is one of the languages
// we provide translations for (or a specific dialect like "es-ar" instead of just "es")
// it sets the active language of the localization package to that language. Defaults to English.
export const detectDefaultLanguage = () => {
  const acceptableLangs = ["en", "es", "ru", "vi", "zh"];
  let defaultLanguage = "";
  if (window.navigator.language) {
    const userLang = window.navigator.language.toLowerCase();
    // console.log(`userLang: ${userLang}`);
    for (let i = 0; i < acceptableLangs.length; i++) {
      if (userLang.includes(acceptableLangs[i], 0)) {
        defaultLanguage = acceptableLangs[i];
        // console.log(`defaultLanguage: ${defaultLanguage}`);
        if (!defaultLanguage) {
          return {lang: "en", other: true}
        } else {
          return {lang: defaultLanguage, other: false}
        }
      }
    }
  } else if (window.navigator.languages) {
    const langArr = window.navigator.languages;
    for (let i = 0; i < acceptableLangs.length; i++) {
      for (let j = 0; j < langArr.length; j++) {
        if (langArr[j].toLowerCase().includes(acceptableLangs[i], 0)) {
          defaultLanguage = acceptableLangs[i];
          // console.log(`defaultLanguage: ${defaultLanguage}`);
          if (!defaultLanguage) {
            return {lang: "en", other: true}
          } else {
            return {lang: defaultLanguage, other: false}
          }
        }
      }
    }
  }
  return {lang: "en", other: true};
};

export const scrollToFirstError = errors => {
  // search through errors object to find only those currently mounted in DOM
  // (some errors will be on future tabs and can't be scrolled to yet)
  if (errors) {
    const errorsArray = Object.keys(errors);
    const firstError = errorsArray.find(
      error => !!document.getElementById(error)
    );
    // console.log(errorsArray);
    // console.log(firstError);
    const el = document.getElementById(firstError);
    if (el) {
      const position =
        el.getBoundingClientRect().top + document.documentElement.scrollTop;
      const offset = 200;
      window.scrollTo({ top: position - offset, behavior: "smooth" });
    } else {
      console.log(`can't find element for ${firstError}`);
    }
  }
};

export const onSubmitFailFn = errors => scrollToFirstError(errors);

// converts any string into camelCase/pascalCase used for formatting IDs of
// employerType and employerName picklist options to match IDs in translation files
export const camelCaseConverter = str => {
  let newStr = str.toLowerCase().replace(/\W+(.)/g, function(match, chr) {
    return chr.toUpperCase();
  });
  newStr.charAt(0).toLowerCase();
  return newStr;
};

export const ordinalSuffix = n =>
  ["st", "nd", "rd"][((((n + 90) % 100) - 10) % 10) - 1] || "th";
