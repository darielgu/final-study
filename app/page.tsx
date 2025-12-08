"use client";

import { useEffect, useMemo, useState } from "react";
import bankData from "@/data/bank.json";

type ChoiceKey = string;

type Question = {
  number: number;
  question: string;
  choices: Record<ChoiceKey, string>;
  correct_answer: ChoiceKey;
  why_correct: string;
  why_incorrect: Record<ChoiceKey, string>;
};

type Category = {
  category: string;
  questions: Question[];
};

type Quiz = {
  categories: Category[];
};

type QuizBank = Record<string, Quiz | undefined>;

type EnrichedQuestion = Question & { category: string };

const quizOrder = ["quiz1", "quiz2", "quiz3"];

const quizBank = bankData as QuizBank;

const formatQuizLabel = (id: string) => id.replace("quiz", "Quiz ");

export default function Home() {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(
    quizBank.quiz1 ? "quiz1" : null
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo<EnrichedQuestion[]>(() => {
    if (!activeQuizId || !quizBank[activeQuizId]) return [];
    const quiz = quizBank[activeQuizId];
    if (!quiz) return [];
    return quiz.categories
      .flatMap((category) =>
        category.questions.map((question) => ({
          ...question,
          category: category.category,
        }))
      )
      .sort((a, b) => a.number - b.number);
  }, [activeQuizId]);

  useEffect(() => {
    // Reset progress when swapping quizzes.
    setQuestionIndex(0);
    setSelectedChoice(null);
    setFinished(false);
    setSubmitted(false);
  }, [activeQuizId]);

  const currentQuestion = questions[questionIndex];
  const isCorrect =
    submitted && selectedChoice && currentQuestion
      ? selectedChoice === currentQuestion.correct_answer
      : false;
  const wrongReason =
    submitted &&
    selectedChoice &&
    currentQuestion &&
    selectedChoice !== currentQuestion.correct_answer
      ? currentQuestion.why_incorrect?.[selectedChoice]
      : null;

  const handleSelect = (choice: ChoiceKey) => {
    setSelectedChoice(choice);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!selectedChoice) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setSubmitted(false);
      return;
    }
    setFinished(true);
  };

  const hoverCopy = (choice: ChoiceKey) => {
    if (!currentQuestion) return "";
    return choice === currentQuestion.correct_answer
      ? currentQuestion.why_correct
      : currentQuestion.why_incorrect?.[choice] ??
          "That option is off the mark.";
  };

  const readyToSubmit = Boolean(selectedChoice);
  const noQuestionsLoaded = activeQuizId && questions.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10 sm:px-8 lg:px-12 ">
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-50">
              Pick your quiz
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {quizOrder.map((quizId) => {
              const available = Boolean(quizBank[quizId]);
              const isActive = activeQuizId === quizId;
              return (
                <button
                  key={quizId}
                  type="button"
                  onClick={() => setActiveQuizId(quizId)}
                  className={`group flex items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition duration-200 ${
                    isActive
                      ? "border-slate-100 bg-slate-800 shadow-md shadow-slate-900/40"
                      : "border-slate-800 bg-slate-900 hover:border-slate-600"
                  } ${!available ? "opacity-70" : ""}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-semibold text-slate-50">
                      {formatQuizLabel(quizId)}
                    </span>
                    <p className="text-sm text-slate-400">
                      {available
                        ? "Curated questions with instant explanations."
                        : "Content will land here next."}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition ${
                      isActive
                        ? "border-slate-100 bg-black text-white"
                        : "border-slate-700 bg-slate-800 text-slate-50"
                    }`}
                  >
                    &gt;
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-md">
          {!activeQuizId && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
              <p className="text-lg font-semibold">
                Pick a quiz to get started.
              </p>
              <p className="text-sm text-slate-400">
                You will see one question at a time with instant feedback.
              </p>
            </div>
          )}

          {noQuestionsLoaded && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
              <p className="text-lg font-semibold">
                No questions available for this quiz yet.
              </p>
              <p className="text-sm text-slate-400">
                Pick another quiz while this one is being prepared.
              </p>
            </div>
          )}

          {!noQuestionsLoaded &&
            activeQuizId &&
            currentQuestion &&
            !finished && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      {formatQuizLabel(activeQuizId)}
                    </span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {currentQuestion.category}
                    </span>
                  </div>
                  <span className="text-sm text-slate-400">
                    Question {questionIndex + 1} of {questions.length}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-inner">
                  <p className="text-lg font-semibold text-slate-50">
                    {currentQuestion.question}
                  </p>
                </div>

                <div className="grid gap-3">
                  {Object.entries(currentQuestion.choices).map(
                    ([key, value]) => {
                      const isPicked = selectedChoice === key;
                      const isCorrectChoice =
                        key === currentQuestion.correct_answer;
                      const statusClass =
                        submitted && isPicked
                          ? isCorrectChoice
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-50 shadow-sm shadow-emerald-900/40"
                            : "border-rose-500 bg-rose-500/10 text-rose-50 shadow-sm shadow-rose-900/40"
                          : isPicked
                          ? "border-slate-100 bg-slate-900 text-slate-50 shadow-sm"
                          : "border-slate-800 bg-slate-900 text-slate-50 hover:border-slate-600 hover:bg-slate-800";

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelect(key)}
                          className={`group relative flex items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition ${statusClass}`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              {key}
                            </span>
                            <span className="text-base font-medium text-slate-50">
                              {value}
                            </span>
                          </div>
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-200">
                            {isPicked ? "OK" : ">"}
                          </div>
                    {submitted && (
                      <div className="pointer-events-none absolute -top-3 right-3 translate-y-[-100%] rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 opacity-0 shadow-lg transition duration-200 group-hover:opacity-100">
                        {hoverCopy(key)}
                      </div>
                    )}
                        </button>
                      );
                    }
                  )}
                </div>

                {isCorrect && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-3 text-emerald-50">
                    <span className="mt-0.5 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-50">
                      Nice
                    </span>
                    <p className="text-sm">{currentQuestion.why_correct}</p>
                  </div>
                )}

                {wrongReason && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-rose-50">
                    <span className="mt-0.5 rounded-full bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-50">
                      Not quite
                    </span>
                    <p className="text-sm">{wrongReason}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-200" />
                    {submitted
                      ? "Hover to see why each option is right or wrong."
                      : "Submit first, then hover to see reasoning."}
                  </div>
                  {!submitted && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!readyToSubmit}
                      className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                        readyToSubmit
                          ? "bg-slate-100 text-slate-900 hover:bg-white"
                          : "cursor-not-allowed bg-slate-800 text-slate-600"
                      }`}
                    >
                      Submit
                    </button>
                  )}
                  {submitted && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
                    >
                      {questionIndex === questions.length - 1
                        ? "Finish"
                        : "Next"}
                      <span className="text-base">&gt;</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          {finished && (
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500 bg-emerald-500/10 p-8 text-emerald-50 shadow-sm">
              <h3 className="text-2xl font-semibold">
                Nice run through{" "}
                {activeQuizId ? formatQuizLabel(activeQuizId) : "Quiz"}.
              </h3>
              <p className="text-sm text-emerald-100">
                Keep the streak going - pick another quiz or replay this one to
                reinforce the explanations.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuestionIndex(0);
                    setSelectedChoice(null);
                    setFinished(false);
                  }}
                  className="rounded-full bg-white text-emerald-900 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-100"
                >
                  Replay this quiz
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuizId(null)}
                  className="rounded-full border border-emerald-400 bg-transparent px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/10"
                >
                  Pick another quiz
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
