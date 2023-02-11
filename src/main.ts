import { invoke } from "@tauri-apps/api/tauri";

interface Set {
	id: number,
	name: string,
	uuid: string,
	last_revised: number,
	is_foreign: boolean,
	description: String | null,
}

class Data {
	sets: Set[];

	constructor() {
		this.sets = []
	}

	async refreshSets() {
		this.sets = await invoke("get_sets");
		console.log(this.sets);
	}
}

let data = new Data;

function init_listeners() {
	window.onkeyup = (e) => {
		if (e.ctrlKey && e.key == "b" || e.key == "B") {
			document.getElementById("sidebar")!.classList.toggle("is-disabled");
		}
	}

	// this doesnt really scale but I CBA rn
	document.getElementById("home-btn")!.onclick = () => {
		document.getElementById("sets-btn")!.classList.remove("active");
		document.getElementById("home-btn")!.classList.add("active");
		document.getElementById("content-frame")?.setAttribute("src", "/src/pages/home.html");
	}
	document.getElementById("sets-btn")!.onclick = async () => {
		document.getElementById("home-btn")!.classList.remove("active");
		document.getElementById("sets-btn")!.classList.add("active");
		document.getElementById("content-frame")?.setAttribute("src", "/src/pages/sets.html");

		data.refreshSets().then(() => {
			console.log(data.sets)
		});

	}
}

// enum ContentVariant {
// Text,
// Image,
// }

// import { v4 as uuid } from 'uuid';

// class Question {
// id: string;
// name: string;
// question_content: [ContentVariant, string][];
// answer_content: [ContentVariant, string][];

// constructor(name: string, content: string, answer: string) {
// this.id = uuid();
// this.name = name;
// this.question_content = [];
// this.answer_content = [];
// }
// }

window.addEventListener("DOMContentLoaded", async () => {
	init_listeners();
});
