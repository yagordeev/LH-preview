import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { set_language } from '../../actions';
import { useCookies } from 'react-cookie';

function Localized(props) {

	const dispatch = useDispatch();
	const [cookies, setCookie] = useCookies(['language']);
	const language = useSelector(state => state.system.language);

	useEffect(() => {
		let flag = true;
		if(flag) {
			// первая загрузка страницы
			if(language === null) {
				//проверяем наличие куки
				if(cookies.language) {
					dispatch(set_language(cookies.language)); //устанавливаем язык из куки
				} else {
					setCookie('language', 'ru', { path: '/', maxAge: 12 * 2592000, httpOnly: false });
					dispatch(set_language('ru')); //устанавливаем дефолтный язык
				}
			} else {
				//обновляем куки, если установлен другой язык
				if(language !== cookies.language) {
					setCookie('language', language, { path: '/', maxAge: 12 * 2592000, httpOnly: false });
				}
			}
		}
		return () => { flag = false };
	}, [language])


	return (
		<div id="language" className='fade' onMouseEnter={()=>props.onHover(false)} onMouseLeave={()=>props.onHover(true)}>
			<div className="title flex-row">
				<img style={{'width':'22px', 'marginRight':'10px'}} src={'/img/'+language+'.png'} alt={language}/> {language}
			</div>
			<div id="language_block" className="popup_arrow_bottom">
				<div className="block">
					<div className="scroll block">
						<div className="name clickable" onClick={()=>dispatch(set_language('ru'))}>
							<img src='/img/ru.png' alt={language}/> Русский
						</div>
						<hr/>
						<div className="name clickable" onClick={()=>dispatch(set_language('en'))}>
							<img src='/img/en.png' alt={language}/> English
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Localized;