'use strict';

var test = require('tape');

var algorithms = ['sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'md5', 'rmd160'];
var encodings = ['hex', 'base64']; // FIXME: test binary
var vectors = require('hash-test-vectors');

function runTest(name, createHash, algorithm) {
	test(name + ' test ' + algorithm + ' against test vectors', function (t) {
		function run(i) {
			if (i >= vectors.length) {
				t.end();
				return;
			}
			var obj = vectors[i];

			var input = new Buffer(obj.input, 'base64');
			var node = obj[algorithm];
			var js = createHash(algorithm).update(input).digest('hex');
			if (js !== node) {
				t.equal(js, node, algorithm + '(testVector[' + i + ']) == ' + node);
			}

			encodings.forEach(function (encoding) {
				var eInput = new Buffer(obj.input, 'base64').toString(encoding);
				var eNode = obj[algorithm];
				var eJS = createHash(algorithm).update(eInput, encoding).digest('hex');
				if (eJS !== eNode) {
					t.equal(eJS, eNode, algorithm + '(testVector[' + i + '], ' + encoding + ') == ' + eNode);
				}
			});
			input = new Buffer(obj.input, 'base64');
			node = obj[algorithm];
			var hash = createHash(algorithm);
			hash.end(input);
			js = hash.read().toString('hex');
			if (js !== node) {
				t.equal(js, node, algorithm + '(testVector[' + i + ']) == ' + node);
			}
			setTimeout(run, 0, i + 1);
		}

		run(0);
	});
}

function testLib(name, createHash) {
	algorithms.forEach(function (algorithm) {
		runTest(name, createHash, algorithm);
	});
}

testLib('createHash in crypto-browserify', require('../').createHash);
testLib('create-hash/browser', require('create-hash/browser'));
