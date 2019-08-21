/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { BACKGROUND_COLOR, BLUE_WHITE, DARK_GREY } from './colors';
import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from './fonts';

const newDataTableStyles = {
  cellContainer: {
    left: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'left',
    },
    right: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'right',
    },
    center: {
      borderRightWidth: 2,
      borderColor: '#ecf3fc',
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
    },
  },
  cellText: {
    left: {
      marginLeft: 20,
      textAlign: 'left',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
    right: {
      marginRight: 20,
      textAlign: 'right',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
    center: {
      textAlign: 'center',
      fontFamily: APP_FONT_FAMILY,
      fontSize: APP_GENERAL_FONT_SIZE,
      color: DARK_GREY,
    },
  },
  editableCellText: {
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
    color: DARK_GREY,
  },
  editableCellTextView: {
    borderBottomColor: '#cbcbcb',
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
    width: '88%',
    maxHeight: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 20,
  },
  touchableCellContainer: {
    borderRightWidth: 2,
    borderColor: '#ecf3fc',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'row',
    height: 45,
  },
  alternateRow: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    height: 45,
  },
  headerCells: {
    left: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    right: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    center: {
      height: 40,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      backgroundColor: 'white',
      borderColor: BLUE_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
};

export default newDataTableStyles;
