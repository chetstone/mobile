import Realm from 'realm';

import { complement } from 'set-manipulator';

import { NUMBER_SEQUENCE_KEYS } from '../index';
import {
  addBatchToParent,
  createRecord,
  getTotal,
  reuseNumber as reuseSerialNumber,
} from '../utilities';

/**
 * A transaction.
 *
 * @property  {string}                  id
 * @property  {string}                  serialNumber
 * @property  {Name}                    otherParty
 * @property  {string}                  comment
 * @property  {Date}                    entryDate
 * @property  {string}                  type
 * @property  {string}                  status
 * @property  {Date}                    confirmDate
 * @property  {User}                    enteredBy
 * @property  {string}                  theirRef           External reference code.
 * @property  {TransactionCategory}     category
 * @property  {List.<TransactionItem>}  items
 * @property  {Requisition}             linkedRequisition
 */
export class Transaction extends Realm.Object {
  /**
   * Create new transaction.
   */
  constructor() {
    super();
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
  }

  /**
   * Delete unfinalised transaction and associated transaction items. Throw error if transaction is
   * finalised.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    if (this.isFinalised) {
      throw new Error('Cannot delete finalised transaction');
    }

    // Recycle invoice serial number to be reused.
    if (this.isCustomerInvoice) {
      reuseSerialNumber(database, NUMBER_SEQUENCE_KEYS.CUSTOMER_INVOICE_NUMBER, this.serialNumber);
    }
    if (this.isSupplierInvoice) {
      reuseSerialNumber(database, NUMBER_SEQUENCE_KEYS.SUPPLIER_INVOICE_NUMBER, this.serialNumber);
    }
    database.delete('TransactionItem', this.items);
  }

  /**
   * Get if transaction is finalised.
   *
   * @return  {boolean}
   */
  get isFinalised() {
    return this.status === 'finalised';
  }

  /**
   * Get if transaction is confirmed.
   *
   * @return  {boolean}
   */
  get isConfirmed() {
    return this.status === 'confirmed';
  }

  /**
   * Get if transaction is incoming (i.e. a supplier invoice).
   *
   * @return  {boolean}
   */
  get isIncoming() {
    return this.type === 'supplier_invoice';
  }

  /**
   * Get if transaction is outgoing (i.e. a customer invoice or supplier credit).
   *
   * @return  {boolean}
   */
  get isOutgoing() {
    // TODO: replace string matching with already defined getter methods.
    return this.type === 'customer_invoice' || this.type === 'supplier_credit';
  }

  /**
   * Get if transaction is a customer invoice.
   *
   * @return  {boolean}
   */
  get isCustomerInvoice() {
    return this.type === 'customer_invoice';
  }

  /**
   * Get if transaction is a supplier invoice.
   *
   * @return  {boolean]}
   */
  get isSupplierInvoice() {
    return this.type === 'supplier_invoice';
  }

  /**
   * Get if transaction is an external supplier invoice.
   *
   * @return  {boolean}
   */
  get isExternalSupplierInvoice() {
    return this.isSupplierInvoice && this.otherParty && this.otherParty.isExternalSupplier;
  }

  /**
   * Get if transaction is an internal supplier invoice.
   *
   * @return  {boolean}
   */
  get isInternalSupplierInvoice() {
    return this.isSupplierInvoice && this.otherParty && this.otherParty.isInternalSupplier;
  }

  /**
   * Get if transaction is an inventory adjustment.
   *
   * @return  {boolean}
   */
  get isInventoryAdjustment() {
    return this.otherParty && this.otherParty.type === 'inventory_adjustment';
  }

  /**
   * Get name of other party to transaction.
   *
   * @return  {string}
   */
  get otherPartyName() {
    return this.otherParty ? this.otherParty.name : '';
  }

  /**
   * Set other party to this transaction.
   *
   * @param  {Name}  name
   */
  setOtherParty(name) {
    name.addTransaction(this);
    this.otherParty = name;
  }

  /**
   * Get total price of items in this transaction.
   *
   * @return  {number}
   */
  get totalPrice() {
    return getTotal(this.items, 'totalPrice');
  }

  /**
   * Get total quantity of items in this transaction.
   *
   * @return  {number}
   */
  get totalQuantity() {
    return getTotal(this.items, 'totalQuantity');
  }

