export default class Home extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<p style="font-style: italic; font-size: 1.7em" class="center">
				Now I will have less distraction.
			</p>
				<div class="container" style="display: grid; justify-content: center; align-items: center;">
				<img id="euler" src="${window.ASSETS["/src/assets/pics/euler.jpg"]}" style=" height: 80vh" />
			</div>
		`
	}
}

if ('customElements' in window) {
	customElements.define('home-page', Home);
}