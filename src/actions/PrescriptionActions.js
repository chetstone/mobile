/* eslint-disable no-unused-expressions */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { batch } from 'react-redux';

import { UIDatabase, createRecord } from '../database';

import { PrescriberActions } from './PrescriberActions';
import { WizardActions } from './WizardActions';

export const PRESCRIPTION_ACTIONS = {
  REFRESH: 'Prescription/refresh',
};

export const updateDirection = (id, newValue) => (_, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const item = items.filtered('id == $0', id)[0];
  item?.setItemDirection(UIDatabase, newValue);
};

export const removeItem = id => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const item = items.filtered('id == $0', id);

  UIDatabase.write(() => {
    UIDatabase.delete('TransactionItem', item);
  });
  dispatch({ type: PRESCRIPTION_ACTIONS.REFRESH });
};

export const editQuantity = (id, quantity) => (_, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const itemToUpdate = items.filtered('id == $0', id)[0];

  UIDatabase.write(() => {
    itemToUpdate.setTotalQuantity(UIDatabase, quantity);
    UIDatabase.save('TransactionItem', itemToUpdate);
  });
};

const assignPrescriber = prescriberID => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const prescriber = UIDatabase.get('Prescriber', prescriberID);

  UIDatabase.write(() =>
    UIDatabase.update('Transaction', {
      ...transaction,
      prescriber,
    })
  );

  batch(() => {
    dispatch(PrescriberActions.setPrescriber(prescriber));
    dispatch(WizardActions.nextTab());
  });
};

export const addItem = itemID => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const item = UIDatabase.get('Item', itemID);

  if (!transaction.hasItem(item)) {
    UIDatabase.write(() => {
      createRecord(UIDatabase, 'TransactionItem', transaction, item, 1);
    });
  }

  dispatch({ type: PRESCRIPTION_ACTIONS.REFRESH });
};

export const PrescriptionActions = {
  addItem,
  assignPrescriber,
  editQuantity,
  removeItem,
  updateDirection,
};
