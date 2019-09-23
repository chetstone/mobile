/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { FlatList, View, VirtualizedList, Text, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import globalStyles from '../globalStyles';
import { UIDatabase } from '../database/index';

import { schema } from '../database/schema';

const REALM_TYPES = {
  boolean: ['bool'],
  date: ['date'],
  number: ['int', 'float', 'double'],
  string: ['string'],
  array: ['list'],
  object: ['object'],
};

const typeMapper = new Map(
  Object.entries(REALM_TYPES)
    .map(([type, realmTypes]) => realmTypes.map(realmType => [realmType, type]))
    .flat()
);

const getObjectTypes = ({ schema: objectSchemas }) =>
  objectSchemas.map(({ schema: objectSchema }) => objectSchema.name);

const parseType = realmType => {
  const { type } = realmType;
  if (type) return parseType(type);
  const parsedType = typeMapper.get(realmType);
  return parsedType;
};

const getObjectFields = ({ schema: objectSchemas }) =>
  objectSchemas
    .map(({ schema: objectSchema }) => {
      const { name, properties } = objectSchema;
      const fields = Object.entries(properties)
        .map(([field, type]) => ({
          [field]: parseType(type),
        }))
        .reduce((acc, field) => ({ ...acc, ...field }), {});
      return { [name]: fields };
    })
    .reduce((acc, object) => ({ ...acc, ...object }));

const OBJECT_TYPES = getObjectTypes(schema);
const OBJECT_FIELDS = getObjectFields(schema);

const toCapitalCase = value => value.charAt(0).toUpperCase() + value.slice(1);

const parseString = value => String(value);
const parseNumber = value => String(value);
const parseObject = value => value.id;
const parseArray = value => value.length;
const parseBoolean = value => toCapitalCase(String(value));
const parseDate = value => value.toString();

const parseCell = (value, type) => {
  if (value === null || value === undefined) return 'N/A';
  switch (type) {
    case 'string':
      return parseString(value);
    case 'number':
      return parseNumber(value);
    case 'object':
      return parseObject(value);
    case 'array':
      return parseArray(value);
    case 'boolean':
      return parseBoolean(value);
    case 'date':
      return parseDate(value);
    default:
      return '';
  }
};

const getInitialState = database => {
  const objectString = 'Requisition';
  const objectData = database.objects(objectString);
  const searchString = '';
  const filterString = '';
  const filteredData = objectData;
  return { objectString, objectData, searchString, filterString, filteredData };
};

const getUpdatedState = (database, state) => {
  const { objectString, objectData, searchString, filterString, filteredData } = state;
  const newState = { searchString, filterString };
  const updateObject = searchString !== objectString && OBJECT_TYPES.indexOf(searchString) >= 0;
  newState.objectString = updateObject ? searchString : objectString;
  newState.objectData = updateObject ? database.objects(newState.objectString) : objectData;
  if (filterString === '') {
    newState.filteredData = newState.objectData;
  } else {
    try {
      newState.filteredData = newState.objectData.filtered(filterString);
    } catch (err) {
      newState.filteredData = updateObject ? newState.objectData : filteredData;
    }
  }

  return newState;
};

/**
 * A page for displaying objects in the local database. Includes search and filtering functionality.
 *
 * @prop   {UIDatabase}     database       App wide database.
 * @state  {string}         objectString   Current database object.
 * @state  {string}         searchString   Current search string. Used to update current object.
 * @state  {string}         filterString   Current filter string. Used to update filtered data.
 * @state  {Realm.Results}  objectData     Reference to current database object results. Used to
 *                                         roll back filter state when filter is reset.
 * @state  {Realm.Results}  filteredData   Reference to current database object results after filter
 *                                         has been applied. Displayed to the user.
 */
export const RealmExplorer = ({ database }) => {
  const [state, setState] = useState(getInitialState(database));

  const onSearchChange = searchString => {
    setState({ ...state, searchString });
  };

  const onFilterChange = filterString => {
    setState({ ...state, filterString });
  };

  useEffect(() => setState(getUpdatedState(database, state)), [
    state.searchString,
    state.filterString,
  ]);

  const objectFields = OBJECT_FIELDS[state.objectString];

  const headerRowKeyExtractor = (_, index) => index.toString();
  const rowKeyExtractor = ({ id }) => id;

  const renderHeaderRow = headerRow => {
    const { item } = headerRow;
    const cells = Object.keys(item).map(columnKey => (
      <View style={styles.cell}>
        <Text style={styles.cellText}>{columnKey}</Text>
      </View>
    ));
    return <View style={styles.row}>{cells}</View>;
  };

  const renderRow = row => {
    const { item } = row;
    const cells = Object.entries(objectFields).map(([columnKey, columnType]) => {
      const cell = item[columnKey];
      const cellValue = parseCell(cell, columnType);
      return (
        <View style={styles.cell}>
          <Text style={styles.cellText}>{cellValue}</Text>
        </View>
      );
    });
    return <View style={styles.row}>{cells}</View>;
  };

  const headerData = [objectFields];
  const data = state.filteredData;

  return (
    <View style={[globalStyles.container]}>
      <SearchBar onChange={onSearchChange} placeholder="Table name" />
      <SearchBar onChange={onFilterChange} placeholder="Filter string" />
      <FlatList
        data={headerData}
        keyExtractor={headerRowKeyExtractor}
        renderItem={renderHeaderRow}
      />
      <VirtualizedList
        data={data}
        getItem={(d, i) => d[i]}
        getItemCount={d => d.length}
        keyExtractor={rowKeyExtractor}
        renderItem={renderRow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
  },
  cellText: {
    textAlign: 'center',
  },
  row: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    flexGrow: 1,
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
});

RealmExplorer.propTypes = {
  database: PropTypes.instanceOf(UIDatabase).isRequired,
};

export default RealmExplorer;
