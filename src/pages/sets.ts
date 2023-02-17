
export default class Sets extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="container" id="__SETS_MAIN_CONTAINER">
				<input type="text" placeholder="Search my sets" id="search-input-el" style="width:min(100%, 20em)">
				<div class="center">
					<button role="button" style="max-width: 15em;" id="set-creation-btn">Create new</button>
				</div>
				
				<div class="center border is-disabled" id="set-creation-div">
					<input type="text" placeholder="Name" id="new-set-name" style="width:min(100%, 10em)">
					<input type="text" placeholder="Description" id="new-set-desc" style="width:min(100%, 10em)">
					<div class="center">
						<button class="button-62" role="button" style="max-width: 15em;" id="create-set-btn">Create</button>
					</div>
				</div>

				<div class="container sets" id="sets"></div>
			</div>
		`
	}
}

if ('customElements' in window) {
	customElements.define('sets-page', Sets);
}
