import { invoke } from "@tauri-apps/api/tauri";

import { Data } from "./lib";
import Home from "./pages/home";
import Sets from "./pages/sets";
import { Set } from "./components/set";
import Sidebar from "./components/sidebar";
import { RouteEventProps} from "./lib";
import { QuestionLayout } from "./pages/question";

let data = new Data;

window.addEventListener("DOMContentLoaded", async () => {
	const root = document.getElementById("__ROOT")! as HTMLDivElement;
	const page_box = document.getElementById("__PAGE-BOX")! as HTMLDivElement;
	const sidebar = new Sidebar();
	root.insertBefore(sidebar, page_box);
	const home_btn = document.getElementById("home-btn")! as HTMLDivElement;
	const sets_btn = document.getElementById("sets-btn")! as HTMLDivElement;

	window.addEventListener("start-revision", ((e: CustomEvent<{ set_uuid: string }>) => {
		console.log("DEBUG: starting game...");

		data.start_revision(e.detail.set_uuid);
		window.dispatchEvent(new CustomEvent<{}>("next-question"));
	}) as EventListener);

	window.addEventListener("next-question", (() => {
		console.log("DEBUG: changing question...");

		page_box.replaceChildren(new QuestionLayout(data.pop_question()!)); // TODO
		eval(`
			MathJax.typesetClear();
			MathJax.typesetPromise(document.querySelectorAll(".question"));
		`);

	}) as EventListener);


	home_btn.onclick = () => {
		window.dispatchEvent(new CustomEvent<RouteEventProps>("route", {
			detail: {
				new_element: new Home(),
				is_temp: false,
				sidebar_el_id: "home-btn",
			}
		}));
	}
	sets_btn.onclick = async () => {
		window.dispatchEvent(new CustomEvent<RouteEventProps>("route", {
			detail: {
				new_element: new Sets(),
				is_temp: false,
				sidebar_el_id: "sets-btn",
			}
		}));

		const sets_el = document.getElementById("sets")! as HTMLDivElement;
		const search_input_el = document.getElementById("search-input-el")! as HTMLInputElement;
		const set_creation_btn = document.getElementById("set-creation-btn")! as HTMLButtonElement;
		const create_set_btn = document.getElementById("create-set-btn")! as HTMLButtonElement;
		const set_creation_div = document.getElementById("set-creation-div")! as HTMLDivElement;
		const name_input = document.getElementById("new-set-name")! as HTMLInputElement;
		const desc_input = document.getElementById("new-set-desc")! as HTMLInputElement;

		await data.refreshSets();
		data.render_sets(sets_el);

		search_input_el.onkeyup = (e) => {
			e.preventDefault();
			if (e.key == "Enter")
				data.render_filtered_sets(sets_el, search_input_el.value)
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

			data.add_and_render_set(sets_el, recd_set);

			set_creation_div.classList.add("is-disabled");
			set_creation_btn.classList.remove("is-disabled");
		}
	}


	home_btn.click();
});
