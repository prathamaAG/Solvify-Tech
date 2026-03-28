// Reducer for managing UI customization state
import { MENU_OPEN, MENU_TYPE } from '../actions/customizationActions';

export const initialState = {
    isOpen: 'dashboard',
    navType: ''
};

const customizationReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case MENU_OPEN:
            return {
                ...state,
                isOpen: action.isOpen
            };
        case MENU_TYPE:
            return {
                ...state,
                navType: action.navType
            };
        default:
            return state;
    }
};

export default customizationReducer;
