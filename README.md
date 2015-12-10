# Elasticsearch Storage Plugin

[![Build Status](https://travis-ci.org/Reekoh/elasticsearch-storage.svg)](https://travis-ci.org/Reekoh/elasticsearch-storage)
![Dependencies](https://img.shields.io/david/Reekoh/elasticsearch-storage.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/elasticsearch-storage.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Elasticsearch Storage Plugin for the Reekoh IoT Platform.

Uses elasticsearch npm library

## Assumptions:

1. Data would be in JSON format
2. Data would be processed based on configuration format
3. Conversions and formatting are done within Reekoh only minimal conversions are done in the plugin

## Process

1. Data would be written directly to the elasticsearch host specified
2. Storage plugin will only write data
3. All errors will be logged and no data should be written
4. Must provide the id field if there is any to be used in an accounts setup
5. Must provide the parent field if there is any parent for a type
6. Data will be parsed accordingly based on field configuration if provided otherwise it will be saved as is

## Field Configuration

1. Input for this field is in JSON format {"(field_name)" : {"source_field" : "value", "data_type": "value", "format": "value"}}.
2. field_name will be the name of the column in the elasticsearch Table
3  source_field (required) value will be the name of the field in the JSON Data passed to the plugin
4  data_type (optional) there are 6 available data types that will convert data to it's proper type before saving
   we have String, Integer, Float, Boolean, DateTime and JSON leaving this blank will just use the current data for
   the field
5. format is only available for DateTime data_type this will allow users to format the date/time before saving
   i.e. (YYYY-MM-DD HH:mm:ss) kindly refer to the moment node module for more details and the accepted format
   of elasticsearch
6. JSON data type would only accept JSON String as an input to be parsed otherwise if it's already a JSON object no
   need to enter data type

### Sample Config

```javascript
{
  "co2_field": {
	"source_field": "co2",
	"data_type": "String"
  },
  "temp_field": {
	"source_field": "temp",
	"data_type": "Integer"
  },
  "quality_field": {
	"source_field": "quality",
	"data_type": "Float"
  },
  "metadata_field": {
	"source_field": "metadata",
	"data_type": "JSON"
  },
  "reading_time_field": {
	"source_field": "reading_time",
	"data_type": "DateTime",
	"format": "yyyy-MM-ddTHH:mm:ss"
  },
  "random_data_field": {
	"source_field": "random_data"
  },
  "is_normal_field": {
	"source_field": "is_normal",
	"data_type": "Boolean"
  }
}
```

### Sample Data:
```javascript
{
  _id: _id,
  co2: '11%',
  temp: 23,
  quality: 11.25,
  metadata: '{"name": "warehouse air conditioning"}',
  reading_time: '2015-11-27T11:04:13.539Z',
  random_data: 'abcdefg',
  is_normal: true
}
```

### Elastic Search Fields:

Type Field mapping |
-------------------|
co2_field          |
temp_field         |
quality_field      |
metadata_field     |
reading_time_field |
random_data_field  |
is_normal_field    |

