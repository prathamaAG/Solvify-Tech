// Reducer for managing login state
import { LOGIN, LOGOUT } from '../actions/loginActions';

const initialState = {};

const loginReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case LOGIN:
            return action.payload;
        case LOGOUT:
            return {};
        default:
            return state;
    }
};

export default loginReducer;
