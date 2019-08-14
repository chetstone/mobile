/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/Ionicons';

// import { GenericPage } from './GenericPage';

import { createRecord } from '../database';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import { AutocompleteSelector, PageButton, PageInfo, TextEditor } from '../widgets';
import { BottomConfirmModal, PageContentModal } from '../widgets/modals';
import { DataTable, Row, Cell, EditableCell, CheckableCell } from '../widgets/DataTable';

import globalStyles, { dataTableColors } from '../globalStyles';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];
const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

const columns = [
  {
    key: 'itemCode',
    width: 2,
    title: tableStrings.item_code,
    sortable: true,
  },
  {
    key: 'itemName',
    width: 4,
    title: tableStrings.item_name,
    sortable: true,
  },
  {
    key: 'availableQuantity',
    width: 2,
    title: tableStrings.available_stock,
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'totalQuantity',
    width: 2,
    type: 'editable',
    title: tableStrings.quantity,
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'remove',
    width: 1,
    type: 'checkable',
    title: tableStrings.remove,
    alignText: 'center',
  },
];

const CheckedComponent = () => (
  <Icon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellChecked} />
);
const UncheckedComponent = () => (
  <Icon name="md-radio-button-off" size={15} color={dataTableColors.checkableCellUnchecked} />
);
const DisabledCheckedComponent = () => (
  <Icon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellDisabled} />
);
const DisabledUncheckedComponent = () => (
  <Icon name="md-radio-button-off" size={15} color={dataTableColors.checkableCellDisabled} />
);

const keyExtractor = item => item.id;

// Reducer for managing DataTable state
const reducer = (state, action) => {
  /**
   * Immutably clears the current focus
   * @param {object} currState  the copy of state you want affected
   * @return {object}           A new object with no cell focused
   */
  const clearFocus = currState => {
    const { dataState, currentFocusedRowKey } = currState;
    if (!currentFocusedRowKey) {
      return currState;
    }

    const newDataState = new Map(dataState);
    const currentRowState = newDataState.get(currentFocusedRowKey);
    newDataState.set(currentFocusedRowKey, {
      ...currentRowState,
      focusedColumn: null,
    });

    return { ...currState, dataState: newDataState, currentFocusedRowKey: null };
  };

  /**
   * Immutably sets the current focus to the cell identified by `rowKey` and `columnKey`
   * @param {object} currState  The copy of state to affect
   * @param {string} rowKey     The key of the row the cell to focus is in
   * @param {string} columnKey  The key of the column the cell to focus is in
   * @return {object}           A new object with a cell focused
   */
  const setFocus = (currState, rowKey, columnKey) => {
    const { dataState, currentFocusedRowKey } = currState;
    const newDataState = new Map(dataState);

    // Clear previous focus if in a different row
    if (currentFocusedRowKey && rowKey !== currentFocusedRowKey) {
      const currentRowState = newDataState.get(currentFocusedRowKey);
      newDataState.set(currentFocusedRowKey, {
        ...currentRowState,
        focusedColumn: null,
      });
    }

    // Update focusedColumn in specified row
    const nextRowState = newDataState.get(rowKey);
    newDataState.set(rowKey, {
      ...nextRowState,
      focusedColumn: columnKey,
    });

    return {
      ...currState,
      dataState: newDataState,
      currentFocusedRowKey: rowKey,
    };
  };

  switch (action.type) {
    case 'editCell': {
      const { value, rowKey, columnKey } = action;
      const { data, database } = state;
      const rowIndex = data.findIndex(row => keyExtractor(row) === rowKey);

      const transactionItem = data.find(row => keyExtractor(row) === rowKey);
      database.write(() => {
        transactionItem.setTotalQuantity(database, parsePositiveInteger(value));
        database.save('TransactionItem', transactionItem);
      });

      // Immutable array editing so only the row/cell edited are re-rendered.
      // If you don't do this, every row will re-render as well as the cell
      // edited.
      const newData = data.map((row, index) => {
        if (index !== rowIndex) {
          return row;
        }
        const rowEdited = { ...row };
        rowEdited[columnKey] = transactionItem.totalQuantity;
        return rowEdited;
      });
      return { ...state, data: newData };
    }
    case 'reverseData':
      return { ...state, data: state.data.reverse() };
    case 'focusCell': {
      // Clear any existing focus and focus cell specified in action
      const { rowKey, columnKey } = action;
      return setFocus(state, rowKey, columnKey);
    }
    case 'focusNextCell': {
      const { data } = state;
      const { rowKey, columnKey } = action;

      // Handle finding next cell to focus
      let nextEditableColKey;
      const currentColIndex = columns.findIndex(col => col.key === columnKey);
      for (let index = currentColIndex + 1; index < columns.length; index++) {
        if (columns[index].type === 'editable') {
          nextEditableColKey = columns[index].key;
          break;
        }
      }

      if (nextEditableColKey) {
        // Focus next editable cell in row
        return setFocus(state, rowKey, nextEditableColKey);
      }

      // Attempt moving focus to next row
      const nextRowIndex = data.findIndex(row => keyExtractor(row) === rowKey) + 1;

      if (nextRowIndex < data.length) {
        // Focus first editable cell in next row
        const nextRowKey = keyExtractor(data[nextRowIndex]);
        const firstEditableColKey = columns.find(col => col.type === 'editable').key;
        return setFocus(state, nextRowKey, firstEditableColKey);
      }

      // We were on the last row and last column, so unfocus current cell
      return clearFocus(state);
    }
    case 'selectRow': {
      const { dataState } = state;
      const { rowKey } = action;
      const newDataState = new Map(dataState);

      const rowState = newDataState.get(rowKey);
      newDataState.set(rowKey, {
        ...rowState,
        isSelected: true,
      });

      return { ...state, dataState: newDataState };
    }
    case 'deselectRow': {
      const { dataState } = state;
      const { rowKey } = action;
      const newDataState = new Map(dataState);

      const rowState = newDataState.get(rowKey);
      newDataState.set(rowKey, {
        ...rowState,
        isSelected: false,
      });

      return { ...state, dataState: newDataState };
    }
    case 'deselectAll': {
      const { dataState } = state;
      const newDataState = new Map(dataState);

      // eslint-disable-next-line no-restricted-syntax
      for (const [rowKey, rowState] of newDataState.entries()) {
        if (rowState.isSelected) {
          newDataState.set(rowKey, {
            ...rowState,
            isSelected: false,
          });
        }
      }
      return { ...state, dataState: newDataState };
    }
    default:
      return state;
  }
};

