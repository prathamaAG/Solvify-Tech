// Combine all reducers into a single root reducer
import { combineReducers } from 'redux';
import loginReducer from './loginReducer';
import customizationReducer from './customizationReducer';

const rootReducer = combineReducers({
    login: loginReducer,
    customization: customizationReducer
});

export default rootReducer;