  /**
   * Get total number of batches in this transaction.
   *
   * @return  {number}
   */
  get numberOfBatches() {
    return getTotal(this.items, 'numberOfBatches');
  }

  /**
   * Get total number of items in this transaction.
   *
   * @return  {number}
   */
  get numberOfItems() {
    return this.items.length;
  }

  /**
   * Get if this transaction is linked to a requisition.
   *
   * @return  {boolean}
   */
  get isLinkedToRequisition() {
    return !!this.linkedRequisition;
  }

  /**
   * Get if this transaction includes a given item.
   *
   * @param   {Item}  item
   * @return  {boolean}
   */
  hasItem(item) {
    const itemId = item.realItem.id;
    return this.items.filtered('item.id == $0', itemId).length > 0;
  }

  /**
   * Add an item to this transaction. If item already exists, do nothing.
   *
   * @param  {TransactionItem}  transactionItem
   */
  addItem(transactionItem) {
    this.items.push(transactionItem);
  }

  /**
   * Add all items from the customer's master list to this transaction. Transaction
   * must be an unfinalised customer invoice.
   *
   * @param  {Realm}  database
   */
  addItemsFromMasterList(database) {
    if (!this.isCustomerInvoice) {
      throw new Error(`Cannot add master lists to ${this.type}`);
    }
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised transaction');
    }
    if (this.otherParty) {
      this.otherParty.masterLists.forEach(masterList => {
        const itemsToAdd = complement(masterList.items, this.items, item => item.itemId);
        itemsToAdd.forEach(masterListItem => {
          if (!masterListItem.item.crossReferenceItem && masterListItem.item.isVisible) {
            // Do not add cross reference items as will cause duplicates.
            createRecord(database, 'TransactionItem', this, masterListItem.item);
          }
        });
      });
    }
  }

  /**
   * Remove items with the given ids from this transaction.
   *
   * @param   {Realm}           database
   * @param   {Array.<string>}  itemIds
   */
  removeItemsById(database, itemIds) {
    const itemsToDelete = [];
    for (let i = 0; i < itemIds.length; i += 1) {
      const transactionItem = this.items.find(testItem => testItem.id === itemIds[i]);
      if (transactionItem.isValid()) {
        itemsToDelete.push(transactionItem);
      }
    }
    database.delete('transactionItem', itemsToDelete);
  }

  /**
   * Remove batches with given ids from this transaction. Prune any items with no remaining
   * associated batches.
   *
   * @param   {Realm}           database
   * @param   {Array.<string>}  transactionBatchIds
   */
  removeTransactionBatchesById(database, transactionBatchIds) {
    if (this.isFinalised) {
      throw new Error('Cannot modify finalised transaction');
    }
    const transactionBatches = this.getTransactionBatches(database);
    const transactionBatchesToDelete = [];
    transactionBatchIds.forEach(transactionBatchId => {
      const transactionBatch = transactionBatches.find(
        matchTransactionBatch => matchTransactionBatch.id === transactionBatchId
      );
      transactionBatchesToDelete.push(transactionBatch);
    });
    database.delete('TransactionBatch', transactionBatchesToDelete);
    this.pruneBatchlessTransactionItems(database);
  }

  /**
   * Remove given item from transaction.
   *
   * @param   {Realm}            database
   * @param   {TransactionItem}  TransactionItem
   */
  // eslint-disable-next-line class-methods-use-this
  removeTransactionItem(database, transactionItem) {
    database.delete('TransactionItem', transactionItem);
  }

  /**
   * Adds a batch to transaction, incorporating it into a matching item or creating a new
   * item if none already exist.
   *
   * @param  {Realm}             database
   * @param  {TransactionBatch}  transactionBatch
   */
  addBatchIfUnique(database, transactionBatch) {
    const { itemBatch } = transactionBatch;
    const { item } = itemBatch;

    addBatchToParent(transactionBatch, this, () =>
      createRecord(database, 'TransactionItem', this, item)
    );
  }

  /**
   * Delete any batches and items that are not contributing to this transaction.
   *
   * @param  {Realm}  database
   */
  pruneRedundantBatchesAndItems(database) {
    const batchesToRemove = this.getTransactionBatches(database).filtered('numberOfPacks = 0');

    database.delete('TransactionBatch', batchesToRemove);
    this.pruneBatchlessTransactionItems(database);
  }

  /**
   * Delete any items with no associated transaction batches.
   *
   * @param  {Realm}  database
   */
  pruneBatchlessTransactionItems(database) {
    const itemsToRemove = [];
    this.items.forEach(transactionItem => {
      if (transactionItem.batches.length === 0) {
        itemsToRemove.push(transactionItem);
      }
    });
    database.delete('TransactionItem', itemsToRemove);
  }

  /**
   * Returns all transaction batches for this transaction as
   * a realm collection (can be filtered).
   *
   * @param   {Realm}                               database
   * @return  {RealmCollection.<TransactionBatch>}
   */
  getTransactionBatches(database) {
    return database.objects('TransactionBatch').filtered('transaction.id == $0', this.id);
  }

  /**
   * Confirm this transaction, generating the associated item batches, linking them
   * to their items, and setting the status to confirmed.
   *
   * @param  {Realm}  database
   */
  confirm(database) {
    if (this.isConfirmed) {
      throw new Error('Cannot confirm as transaction is already confirmed');
    }
    if (this.isFinalised) {
      throw new Error('Cannot confirm as transaction is already finalised');
    }
    const isIncomingInvoice = this.isIncoming;

    this.getTransactionBatches(database).forEach(transactionBatch => {
      const {
        itemBatch,
        batch,
        packSize,
        numberOfPacks,
        expiryDate,
        costPrice,
        sellPrice,
      } = transactionBatch;

      // Pack to one all transactions in mobile, so multiply by |packSize| to get
      // quantity and price.
      const packedToOneQuantity = numberOfPacks * packSize;
      const packedToOneCostPrice = costPrice / packSize;
      const packedToOneSellPrice = sellPrice / packSize;

      const newNumberOfPacks = isIncomingInvoice
        ? itemBatch.numberOfPacks + packedToOneQuantity
        : itemBatch.numberOfPacks - packedToOneQuantity;
      itemBatch.packSize = 1;
      itemBatch.numberOfPacks = newNumberOfPacks;
      itemBatch.expiryDate = expiryDate;
      itemBatch.batch = this.adjustBatchName(batch);
      itemBatch.costPrice = packedToOneCostPrice;
      itemBatch.sellPrice = packedToOneSellPrice;
      database.save('ItemBatch', itemBatch);
    });

    this.confirmDate = new Date();
    this.status = 'confirmed';
  }

  /**
   * Get `supplierinvoice_{invoiceNumber}` of batch. Name is empty and
   * transaction is supplier invoice.
   *
   * @param   {string}  batchName
   * @return  {string}
   */
  adjustBatchName(batchName) {
    if (this.isSupplierInvoice && (!batchName || batchName === '')) {
      return `supplierinvoice_${this.serialNumber}`;
    }
    return batchName;
  }

  /**
   * Finalise this transaction, setting the status so that this transaction is
   * locked down. If it has not already been confirmed (i.e. adjustments to inventory
   * made), confirm it first.
   *
   * @param  {Realm}  database
   */
  finalise(database) {
    if (this.isFinalised) {
      throw new Error('Cannot finalise as transaction is already finalised');
    }
    // Prune all invoices except internal supplier invoices.
    if (!this.isInternalSupplierInvoice) {
      this.pruneRedundantBatchesAndItems(database);
    }
    if (!this.isConfirmed) this.confirm(database);

    this.status = 'finalised';
    database.save('Transaction', this);
  }
}

Transaction.schema = {
  name: 'Transaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    serialNumber: { type: 'string', default: 'placeholderSerialNumber' },
    otherParty: { type: 'Name', optional: true },
    comment: { type: 'string', optional: true },
    entryDate: { type: 'date', optional: true },
    type: { type: 'string', default: 'placeholderType' },
    status: { type: 'string', default: 'new' },
    confirmDate: { type: 'date', optional: true },
    enteredBy: { type: 'User', optional: true },
    theirRef: { type: 'string', optional: true },
    category: { type: 'TransactionCategory', optional: true },
    items: { type: 'list', objectType: 'TransactionItem' },
    linkedRequisition: { type: 'Requisition', optional: true },
  },
};

export default Transaction;
