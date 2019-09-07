/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Method using a factory pattern variant to get a reducer
 * for a particular page or page style.
 *
 * For a new page - create a constant object with the
 * methods from reducerMethods which are composed to create
 * a reducer. Add to PAGE_REDUCERS.
 *
 * Each key value pair in a reducer object should be in the form
 * action type: reducer function, returning a new state object
 *
 */

import {
  filterData,
  editTotalQuantity,
  focusNextCell,
  selectRow,
  deselectRow,
  deselectAll,
  focusCell,
  sortData,
  openBasicModal,
  closeBasicModal,
  addMasterListItems,
  addItem,
  editTheirRef,
  editComment,
  deleteRecordsById,
  refreshData,
  editBatchExpiry,
  createAutomaticOrder,
  hideOverStocked,
  showOverStocked,
  editRequiredQuantity,
} from './reducerMethods';

/**
 * Used for actions that should be in all pages using a data table.
 */
const BASE_TABLE_PAGE_REDUCER = {
  focusNextCell,
  focusCell,
  sortData,
};

const customerInvoice = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  editTotalQuantity,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  addMasterListItems,
  addItem,
  editTheirRef,
  editComment,
  deleteRecordsById,
  refreshData,
};

const customerInvoices = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  deleteRecordsById,
};

const supplierInvoice = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  closeBasicModal,
  openBasicModal,
  editTheirRef,
  editComment,
  refreshData,
  addItem,
  editTotalQuantity,
  deleteRecordsById,
  editBatchExpiry,
};

const supplierRequisitions = {
  sortData,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  refreshData,
  deleteRecordsById,
};

const supplierRequisition = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  editTheirRef,
  editComment,
  refreshData,
  addMasterListItems,
  addItem,
  createAutomaticOrder,
  hideOverStocked,
  showOverStocked,
  editRequiredQuantity,
  deleteRecordsById,
};

const programSupplierRequisition = {
  ...BASE_TABLE_PAGE_REDUCER,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  editTheirRef,
  editComment,
  refreshData,
  addMasterListItems,
  addItem,
  createAutomaticOrder,
  hideOverStocked,
  showOverStocked,
  editRequiredQuantity,
};

const PAGE_REDUCERS = {
  customerInvoice,
  customerInvoices,
  supplierInvoice,
  supplierRequisitions,
  supplierRequisition,
  programSupplierRequisition,
};

const getReducer = page => {
  const reducer = PAGE_REDUCERS[page];
  return (state, action) => {
    const { type } = action;
    if (!reducer[type]) return state;
    return reducer[type](state, action);
  };
};

export default getReducer;
