## MAKING NEW TRANSLATIONS ACCESSIBLE TO WEBSITE
The simplest way to add translations to the site is to add a new item to one of the existing translation json files.
To do this, follow the format of the objects by adding the translation with its ID as the key and translations as an array of strings.

**NOTE:** It is very important that the languages in the array are always in the same order, react-localization-redux expects translations
to be in the same order as the languages listed in the languages object option provided to App.jsx in this.props.initialize.

EXAMPLE: 
{
  newId: [
    "English translation",
    "Spanish translation",
    "Russian translation",
    "Vietnamese translation",
    "Chinese translation"
  ]  
};

If you need or want to create a new translation file for organizational purposes, please do so in this translations folder.
It must be a .json file and follow proper json formatting. You will then need to import it into globalTranslations.jsx and
add it to the exported object therein for the new translations to be accessible. Once that is done, anything in that file will
be available site wide.

*** An Important note on IDs ***
Please make sure that any new ids you create are unique. If it is identical to an existing id whichever one is last in file 
order wil overwrite any pre-existing id and anywhere that translation id is referenced on the page, they will all say whatever
is in the last translation array.

## ADDING TRANSLATE COMPONENTS 
Now any new translations are accessible to the entire site but they will not be displayed yet.
To do that they must be added as a <Translate> component in some manner. Some of this is automated but some will require further action 
depending on the type of component/element is being added or changed.

If the new translation is for an input element that is generated with one of the render checkbox/select/textField functions from 
SubmissionFormElements.jsx, you must make sure that the id in the translation json file matches the id of the input. This is the only way
to translate the labels for these elements. But once those match, the translations will be added automatically and you are good to go!

If the new translation is not one of these pre-built elements there are two routes you may need to take depending on whether the text is 
hardcoded HTML/JSX or if it is rendered by a parent component.

If the text is hardcoded (ie button text, <FormHelperText> or <FormLabel> elements etc.) add the translations is pretty straightforward.
Just make sure at the top of the file you
import { Translate } from "react-localize-redux";

And then nest the <Translate> component inside the element. If you would like to include the default language translation you can do so,
but it is not necessary. Below are two examples, one with the default english, and one with the self closing Translation component taken from 
Tab1.jsx lines 247-249 (at the time of this writing).

*** WITH DEFAULT TRANSLATION: ***
  <FormHelperText className={classes.formHelperText}>
    <Translate id="phoneLegalLanguage">
      † By providing my phone number, I understand that the Service Employees International Union (SEIU), its local unions, and affiliates 
      may use automated calling technologies and/or text message me on my cellular phone on a periodic basis. SEIU will never charge for text 
      message alerts. Carrier message and data rates may apply to such alerts. Reply STOP to stop receiving messages; reply HELP for more information.
    </Translate>
  </FormHelperText>

*** WITHOUT DEFAULT TRANSLATION: ***
  <FormHelperText className={classes.formHelperText}>
    <Translate id="phoneLegalLanguage" />
  </FormHelperText>

Both will display the same.

**NOTE:** that `phoneLegalLanguage` id in the <Translate> component matches the corresponding key from the page1.json translation file.

If the new text is rendered by a parent component (ie a label, an imported nested renderElement function, a TextField inside a React Form, etc,) 
the code is a little more involved but still fairly straightforward. You will wrap the child element in the <Translate> component passed up
through a callback function with `translate`. Again make sure at the top of the file to 
import { Translate } from "react-localize-redux";

And then the new element may look something like this taken from LinkRequest.jsx:
    <form id="myGreatForm"
      onSubmit={e => this.submit(e)}
      className={classes.form}
      onError={errors => console.log(errors)}
      id="form"
    >
      <Translate>
        {({ translate }) => (
          <TextField
            data-test="firstName"
            name="firstName"
            id="firstName"
            label={translate("firstName")}
            type="text"
            variant="outlined"
            required
            value={this.props.submission.formPage1.firstName}
            onChange={e => this.props.apiSubmission.handleInput(e)}
            className={classes.input}
          />
        )}
      </Translate>
    </form>

The most difficult aspect of this method above came in writing tests (at least for the author of these instructions). If you run into issues with trying to 
mount, shallow render, or trigger onChange/onSubmit events in your unit tests, go look at tests/containers/LinkRequest.test.js. Specifically the test 
`"calls 'handleInput' on input change"` (lines 74-111) for a reference.

## FILE SETUP
Lastly, I want to briefly mention an instruction on file setup. In App.js on the final export line App is wrapped in `withLocalize`. This gives App and all 
files contained within access to `react-localize-redux` and its methods. The two most important for us being `this.props.localize` and `translate`.
Because we put this at the highest level component we shouldn't have to worry about it again. But, If for some reason this needs to be removed or you are building 
a secondary site that also needs this package, you must:
- Export the parent component with `withLocalize`.
- Initialize the translations in the parent constructor.
- Wrap the parent Element with `LocalizeProvider` in order to have access to the redux store as done in index.js

That should be it. If you run into further issues here are some helpful links
- official documentation: https://ryandrewjohnson.github.io/react-localize-redux-docs/
- github: https://github.com/ryandrewjohnson/react-localize-redux
- npm page: https://www.npmjs.com/package/react-localize-redux
- and the email of the yokel responsible for adding this package: jheff2@gmail.com
