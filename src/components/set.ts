import { time_since_unix_timestamp } from "../lib";

export interface Set {
	id: number,
	name: string,
	uuid: string,
	last_revised: number,
	is_foreign: boolean,
	description: String | null,
	question_count: number,
}

export class SetCard extends HTMLElement {
	set: Set;

	constructor(set: Set) {
		super();
		this.set = set;

		const last_revised_str = (set.last_revised == null) ? "never" : time_since_unix_timestamp(set.last_revised);
		this.innerHTML = `
			<div class="set-info">
				<div class="set-name set-info__item">${set.name}</div>
				<div class="set-count set-info__item">Question count: <span id="set-count">${set.question_count}</span></div>
				<div class="set-last set-info__item">Last revised: ${last_revised_str}</div>
			</div>
			<div>
				<div class="set-icon-container container">
					<img src="/src/assets/bookmark.svg" alt="set icon" class="set-icon">
				</div>
			</div>
		`;
	}

	connectedCallback() {
		this.onclick = () => {
			Array.from(document.getElementsByClassName("sidebar-item")).forEach(e => { e.classList.remove("active") });

			window.dispatchEvent(new CustomEvent<{set_uuid: string}>('start-revision', {
				detail: {
					set_uuid: this.set.uuid
				}
			}));
		}
	}
}

if ('customElements' in window) {
	customElements.define('set-card', SetCard);
}