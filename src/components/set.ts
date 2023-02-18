import { invoke } from "@tauri-apps/api";
import { RouteEventProps, time_since_unix_timestamp } from "../lib";
import { QuestionEditing } from "../pages/editing_set";
import { Question } from "../pages/question";

export interface Set {
	id: number,
	name: string,
	uuid: string,
	last_revised: number,
	is_foreign: boolean,
	description: string | null,
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
			<div class="set-icon-container container">
				<img src="/src/assets/edit-icon.svg" alt="set icon" class="set-icon">
			</div>
		`;
	}

	connectedCallback() {
		const info_box = this.querySelector(".set-info")! as HTMLDivElement;
		const icon_box = this.querySelector(".set-icon-container")! as HTMLDivElement;

		info_box.onclick = () => {
			window.dispatchEvent(new CustomEvent<{ set_uuid: string }>('start-revision', {
				detail: {
					set_uuid: this.set.uuid
				}
			}));
		}

		icon_box.onclick = async () => {
			let questions = await invoke("get_set_questions", {
				setUuid: this.set.uuid,
			}) as Question[];

			window.dispatchEvent(new CustomEvent<RouteEventProps>('route', {
				detail: {
					new_element: new QuestionEditing(this.set, questions),
					sidebar_el_id: this.set.id.toString(),
				}
			}));
		}
	}
}

if ('customElements' in window) {
	customElements.define('set-card', SetCard);
}