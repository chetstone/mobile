/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { newDataTableStyles } from '../../globalStyles';

import Row from './Row';
import Cell from './Cell';
import EditableCell from './EditableCell';
import CheckableCell from './CheckableCell';
import TouchableCell from './TouchableCell';

import { NewExpiryDateInput } from '../NewExpiryDateInput';

import {
  CheckedComponent,
  UncheckedComponent,
  DisabledCheckedComponent,
  DisabledUncheckedComponent,
  OpenModal,
} from '../icons';

import { formatStatus } from '../../utilities/index';

/**
 * Wrapper component for a mSupply DataTable page row.
 * Wraps Row component with a contained RenderCells, which
 * will generate the appropriate cell for a given columnKey.
 * Doesn't need to be used, but is a convenience component.
 *
 * @param {Object} rowData  Data object for a row i.e. ItemBatch object
 * @param {Object} rowState State object for a row, see: Row.js
 * @param {Object} style    Style object the be passed to inner Row
 * @param {String} rowKey   Unique key for a row
 * @param {Array} columns   Array of column objects, see: columns.js
 * @param {Bool} isFinalised    Boolean indicating if the DataTable page is finalised.
 * @param {Func} focusCellAction    Action for focusing a cell.
 * @param {Func} focusNextAction    Action for focusing the next cell.
 * @param {Func} dispatch   Dispatch function for containing reducer.
 * @param {Func} getAction  Function to return an action for a cell
 *                          (colKey, propName) => actionObject
 */
const DataTableRow = React.memo(
  ({
    rowData,
    rowState,
    rowKey,
    style,
    columns,
    isFinalised,
    dispatch,
    focusCellAction,
    focusNextAction,
    getAction,
    onPress,
  }) => {
    // Key of the current column focused.
    const focusedColumnKey = rowState && rowState.focusedColumn;

    // Callback for rendering a row of cells. A cell is
    const renderCells = useCallback(() => {
      const {
        cellText,
        cellContainer,
        touchableCellContainer,
        editableCellText,
        editableCellTextView,
        editableCellUnfocused,
      } = newDataTableStyles;

      // Map each column to an appropriate cell for a given row.
      return columns.map(({ key: columnKey, type, width, alignText }, index) => {
        const isLastCell = index === columns.length - 1;
        const isDisabled = isFinalised || (rowState && rowState.isDisabled) || rowData.isFinalised;
        const isFocused = focusedColumnKey === columnKey;
        const cellAlignment = alignText || 'left';

        switch (type) {
          case 'editable':
            return (
              <EditableCell
                key={columnKey}
                value={rowData[columnKey]}
                rowKey={rowKey}
                columnKey={columnKey}
                editAction={getAction(columnKey)}
                isFocused={isFocused}
                isDisabled={isDisabled}
                focusAction={focusCellAction}
                focusNextAction={focusNextAction}
                dispatch={dispatch}
                width={width}
                viewStyle={cellContainer[cellAlignment]}
                textViewStyle={editableCellTextView}
                isLastCell={isLastCell}
                keyboardType="numeric"
                textInputStyle={cellText[cellAlignment]}
                textStyle={editableCellUnfocused[cellAlignment]}
                cellTextStyle={editableCellText}
              />
            );

          case 'checkable':
            return (
              <CheckableCell
                key={columnKey}
                rowKey={rowKey}
                columnKey={columnKey}
                isChecked={rowState && rowState.isSelected}
                isDisabled={isDisabled}
                CheckedComponent={CheckedComponent}
                UncheckedComponent={UncheckedComponent}
                DisabledCheckedComponent={DisabledCheckedComponent}
                DisabledUncheckedComponent={DisabledUncheckedComponent}
                onCheckAction={getAction(columnKey, 'onCheckAction')}
                onUncheckAction={getAction(columnKey, 'onUncheckAction')}
                dispatch={dispatch}
                containerStyle={touchableCellContainer}
                width={width}
                isLastCell={isLastCell}
              />
            );

          case 'editableDate':
            return (
              <NewExpiryDateInput
                key={columnKey}
                value={rowData[columnKey]}
                rowKey={rowKey}
                columnKey={columnKey}
                editAction={getAction(columnKey)}
                isFocused={isFocused}
                isDisabled={isDisabled}
                focusAction={focusCellAction}
                focusNextAction={focusNextAction}
                dispatch={dispatch}
                width={width}
                isLastCell={isLastCell}
              />
            );

          case 'status':
            return (
              <Cell
                key={columnKey}
                value={formatStatus(rowData[columnKey])}
                width={width}
                viewStyle={cellContainer[cellAlignment]}
                textStyle={cellText[cellAlignment]}
                isLastCell={isLastCell}
              />
            );

          case 'date':
            return (
              <Cell
                key={columnKey}
                value={rowData[columnKey] && rowData[columnKey].toDateString()}
                width={width}
                viewStyle={cellContainer[cellAlignment]}
                textStyle={cellText[cellAlignment]}
                isLastCell={isLastCell}
              />
            );

          case 'modalControl':
            return (
              <TouchableCell
                key={columnKey}
                renderChildren={OpenModal}
                rowKey={rowKey}
                columnKey={columnKey}
                onPressAction={getAction(columnKey)}
                dispatch={dispatch}
                width={width}
                isLastCell={isLastCell}
                isDisabled={isDisabled}
                containerStyle={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              />
            );

          default:
            return (
              <Cell
                key={columnKey}
                value={rowData[columnKey]}
                width={width}
                viewStyle={cellContainer[cellAlignment]}
                textStyle={cellText[cellAlignment]}
                isLastCell={isLastCell}
              />
            );
        }
      });
    }, [isFinalised, focusedColumnKey, rowState]);

    return (
      <Row
        onPress={onPress}
        style={style}
        renderCells={renderCells}
        debug
        rowKey={rowKey}
        rowData={rowData}
        rowState={rowState}
      />
    );
  }
);

DataTableRow.defaultProps = {
  isFinalised: false,
  focusCellAction: null,
  focusNextAction: null,
  getAction: null,
  onPress: null,
  rowState: null,
};
DataTableRow.propTypes = {
  onPress: PropTypes.func,
  rowData: PropTypes.object.isRequired,
  rowState: PropTypes.object,
  rowKey: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  isFinalised: PropTypes.bool,
  focusCellAction: PropTypes.func,
  focusNextAction: PropTypes.func,
  getAction: PropTypes.func,
};

export default DataTableRow;
