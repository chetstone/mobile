/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Name extends Realm.Object {
  destructor(database) {
    // Clean up name store joins referencing deleted name.
    const nameStoreJoins = database.objects('NameStoreJoin').filtered('nameId == $0', this.id);
    database.delete('NameStoreJoin', nameStoreJoins);
  }

  get numberOfTransactions() {
    return this.transactions.length;
  }

  get isExternalSupplier() {
    return this.type === 'facility' && this.isSupplier;
  }

  get isInternalSupplier() {
    return this.type === 'store' && this.isSupplier;
  }

  addMasterListIfUnique(masterList) {
    if (this.masterLists.filtered('id == $0', masterList.id).length > 0) return;
    this.masterLists.push(masterList);
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
  }

  addTransactionIfUnique(transaction) {
    if (this.transactions.filtered('id == $0', transaction.id).length > 0) {
      return;
    }
    this.addTransaction(transaction);
  }

  toString() {
    return this.name;
  }
}

export default Name;

Name.schema = {
  name: 'Name',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    code: { type: 'string', default: 'placeholderCode' },
    phoneNumber: { type: 'string', optional: true },
    billingAddress: { type: 'Address', optional: true },
    emailAddress: { type: 'string', optional: true },
    type: { type: 'string', default: 'placeholderType' },
    isCustomer: { type: 'bool', default: false },
    isSupplier: { type: 'bool', default: false },
    isManufacturer: { type: 'bool', default: false },
    masterLists: { type: 'list', objectType: 'MasterList' },
    transactions: { type: 'list', objectType: 'Transaction' },
    isVisible: { type: 'bool', default: false },
    supplyingStoreId: { type: 'string', optional: true },
  },
};
