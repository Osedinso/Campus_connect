// screens/QuickExam.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import HomeHeader from '../../components/HomeHeader';

const QuickExam = () => {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);

  useEffect(() => {
    console.log('questions state updated:', questions);
  }, [questions]);

  const generateQuestions = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedAnswers({});
    setIsSubmitted(false);

    try {
      const response = await fetch(
        'https://chatcompletion-fv2fp2wjea-uc.a.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Generate ${questionCount} multiple choice questions based on this text: "${inputText}"
            
Format EXACTLY like this example:
1. [Question text here]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
Answer: [Correct letter]

2. [Next question]
[And so on...]

Make sure each question has exactly 4 options labeled A) B) C) D) and clearly state the correct answer after each question with "Answer: [letter]"`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(
          errorData.error ||
            'An error occurred while generating questions'
        );
      }

      const data = await response.json();
      console.log('Raw AI Response:', data.aiResponse);
      const parsedQuestions = parseGPTResponse(data.aiResponse);
      console.log('Parsed Questions:', parsedQuestions);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Error calling chatCompletion function:', error);
      setError(
        error.message || 'An error occurred while generating questions'
      );
    } finally {
      setLoading(false);
    }
  };

  const parseGPTResponse = (content) => {
    const questions = [];
    let currentQuestion = null;

    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      if (/^\d+\./.test(line)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line.replace(/^\d+\.\s*/, ''),
          options: [],
          correct_answer: null,
        };
      } else if (/^[A-D]\)/.test(line)) {
        if (currentQuestion) {
          const letter = line[0];
          const text = line.slice(2).trim();
          currentQuestion.options.push({
            letter: letter,
            text: text,
          });
        }
      } else if (/^Answer:\s*[A-D]$/i.test(line)) {
        if (currentQuestion) {
          currentQuestion.correct_answer = line.slice(-1).toUpperCase();
        }
      }
    }

    if (currentQuestion && currentQuestion.options.length > 0) {
      questions.push(currentQuestion);
    }

    console.log('Parsed questions:', questions);
    return questions;
  };

  const handleSelectOption = (questionIndex, optionLetter) => {
    if (!isSubmitted) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionIndex]: optionLetter,
      }));
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSelectedAnswers({});
  };

  const getScore = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const renderOption = (option, questionIndex, question) => {
    const isSelected = selectedAnswers[questionIndex] === option.letter;
    const isCorrect = question.correct_answer === option.letter;
    const isIncorrect = isSubmitted && isSelected && !isCorrect;

    return (
      <TouchableOpacity
        key={option.letter}
        style={[
          styles.option,
          isSelected && styles.selectedOption,
          isSubmitted && isCorrect && styles.correctOption,
          isIncorrect && styles.incorrectOption,
        ]}
        onPress={() => handleSelectOption(questionIndex, option.letter)}
        disabled={isSubmitted}
      >
        <Text
          style={[
            styles.optionText,
            isSelected && styles.selectedOptionText,
            isSubmitted && isCorrect && styles.correctOptionText,
            isIncorrect && styles.incorrectOptionText,
          ]}
        >
          {option.letter}) {option.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HomeHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.title}>Quick Exam Generator</Text>

          <View style={styles.inputContainer}>
            {/* Question Count Selector */}
            <View style={styles.questionCountContainer}>
              <Text style={styles.questionCountLabel}>
                Number of Questions
              </Text>
              <View style={styles.questionCountButtonsContainer}>
                {[3, 5, 7, 10].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.questionCountButton,
                      questionCount === count && styles.questionCountButtonActive,
                    ]}
                    onPress={() => setQuestionCount(count)}
                  >
                    <Text
                      style={[
                        styles.questionCountButtonText,
                        questionCount === count && styles.questionCountButtonTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              multiline
              numberOfLines={6}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Enter your text here to generate questions..."
              style={styles.textInput}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={generateQuestions}
              disabled={loading || !inputText.trim()}
              style={[
                styles.generateButton,
                (loading || !inputText.trim()) && styles.disabledButton,
              ]}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.buttonText}>
                    Generating {questionCount} Questions...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Generate {questionCount} Questions
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {questions.length > 0 && (
          <View style={styles.questionsContainer}>
            <Text style={styles.sectionTitle}>Questions</Text>
            {questions.map((question, index) => (
              <View key={index} style={styles.questionCard}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.question}
                </Text>
                <View style={styles.optionsContainer}>
                  {question.options.map((option) =>
                    renderOption(option, index, question)
                  )}
                </View>
                {isSubmitted && (
                  <Text
                    style={[
                      styles.feedbackText,
                      selectedAnswers[index] === question.correct_answer
                        ? styles.correctFeedback
                        : styles.incorrectFeedback,
                    ]}
                  >
                    {selectedAnswers[index] === question.correct_answer
                      ? '✓ Correct!'
                      : `✗ Incorrect. Correct answer: ${question.correct_answer}`}
                  </Text>
                )}
              </View>
            ))}

            {Object.keys(selectedAnswers).length === questions.length &&
              !isSubmitted && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Submit Answers</Text>
                </TouchableOpacity>
              )}

            {isSubmitted && (
              <View style={styles.resultsContainer}>
                <Text style={styles.scoreText}>
                  Score: {getScore()} out of {questions.length}
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Tailwind gray-100
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // Tailwind gray-800
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  questionCountContainer: {
    marginBottom: 16,
  },
  questionCountLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151', // Tailwind gray-700
    marginBottom: 8,
  },
  questionCountButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionCountButton: {
    flex: 1,
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  questionCountButtonActive: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
  },
  questionCountButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  questionCountButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB', // Tailwind gray-50
    minHeight: 120,
    fontSize: 16,
    color: '#374151',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2', // Tailwind red-100
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#B91C1C', // Tailwind red-700
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF', // Tailwind gray-400
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  questionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Tailwind gray-800
    marginBottom: 16,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#F9FAFB', // Tailwind gray-50
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Tailwind gray-200
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    color: '#111827', // Tailwind gray-900
  },
  optionsContainer: {
    marginBottom: 8,
  },
  option: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
  },
  selectedOption: {
    backgroundColor: '#DBEAFE', // Tailwind blue-100
    borderColor: '#3B82F6', // Tailwind blue-500
  },
  correctOption: {
    backgroundColor: '#D1FAE5', // Tailwind green-100
    borderColor: '#10B981', // Tailwind green-500
  },
  incorrectOption: {
    backgroundColor: '#FEE2E2', // Tailwind red-100
    borderColor: '#EF4444', // Tailwind red-500
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#1E40AF', // Tailwind blue-800
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#065F46', // Tailwind green-800
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: '#B91C1C', // Tailwind red-700
    fontWeight: '500',
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  correctFeedback: {
    color: '#10B981', // Tailwind green-500
  },
  incorrectFeedback: {
    color: '#EF4444', // Tailwind red-500
  },
  submitButton: {
    backgroundColor: '#10B981', // Tailwind green-500
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resultsContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Tailwind gray-800
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#3B82F6', // Tailwind blue-500
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default QuickExam;
