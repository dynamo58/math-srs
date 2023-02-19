
import { Data, RouteEventProps } from "./lib";
import Home from "./pages/home";
import Sets from "./pages/sets";
import { QuestionLayout } from "./pages/question";
import Sidebar from "./components/sidebar";

declare global {
	interface Window {
		data: Data,
	}
}

window.data = new Data;

window.addEventListener("DOMContentLoaded", async () => {
	const root = document.getElementById("__ROOT")! as HTMLDivElement;
	const page_box = document.getElementById("__PAGE-BOX")! as HTMLDivElement;
	const sidebar = new Sidebar();
	root.insertBefore(sidebar, page_box);
	const home_btn = document.getElementById("home-btn")! as HTMLDivElement;
	const sets_btn = document.getElementById("sets-btn")! as HTMLDivElement;

	window.addEventListener("start-revision", ((e: CustomEvent<{ set_uuid: string }>) => {
		console.log("DEBUG: starting game...");

		window.data.start_revision(e.detail.set_uuid).then(() => {
			window.dispatchEvent(new CustomEvent<{}>("next-question"));
		});
	}) as EventListener);

	window.addEventListener("next-question", (() => {
		console.log("DEBUG: changing question...");

		page_box.replaceChildren(new QuestionLayout(window.data.pop_question()!)); // TODO
		eval(`
			MathJax.typesetClear();
			MathJax.typesetPromise(document.querySelectorAll(".question"));
		`);
	}) as EventListener);


	home_btn.onclick = () => {
		window.dispatchEvent(new CustomEvent<RouteEventProps>("route", {
			detail: {
				new_element: new Home(),
				sidebar_el_id: "home-btn",
			}
		}));
	}
	sets_btn.onclick = async () => {
		window.dispatchEvent(new CustomEvent<RouteEventProps>("route", {
			detail: {
				new_element: new Sets(),
				sidebar_el_id: "sets-btn",
			}
		}));
	}


	home_btn.click();
});
