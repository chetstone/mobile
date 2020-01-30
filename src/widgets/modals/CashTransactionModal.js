/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { ToggleBar } from '../ToggleBar';
import { BottomModalContainer, BottomTextEditor, BottomCurrencyEditor } from '../bottomModals';
import { GenericChoiceList } from '../modalChildren';
import { PageButton } from '../PageButton';
import { PencilIcon, ChevronDownIcon } from '../icons';

import currency from '../../localization/currency';
import { UIDatabase } from '../../database';
import {
  CASH_TRANSACTION_KEYS,
  CASH_TRANSACTION_TYPES,
} from '../../utilities/modules/dispensary/constants';

import globalStyles, { WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';
import { buttonStrings, dispensingStrings, generalStrings } from '../../localization';

export const CashTransactionModal = ({ onConfirm }) => {
  const [name, setName] = useState(null);
  const [isCashIn, setIsCashIn] = useState(true);
  const [amount, setAmount] = useState(null);
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState(null);

  const [amountBuffer, setAmountBuffer] = useState(currency(0).format());
  const [descriptionBuffer, setDescriptionBuffer] = useState('');

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const names = useMemo(() => UIDatabase.objects('Name'));
  const reasons = useMemo(() => UIDatabase.objects('Options'));
  const type = useMemo(
    () => (isCashIn ? CASH_TRANSACTION_TYPES.CASH_IN : CASH_TRANSACTION_TYPES.CASH_OUT),
    [isCashIn]
  );

  const isValidTransaction = useMemo(() => !!name && !!amount && (isCashIn || !!reason), [
    name,
    amount,
    reason,
    isCashIn,
  ]);

  const onCreate = useCallback(
    () => onConfirm({ name, type, amount: amount.value, reason, description }),
    [name, type, amount, reason, description]
  );

  const onChangeText = useMemo(() => text => setDescriptionBuffer(text));
  const onChangeAmount = useMemo(() => value => setAmountBuffer(value));

  const resetBottomModal = () => {
    setIsNameModalOpen(false);
    setIsAmountModalOpen(false);
    setIsReasonModalOpen(false);
    setIsDescriptionModalOpen(false);
  };

  const onPressName = () => {
    resetBottomModal();
    setIsNameModalOpen(true);
  };

  const onPressAmount = () => {
    resetBottomModal();
    if (amount) {
      setAmountBuffer(amount.format(false));
    }
    setIsAmountModalOpen(true);
  };

  const onPressReason = () => {
    resetBottomModal();
    setIsReasonModalOpen(true);
  };

  const onPressDescription = () => {
    resetBottomModal();
    if (description) {
      setDescriptionBuffer(description);
    }
    setIsDescriptionModalOpen(true);
  };

  const onSubmitName = ({ item: nameItem }) => {
    setName(nameItem);
    setIsNameModalOpen(false);
  };

  const onSubmitAmount = () => {
    setAmount(currency(amountBuffer));
    setIsAmountModalOpen(false);
  };

  const onSubmitReason = ({ item: reasonItem }) => {
    setReason(reasonItem);
    setIsReasonModalOpen(false);
  };

  const onSubmitDescription = () => {
    setDescription(descriptionBuffer);
    setIsDescriptionModalOpen(false);
  };

  const nameText = useMemo(() => name?.name ?? dispensingStrings.choose_a_name, [name]);
  const amountText = useMemo(() => amount?.format(false) ?? dispensingStrings.enter_the_amount, [
    amount,
  ]);
  const reasonText = useMemo(() => reason?.title ?? dispensingStrings.choose_a_reason, [reason]);
  const descriptionText = useMemo(() => description ?? dispensingStrings.enter_a_description, [
    description,
  ]);
  const toggleTransactionType = () => setIsCashIn(!isCashIn);

  const toggles = useMemo(
    () => [
      { text: dispensingStrings.cash_in, onPress: toggleTransactionType, isOn: isCashIn },
      { text: dispensingStrings.cash_out, onPress: toggleTransactionType, isOn: !isCashIn },
    ],
    [isCashIn]
  );

  const PressReason = useCallback(
    () =>
      isCashIn ? (
        <TouchableOpacity style={localStyles.containerStyle}>
          <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{generalStrings.not_available}</Text>
          </View>
          <View style={localStyles.iconContainerStyle} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={localStyles.containerStyle} onPress={onPressReason}>
          <View style={localStyles.textContainerStyle}>
            <Text style={localStyles.textStyle}>{reasonText}</Text>
          </View>
          <View style={localStyles.iconContainerStyle}>
            <ChevronDownIcon />
          </View>
        </TouchableOpacity>
      ),
    [isCashIn, reason]
  );

  return (
    <View style={localStyles.modalContainerStyle}>
      <ToggleBar toggles={toggles} />
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressName}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{nameText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <ChevronDownIcon />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressAmount}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{amountText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <PencilIcon />
        </View>
      </TouchableOpacity>
      <PressReason />
      <TouchableOpacity style={localStyles.containerStyle} onPress={onPressDescription}>
        <View style={localStyles.textContainerStyle}>
          <Text style={localStyles.textStyle}>{descriptionText}</Text>
        </View>
        <View style={localStyles.iconContainerStyle}>
          <PencilIcon />
        </View>
      </TouchableOpacity>
      <BottomModalContainer
        isOpen={isNameModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={names}
          keyToDisplay={CASH_TRANSACTION_KEYS.NAME}
          onPress={onSubmitName}
          highlightValue={name?.name}
        />
      </BottomModalContainer>
      <BottomCurrencyEditor
        isOpen={isAmountModalOpen}
        buttonText={buttonStrings.confirm}
        value={amountBuffer}
        placeholder={dispensingStrings.enter_the_amount}
        onChangeText={onChangeAmount}
        onConfirm={onSubmitAmount}
      />
      <BottomModalContainer
        isOpen={isReasonModalOpen}
        modalStyle={localStyles.bottomModalContainerStyle}
      >
        <GenericChoiceList
          data={reasons}
          keyToDisplay={CASH_TRANSACTION_KEYS.REASON}
          onPress={onSubmitReason}
          highlightValue={reason?.title}
        />
      </BottomModalContainer>
      <BottomTextEditor
        isOpen={isDescriptionModalOpen}
        buttonText={buttonStrings.confirm}
        value={descriptionBuffer}
        placeholder={dispensingStrings.enter_a_description}
        onChangeText={onChangeText}
        onConfirm={onSubmitDescription}
      />
      <PageButton
        text={buttonStrings.confirm}
        onPress={onCreate}
        isDisabled={!isValidTransaction}
        disabledColor={WARM_GREY}
        style={localStyles.okButton}
        textStyle={localStyles.pageButtonTextStyle}
      />
    </View>
  );
};

CashTransactionModal.defaultProps = {};

CashTransactionModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  modalContainerStyle: {
    flexDirection: 'column',
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '10%',
  },
  bottomModalContainerStyle: {
    height: 120,
  },
  textContainerStyle: { width: '30%', justifyContent: 'center' },
  iconContainerStyle: { width: '5%', justifyContent: 'flex-end', alignItems: 'flex-end' },
  textStyle: { color: 'white' },
  okButton: {
    ...globalStyles.button,
    backgroundColor: SUSSOL_ORANGE,
    alignSelf: 'center',
    marginTop: 60,
  },
  pageButtonTextStyle: {
    ...globalStyles.buttonText,
    color: 'white',
    fontSize: 14,
  },
});
