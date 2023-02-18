import { Set } from "../components/set";
import { invoke } from "@tauri-apps/api";
import { Question } from "./question";

export class QuestionEditing extends HTMLElement {
	set: Set;
	set_questions: Question[];

	constructor(set: Set, questions: Question[]) {
		super();
		this.set = set;
		this.set_questions = questions;

		this.innerHTML = `
			<div>
				<div class="center border set-edit-info-bot">
					<input type="text" value="" id="set-name" placeholder="New set name">
					<input type="text" value="" id="set-desc" placeholder="New set description">
					<button id="edit-set-info-btn">Edit info</button>
				</div>
				<div class="add-question-form">
					<div class="editable-question border flex-row" class="width: 100%; justify-content: space-evenly">
						<div class="flex-col" style="flex-grow: 1">
							<textarea id="new-question-question" placeholder="Question formulation"></textarea>
							<textarea id="new-question-answer" placeholder="Answer to the question"></textarea>
						</div>
						<div class="flex-col" style="justify-content: center;">
							<button id="new-question-submit-btn">Add</button>
						</div>
					</div>
				</div>
				<hr>
				<div id="set-questions"></div>
			</div>
		`
	}

	async connectedCallback() {
		const question_box = document.getElementById("set-questions")! as HTMLDivElement;
		let res = await invoke("get_set_questions", {
			setUuid: this.set.uuid,
		}).catch((e) => console.log(e)) as Question[];

		res.forEach((q) => {
			question_box.insertAdjacentHTML("afterbegin", `
				<div class="editable-question border flex-row" class="width: 100%; justify-content: space-evenly">
					<div class="flex-col" style="flex-grow: 1">
						<textarea id="editing-question-question">${q.ser_question}</textarea>
						<textarea id="editing-question-answer">${q.ser_answer}</textarea>
					</div>
					<div class="flex-col">
						<button id="apply-question-edit-btn">Apply changes</button>
						<button id="delete-question-btn">Delete question</button>
					</div>
				</div>
			`);
		});

		const add_question_btn = this.querySelector("#new-question-submit-btn")! as HTMLButtonElement;

		add_question_btn.onclick = async () => {
			const question = this.querySelector("#new-question-question")! as HTMLTextAreaElement;
			const answer = this.querySelector("#new-question-answer")! as HTMLTextAreaElement;

			await invoke("add_question_to_set", {
				setUuid: this.set.uuid,
				serQuestion: question.value,
				serAnswer: answer.value,
			}).catch((e) => console.log(e));

		}
	}
}

if ('customElements' in window) {
	customElements.define('question-editing', QuestionEditing);
}