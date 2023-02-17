export interface Question {
	id: number,
	ser_question: string,
	ser_answer: string,
}

export class QuestionLayout extends HTMLElement {
	constructor(q: Question) {
		super();

		this.innerHTML = `
			<div class="question">
					<div class="center" id="question-question">
						${q.ser_question}
					</div>
					<div id="question-answer" class="is-disabled">
						${q.ser_answer}
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

		next_btn.onclick = () => {
			window.dispatchEvent(new CustomEvent('next-question'))
		}
	}
}

if ('customElements' in window) {
	customElements.define('question-layout', QuestionLayout);
}
