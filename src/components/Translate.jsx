import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { set_language } from '../actions';
import { useCookies } from 'react-cookie';

const query = new URLSearchParams(window.location.search);
let l = query.get('l');

function Translate(req, param) {

	let history = useHistory();

	const dispatch = useDispatch();
	const [cookies, setCookie] = useCookies(['language']);
	const language = useSelector(state => state.system.language);

	useEffect(() => {
		let flag = true;
		if(flag) {
			//проверяем ссылку
			if(l) {
				//устанавливаем дефолтный язык
				dispatch(set_language(l));
				//устанавливаем куки
				setCookie('language', l, { path: '/', maxAge: 12 * 2592000, httpOnly: false });
				//удаляем query
				history.push('/')
			} else {
				if(language === null) {
					//проверяем наличие куки
					if(cookies.language) {
						dispatch(set_language(cookies.language)); //устанавливаем язык из куки
					} else {
						setCookie('language', 'ru', { path: '/', maxAge: 12 * 2592000, httpOnly: false });
						//устанавливаем дефолтный язык
						dispatch(set_language('ru'));
					}
				} else {
					//обновляем куки, если установлен другой язык
					if(language !== cookies.language) {
						setCookie('language', language, { path: '/', maxAge: 12 * 2592000, httpOnly: false });
					}
				}
			}
		}
		return () => { flag = false };
	}, [])

	return null
}

export default Translate;