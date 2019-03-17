/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { Requisition } from './Requisition';
import { parsePositiveInteger } from '../../utilities';

export class RequisitionItem extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }

  get itemCode() {
    return this.item ? this.item.code : '';
  }

  get itemName() {
    return this.item ? this.item.name : '';
  }

  get requisitionId() {
    return this.requisition ? this.requisition.id : '';
  }

  get monthlyUsage() {
    return this.dailyUsage * 30;
  }

  get suggestedQuantity() {
    const daysToSupply = this.requisition ? this.requisition.daysToSupply : 0;
    return Math.ceil(Math.max(this.dailyUsage * daysToSupply - this.stockOnHand, 0));
  }

  get linkedTransactionItem() {
    if (this.isRequest || !this.requisition.linkedTransaction) return null;
    return this.requisition.linkedTransaction.items.filtered('item.id == $0', this.item.id)[0];
  }

  get ourStockOnHand() {
    const { availableQuantity } = this.linkedTransactionItem;
    const { totalQuantity } = this.item;

    // TODO: this.linkedTransactionItem and this.item can both be falsey, unhandled possible return
    return this.linkedTransactionItem ? availableQuantity : totalQuantity;
  }

  setSuppliedQuantity(database, newValue) {
    if (this.requisition.isFinalised || this.requisition.isRequest) {
      throw new Error('Cannot set supplied quantity for Finalised or Request Requisition');
    }

    const transactionItem = this.linkedTransactionItem;
    if (!transactionItem) return;
    transactionItem.setTotalQuantity(database, parsePositiveInteger(newValue));
    database.save('TransactionItem', transactionItem);
    this.suppliedQuantity = transactionItem.totalQuantity;
    database.save('RequisitionItem', this);
  }
}

export default Requisition;

RequisitionItem.schema = {
  name: 'RequisitionItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    requisition: { type: 'Requisition', optional: true },
    item: { type: 'Item', optional: true },
    stockOnHand: { type: 'double', default: 0 },
    dailyUsage: { type: 'double', optional: true },
    imprestQuantity: { type: 'double', optional: true },
    requiredQuantity: { type: 'double', optional: true },
    suppliedQuantity: { type: 'double', optional: true },
    comment: { type: 'string', optional: true },
    sortIndex: { type: 'int', optional: true },
  },
};
