/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */
import throttle from 'lodash.throttle';

import { PermissionActions } from '../PermissionActions';
import BleService from '../../bluetooth/BleService';
import { UIDatabase } from '../../database/index';
import { selectScannedSensors } from '../../selectors/Bluetooth/sensorScan';

export const SCAN_ACTIONS = {
  SCAN_START: 'Bluetooth/sensorScanStart',
  SCAN_STOP: 'Bluetooth/sensorScanStop',
  SENSOR_FOUND: 'Bluetooth/sensorFound',
};

const scanStart = () => ({ type: SCAN_ACTIONS.SCAN_START });
const scanStop = () => ({ type: SCAN_ACTIONS.SCAN_STOP });
const sensorFound = macAddress => ({ type: SCAN_ACTIONS.SENSOR_FOUND, payload: { macAddress } });

const isNewlyFoundSensor = (macAddress, alreadyScannedMacAddresses) => {
  // The sensors has already been picked up in the current scan.
  const alreadyFound = alreadyScannedMacAddresses?.includes(macAddress);
  // The sensor is already in the database
  const alreadySaved = UIDatabase.get('Sensor', macAddress, 'macAddress');
  // The sensor is an active sensor in the database
  const isActive = alreadySaved?.isActive;
  const isAlreadySavedAndActive = alreadySaved && isActive;

  // A newly found sensor are sensors which are not active in the database, and not found already
  return !alreadyFound && !isAlreadySavedAndActive;
};

const scanForSensors = (dispatch, getState) => {
  dispatch(scanStart());

  const deviceCallback = throttle(
    device => {
      const { id: macAddress } = device;
      if (macAddress) {
        const alreadyScanned = selectScannedSensors(getState());

        if (isNewlyFoundSensor(macAddress, alreadyScanned)) {
          dispatch(sensorFound(macAddress));
        }
      }
    },
    500,
    { leading: true }
  );

  // Scan will continue running until it is stopped...
  BleService().scanForSensors(deviceCallback);
};

const startSensorScan = () => async (dispatch, getState) => {
  PermissionActions.withLocationAndBluetooth(dispatch, getState, scanForSensors);
  return null;
};

const stopSensorScan = () => dispatch => {
  dispatch(scanStop());
  BleService().stopScan();
};

export const SensorScanActions = {
  startSensorScan,
  stopSensorScan,
};
