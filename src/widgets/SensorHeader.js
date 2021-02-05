import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { StyleSheet } from 'react-native';
import { TextWithIcon } from './Typography/index';
import { BatteryIcon, CogIcon, DownloadIcon } from './icons';
import {
  APP_FONT_FAMILY,
  BLACK,
  DARKER_GREY,
  FINALISE_GREEN,
  MISTY_CHARCOAL,
} from '../globalStyles/index';
import { IconButton } from './IconButton';
import { selectSensorState } from '../selectors/Entities/sensor';
import { gotoEditSensorPage } from '../navigation/actions';
import { LastSensorDownload } from './LastSensorDownload';
import { BlinkSensorButton } from './BlinkSensorButton';
import { Circle } from './Circle';
import { FlexRow } from './FlexRow';

const formatBatteryLevel = batteryLevel => `${batteryLevel}%`;

export const SensorHeaderComponent = ({
  batteryLevel,
  name,
  macAddress,
  editSensor,
  showCog,
  showTitle,
}) => (
  <>
    <FlexRow flex={1} alignItems="center">
      {showTitle && (
        <TextWithIcon
          left
          text={name}
          size="ms"
          textStyle={localStyles.paperTitleText}
          containerStyle={{}}
          Icon={<Circle size={20} backgroundColor={FINALISE_GREEN} />}
        >
          {name}
        </TextWithIcon>
      )}
    </FlexRow>

    <LastSensorDownload macAddress={macAddress} />
    <TextWithIcon
      containerStyle={localStyles.headerTextWithIcon}
      size="s"
      Icon={<BatteryIcon color={MISTY_CHARCOAL} />}
    >
      {formatBatteryLevel(batteryLevel)}
    </TextWithIcon>

    <IconButton
      Icon={<DownloadIcon color={DARKER_GREY} />}
      containerStyle={{ width: 50, justifyContent: 'center' }}
    />
    <BlinkSensorButton macAddress={macAddress} />
    {showCog && (
      <IconButton
        Icon={<CogIcon color={BLACK} />}
        onPress={editSensor}
        containerStyle={{ width: 50, justifyContent: 'center' }}
      />
    )}
  </>
);

SensorHeaderComponent.defaultProps = {
  macAddress: 'AA:BB:CC:DD:EE:FF',
  batteryLevel: 99,
  name: '',
  showCog: false,
  showTitle: false,
};

SensorHeaderComponent.propTypes = {
  name: PropTypes.string,
  macAddress: PropTypes.string,
  batteryLevel: PropTypes.number,
  editSensor: PropTypes.func.isRequired,
  showCog: PropTypes.bool,
  showTitle: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  paperTitleText: {
    color: DARKER_GREY,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    textTransform: 'uppercase',
  },
  headerTextWithIcon: {
    flex: 0,
    paddingHorizontal: 8,
  },
});

const stateToProps = (state, props) => {
  const { sensor } = props;
  const { id: sensorID, macAddress } = sensor ?? {};

  const { byId = {} } = selectSensorState(state) ?? {};
  const sensorState = byId[sensorID];
  const { batteryLevel, name } = sensorState ?? {};

  return { batteryLevel, name, macAddress };
};

const dispatchToProps = (dispatch, props) => {
  const { sensor } = props;

  const editSensor = () => dispatch(gotoEditSensorPage(sensor));

  return { editSensor };
};

export const SensorHeader = connect(stateToProps, dispatchToProps)(SensorHeaderComponent);
