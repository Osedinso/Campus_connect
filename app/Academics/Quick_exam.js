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
import HomeHeader from "../../components/HomeHeader";


const QuickExam = () => {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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
            prompt: `Generate 5 multiple choice questions based on this text: "${inputText}"
            
Format EXACTLY like this example:
1. [Question text here]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
Answer: [Correct letter]

2. [Next question]
[And so on...]

Make sure each question has exactly 4 options labeled A) B) C) D) and clearly state the correct answer after each question with "Answer: [letter]"`
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.error || 'An error occurred while generating questions');
      }

      const data = await response.json();
      console.log('Raw AI Response:', data.aiResponse);
      const parsedQuestions = parseGPTResponse(data.aiResponse);
      console.log('Parsed Questions:', parsedQuestions);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Error calling chatCompletion function:', error);
      setError(error.message || 'An error occurred while generating questions');
    } finally {
      setLoading(false);
    }
  };

// And replace the parseGPTResponse function with this simpler version:

const parseGPTResponse = (content) => {
    const questions = [];
    let currentQuestion = null;

    // Split content into lines and remove empty lines
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    
    for (const line of lines) {
        // Question starts with a number followed by a dot
        if (/^\d+\./.test(line)) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                question: line.replace(/^\d+\.\s*/, ''),
                options: [],
                correct_answer: null
            };
        }
        // Option line starts with A) B) C) D)
        else if (/^[A-D]\)/.test(line)) {
            if (currentQuestion) {
                const letter = line[0];
                const text = line.slice(2).trim();
                currentQuestion.options.push({
                    letter: letter,
                    text: text
                });
            }
        }
        // Answer line
        else if (/^Answer:\s*[A-D]$/i.test(line)) {
            if (currentQuestion) {
                currentQuestion.correct_answer = line.slice(-1).toUpperCase();
            }
        }
    }

    // Don't forget the last question
    if (currentQuestion && currentQuestion.options.length > 0) {
        questions.push(currentQuestion);
    }

    // Debug log
    console.log('Parsed questions:', questions);
    
    return questions;
};

  const handleSelectOption = (questionIndex, optionLetter) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: optionLetter
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
        <Text style={[
          styles.optionText,
          isSelected && styles.selectedOptionText,
          isSubmitted && isCorrect && styles.correctOptionText,
          isIncorrect && styles.incorrectOptionText,
        ]}>
          {option.letter}) {option.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <HomeHeader />
        <View style={styles.inputSection}>
          <Text style={styles.title}>Quick Exam Generator</Text>

          <View style={styles.inputContainer}>
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
                  <Text style={styles.buttonText}>Generating...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Generate Questions</Text>
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
                  <Text style={[
                    styles.feedbackText,
                    selectedAnswers[index] === question.correct_answer
                      ? styles.correctFeedback
                      : styles.incorrectFeedback
                  ]}>
                    {selectedAnswers[index] === question.correct_answer
                      ? '✓ Correct!'
                      : `✗ Incorrect. Correct answer: ${question.correct_answer}`}
                  </Text>
                )}
              </View>
            ))}

            {Object.keys(selectedAnswers).length === questions.length && !isSubmitted && (
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    minHeight: 120,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#d93025',
  },
  generateButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdbdbd',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  questionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#2c3e50',
  },
  optionsContainer: {
    marginBottom: 8,
  },
  option: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  correctOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  incorrectOption: {
    backgroundColor: '#ffebee',
    borderColor: '#ef5350',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2196f3',
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#4caf50',
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: '#ef5350',
    fontWeight: '500',
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  correctFeedback: {
    color: '#4caf50',
  },
  incorrectFeedback: {
    color: '#ef5350',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButton: {
    backgroundColor: '#2196f3',
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
    color: '#333',
    marginBottom: 16,
  },
});

export default QuickExam;