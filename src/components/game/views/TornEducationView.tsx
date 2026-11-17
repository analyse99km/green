'use client';

import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { GraduationCap, Award, BookOpen, CheckCircle, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { EducationCourse } from '../types';

export default function TornEducationView() {
  const { player, startEducation, submitExam } = useGame();
  const [selectedCourse, setSelectedCourse] = useState<EducationCourse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [examResult, setExamResult] = useState<{ message: string; success: boolean } | null>(null);

  const handleStartExam = (course: EducationCourse) => {
    setSelectedCourse(course);
    setSelectedAnswers(new Array(course.examQuestions.length).fill(-1));
    setExamResult(null);
  };

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    const updated = [...selectedAnswers];
    updated[qIdx] = oIdx;
    setSelectedAnswers(updated);
  };

  const handleSubmitExam = () => {
    if (!selectedCourse) return;
    const res = submitExam(selectedCourse.id, selectedAnswers);
    setExamResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Education Hall Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h2 className="text-xl font-bold text-white">Metropolis Academy & Professional Licensing</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Citizens are not born doctors, police officers, or corporate executives. You must enroll in rigorous curriculum courses, fulfill prerequisite working stats, and <strong>pass official examinations</strong> to unlock licensed professions and deeds.
            </p>
          </div>

          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 text-xs font-mono">
            <span className="text-neutral-500 block text-[10px]">Your Current Role</span>
            <span className="text-emerald-400 font-bold">{player.role}</span>
          </div>
        </div>
      </div>

      {/* Interactive Exam Modal / Section */}
      {selectedCourse && (
        <div className="bg-neutral-900 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 uppercase">
                Official Examination
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{selectedCourse.title}</h3>
              <p className="text-xs text-neutral-400">Answer all questions correctly (100% score) to unlock: <strong>{selectedCourse.unlocksProfession}</strong></p>
            </div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-neutral-400 hover:text-white text-xs px-3 py-1 rounded-lg bg-neutral-800 cursor-pointer"
            >
              Close Exam
            </button>
          </div>

          {examResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                examResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              }`}
            >
              {examResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{examResult.message}</span>
            </div>
          )}

          {/* Exam Questions List */}
          <div className="space-y-4">
            {selectedCourse.examQuestions.map((q, qIdx) => (
              <div key={qIdx} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Q{qIdx + 1}: {q.question}
                </span>

                <div className="space-y-1.5 pl-5">
                  {q.options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedAnswers[qIdx] === oIdx
                          ? 'bg-indigo-950/50 border-indigo-500 text-white font-medium'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${qIdx}`}
                        checked={selectedAnswers[qIdx] === oIdx}
                        onChange={() => handleSelectOption(qIdx, oIdx)}
                        className="accent-indigo-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitExam}
            disabled={selectedAnswers.includes(-1)}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
              !selectedAnswers.includes(-1)
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Submit Examination Answers for Grading
          </button>
        </div>
      )}

      {/* Courses Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {player.educationCourses.map((course) => {
          return (
            <div
              key={course.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between shadow-sm transition-all ${
                course.examPassed
                  ? 'bg-neutral-900 border-emerald-500/40 shadow-emerald-950/20'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                      {course.category === 'LAW' ? '⚖️' : course.category === 'MEDICINE' ? '🏥' : course.category === 'COMMERCE' ? '🏢' : '🥷'}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{course.title}</h4>
                      <span className="text-[10px] font-mono uppercase text-indigo-400">
                        {course.category} DEPT
                      </span>
                    </div>
                  </div>

                  {course.examPassed ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Certified
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-400">
                      Unlocks: {course.unlocksProfession}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-400 my-3 leading-relaxed">{course.description}</p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80">
                {course.examPassed ? (
                  <div className="text-center py-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                    ✓ Qualification Passed & Profession Active
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartExam(course)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Sit for Qualification Exam (3 Questions)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
