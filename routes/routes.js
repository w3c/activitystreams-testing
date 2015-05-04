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
 * Node routes for working with Activity Streams Test Harness
 *
 * @author Jacques Perrault (jacques_perrault@us.ibm.com)
 */
module.exports = function(app, config) {

  var request         = require('request'); // Simplified HTTP client
  var DateTime        = require('date-time-string'); // data/time formatting
  var jsonlint        = require('jsonlint'); // nicer err msgs than JSON.parse
  var as              = require('activitystrea.ms');
  var jsonld          = require('jsonld');
  var msgs            = require('../config/msgs');
  var asTest          = require('../public/javascript/asTest')

  // =====================================
  // LOG ALL REQUESTS ====================
  // =====================================
  app.all('*', function(req, res, next) {
    console.log(Date.now() + " - remote ip: " + req.connection.remoteAddress + " received request to " + req.url);
    next();
  });

  // =====================================
  // HOME PAGE ===========================
  // =====================================
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // =====================================
  // VALIDATE ============================
  // =====================================
  app.post('/validate', function(req, res) {
    // FETCH THE ACTIVITYSTREAM SPEC
    var asVocab       = {};
    var importedDoc   = {};
    var expandedDoc   = {};
    var flattenedDoc  = {};
    var jsonDoc       = {};
    var baseURI       = 'http://www.w3.org/ns/activitystreams#';

    request.get(baseURI, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        asVocab = JSON.parse(body);
    
        // FETCH DATA FROM THE ENDPOINT
        request.get(req.body.activitystreamIRI, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var content = body;
            console.log('RAW DATA from ' + req.body.activitystreamIRI);
            console.log(content);

            // VALIDATE JSON
            try {
              var jsonDoc = jsonlint.parse(content);
            } catch (error) {
              sendResult(500, msgs.json.invalid, error.message.replace(/\n/g,'<br>'), res);
              // TODO return(next) handling to cease validation
            }

            // VALIDATE JSON-LD
            as.import(jsonDoc, function(err,imported) {
              if (err !== null) {
                sendResult(500, msgs.as.import, err.message.replace(/\n/g,'<br>'), res);
                // TODO return(next) handling to cease validation
              } else {
                importedDoc = imported;

                // VALIDATE ACTIVITYSTREAM DEFAULT MAPPINGS
                expandedDoc = importedDoc._expanded;
                console.log('EXPANDED: ' + JSON.stringify(expandedDoc));
                var result = '';
                result = getTypes(jsonDoc, expandedDoc, baseURI);
                console.log(result);

                // =====================================
                // VALIDATE Core Vocabulary Terms ======
                // =====================================
    /*            asTest.asDisplayName(compacted, function(code, alert){
                  sendResult(code, alert, content, res);
                });
    */
                // All tests passed, send a friendly message
                sendResult(200, msgs.as.results, result.replace(/\n/g,'<br>'), res);
              }
            })
          }
        })
      // unable to retrieve ActivityStream vocabulary specification
      } else {
        if (error === null) {
          sendResult(500, msgs.as.nodefs, '', res);
        } else {
          sendResult(500, msgs.as.nodefs, error.message.replace(/\n/g,'<br>'), res);
        }
      }
    })
  });


  function getTypes(jsonObject, expandedObject, baseURI) {
    var result = '';
    for (property in jsonObject) {
      if (property !== '@context' ) {
        if (property === '@type') {
          // VALIDATE ACTIVITY TYPE MAPPING
          //console.log('VALIDATE @TYPE: ' + jsonObject[property]);
          result += validateActivityType(jsonObject[property], expandedObject, baseURI)
        } else if (property === '@id') {
          // ignore @id
        } else {
          if (typeof jsonObject[property] === 'object') {
            // VALIDATE OBJECT TYPE MAPPING
            //console.log('VALIDATE OBJECT: ' + property);
            result += validateObjectOrPropertyType(property, expandedObject, baseURI)
            //console.log('ENTERING NESTED OBJECT: ' + property);
            // then iterate through the object
            result += getTypes(jsonObject[property], expandedObject[baseURI + property][0], baseURI);
          } else {
            // VALIDATE PROPERTY MAPPING
            //console.log('VALIDATE PROPERTY: ' + property);
            result += validateObjectOrPropertyType(property, expandedObject, baseURI)
          }
        }
      }
    }
    return result;
  };

  function validateActivityType(activityType, expandedObject, baseURI) {
    var result = '';
    var shouldMatch = baseURI + activityType;
    var beingMatched = expandedObject["@type"][0]
    if (beingMatched === shouldMatch) {
      result = '"' + activityType + '" matches the ActivityStream Activity Type: ' + shouldMatch + '\n';
    } else {
      result = '-----------------' + '\n';
      result += 'Implementers are not permitted to change the default mappings of the core properties and types' + '\n';
      result += 'Raw activity type: ' + activityType + '\n';
      result += 'Expanded value: ' + expandedObject["@type"][0] + '\n';
      result += 'Normative value: ' + shouldMatch + '\n';
      result += '-----------------' + '\n';
    }
    console.log(result);
    return result;
  }


  function validateObjectOrPropertyType(activityType, expandedObject, baseURI) {
    var result = '';
    var shouldMatch = baseURI + activityType;
    if (expandedObject.hasOwnProperty(shouldMatch)) {
      result = '"' + activityType + '" matches the ActivityStream Object Type: ' + shouldMatch + '\n';
    } else {
      result = '-----------------' + '\n';
      result += 'Implementers are not permitted to change the default mappings of the core properties and types' + '\n';
      result += 'Raw activity type: ' + activityType + '\n';
      result += 'Expanded value: ' + expandedObject["@type"][0] + '\n';
      result += 'Normative value: ' + shouldMatch + '\n';
      result += '-----------------' + '\n';
    }
    //console.log(result);
    return result;
  }
  
  
  // =====================================
  // RESULTS =============================
  // =====================================
  function sendResult(code, alert, data, res) {
    var bsclass = '';
    switch (code) {
        case 200:
          bsclass = 'class="alert alert-success"';
          break;
        case 300:
          bsclass = 'class="alert alert-warning"';
          break;
        case 500:
          bsclass = 'class="alert alert-danger"';
          break;
        default:
          bsclass = 'class="alert alert-success"';
          break;
    }
    res.status(200).render('response.ejs', { bsclass: bsclass, alert: alert, data: data });
  }

  // =====================================
  // JSON (INVALID) ======================
  // =====================================
  app.get('/json/0001', function(req, res) {
    res.status(200).send('{test: "false"}');
  });
  // =====================================
  // JSON-LD (INVALID) ===================
  // =====================================
  app.get('/jsonld/0001', function(req, res) {
    var obj = '{"@context": "http://asjsonld.mybluemix.net","object": {"@id": "http://example.org","@reverse": "http://example.com"}}';
    res.status(200).send(obj);
  });
  // =====================================
  // as:Activity =========================
  // =====================================
  app.get('/asActivity/0001', function(req, res) {
    var obj = '{"@context": "http://www.w3.org/ns/activitystreams#Like","@type": "Like","actor": {"@type": "Person","displayName": "Sally"},"object": {"@type": "Note","displayName": "A Note"}}';
    res.status(200).send(obj);
  });
  app.get('/asActivity/0002', function(req, res) {
    var obj = '{"@context": ["http://asjsonld.mybluemix.net",{"Assign": "http://foo/Bar"}],"@type": "Assign"}';
    res.status(200).send(obj);
  });
  // =====================================
  // AS displayName (invalid / object) ===
  // =====================================
  app.get('/asdisplayName/0001', function(req, res) {
    var obj = '{"@context":"http://dandus.mybluemix.net/context","@id":"http://dandus.mybluemix.net/r/res1428409632038","@type":"Announce","actor":{"@id":"acct:workflow@example.org","@type":"Application"},"displayName": {"key": "Announce:  Reassigned patient"},"object":{"@type":"Assign","actor":"acct:workflow@example.org","object":{"@id":"acct:33333","@type":"Person"},"target":{"@id":"acct:11111","@type":"Person"}},"published":"2015-04-07T12:27:12.048Z","summary":"Reassigned patient Jane to doctor Dr. Samantha.","updated":"2015-04-07T12:27:12.048Z"}';
    res.status(200).send(obj);
  });
  // =====================================
  // AS displayName (invalid / HTML) =====
  // =====================================
  app.get('/asdisplayName/0002', function(req, res) {
    var obj = '{"@context":"http://dandus.mybluemix.net/context","@id":"http://dandus.mybluemix.net/r/res1428409632038","@type":"Announce","actor":{"@id":"acct:workflow@example.org","@type":"Application"},"displayName": "Announce:  <b>Reassigned patient</b>","object":{"@type":"Assign","actor":"acct:workflow@example.org","object":{"@id":"acct:33333","@type":"Person"},"target":{"@id":"acct:11111","@type":"Person"}},"published":"2015-04-07T12:27:12.048Z","summary":"Reassigned patient Jane to doctor Dr. Samantha.","updated":"2015-04-07T12:27:12.048Z"}';
    res.status(200).send(obj);
  });
  // =====================================
  // AS displayName w/ displayNameMap ====
  // =====================================
  app.get('/asdisplayName/0003', function(req, res) {
    var obj = '{"@context":"http://dandus.mybluemix.net/context","@id":"http://dandus.mybluemix.net/r/res1428409632038","@type":"Announce","actor":{"@id":"acct:workflow@example.org","@type":"Application"},"displayNameFull": "bob","displayName":"Announce:  Reassigned patient","displayNameMap": {"en": "A simple note","sp": "Una simple nota"},"object":{"@type":"Assign","actor":"acct:workflow@example.org","object":{"@id":"acct:33333","@type":"Person"},"target":{"@id":"acct:11111","@type":"Person"}},"published":"2015-04-07T12:27:12.048Z","summary":"Reassigned patient Jane to doctor Dr. Samantha.","updated":"2015-04-07T12:27:12.048Z"}';
    res.status(200).send(obj);
  });
}
