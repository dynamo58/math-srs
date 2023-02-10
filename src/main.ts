import { invoke } from "@tauri-apps/api/tauri";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
	if (greetMsgEl && greetInputEl) {
		// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
		greetMsgEl.textContent = await invoke("greet", {
			name: greetInputEl.value,
		});
	}
}

function init_listeners() {
	window.onkeyup = (e) => {
		if (e.ctrlKey && e.key == "b") {
			document.getElementById("sidebar")!.classList.toggle("is-disabled");
		}
	}

	document.getElementById("home-btn")!.onclick = () => {
		Array.from(document.getElementsByClassName("icon")).forEach(el => {
			el.classList.remove("active")
		});

		document.getElementById("home-btn")!.classList.add("active")

		document.getElementById("content-frame")?.setAttribute("src", "/src/pages/home.html")
	}
}

// declare global {
// interface Window { MathJax: any; }
// }

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

// class Set {
// name: string;
// questions: Question[];

// constructor(name: string) {
// this.name = name
// }
// }

window.addEventListener("DOMContentLoaded", () => {
	init_listeners();


	greetInputEl = document.querySelector("#greet-input");
	greetMsgEl = document.querySelector("#greet-msg");
	document
		.querySelector("#greet-button")
		?.addEventListener("click", () => greet());
});
