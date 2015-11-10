/*
 * Just a sample code to test the storage plugin.
 * Kindly write your own unit tests for your own plugin.
 */
'use strict';

var cp     = require('child_process'),
	assert = require('assert'),
	storage;

describe('Storage', function () {
	this.slow(5000);

	after('terminate child process', function () {
		storage.send({
			type: 'close'
		});

		setTimeout(function () {
			storage.kill('SIGKILL');
		}, 3000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			assert.ok(storage = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			storage.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			storage.send({
				type: 'ready',
				data: {
					options: {
						host	: 'reekoh.east-us.azr.facetflow.io',
						user	: 'KD8xosnl80e2WR8eyfqENgoNo4VUOs0S',
						protocol: 'https',
						fields : JSON.stringify({ string_field: {source_field:'name', data_type: 'String'}}),
						id 		: '_id',
						index	: 'reekoh_test',
						type	: 'type_test'
					}
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should process the data', function (done) {

			var _id = new Date().getTime();

			storage.send({
				type: 'data',
				data: {
					_id : _id,
					name: 'Test Name'
				}
			}, done);
		});
	});
});