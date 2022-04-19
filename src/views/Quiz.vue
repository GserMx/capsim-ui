<template>
  <main>
    <form v-on:submit.prevent="">
      <div class="flex items-center justify-center h-screen">
        <div class="flex flex-col">
          <div
            class="alert alert-error shadow-lg w-4/6 ml-40"
            v-show="state.incompleteQuiz"
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>All Answers must be completed</span>
            </div>
          </div>
          <div
            class="m-10 ml-40 text-xl"
            v-for="(question, qidx) in state.questions"
            :key="qidx"
          >
            {{ question.question }}
            <div class="grid grid-cols-5 gap-1">
              <div
                v-for="(answer, idx) in question.answers"
                :key="idx"
                class="text-base"
              >
                <!-- Answers  -->
                <div v-if="question.type == 'single_choice'">
                  <div class="flex flex-row mt-4">
                    <div>
                      <input
                        v-model="state.answers.single[qidx]"
                        type="radio"
                        :value="answer"
                        :name="answer.text"
                        class="radio radio-primary"
                        :id="answer.id.toString()"
                      />
                    </div>
                    <div>
                      <label
                        class="pb-4"
                        :for="answer.id.toString()"
                        style="margin-left: 5px"
                      >
                        {{ answer.text }}
                      </label>
                    </div>
                  </div>
                </div>
                <!-- Multiple choice -->
                <div v-else>
                  <div class="flex flex-row mt-4">
                    <div>
                      <input
                        v-model="state.answers.multi['q' + qidx]"
                        type="checkbox"
                        class="checkbox checkbox-primary"
                        :id="answer.text"
                        :value="answer"
                      />
                    </div>
                    <div>
                      <label
                        class="pb-4"
                        :for="answer.text"
                        style="margin-left: 5px"
                      >
                        {{ answer.text }}
                      </label>
                    </div>
                  </div>
                </div>
                <!-- End multiple choice -->
              </div>
            </div>
          </div>
          <div class="ml-40">
            <button
              class="btn btn-primary"
              :class="{ loading: state.processing }"
              v-on:click="onSubmitForm"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
    <!-- The button to open modal -->
    <!-- <label for="my-modal" class="btn modal-button">open modal</label> -->

    <!-- Put this part before </body> tag -->
    <input
      type="checkbox"
      :checked="state.scoreModalOpen"
      id="my-modal"
      class="modal-toggle"
    />
    <div class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Your Score is</h3>
        <p class="py-4 text-7xl justify-center align-middle">
          {{ state.score }}
        </p>
        <div class="modal-action">
          <label
            for="my-modal"
            class="btn"
            v-on:click="state.scoreModalOpen = false"
            >Close</label
          >
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from "vue";
import _ from "lodash";
import type { Answer, State, Question } from "@/interfaces/quiz.interfaces";

const state: State = reactive({
  questions: [],
  answers: {
    multi: {},
    single: [],
  },
  maxScore: 11,
  incompleteQuiz: false,
  processing: false,
  scoreModalOpen: false,
  score: 0,
});

onMounted(async () => {
  const response = await fetch("http://localhost:8000/quiz");
  const jsonRes = await response.json();
  state.questions = jsonRes.data;
  prepareMultiQuestionState();
});

const calculateScore = () => {
  let multiSum = 0;
  let singleSum = 0;
  for (const el in state.answers.multi) {
    multiSum = _.sumBy(state.answers.multi[el], (a: Answer) => a.points);
  }
  singleSum = _.sumBy(state.answers.single, (a: Answer) => a.points);
  return Math.round(((singleSum + multiSum) * 100) / 11);
};

const onSubmitForm = async () => {
  const isValid = validateQuiz();
  if (!isValid) return false;
  state.score = calculateScore();
  state.processing = true;
  const response = await fetch(
    `http://localhost:8000/quiz/score?score=${state.score}`,
    {
      method: "POST",
    }
  );
  if (response.status == 201) {
    state.processing = false;
    state.scoreModalOpen = true;
    resetQuiz();
  }
};

const prepareMultiQuestionState = () => {
  const multi = state.questions.filter(
    (q: Question, i) => q.type == "multiple_choice"
  );

  multi.forEach((q: Question, i) => {
    const k = q.id - 1;
    state.answers.multi["q" + k] = [];
  });
};

const resetQuiz = () => {
  state.answers.single = [];
  state.answers.multi = {};
  prepareMultiQuestionState();
};

const validateQuiz = () => {
  const numQuestions = state.questions.length;
  let multiSelected = 0;
  const singleChoiceQuestions = state.questions.filter(
    (q) => q.type == "single_choice"
  ).length;
  const multChoiceQuestions = numQuestions - singleChoiceQuestions;

  for (const a in state.answers.multi) {
    if (state.answers.multi[a].length > 0) {
      multiSelected++;
    }
  }
  if (
    state.answers.single.length < state.questions.length &&
    multiSelected < multChoiceQuestions
  ) {
    state.incompleteQuiz = true;
    return false;
  } else {
    state.incompleteQuiz = false;

    return true;
  }
};
</script>