// Actions
const editCell = (value, rowKey, columnKey) => ({
  type: 'editCell',
  value,
  rowKey,
  columnKey,
});

const focusCell = (rowKey, columnKey) => ({
  type: 'focusCell',
  rowKey,
  columnKey,
});

const focusNext = (rowKey, columnKey) => ({
  type: 'focusNextCell',
  rowKey,
  columnKey,
});

const selectRow = rowKey => ({
  type: 'selectRow',
  rowKey,
});

const deselectRow = rowKey => ({
  type: 'deselectRow',
  rowKey,
});

const deselectAll = () => ({
  type: 'deselectAll',
});

export const CustomerInvoicePage = ({
  transaction,
  database,
  genericTablePageStyles: pageStyles,
  runWithLoadingIndicator,
  topRoute,
}) => {
  const [tableState, dispatch] = useReducer(reducer, {
    data: transaction.items,
    database,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    sortBy: 'itemName',
    isAscending: true,
  });
  const [modalKey, setModalKey] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
  const { data, dataState, searchTerm, sortBy, isAscending } = tableState;
  let isSelection = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const row of dataState.values()) {
    if (row.isSelected) {
      isSelection = true;
      break;
    }
  }

  const openItemSelector = () => {
    setModalKey(ITEM_SELECT);
    setModalIsOpen(true);
  };

  const openCommentEditor = () => {
    setModalKey(COMMENT_EDIT);
    setModalIsOpen(true);
  };

  const openTheirRefEditor = () => {
    setModalKey(THEIR_REF_EDIT);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  const getModalTitle = () => {
    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_invoice_comment;
      case THEIR_REF_EDIT:
        return modalStrings.edit_their_reference;
    }
  };

  const onDeleteConfirm = () => {};
  const onDeleteCancel = () => {
    dispatch(deselectAll());
  };
  const onAddMasterItems = () => {
    runWithLoadingIndicator(() => {
      database.write(() => {
        transaction.addItemsFromMasterList(database);
        database.save('Transaction', transaction);
      });
    });
  };

  const onSearchChange = () => {};

  const renderPageInfo = () => {
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(transaction.entryDate) || 'N/A',
        },
        {
          title: `${pageInfoStrings.confirm_date}:`,
          info: formatDate(transaction.confirmDate),
        },
        {
          title: `${pageInfoStrings.entered_by}:`,
          info: transaction.enteredBy && transaction.enteredBy.username,
        },
      ],
      [
        {
          title: `${pageInfoStrings.customer}:`,
          info: transaction.otherParty && transaction.otherParty.name,
        },
        {
          title: `${pageInfoStrings.their_ref}:`,
          info: transaction.theirRef,
          onPress: openTheirRefEditor,
          editableType: 'text',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: transaction.comment,
          onPress: openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return <PageInfo columns={infoColumns} isEditingDisabled={transaction.isFinalised} />;
  };

  const renderCells = useCallback(
    (rowData, rowState = {}, rowKey) =>
      columns.map(column => {
        const { key: colKey, type } = column;
        switch (type) {
          case 'editable':
            return (
              <EditableCell
                key={colKey}
                value={rowData[colKey]}
                rowKey={rowKey}
                columnKey={colKey}
                editAction={editCell}
                isFocused={colKey === rowState.focusedColumn}
                disabled={rowState.disabled}
                focusAction={focusCell}
                focusNextAction={focusNext}
                dispatch={dispatch}
              />
            );
          case 'checkable':
            return (
              <CheckableCell
                key={colKey}
                rowKey={rowKey}
                columnKey={colKey}
                isChecked={rowState.isSelected}
                disabled={rowState.disabled}
                CheckedComponent={CheckedComponent}
                UncheckedComponent={UncheckedComponent}
                DisabledCheckedComponent={DisabledCheckedComponent}
                DisabledUncheckedComponent={DisabledUncheckedComponent}
                onCheckAction={selectRow}
                onUncheckAction={deselectRow}
                dispatch={dispatch}
              />
            );
          default:
            return <Cell key={colKey} value={rowData[colKey]} />;
        }
      }),
    []
  );

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <Row
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          renderCells={renderCells}
        />
      );
    },
    [data, dataState, renderCells]
  );

  const renderModalContent = () => {
    switch (modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={item => {
              database.write(() => {
                if (!transaction.hasItem(item)) {
                  createRecord(database, 'TransactionItem', transaction, item);
                }
              });
              closeModal();
            }}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={transaction.comment}
            onEndEditing={newComment => {
              if (newComment !== transaction.comment) {
                database.write(() => {
                  transaction.comment = newComment;
                  database.save('Transaction', transaction);
                });
              }
              closeModal();
            }}
          />
        );
      case THEIR_REF_EDIT:
        return (
          <TextEditor
            text={transaction.theirRef}
            onEndEditing={newTheirRef => {
              if (newTheirRef !== transaction.theirRef) {
                database.write(() => {
                  transaction.theirRef = newTheirRef;
                  database.save('Transaction', transaction);
                });
              }
              closeModal();
            }}
          />
        );
    }
  };

  const renderButtons = () => (
    <View style={globalStyles.verticalContainer}>
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.new_item}
        onPress={openItemSelector}
        isDisabled={transaction.isFinalised}
      />
      <PageButton
        text={buttonStrings.add_master_list_items}
        onPress={onAddMasterItems}
        isDisabled={transaction.isFinalised}
      />
    </View>
  );
  return (
    <View style={[defaultStyles.pageContentContainer, pageStyles.pageContentContainer]}>
      <View style={[defaultStyles.container, pageStyles.container]}>
        <View style={[defaultStyles.pageTopSectionContainer, pageStyles.pageTopSectionContainer]}>
          <View
            style={[
              defaultStyles.pageTopLeftSectionContainer,
              pageStyles.pageTopLeftSectionContainer,
            ]}
          >
            {renderPageInfo()}
            <SearchBar
              onChange={onSearchChange}
              style={pageStyles.searchBar}
              color="blue"
              placeholder="fuck off"
            />
          </View>
          <View
            style={[
              defaultStyles.pageTopRightSectionContainer,
              pageStyles.pageTopRightSectionContainer,
            ]}
          >
            {renderButtons()}
          </View>
        </View>
        <DataTable
          data={data}
          extraData={dataState}
          renderRow={renderRow}
          keyExtractor={keyExtractor}
        />
        <BottomConfirmModal
          isOpen={isSelection && !transaction.isFinalised}
          questionText={modalStrings.remove_these_items}
          onCancel={onDeleteCancel}
          onConfirm={onDeleteConfirm}
          confirmText={modalStrings.remove}
        />
        <PageContentModal
          isOpen={modalIsOpen && !transaction.isFinalised}
          onClose={closeModal}
          title={getModalTitle()}
        >
          {renderModalContent()}
        </PageContentModal>
      </View>
    </View>
  );
};

