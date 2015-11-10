# Elasticsearch Storage Plugin

Elasticsearch Storage Plugin for the Reekoh IoT Platform.

Uses elasticsearch npm library

**Assumptions:**

1. Data would be in JSON format
2. Data would be processed based on configuration format
3. Conversions and formatting are done within Reekoh only minimal conversions are done in the plugin

**Process**

1. Data would be written directly to the elasticsearch host specified
2. Storage plugin will only write data
3. All errors will be logged and no data should be written
4. Must provide the id field if there is any to be used in an accounts setup
5. Must provide the parent field if there is any parent for a type
6. Data will be parsed accordingly based on field configuration if provided

**Field Configuration**

1. Input for this field is in JSON format {"(field_name)" : {"source_field" : "value", "data_type": "value", "format": "value"}}.
2. field_name will be the name of the column in the elasticsearch Table
3  source_field (required) value will be the name of the field in the JSON Data passed to the plugin
4  data_type (optional) there are 5 available data types that will convert data to it's proper type before saving
   we have String, Integer, Float, Boolean and DateTime leaving this blank will just use the current data for the field
5. format is only available for DateTime data_type this will allow users to format the date/time before saving
   i.e. (YYYY-MM-DD HH:mm:ss) kindly refer to the moment node module for more details and the accepted format
   of elasticsearch
