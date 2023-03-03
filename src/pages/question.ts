import { RouteEventProps } from "../lib";
import Sets from "./sets";

export interface Question {
	id: number,
	ser_question: string,
	ser_answer: string,
}

export class QuestionLayout extends HTMLElement {

	constructor(q: Question) {
		super();

		this.innerHTML = `
			<div class="question center">
				<div class="WHAT">
					<p class="math" id="question-question">
						${q.ser_question.replaceAll("\n", "<br>")}
					</p>
				</div>
				<hr style="width: 100%">
				<div id="question-answer" class="WHAT is-disabled">
					<p class="math">
						${q.ser_answer.replaceAll("\n", "<br>")}
					</p>
				</div>
				<div class="question-btns-div">
					<button id="question-reveal-btn">Reveal answer</button>
					<button id="question-next-btn">Next question</button>
				</div>
			</div>
		`
	}

	connectedCallback() {
		const reveal_btn = this.querySelector("#question-reveal-btn")! as HTMLButtonElement;
		const next_btn = this.querySelector("#question-next-btn")! as HTMLButtonElement;

		reveal_btn.onclick = () => {
			this.querySelector('#question-answer')!.classList.remove('is-disabled');
		}

		if (window.data.revision_data!.questions.length === 0) {
			next_btn.innerText = "End (no questions left)";
			next_btn.onclick = () => {
				window.dispatchEvent(new CustomEvent<RouteEventProps>("route", {
					detail: {
						new_element: new Sets(),
						sidebar_el_id: "sets-btn",
					}
				}))
				window.dispatchEvent(new CustomEvent('end-revision'));
			}
		} else {
			next_btn.innerText = `Next question (${window.data.revision_data!.questions.length} left)`;
			next_btn.onclick = () => {
				window.dispatchEvent(new CustomEvent('next-question'))
			}
		}
	}
}

if ('customElements' in window) {
	customElements.define('question-layout', QuestionLayout);
}
