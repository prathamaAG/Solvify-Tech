import { compose, applyMiddleware, createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducers';
import { thunk } from 'redux-thunk';

const persistConfig = {
    key: 'root',
    storage
};

const middlewares = [thunk];

const enhancer = compose(applyMiddleware(...middlewares));
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, enhancer);
const persistor = persistStore(store);

export { store, persistor };
