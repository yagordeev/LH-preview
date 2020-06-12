import { CONFIG, MODE } from '../../../../config.js';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { system_status, notification } from '../../../../actions';
import axios from 'axios';

import Localized from '../../../../components/Localized.jsx';

function Cart(props) {

	const dispatch = useDispatch();

	const system = useSelector(state => state.system);
	const user = useSelector(state => state.user);
	const project = useSelector(state => state.project);

	const cart = props.cart;

	const currency = props.currency;
	const currency_price = props.currencyPrice;

	const accounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	const months = [1, 3, 6, 9, 12, 24]

	const [total, setTotal] = useState(0);
	const [show, setShow] = useState(false);

	useEffect(() => {
		let summ = 0;
		Object.keys(cart).map(item => (
			summ = summ + (cart[item][currency_price] * cart[item].quantity * cart[item].validity)
		))
		setTotal(summ)
	}, [props.cart, currency])

	function edit(item, quantity, validity) {
		props.onChange(item, quantity, validity)
	}

	function deleteItem(item) {
		props.onDelete(item)
	}

	function sendOrder() {
		let order = Object.keys(cart).map(name => ({
			...cart[name],
			name: name,
			date: new Date().toISOString()
		}));
		axios.defaults.headers.common['Authorization'] = "Bearer " + user.token;
		axios.post(CONFIG[MODE].api + "/pscb/get_pay_link", {
				project: user.project,
				email: user.username,
				full_name: user.full_name,
				project_name: project[user.project].project_name,
				order: order,
				total: total,
				currency: currency,
				date: new Date().toISOString(),
			})
			.then(response => {
				console.log(response.data);
				if(response.status === 200) {
					const data = response.data;
					if(data.success === false) {
						//показываем сообщение сервера
						dispatch(notification(Localized(null, { language: system.language, req: data.msg })))
					} else {
						console.log(data.url);
						//перейти по ссылке
						window.location.href = data.url;
					}
				} else if(response.status === 205) {
					//устанавливаем статус - не авторизован
					dispatch(system_status('unauthorized'));
					//показываем сообщение, что токен устарел
					dispatch(notification(Localized(null, { language: system.language, req: "notify_invalid_session" })))
				}
			})
			.catch((error) => {
				//статус ошибки
				error.response ? (
					console.log('Looks like there was a problem' +
						(error.response.config.url && (' with ' + error.response.config.url)) +
						(error.response.status && ('. Status Code: ' + error.response.status))
					)
				) : console.log('ERROR', error);
			});
	}

	return (
		<div id="cart" className="flex-column-100 block" >
			{Object.keys(cart).map((item)=>(cart[item].quantity > 0 && (
				<div key={item} className="flex-row fade-top" style={{width: '100%'}}>
					<div className="item flex-row area">

						<div className="text">
							<Localized language={system.language} req={'cart_'+item}/>
						</div>

						{cart[item].multi && (
							<div className="option_list">
								<div className="active flex-row block">
									<div style={{flex: 1}}>
										{String(cart[item].quantity)}
										<Localized language={system.language} req={'constructor_acc'}/>
									</div>
									<span>▾</span>
								</div>
								<div className="options block">
									{accounts.map((number, i) => (
										<div key={number} className={cart[item].quantity === number ? 'active' : ''} onClick={()=>edit(item, number, false)}>
											{number}
										</div>
									))}
								</div>
							</div>
						)}

						<div className="option_list">
							<div className="active flex-row block">
								<div style={{flex: 1}}>
									{String(cart[item].validity)}
									<Localized language={system.language} req="constructor_mes"/>
								</div>
								<span>▾</span>
							</div>
							<div className="options block">
								{months.map((month, i) => (
									<div key={month} className={cart[item].validity === month ? 'active' : ''} onClick={()=>edit(item, false, month)}>
										{month}
									</div>
								))}
							</div>

						</div>

						<div className="price">
							{(cart[item][currency_price] * cart[item].quantity * cart[item].validity).toLocaleString('ru-RU', { style: 'currency', currency: currency, minimumFractionDigits: 0 })}
						</div>

					</div>

					<div className="delete">
						<img onClick={()=>deleteItem(item)} src="/img/delete2.svg" alt="delete"></img>
					</div>

				</div>
			)))}
			<div className="pay flex-row">
				<div className="pay_button">
					<button type="button" className="button" onClick={sendOrder}>
						<Localized language={system.language} req="pay_button"/>
					</button>
				</div>
				<div className="price">
					<div className="total">{total.toLocaleString('ru-RU', { style: 'currency', currency: currency, minimumFractionDigits: 0 })}</div>
				</div>
			</div>
		</div>
	)
}

export default Cart;