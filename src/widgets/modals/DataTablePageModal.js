/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import ModalContainer from './ModalContainer';
import { getModalTitle, MODAL_KEYS } from '../../utilities/getModalTitle';
import { AutocompleteSelector } from '../AutocompleteSelector';
import { TextEditor } from '../TextEditor';
import { ByProgramModal } from './ByProgramModal';
import { UIDatabase } from '../../database';
import { modalStrings } from '../../localization';
import Settings from '../../settings/MobileAppSettings';

/**
 * Wrapper around ModalContainer, containing common modals used in various
 * DataTable pages.
 * @prop {Bool}   fullScreen   Force the modal to cover the entire screen.
 * @prop {Bool}   isOpen       Whether the modal is open
 * @prop {Func}   onClose      A function to call if the close x is pressed
 * @prop {Func}   onSelect     The components to render within the modal
 * @prop {String} modalKey     The title to show in within the modal.
 * @prop {String} currentValue The current value a modal should be i.e. theirRef/comment
 */
export const DataTablePageModal = ({
  fullScreen,
  isOpen,
  onClose,
  modalKey,
  onSelect,
  currentValue,
}) => {
  const ModalContent = () => {
    switch (modalKey) {
      case MODAL_KEYS.ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Item')}
            queryString="name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0"
            queryStringSecondary="name CONTAINS[c] $0"
            sortByString="name"
            onSelect={onSelect}
            renderLeftText={item => `${item.name}`}
            renderRightText={item => `${item.totalQuantity}`}
          />
        );

      case MODAL_KEYS.COMMENT_EDIT:
        return <TextEditor text={currentValue} onEndEditing={onSelect} />;

      case MODAL_KEYS.THEIR_REF_EDIT:
        return <TextEditor text={currentValue} onEndEditing={onSelect} />;

      case MODAL_KEYS.SELECT_CUSTOMER:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Customer')}
            isOpen={isOpen}
            placeholderText={modalStrings.start_typing_to_select_customer}
            queryString="name BEGINSWITH[c] $0"
            sortByString="name"
            onSelect={onSelect}
          />
        );

      case MODAL_KEYS.SELECT_SUPPLIER:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('ExternalSupplier')}
            isOpen={isOpen}
            placeholderText={modalStrings.start_typing_to_select_supplier}
            queryString="name BEGINSWITH[c] $0"
            sortByString="name"
            onSelect={onSelect}
          />
        );
      case MODAL_KEYS.PROGRAM_REQUISITION:
        return (
          <ByProgramModal
            onConfirm={onSelect}
            database={UIDatabase}
            type="requisition"
            settings={Settings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalContainer
      fullScreen={fullScreen}
      isVisible={isOpen}
      onClose={onClose}
      title={getModalTitle(modalKey)}
    >
      <ModalContent />
    </ModalContainer>
  );
};

DataTablePageModal.defaultProps = {
  fullScreen: false,
  modalKey: '',
  onSelect: null,
  currentValue: '',
};

DataTablePageModal.propTypes = {
  fullScreen: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  modalKey: PropTypes.string,
  onSelect: PropTypes.func,
  currentValue: PropTypes.string,
};

export default DataTablePageModal;
