import systemReducer from './system';
import userReducer from './user';
import projectReducer from './project';
import chatReducer from './chat';
import countReducer from './count';
import { combineReducers } from 'redux';

const allReducers = combineReducers({
	system: systemReducer,
	user: userReducer,
	project: projectReducer,
	chat: chatReducer,
	count: countReducer
})

export default allReducers;