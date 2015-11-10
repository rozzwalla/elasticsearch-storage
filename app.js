'use strict';

var platform      = require('./platform'),
	elasticsearch = require('elasticsearch'),
	_			  = require('lodash'),
	isJSON        = require('is-json'),
	moment		  = require('moment'),
	params = {}, client;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {

	var processedData = {};

	if (params.fields) {

		_.forEach(params.fields, function(field, key) {

			var datum = data[field.source_field],
				processedDatum;

			if (datum !== undefined && datum !== null) {
				if (field.data_type) {
					try {
						if (field.data_type === 'String') {

							if (isJSON(datum))
								processedDatum = JSON.stringify(datum);
							else
								processedDatum = String(datum);

						} else if (field.data_type === 'Integer')  {

							var intData = parseInt(datum);

							if (isNaN(intData))
								processedDatum = datum; //store original value
							else
								processedDatum = intData;

						} else if (field.data_type === 'Float')  {

							var floatData = parseFloat(datum);

							if (isNaN(floatData))
								processedDatum = datum; //store original value
							else
								processedDatum = floatData;

						} else if (field.data_type === 'Boolean') {

							var type = typeof datum;

							if ((type === 'string' && datum.toLocaleLowerCase() === 'true') ||
								(type === 'number' && datum === 1 )) {
								processedDatum = true;
							} else if ((type === 'string' && datum.toLocaleLowerCase() === 'false') ||
								(type === 'number' && datum === 0 )) {
								processedDatum = false;
							} else {
								processedDatum = datum;
							}

						} else if (field.data_type === 'DateTime') {

							var dtm = new Date(datum);

							if (!isNaN( dtm.getTime())) {

								if (field.format !== undefined)
									processedDatum = moment(dtm).format(field.format);
								else
									processedDatum = dtm;


							} else {
								processedDatum = datum;
							}

						}
					} catch (e) {
						console.error('Data conversion error in Elasticsearch.', e);
						platform.handleException(e);
						processedDatum = datum;
					}

				} else {
					processedDatum = datum;
				}

			} else {
				processedDatum = null;
			}

			processedData[key] = processedDatum;

		});
	} else {
		processedData = data;
	}

	var createObject = {
		index: params.index,
		type: params.type,
		body: processedData
	};

	if (params.id) {
		if (data[params.id] !== undefined)
			createObject.id = data[params.id];
	}

	if (params.parent) {
		if (data[params.parent] !== undefined)
			createObject.parent = data[params.parent];
	}

	client.create(createObject, function (error, result) {
		if (error) {
			console.error('Error creating record on Elasticsearch', error);
			platform.handleException(error);
		} else {
			platform.log(JSON.stringify({
				title: 'Record Successfully inserted to Elasticsearch.',
				data: result
			}));
		}
	});

});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	var domain = require('domain');
	var d = domain.create();

	d.on('error', function(error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
	});

	d.run(function() {
		// TODO: Release all resources and close connections etc.
		platform.notifyClose(); // Notify the platform that resources have been released.
	});
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {

	var parseFields, auth, apiVersion, host, parent, id;

	if (options.fields) {
		try {
			 parseFields = JSON.parse(options.fields);

			_.forEach(parseFields, function(field, key) {
				if (field.source_field === undefined || field.source_field === null) {
					throw( new Error('Source field is missing for ' + key + ' in Elasticsearch Plugin'));
				} else if (field.data_type  && (field.data_type !== 'String' && field.data_type !== 'Integer' &&
					field.data_type !== 'Float'  && field.data_type !== 'Boolean' &&
					field.data_type !== 'DateTime')) {
					throw(new Error('Invalid Data Type for ' + key + ' allowed data types are (String, Integer, Float, Boolean, DateTime) in Elasticsearch Plugin'));
				}
			});

		} catch (e) {
			console.error('Error parsing JSON field configuration for Elasticsearch.', e);
			platform.handleException(e);
			return;
		}
	}


	if (options.user) {
		if (options.password)
			auth =  options.user + ':' + options.password + '@';
		else
			auth =  options.user + ':@';
	}

	apiVersion = (options.apiVersion ? options.apiVersion: '1.0');
	parent 	   = (options.parent ? options.parent: null);
	id 		   = (options.id ? options.id: null);

	host       = options.protocol + '://' + auth + options.host;

	if (options.port)
		host = host + ':' + options.port;

	params = {
		parent     : parent,
		type       : options.type,
		index      : options.index,
		id         : id,
		fields     : parseFields
	};

	client = new elasticsearch.Client({
		host: host,
		apiVersion: apiVersion
	});

	platform.log('Elasticsearch plugin ready.');
	platform.notifyReady();
});