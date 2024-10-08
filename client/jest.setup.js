import 'cross-fetch/polyfill';

// jest.mock('react', () => ({ React: jest.fn() }));
// import React from "react";

// React.mockImplementation(() => <div>Mock</div>);


// import React from "react";

// const mockReact = React;

// jest.mock('react', () => ({
//   React: () => mockReact,
// }));

// jest.doMock('react-google-recaptcha', () => {
//   const mockRecaptchaV2 = React.forwardRef((props, ref) => {
//     React.useImperativeHandle(ref, () => ({
//       reset: jest.fn(),
//       execute: jest.fn(),
//       executeAsync: jest.fn(() => 'token'),
//     }));
//     return {
//       __esModule: true,
//     	<input ref={ref} type="checkbox" data-testid="mock-v2-captcha-element" {...props} />;
//     }
//   });

//   return mockRecaptchaV2;
// });