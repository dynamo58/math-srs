import { Set } from "../components/set";
import { invoke } from "@tauri-apps/api";
import { Question } from "./question";
import { RouteEventProps } from "../lib";
import Sets from "./sets";

export class SingleQuestionEditForm extends HTMLElement {
	q: Question;
	set_uuid: string;

	constructor(q: Question, uuid: string) {
		super();

		this.q = q;
		this.set_uuid = uuid;

		this.innerHTML = `
			<div class="editable-question border flex-row">
				<div class="flex-col" style="flex-grow: 1">
					<textarea rows="4" class="editing-question-question">${q.ser_question}</textarea>
					<textarea rows="4" class="editing-question-answer">${q.ser_answer}</textarea>
				</div>
				<div class="flex-col">
					<button class="apply-question-edit-btn">Apply changes</button>
					<button class="delete-question-btn">Delete question</button>
				</div>
			</div>
		`
	}

	connectedCallback() {
		const edit_button = this.querySelector(`.apply-question-edit-btn`)! as HTMLButtonElement;
		const delete_button = this.querySelector(`.delete-question-btn`)! as HTMLButtonElement;

		edit_button.onclick = () => {
			const new_question = this.querySelector(`.editing-question-question`)! as HTMLTextAreaElement;
			const new_answer = this.querySelector(`.editing-question-answer`)! as HTMLTextAreaElement;

			invoke("edit_question_in_set", {
				setUuid: this.set_uuid,
				questionId: this.q.id,
				serQuestion: new_question.value,
				serAnswer: new_answer.value,
			})
				.then(() => { })
				.catch((e) => {
					console.log(e);

					new_question.value = this.q.ser_question;
					new_answer.value = this.q.ser_answer;
				})
		}

		delete_button.onclick = () => {
			invoke("delete_question_from_set", {
				setUuid: this.set_uuid,
				questionId: this.q.id,
			})
				.then(() => {
					this.remove();
				})
				.catch((e) => console.log(e));
		}
	}
}

export class QuestionEditing extends HTMLElement {
	set: Set;
	set_questions: Question[];

	constructor(set: Set, questions: Question[]) {
		super();
		this.set = set;
		this.set_questions = questions;

		this.innerHTML = `
			<div>
				<h4 class="center">Edit the set name & description</h4>
				<div class="add-question-form">
					<div class="border flex-row">
						<div class="flex-col" style="flex-grow: 1">
							<textarea id="set-name" placeholder="New set name">${set.name}</textarea>
							<textarea id="set-desc" placeholder="New set description">${set.description}</textarea>
						</div>
						<div class="flex-col">
							<button id="edit-set-info-btn">Edit info</button>
						</div>
					</div>
				</div>
				<h4 class="center">Add a new question to the set</h4>
				<div class="add-question-form">
					<div class="border flex-row">
						<div class="flex-col" style="flex-grow: 1">
							<textarea rows="4" id="new-question-question" placeholder="Question formulation"></textarea>
							<textarea rows="4" id="new-question-answer" placeholder="Answer to the question"></textarea>
						</div>
						<div class="flex-col">
							<button id="new-question-submit-btn">Add</button>
						</div>
					</div>
				</div>
				<h4 class="center">Edit individual questions</h4>
				<div id="set-questions"></div>
				<div class="center">
					<button id="delete-set-btn">Delete set</button>
				</div>
			</div>
		`
	}

	async connectedCallback() {
		const question_box = document.getElementById("set-questions")! as HTMLDivElement;
		const add_question_btn = this.querySelector("#new-question-submit-btn")! as HTMLButtonElement;
		const delete_set_btn = this.querySelector("#delete-set-btn")! as HTMLButtonElement;

		this.set_questions.forEach((q) => {
			question_box.insertAdjacentElement("afterbegin", new SingleQuestionEditForm(q, this.set.uuid));
		});

		delete_set_btn.onclick = () => {
			invoke("delete_set", {
				setUuid: this.set.uuid,
			})
				.then(() => {
					window.dispatchEvent(new CustomEvent<RouteEventProps>("route", {
						detail: {
							new_element: new Sets(),
							sidebar_el_id: "sets-btn"
						}
					}))
				})
				.catch(e => console.log(e))
		}

		add_question_btn.onclick = async () => {
			const question_area = (this.querySelector("#new-question-question")! as HTMLTextAreaElement);
			const answer_area = (this.querySelector("#new-question-answer")! as HTMLTextAreaElement);

			await invoke("add_question_to_set", {
				setUuid: this.set.uuid,
				serQuestion: question_area.value,
				serAnswer: answer_area.value,
			})
				.then((q_id_in_db) => {
					question_box.insertAdjacentElement("afterbegin", new SingleQuestionEditForm({
						id: q_id_in_db as number,
						ser_question: question_area.value,
						ser_answer: answer_area.value,
					}, this.set.uuid));

					question_area.value = "";
					answer_area.value = "";
				})
				.catch((e) => console.log(e));
		}

		const edit_question_info_btn = this.querySelector("#edit-set-info-btn")! as HTMLButtonElement;
		edit_question_info_btn.onclick = () => {
			const name = this.querySelector("#set-name")! as HTMLTextAreaElement;
			const desc = this.querySelector("#set-desc")! as HTMLTextAreaElement;

			invoke("edit_set", {
				setUuid: this.set.uuid,
				newName: name.value,
				newDesc: desc.value,
			})
		}
	}
}

if ('customElements' in window) {
	customElements.define('question-editing', QuestionEditing);
	customElements.define('single-question-editing', SingleQuestionEditForm);
}
