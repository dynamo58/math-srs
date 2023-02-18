import { invoke } from "@tauri-apps/api/tauri";
import { Set } from "../components/set";


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

	async connectedCallback() {
		const sets_el = document.getElementById("sets")! as HTMLDivElement;
		const search_input_el = document.getElementById("search-input-el")! as HTMLInputElement;
		const set_creation_btn = document.getElementById("set-creation-btn")! as HTMLButtonElement;
		const create_set_btn = document.getElementById("create-set-btn")! as HTMLButtonElement;
		const set_creation_div = document.getElementById("set-creation-div")! as HTMLDivElement;
		const name_input = document.getElementById("new-set-name")! as HTMLInputElement;
		const desc_input = document.getElementById("new-set-desc")! as HTMLInputElement;

		await window.data.refreshSets();
		window.data.render_sets(sets_el);

		search_input_el.onkeyup = (e) => {
			e.preventDefault();
			if (e.key == "Enter")
				window.data.render_filtered_sets(sets_el, search_input_el.value)
		}

		set_creation_btn.onclick = () => {
			set_creation_div.classList.remove("is-disabled");
			set_creation_btn.classList.add("is-disabled");
		}

		create_set_btn.onclick = async () => {
			let recd_set = await invoke("create_set", {
				name: name_input.value,
				desc: desc_input.value,
			}) as Set;

			window.data.add_and_render_set(sets_el, recd_set);

			set_creation_div.classList.add("is-disabled");
			set_creation_btn.classList.remove("is-disabled");
		}
	}
}

if ('customElements' in window) {
	customElements.define('sets-page', Sets);
}
