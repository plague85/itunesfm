'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _lastfm = require('./lastfm');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _promisify = require('./promisify');

var _promisify2 = _interopRequireDefault(_promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_prompt2.default.colors = false;

// Store ambiguous songs in this DB.
var MATCHING_FILE = 'matching.json';

var quickPrompt = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(message) {
    var _ref, result;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _promisify2.default)(_prompt2.default, 'get', { properties: { result: { message: message } } });

          case 2:
            _ref = _context.sent;
            result = _ref.result;
            return _context.abrupt('return', result);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function quickPrompt(_x) {
    return ref.apply(this, arguments);
  };
}();

var promptForMatch = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(name, artist, matches) {
    var i, num;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log('Multiple matches for %s by %s. Please pick one:', name || '??', artist || '??');
            for (i = 0; i < matches.length; i++) {
              console.log('%d: %s by %s (%d plays)', i + 1, matches[i].name, matches[i].artist.name, matches[i].playcount);
            }
            _context2.next = 4;
            return quickPrompt('Enter a number (0 for none)');

          case 4:
            _context2.t0 = _context2.sent;
            num = parseInt(_context2.t0, 10);

            if (!(num <= 0 || num >= matches.length)) {
              _context2.next = 8;
              break;
            }

            return _context2.abrupt('return', null);

          case 8:
            return _context2.abrupt('return', matches[num - 1]);

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return function promptForMatch(_x2, _x3, _x4) {
    return ref.apply(this, arguments);
  };
}();

var matchTrack = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(tracks, name, artist, key, matching) {
    var _findMatchingTracks, matches, nameMatches, match;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _findMatchingTracks = (0, _lastfm.findMatchingTracks)(tracks, name, artist, key && matching[key]);
            matches = _findMatchingTracks.matches;
            nameMatches = _findMatchingTracks.nameMatches;
            match = undefined;

            if (!(matches.length + nameMatches.length === 0)) {
              _context3.next = 8;
              break;
            }

            console.log('warning: could not match ' + name + ' by ' + artist + ' (id = ' + key + ')');
            // TODO: use heuristics to determine possible matches
            _context3.next = 16;
            break;

          case 8:
            if (!(matches.length === 1 || nameMatches.length === 1)) {
              _context3.next = 12;
              break;
            }

            match = matches[0] || nameMatches[0];
            _context3.next = 16;
            break;

          case 12:
            _context3.next = 14;
            return promptForMatch(name, artist, matches.length ? matches : nameMatches);

          case 14:
            match = _context3.sent;

            // Record the absence of a match as well.
            matching[key] = match == null ? '' : match.url;

          case 16:
            return _context3.abrupt('return', match);

          case 17:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return function matchTrack(_x5, _x6, _x7, _x8, _x9) {
    return ref.apply(this, arguments);
  };
}();

var main = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
    var provider, tracksPromise, username, useCached, _ref2, _ref3, myTracks, topTracks, matching, updates, id, _myTracks$id, name, artist, playedCount, match, matchPlayCount, ok;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            provider = undefined;

            if (!(_os2.default.platform() === 'win32')) {
              _context4.next = 6;
              break;
            }

            provider = require('./providers/WindowsProvider.js');
            _context4.next = 11;
            break;

          case 6:
            if (!(_os2.default.platform() === 'darwin')) {
              _context4.next = 10;
              break;
            }

            provider = require('./providers/OSXProvider');
            _context4.next = 11;
            break;

          case 10:
            throw new Error('platform ' + _os2.default.platform() + ' not supported');

          case 11:
            // Start fetching from iTunes immediately.
            tracksPromise = provider.getTracks();
            username = process.argv[2];

            if (!(username == null)) {
              _context4.next = 17;
              break;
            }

            _context4.next = 16;
            return quickPrompt('Enter your last.fm username');

          case 16:
            username = _context4.sent;

          case 17:
            useCached = process.argv.indexOf('cache') !== -1;
            _context4.next = 20;
            return _promise2.default.all([tracksPromise, (0, _lastfm.getTopTracks)(username, useCached)]);

          case 20:
            _ref2 = _context4.sent;
            _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
            myTracks = _ref3[0];
            topTracks = _ref3[1];

            console.log('Found %d tracks locally, %d on last.fm.', (0, _keys2.default)(myTracks).length, topTracks.length);

            matching = {};

            try {
              matching = JSON.parse(_fs2.default.readFileSync(MATCHING_FILE).toString());
            } catch (e) {}

            updates = {};
            _context4.t0 = _regenerator2.default.keys(myTracks);

          case 29:
            if ((_context4.t1 = _context4.t0()).done) {
              _context4.next = 41;
              break;
            }

            id = _context4.t1.value;
            _myTracks$id = myTracks[id];
            name = _myTracks$id.name;
            artist = _myTracks$id.artist;
            playedCount = _myTracks$id.playedCount;
            _context4.next = 37;
            return matchTrack(topTracks, name, artist, id, matching);

          case 37:
            match = _context4.sent;

            if (match != null) {
              matchPlayCount = parseInt(match.playcount, 10);

              if (playedCount < matchPlayCount) {
                console.log('will update ' + name + ': ' + artist + ' to ' + match.playcount);
                updates[id] = matchPlayCount;
              }
            }
            _context4.next = 29;
            break;

          case 41:
            if (!((0, _keys2.default)(updates).length === 0)) {
              _context4.next = 45;
              break;
            }

            console.log('No play counts were changed.');
            _context4.next = 52;
            break;

          case 45:
            _context4.next = 47;
            return quickPrompt('Save changes? y/n');

          case 47:
            ok = _context4.sent;

            if (!(ok === 'y')) {
              _context4.next = 52;
              break;
            }

            console.log('Saving changes..');
            _context4.next = 52;
            return provider.updateTracks(updates);

          case 52:

            _fs2.default.writeFileSync(MATCHING_FILE, (0, _stringify2.default)(matching));
            _context4.next = 58;
            break;

          case 55:
            _context4.prev = 55;
            _context4.t2 = _context4['catch'](0);

            console.error(_context4.t2);

          case 58:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 55]]);
  }));
  return function main() {
    return ref.apply(this, arguments);
  };
}();

main();