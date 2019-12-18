/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, ToastAndroid } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageView, PageButton, PageInfo, ToggleBar, SearchBar } from '../widgets';

import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';
import { ROUTES } from '../navigation/constants';

import { useRecordListener } from '../hooks';

import globalStyles from '../globalStyles';
import { buttonStrings, modalStrings, programStrings } from '../localization/index';
import { UIDatabase } from '../database/index';
import { SETTINGS_KEYS } from '../settings/index';

/**
 * Renders a mSupply mobile page with a supplier requisition loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isDisabled },
 */
const SupplierRequisition = ({
  runWithLoadingIndicator,
  dispatch,
  data,
  dataState,
  sortKey,
  modalValue,
  isAscending,
  modalKey,
  pageObject,
  hasSelection,
  showAll,
  keyExtractor,
  searchTerm,
  columns,
  getPageInfoColumns,
  refreshData,
  onSelectNewItem,
  onEditComment,
  onFilterData,
  onDeleteItems,
  onDeselectAll,
  onCloseModal,
  onCheck,
  onUncheck,
  onSortColumn,
  onShowOverStocked,
  onHideOverStocked,
  onOpenRegimenDataModal,
  onEditMonth,
  onEditRequiredQuantity,
  onAddRequisitionItem,
  onSetRequestedToSuggested,
  onAddMasterList,
  onApplyMasterLists,
  route,
}) => {
  // Listen for changes to this pages requisition. Refreshing data on side effects i.e. finalizing.
  useRecordListener(() => dispatch(refreshData), pageObject, 'Requisition');

  const { isFinalised, comment, theirRef, program, daysToSupply } = pageObject;

  const createAutomaticOrder = () => dispatch(PageActions.createAutomaticOrder(route));
  const onCreateAutomaticOrder = () => runWithLoadingIndicator(createAutomaticOrder);

  const pageInfoColumns = useMemo(() => getPageInfoColumns(pageObject, dispatch, route), [
    comment,
    theirRef,
    isFinalised,
    daysToSupply,
  ]);

  const getCallback = (colKey, propName) => {
    switch (colKey) {
      case 'requiredQuantity':
        return onEditRequiredQuantity;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddRequisitionItem;
      case MODAL_KEYS.SELECT_MONTH:
        return onEditMonth;
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
        return onEditComment;
      case MODAL_KEYS.SELECT_MASTER_LISTS:
        return onApplyMasterLists;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);

      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          isFinalised={isFinalised}
          getCallback={getCallback}
          rowIndex={index}
        />
      );
    },
    [data, dataState]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        onPress={onSortColumn}
        isAscending={isAscending}
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
  );

  const AddMasterListItemsButton = () => (
    <PageButton
      style={globalStyles.leftButton}
      text={buttonStrings.add_master_list_items}
      onPress={onAddMasterList}
      onSelect={onApplyMasterLists}
      isDisabled={isFinalised}
    />
  );

  const AddNewItemButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.new_item}
      onPress={onSelectNewItem}
      isDisabled={isFinalised}
    />
  );

  const CreateAutomaticOrderButton = () => (
    <PageButton
      style={{ ...globalStyles.leftButton, marginLeft: 5 }}
      text={buttonStrings.create_automatic_order}
      onPress={onCreateAutomaticOrder}
      isDisabled={isFinalised}
    />
  );

  const UseSuggestedQuantitiesButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.use_suggested_quantities}
      onPress={onSetRequestedToSuggested}
      isDisabled={isFinalised}
    />
  );

  const toggles = useMemo(
    () => [
      {
        text: programStrings.hide_over_stocked,
        isOn: !showAll,
        onPress: onHideOverStocked,
      },
      {
        text: programStrings.show_over_stocked,
        isOn: showAll,
        onPress: onShowOverStocked,
      },
    ],
    [showAll]
  );

  const ThresholdMOSToggle = () => <ToggleBar toggles={toggles} />;

  const ViewRegimenDataButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.view_regimen_data}
      onPress={onOpenRegimenDataModal}
    />
  );

  const GeneralButtons = useCallback(() => {
    const { verticalContainer } = globalStyles;
    return (
      <>
        <View style={verticalContainer}>
          <UseSuggestedQuantitiesButton />
          <CreateAutomaticOrderButton />
        </View>
        <View style={globalStyles.verticalContainer}>
          <AddNewItemButton />
          <AddMasterListItemsButton />
        </View>
      </>
    );
  }, [isFinalised]);

  const ProgramButtons = useCallback(() => {
    const { verticalContainer, horizontalContainer } = globalStyles;
    return (
      <>
        <View style={verticalContainer}>
          <View style={horizontalContainer}>
            <UseSuggestedQuantitiesButton />
            <ViewRegimenDataButton />
          </View>
          <ThresholdMOSToggle />
        </View>
      </>
    );
  }, [showAll, isFinalised]);

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
          {program ? <ProgramButtons /> : <GeneralButtons />}
        </View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={onDeselectAll}
        onConfirm={onDeleteItems}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const thisStoreID = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_NAME_ID);
  const thisStore = UIDatabase.get('Name', thisStoreID);
  const hasMasterLists = thisStore?.masterLists?.length > 0;

  const noMasterLists = () =>
    ToastAndroid.show(modalStrings.supplier_no_masterlist_available, ToastAndroid.LONG);

  return {
    ...getPageDispatchers(dispatch, ownProps, 'Requisition', ROUTES.SUPPLIER_REQUISITION),
    [hasMasterLists ? null : 'onAddMasterList']: noMasterLists,
  };
};

const mapStateToProps = state => {
  const { pages } = state;
  return pages[ROUTES.SUPPLIER_REQUISITION];
};

export const SupplierRequisitionPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SupplierRequisition);

SupplierRequisition.defaultProps = {
  modalValue: null,
  showAll: false,
};

SupplierRequisition.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  dataState: PropTypes.object.isRequired,
  modalKey: PropTypes.string.isRequired,
  pageObject: PropTypes.object.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
  routeName: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  showAll: PropTypes.bool,
  modalValue: PropTypes.any,
  refreshData: PropTypes.func.isRequired,
  onSelectNewItem: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onDeleteItems: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onShowOverStocked: PropTypes.func.isRequired,
  onHideOverStocked: PropTypes.func.isRequired,
  onOpenRegimenDataModal: PropTypes.func.isRequired,
  onEditMonth: PropTypes.func.isRequired,
  onEditRequiredQuantity: PropTypes.func.isRequired,
  onAddRequisitionItem: PropTypes.func.isRequired,
  onSetRequestedToSuggested: PropTypes.func.isRequired,
  onAddMasterList: PropTypes.func.isRequired,
  onApplyMasterLists: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
};
