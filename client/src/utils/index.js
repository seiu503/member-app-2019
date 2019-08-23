const options = { year: "numeric", month: "short", day: "numeric" };

export const formatDate = date =>
  new Date(date).toLocaleDateString("en-US", options);

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

export const defaultWelcomeInfo = {
  body: `<p>Demonstrate your commitment to your co-workers and the people you serve in a few simple steps. To get started, click “Next.”</p>
<p>Being a part of SEIU 503 means you are fighting for a better life for the people you serve and for yourself. SEIU 503 members have won incredible victories – including increasing our pay and benefits and improving our workplace conditions. </p>
<p>We have strength in numbers. Click "Next" to join tens of thousands of public service workers and care providers who make Oregon a great place to work and live. By joining, you commit to maintaining your membership for one year, or paying a non-member fee equivalent. Dues are 1.7% of your salary + $2.75/month.</p>`,
  headline: `SEIU 503: It’s about more than a better job – it’s about a better world.`
};

export const scrollToFirstError = errors => {
  // search through errors object to find only those currently mounted in DOM
  // (some errors will be on future tabs and can't be scrolled to yet)
  const errorsArray = Object.keys(errors);
  const firstError = errorsArray.find(
    error => !!document.getElementById(error)
  );
  const el = document.getElementById(firstError);
  const position =
    el.getBoundingClientRect().top + document.documentElement.scrollTop;

  const offset = 200;

  window.scrollTo({ top: position - offset, behavior: "smooth" });
};
