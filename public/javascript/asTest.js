  var msgs            = require('../../config/msgs');

  // =====================================
  // displayName                         
  // http://www.w3.org/ns/activitystreams#displayName
  // http://www.w3.org/TR/activitystreams-vocabulary/#dfn-displayname
  // =====================================
  exports.asDisplayName = function(compactedDoc, callback) {
    if (typeof compactedDoc['displayName'] !== 'undefined') {
      var re = new RegExp("<|>");
      if (typeof compactedDoc['displayName'] !== 'string') {
        callback.call(this, 500, msgs.as.displayName_mustBeString );
      }

      if (re.test(compactedDoc['displayName'])) {
        callback.call(this, 500, msgs.as.displayName_noHtml );
      }

      if (compactedDoc['displayNameMap'] !== undefined) {
        callback.call(this, 300, msgs.as.displayName_useNaturalLanguageForm );
      }
    }
  }
