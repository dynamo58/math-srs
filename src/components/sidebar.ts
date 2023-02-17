import { RouteEventProps } from "../lib";

export default class Sidebar extends HTMLElement {
	is_active_temp: boolean;


	constructor() {
		super();

		this.is_active_temp = true;
		// this.attachShadow({ mode: "open" });

		this.innerHTML = `
			<div class="sidebar container" id="sidebar">
				<div class="sidebar-item container active" id="home-btn" oclick="">
					<img src="/src/assets/home-icon.svg" class="icon" alt="Home" />
				</div>
				<div class="sidebar-item container" id="sets-btn">
					<img src="/src/assets/list-icon.svg" class="icon" alt="Sets" />
				</div>
				<div id="temporary-sidebar"></div>
			</div>
		`
	}

	change_focus(s: string) {
		Array.from(this.querySelectorAll(".sidebar-item")).forEach((el) => {
			console.log({el});
			el.classList.remove("active");
		})

		this.querySelector(`#${s}`)!.classList.add("active")
	}

	connectedCallback() {
		window.onkeyup = (e) => {
			if (e.ctrlKey && e.key == "b" || e.key == "B")
				this.classList.toggle("is-disabled");
		}

		window.addEventListener("route", ((e: CustomEvent<RouteEventProps>) => {
			console.log("here")
			if (e.detail.is_temp)
				this.querySelector("temporary-sidebar")!.innerHTML += `
					<div class="sidebar-item container active-set-sidebar-item active" id=${e.detail.sidebar_el_id}>
						<img src="/src/assets/book.svg" class="icon" alt="Opened set icon" />
					</div>
				`;

			document.getElementById("__PAGE-BOX")!.replaceChildren(e.detail.new_element)
			this.change_focus(e.detail.sidebar_el_id!);
		}) as EventListener);
	}
}

if ('customElements' in window) {
	customElements.define('sidebar-div', Sidebar);
}
