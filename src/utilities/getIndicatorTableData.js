/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

// eslint-disable-next-line import/no-cycle
import { COLUMN_TYPES } from '../pages/dataTableUtilities';
import { UIDatabase, createRecord } from '../database';

const COLUMN_INDICATOR = {
  width: 1,
  sortable: false,
};

const COLUMN_INDICATOR_IMMUTABLE = {
  type: COLUMN_TYPES.STRING,
  editable: false,
  ...COLUMN_INDICATOR,
};

const COLUMN_INDICATOR_MUTABLE = {
  type: COLUMN_TYPES.EDITABLE_STRING,
  editable: true,
  ...COLUMN_INDICATOR,
};

const COLUMNS = {
  DESCRIPTION: {
    ...COLUMN_INDICATOR_IMMUTABLE,
    title: 'Description',
    key: 'description',
  },
  CODE: {
    ...COLUMN_INDICATOR_IMMUTABLE,
    title: 'Code',
    key: 'code',
  },
};

/**
 * Intialise a new indicator value.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 */
const initialiseRowColumnValue = (row, column, period) => {
  UIDatabase.write(() => {
    createRecord(UIDatabase, 'IndicatorValue', row, column, period);
  });
};

const getIndicatorColumns = (indicator, code) =>
  indicator?.columns?.filter(({ description: columnCode }) => columnCode === code);

const getIndicatorRows = (indicator, code) =>
  indicator?.rows?.filter(({ id: rowCode }) => rowCode === code);

/**
 * Get value for indicator row, column tuple.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 * @returns {IndicatorValue}
 */
const getIndicatorRowColumnValue = (row, column, period) => {
  const columnValues = column.values.filtered('period == $0', period);
  const rowValues = row.values.filter(({ period: valuePeriod }) => valuePeriod.ID === period.ID);
  const columnValueIds = columnValues?.map(({ id }) => id);
  const rowValueIds = rowValues?.map(({ id }) => id);
  const [rowColumnValueId] = columnValueIds?.filter(id => rowValueIds.includes(id)) || [];
  const rowColumnValue = column?.values?.find(({ id }) => id === rowColumnValueId);

  if (!rowColumnValue) {
    initialiseRowColumnValue(row, column, period);
    return getIndicatorRowColumnValue(row, column, period);
  }

  return rowColumnValue;
};

// eslint-disable-next-line no-unused-vars
const getIndicatorTableColumn = (columnCode, indicator, period) => {
  const [column] = indicator.columns.filter(({ code }) => code === columnCode);
  return {
    ...COLUMN_INDICATOR_MUTABLE,
    title: column.description,
    key: column.code,
  };
};

/**
 * Get indicator data table columns.
 *
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {Array.<object>}
 */
// eslint-disable-next-line no-unused-vars
const getIndicatorTableColumns = (indicator, period) => {
  const descriptionColumn = COLUMNS.DESCRIPTION;
  const codeColumn = COLUMNS.CODE;
  // eslint-disable-next-line no-unused-vars
  const valueColumns = indicator.columns.map(({ description, code }) => ({
    ...COLUMN_INDICATOR_MUTABLE,
    title: description,
    key: description,
  }));

  return [descriptionColumn, codeColumn, ...valueColumns];
};

const getIndicatorTableRow = (rowId, indicator, period) => {
  const [row] = indicator.rows.filter(({ id }) => id === rowId);
  const { description, code } = row;
  const values = indicator.columns.reduce((acc, column) => {
    const { description: key } = column;
    const value = getIndicatorRowColumnValue(row, column, period);
    return { ...acc, [key]: value.value };
  }, {});
  return { id: rowId, description, code, ...values };
};

/**
 * Get indicator data table rows.
 *
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {Array.<object>}
 */
const getIndicatorTableRows = (indicator, period) =>
  indicator.rows.map(({ id }) => getIndicatorTableRow(id, indicator, period));

/**
 * Get indicator data table rows and columns.
 *
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {object}
 */
const getIndicatorTableData = (indicator, period) => {
  const columns = getIndicatorTableColumns(indicator, period);
  const rows = getIndicatorTableRows(indicator, period);
  return { columns, rows };
};

export {
  getIndicatorRows,
  getIndicatorColumns,
  getIndicatorTableRow,
  getIndicatorTableRows,
  getIndicatorRowColumnValue,
  getIndicatorTableData,
};
