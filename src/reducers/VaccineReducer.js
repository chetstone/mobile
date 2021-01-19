import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  isScanning: false,
  sensors: [],
});

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;
  switch (type) {
    case VACCINE_ACTIONS.SCAN_START: {
      return {
        ...state,
        isScanning: true,
      };
    }

    case VACCINE_ACTIONS.SCAN_STOP: {
      return {
        ...state,
        isScanning: false,
      };
    }

    case VACCINE_ACTIONS.SENSOR_FOUND: {
      const { payload } = action;
      const { sensor } = payload;

      const { sensors = [] } = state;

      if (!sensor) {
        throw new Error('sensor undefined!');
      }
      return {
        ...state,
        sensors: [...sensors, sensor],
      };
    }

    default:
      return state;
  }
};
