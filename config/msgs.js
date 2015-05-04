/**
 * Copyright 2015 International Business Machines Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Messages library for working with Activity Streams Test Harness
 *
 * @author Jacques Perrault (jacques_perrault@us.ibm.com)
 */
module.exports = {
  'json': {
    'invalid': 'JSON is invalid.'
  },
  'jsonld' : {
    'invalid': 'JSON-LD is invalid.'
  },
  'as': {
    'results': 'Validation results',
    'nodefs': 'Could not retieve Activity Stream definitions',
    'valid': 'ActivityStream is valid',
    'import': 'ActivityStream import failed',
    'displayName_noHtml': 'HTML markup MUST NOT be included in displayName',
    'displayName_mustBeString': 'displayName must be a string',
    'displayName_useNaturalLanguageForm': 'ActivityStream contains displayName and displayNameMap vocabulary terms.  Consider collapsing the JSON string form (displayName) into the natural language form (displayNameMap)'
  }
}
