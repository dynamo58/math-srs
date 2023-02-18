export default class Home extends HTMLElement {
	constructor() {
		super();

		// this.innerHTML = ``

		// this.innerHTML = `
		// 	<div class="container">
		// 		yo
		// 	</div>
		// `
	}
}

if ('customElements' in window) {
	customElements.define('home-page', Home);
}