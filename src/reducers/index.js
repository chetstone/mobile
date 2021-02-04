/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { combineReducers } from 'redux';

import { BluetoothReducer } from './Bluetooth';
import { CashTransactionReducer } from './CashTransactionReducer';
import { DashboardReducer } from './DashboardReducer';
import { DispensaryReducer } from './DispensaryReducer';
import { FinaliseReducer } from './FinaliseReducer';
import { FormReducer } from './FormReducer';
import { InsuranceReducer } from './InsuranceReducer';
import { ModulesReducer } from './ModulesReducer';
import { PagesReducer } from './PagesReducer';
import { PatientReducer } from './PatientReducer';
import { PaymentReducer } from './PaymentReducer';
import { PrescriberReducer } from './PrescriberReducer';
import { PrescriptionReducer } from './PrescriptionReducer';
import { SupplierCreditReducer } from './SupplierCreditReducer';
import { UserReducer } from './UserReducer';
import { WizardReducer } from './WizardReducer';
import { FridgeReducer } from './FridgeReducer';
import { BreachReducer } from './BreachReducer';
import { RowDetailReducer } from './RowDetailReducer';
import { PermissionReducer } from './PermissionReducer';
import SyncReducer from './SyncReducer';
import { EntitiesReducer } from './Entities';

export default combineReducers({
  bluetooth: BluetoothReducer,
  cashTransaction: CashTransactionReducer,
  dashboard: DashboardReducer,
  dispensary: DispensaryReducer,
  finalise: FinaliseReducer,
  form: FormReducer,
  insurance: InsuranceReducer,
  modules: ModulesReducer,
  pages: PagesReducer,
  patient: PatientReducer,
  payment: PaymentReducer,
  prescriber: PrescriberReducer,
  prescription: PrescriptionReducer,
  supplierCredit: SupplierCreditReducer,
  sync: SyncReducer,
  user: UserReducer,
  wizard: WizardReducer,
  fridge: FridgeReducer,
  breach: BreachReducer,
  rowDetail: RowDetailReducer,
  permission: PermissionReducer,
  entities: EntitiesReducer,
});
