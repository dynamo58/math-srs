import { RouteEventProps } from "../lib";

export default class Sidebar extends HTMLElement {
	is_active_temp: boolean;
	static hard_end = ["home-btn", "sets-btn"];

	constructor() {
		super();
		this.is_active_temp = true;
		this.innerHTML = `
			<div class="sidebar container" id="sidebar">
				<div class="sidebar-item container active" id="home-btn" oclick="">
					<img src="/src/assets/pics/home-icon.svg" class="icon" alt="Home" />
				</div>
				<div class="sidebar-item container" id="sets-btn">
					<img src="/src/assets/pics/list-icon.svg" class="icon" alt="Sets" />
				</div>
			</div>
		`
	}

	change_focus(s: string) {
		Array.from(this.querySelectorAll(".sidebar-item")).forEach((el) => {
			el.classList.remove("active");
		})

		if (Sidebar.hard_end.includes(s))
			this.querySelector(`#${s}`)!.classList.add("active")
	}

	connectedCallback() {
		window.onkeyup = (e) => {
			if (e.ctrlKey && e.key == "b" || e.key == "B")
				this.classList.toggle("is-disabled");
		}

		window.addEventListener("route", ((e: CustomEvent<RouteEventProps>) => {
			document.getElementById("__PAGE-BOX")!.replaceChildren(e.detail.new_element)
			this.change_focus(e.detail.sidebar_el_id!);
		}) as EventListener);
	}
}

if ('customElements' in window) {
	customElements.define('sidebar-div', Sidebar);
}