/* eslint-disable react/forbid-prop-types */
CustomerInvoicePage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  topRoute: PropTypes.bool.isRequired,
  transaction: PropTypes.object.isRequired,
};

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
  },
  pageContentContainer: {
    flex: 1,
  },
  pageTopSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pageTopLeftSectionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 500,
  },
  pageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  listView: {
    flex: 1,
  },
  alignTextLeft: {
    marginLeft: 20,
    textAlign: 'left',
  },
  alignTextCenter: {
    textAlign: 'center',
  },
  alignTextRight: {
    marginRight: 20,
    textAlign: 'right',
  },
});

/**
 * Check whether a given customer invoice is safe to be finalised. If safe to finalise,
 * return null, else return an appropriate error message.
 *
 * @param   {object}  customerInvoice  The customer invoice to check.
 * @return  {string}                   Error message if unsafe to finalise, else null.
 */
export function checkForFinaliseError(customerInvoice) {
  if (customerInvoice.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  }

  if (customerInvoice.totalQuantity === 0) {
    return modalStrings.record_stock_to_issue_before_finalising;
  }

  return null;
}

// data={data}
// refreshData={refreshData}
// renderCell={renderCell}
// renderTopLeftComponent={renderPageInfo}
// renderTopRightComponent={renderButtons}
// onSelectionChange={onSelectionChange}
// onEndEditing={onEndEditing}
// defaultSortKey={dataFilters.sortBy}
// defaultSortDirection={dataFilters.isAscending ? 'ascending' : 'descending'}
// columns= {columns}
// dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
// finalisableDataType="Transaction" database={database}
// selection={selection}
// {...genericTablePageStyles}
// topRoute={topRoute}

// /**
//  * Respond to the user editing the number in the number received column.
//  *
//  * @param   {string}  key              Should always be |totalQuantity|.
//  * @param   {object}  transactionItem  The transaction item from the row being edited.
//  * @param   {string}  newValue         The value the user entered in the cell.
//  * @return  {none}
//  */
// const onEndEditing = (key, transactionItem, newValue) => {
//   if (key !== 'totalQuantity') return;
//   database.write(() => {
//     transactionItem.setTotalQuantity(database, parsePositiveInteger(newValue));
//     database.save('TransactionItem', transactionItem);
//   });
// };

// const onDeleteConfirm = () => {
//   database.write(() => {
//     transaction.removeItemsById(database, selection);
//     database.save('Transaction', transaction);
//   });
//   setPageState(...pageState, { selection: [] });
// };

// const onDeleteCancel = () => {
//   setPageState(...pageState, { selection: [] });
// };

// const onSelectionChange = newSelection => {
//   setPageState(...pageState, { selection: newSelection });
// };

// const openModal = key => {
//   setPageState(...pageState, { modalKey: key, modalIsOpen: true });
// };

// const closeModal = () => {
//   setPageState(...pageState, { modalIsOpen: false });
// };
