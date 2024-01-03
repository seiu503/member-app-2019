## MAKING NEW TRANSLATIONS ACCESSIBLE TO WEBSITE
The simplest way to add translations to the site is to add a new item to one of the existing translation json files.
To do this, follow the format of the objects by adding the translation with its ID as the key and translations as an array of strings.

These instructions were updated June 14, 2023 when switching from the react-localize-redux package to react-i18nNext because the original package is no longer maintained

If you need or want to create a new translation file for organizational purposes, please do so in this translations folder.
It must be a .json file and follow proper json formatting. You will then need to import it into globalTranslations.js and
add it to the exported object therein for the new translations to be accessible. Once that is done, anything in that file will be available site wide.

Any new ids you create must be unique. Duplicate ids will overwrite each other.