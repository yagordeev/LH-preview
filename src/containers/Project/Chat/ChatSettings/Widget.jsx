import React from 'react';

import Localized from '../../../../components/Localized.jsx';


function Widget(props) {

	const system = props.system;
	const user = props.user;


	return (
		<div className="block box fade-top">
			<span className="title contrast-text">
				<Localized language={system.language} req='widget'/>
			</span>
			<span className="description contrast-text">
				<Localized language={system.language} req='widget_description'/>
				<pre className="element">{`</head>`}</pre>.</span>
			<div className="code area">
				<pre>{`<!-- LeadHunt -->`}</pre>
				<pre>{`<script>`}</pre>
				<pre style={{'paddingLeft': '15px'}}>{`(function (d, w) {`}</pre>
				<pre style={{'paddingLeft': '35px'}}>{`w.ProjectID = '`}{user.project}{`';`}</pre>
				<pre style={{'paddingLeft': '35px'}}>{	`var s = d.createElement('script');`}</pre>
				<pre style={{'paddingLeft': '35px'}}>{	`s.async = true;`}</pre>
				<pre style={{'paddingLeft': '35px'}}>{	`s.src = 'https://chat.leadhunt.one/widget.js';`}</pre>
				<pre style={{'paddingLeft': '35px'}}>{	`d.head && d.head.appendChild(s);`}</pre>
				<pre style={{'paddingLeft': '15px'}}>{`})(document, window);`}</pre>
				<pre>{`</script>`}</pre>
				<pre>{`<!-- /LeadHunt -->`}</pre>
			</div>
		</div>
	)
}

export default Widget;