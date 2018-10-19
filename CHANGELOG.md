# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org)

## [2.3.0] - 2018-10-18
### Fixed
- Support retention-policy-esque filter creation

## [2.2.1] - 2018-04-09
### Fixed
- tweaked metadata text for `is_unique`

## [2.2.0] - 2018-04-04
### Fixed
- UI: Handle preselected integration and update styles

## [2.1.3] - 2018-03-03
### Added
- Add metadata and icon

## [2.1.1] - 2018-01-16
### Added
- Convert to js

## [2.1.0] - 2018-01-05
### Added
- Capture duration data from SL api

## [2.0.5] - 2017-10-26
### Fixed
- fixed `is_unique` event structure to match response variables

## [2.0.4] - 2017-08-23
### Fixed
- fixed UI to map `values` (not `value`) for integrations other than `query_item`

## [2.0.3] - 2017-08-14
### Fixed
- re-added `values` to query item as a deprecated field
- fixed ui to map to `value` instead of `values` for query item

## [2.0.2] - 2017-08-09
### Fixed
- changed to stop using webpack-dev-middleware in production

## [2.0.1] - 2017-07-25
### Fixed
- Protect against unset NODE_ENV     

## [2.0.0] - 2017-07-06
### Fixed
- changed the request field for query item from `values` to `value`
- changed query item to only use the first item if a comma-separated list is mapped

## [1.4.0] - 2017-06-29
### Added
- new rich UI with support for fetching lists and ensuring a list exists
- new "is unique" (query + add) endpoint

## [1.3.4] - 2017-04-06
### Fixed
- `values` are now only URL encoded when they appear in a URL

## [1.3.3] - 2017-04-05
### Fixed
- `values` are now URL encoded

## [1.3.2] - 2017-01-18
### Fixed
- fixed an error caused by unclosed quotes in `values`

## [0.0.1] - 2014-07-17
### Added
- initial implementation
