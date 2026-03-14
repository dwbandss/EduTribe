'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, CheckCircle, XCircle, RotateCcw, Save, Volume2 } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface TutorResponse {
  explanation: string;
  examples: string[];
  quiz: QuizQuestion[];
}

export default function AITutor() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('English');
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  const subjects = [
    'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Geography', 'Computer Science', 'Social Studies'
  ];

  const levels = [
    '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
    '11th Grade', '12th Grade'
  ];

  const languages = [
    'English', 'Hindi', 'Odia', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'
  ];

  const askTutor = async () => {
    if (!question.trim() || !subject || !level) {
      return;
    }

    setLoading(true);
    setShowResults(false);
    setQuizAnswers({});
    
    try {
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, subject, level, language })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResponse(data.data);
        }
      }
    } catch (error) {
      console.error('Error asking tutor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
  };

  const saveNotes = () => {
    if (response) {
      const notes = `Subject: ${subject}\nLevel: ${level}\nQuestion: ${question}\n\nExplanation:\n${response.explanation}\n\nExamples:\n${response.examples.join('\n')}`;
      setSavedNotes(prev => [...prev, notes]);
    }
  };

  const getScore = () => {
    if (!response) return 0;
    let correct = 0;
    response.quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">AI Tutor</h1>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Ask Your Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(lvl => (
                  <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Ask your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={askTutor} 
            disabled={loading || !question.trim() || !subject || !level}
            className="w-full"
          >
            {loading ? 'Getting Response...' : 'Ask Tutor'}
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tutor Response</span>
              <Button size="sm" variant="outline" onClick={saveNotes}>
                <Save className="w-4 h-4 mr-2" />
                Save Notes
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Explanation */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Explanation
              </h3>
              <p className="text-gray-700 leading-relaxed">{response.explanation}</p>
            </div>

            {/* Examples */}
            <div>
              <h3 className="font-semibold mb-2">Examples</h3>
              <div className="space-y-2">
                {response.examples.map((example, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Quiz</h3>
                <div className="flex gap-2">
                  {showResults && (
                    <>
                      <Badge variant="outline">
                        Score: {getScore()}/{response.quiz.length}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={resetQuiz}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {response.quiz.map((quizItem, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium mb-3">{quizItem.question}</p>
                    <div className="space-y-2">
                      {quizItem.options.map((option, optionIndex) => {
                        const optionLetter = option.charAt(0);
                        const isSelected = quizAnswers[index] === optionLetter;
                        const isCorrect = showResults && optionLetter === quizItem.correctAnswer;
                        const isWrong = showResults && isSelected && optionLetter !== quizItem.correctAnswer;

                        return (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded cursor-pointer border ${
                              isSelected ? 'bg-blue-100 border-blue-300' : 'bg-gray-50'
                            } ${isCorrect ? 'bg-green-100 border-green-300' : ''} ${
                              isWrong ? 'bg-red-100 border-red-300' : ''
                            }`}
                            onClick={() => !showResults && handleQuizAnswer(index, optionLetter)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {showResults && (
                                <span>
                                  {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                  {isWrong && <XCircle className="w-4 h-4 text-red-600" />}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {!showResults && (
                <Button 
                  onClick={checkAnswers}
                  className="w-full mt-4"
                  disabled={Object.keys(quizAnswers).length !== response.quiz.length}
                >
                  Check Answers
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Notes */}
      {savedNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedNotes.map((note, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{note}</pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
