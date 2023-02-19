import { invoke } from "@tauri-apps/api";
import { SetCard, Set } from "./components/set";
import { Question, QuestionLayout } from "./pages/question";

// adapted from https://stackoverflow.com/a/12475270
export function time_since_unix_timestamp(time: number) {
	var time_formats = [
		[60, 'seconds', 1], // 60
		[120, '1 minute ago', '1 minute from now'], // 60*2
		[3600, 'minutes', 60], // 60*60, 60
		[7200, '1 hour ago', '1 hour from now'], // 60*60*2
		[86400, 'hours', 3600], // 60*60*24, 60*60
		[172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
		[604800, 'days', 86400], // 60*60*24*7, 60*60*24
		[1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
		[2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
		[4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
		[29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
		[58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
		[2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
		[5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
		[58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
	];
	var seconds = (+new Date() - time) / 1000,
		token = 'ago',
		list_choice = 1;

	if (seconds == 0) {
		return 'Just now'
	}
	if (seconds < 0) {
		seconds = Math.abs(seconds);
		token = 'from now';
		list_choice = 2;
	}
	var i = 0,
		format;
	while (format = time_formats[i++])
		if (seconds < format[0]) {
			if (typeof format[2] == 'string')
				return format[list_choice];
			else
				return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
		}
	return time;
}

declare global {
	interface Array<T> {
		pop_rand(): T | undefined;
	}
}

Array.prototype.pop_rand = function () {
	if (this.length == 0) return undefined;
	return this.splice(Math.floor(Math.random() * this.length), 1)[0];
}

export class Data {
	sets: Set[];
	revision_data?: {
		questions: Question[],
		count_at_start: number,
	}

	constructor() {
		this.sets = [];
	}

	async refreshSets() {
		this.sets = await invoke("get_sets");
	}

	render_sets(div: HTMLDivElement) {
		div.innerHTML = "";
		this.sets.forEach((set) => {
			div.appendChild(new SetCard(set));
		})
	}

	render_filtered_sets(div: HTMLDivElement, substr: string) {
		div.innerHTML = "";
		this.sets.filter(s => s.name.toLowerCase().includes(substr.toLowerCase())).forEach((set) => {
			div.appendChild(new SetCard(set));
		})
	}

	add_and_render_set(div: HTMLDivElement, set: Set) {
		this.sets.push(set);
		div.appendChild(new SetCard(set));
	}

	async start_revision(uuid: string) {
		let questions = await invoke("get_set_questions", {
			setUuid: uuid
		}) as Question[];

		this.revision_data = {
			questions,
			count_at_start: questions.length
		}
	}

	pop_question(): Question | undefined {
		return this.revision_data?.questions.pop_rand();
	}
}

export interface RouteEventProps {
	new_element: HTMLElement,
	// is_temp: boolean,
	sidebar_el_id: string,
}
