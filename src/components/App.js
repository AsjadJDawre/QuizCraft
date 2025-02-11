import Header from './Header';
import Main from './Main';
import Loader from './Loader';
import Error from './Error';
import StartScreen from './StartScreen';
import Progress from './Progress';
import Question from './Question';
import Footer from './Footer';
import Timer from './Timer';
import NextButton from './NextButton';
import FinishScreen from './FinishScreen';





import { useEffect, useReducer, useState } from "react";
import "../index.css";
// Initial state for useReducer
const initialState = {
  questions: [
    {
      question: "What is the purpose of React's `useState` hook?",
      options: [
        "To handle side effects in functional components",
        "To manage and update local component state",
        "To interact with the DOM directly",
        "To create reusable components",
      ],
      correctOption: 1,
      points: 5,
    },
    {
      question: "Which method is used to update the state in a React class component?",
      options: [
        "setState",
        "useState",
        "updateState",
        "stateUpdater",
      ],
      correctOption: 0,
      points: 5,
    },
    {
      question: "What is the Virtual DOM in React?",
      options: [
        "A virtual browser environment for React components",
        "An in-memory representation of the real DOM",
        "A tool to manage global state",
        "A replacement for the actual DOM",
      ],
      correctOption: 1,
      points: 5,
    },
    {
      question: "What does the `useEffect` hook do in React?",
      options: [
        "Handles lifecycle events like component mounting and unmounting",
        "Fetches data from APIs",
        "Directly updates the DOM",
        "Allows state management in functional components",
      ],
      correctOption: 0,
      points: 10,
    },
    {
      question: "What is the purpose of the `key` attribute in a list of elements?",
      options: [
        "To identify the type of list items",
        "To improve rendering performance by uniquely identifying elements",
        "To define the order of list elements",
        "To store metadata for list elements",
      ],
      correctOption: 1,
      points: 10,
    },
    {
      question: "Which hook would you use for memoizing expensive calculations in React?",
      options: [
        "useEffect",
        "useMemo",
        "useState",
        "useReducer",
      ],
      correctOption: 1,
      points: 10,
    },
    {
      question: "What does React's `StrictMode` do?",
      options: [
        "Renders components faster by bypassing lifecycle methods",
        "Detects potential issues in an application and provides warnings",
        "Improves accessibility for screen readers",
        "Adds security checks to prevent XSS attacks",
      ],
      correctOption: 1,
      points: 5,
    },
    {
      question: "What is the purpose of `React.Fragment`?",
      options: [
        "To return multiple elements without adding extra nodes to the DOM",
        "To fetch data from APIs more efficiently",
        "To provide default props for a component",
        "To manage global application state",
      ],
      correctOption: 0,
      points: 5,
    },
    {
      question: "What is the default behavior of `useReducer` in React?",
      options: [
        "It fetches and manages API data",
        "It provides an alternative to `useState` for complex state logic",
        "It directly updates the DOM tree",
        "It manages asynchronous operations",
      ],
      correctOption: 1,
      points: 10,
    },
    {
      question: "What is the primary purpose of React's Context API?",
      options: [
        "To handle side effects in components",
        "To avoid prop drilling by sharing data across components",
        "To manage form inputs and validation",
        "To enhance the rendering performance of components",
      ],
      correctOption: 1,
      points: 10,
    },
  ],
  status: "ready", // 'loading', 'error', 'ready', 'active', 'finished'
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};
const SECS_PER_QUESTION = 30;
// Reducer function to handle actions
function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };

    case "dataFailed":
      return {
        ...state,
        status: "error",
      };
      case "ADD":
        return {
          ...state,
          showAddQuestion: !state.showAddQuestion, // Toggle visibility
        };
  
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };

    case "newAnswer":
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };

    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };

    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };

    case "restart":
      return { 
        ...initialState, 
        questions: state.questions, // Retain the current questions
        status: "ready" 
      };

    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        highscore:
          state.secondsRemaining === 0
            ? state.points > state.highscore
              ? state.points
              : state.highscore
            : state.highscore,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };

    case "addQuestion":
      const updatedQuestions = [...state.questions, action.payload];
      const limitedQuestions =
        updatedQuestions.length > 50
          ? updatedQuestions.slice(updatedQuestions.length - 50)
          : updatedQuestions;

      localStorage.setItem("questions", JSON.stringify(limitedQuestions));
      return {
        ...state,
        questions: limitedQuestions,
      };

    default:
      throw new Error("Action unknown");
  }
}


// New Question Form Component
function NewQuestionForm({ dispatch }) {
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: null,
    points: null,
  });

  const [step, setStep] = useState(1); // To control the step of the form

  const [errors, setErrors] = useState({
    question: false,
    options: [false, false, false, false],
    correctOption: false,
    points: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setNewQuestion((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };


//   Danger Delete Operation do not uncomment this code ( Only for testing purposes )
  // function deleteQuestionsFromLocalStorage() {
  //   // Retrieve the questions from local storage
  //   const questions = JSON.parse(localStorage.getItem("questions")) || [];
  
  //   // Filter out the questions numbered 16, 17, and 18
  //   const updatedQuestions = questions.filter((question, index) => {
  //     // Assuming the index starts from 0 and the questions are 0-indexed
  //     return index !== 15 && index !== 16 ; // Deleting questions 16, 17, 18 (index 15, 16, 17)
  //   });
  
  //   // Save the updated questions back to local storage
  //   localStorage.setItem("questions", JSON.stringify(updatedQuestions));
  // }
  
  // // Call the function to delete the questions
  // deleteQuestionsFromLocalStorage();
  




  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!newQuestion.question.trim()) {
          setErrors((prev) => ({ ...prev, question: true }));
          return false;
        }
        setErrors((prev) => ({ ...prev, question: false }));
        return true;
      case 2:
      case 3:
      case 4:
      case 5:
        if (!newQuestion.options[step - 2].trim()) {
          const newOptionErrors = [...errors.options];
          newOptionErrors[step - 2] = true;
          setErrors((prev) => ({ ...prev, options: newOptionErrors }));
          return false;
        }
        const newOptionErrors = [...errors.options];
        newOptionErrors[step - 2] = false;
        setErrors((prev) => ({ ...prev, options: newOptionErrors }));
        return true;
      case 6:
        if (newQuestion.correctOption === "" || isNaN(newQuestion.correctOption)) {
          setErrors((prev) => ({ ...prev, correctOption: true }));
          return false;
        }
        setErrors((prev) => ({ ...prev, correctOption: false }));
        return true;
      case 7:
        if (!newQuestion.points.trim() || isNaN(newQuestion.points)) {
          setErrors((prev) => ({ ...prev, points: true }));
          return false;
        }
        setErrors((prev) => ({ ...prev, points: false }));
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleSubmitQuestion = () => {
    if (validateCurrentStep()) {
      // Convert correctOption and points to numbers
      const questionToAdd = {
        ...newQuestion,
        correctOption: Number(newQuestion.correctOption), // Convert to number
        points: Number(newQuestion.points), // Convert to number
      };
  
      // Dispatch action to add the question
      dispatch({ type: "addQuestion", payload: questionToAdd });
  
      // Reset form after submission
      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        correctOption: "",
        points: "",
      });
      setStep(1);
    }
  };
  
  return (
      <div  className="p-4 border relative -z-10 rounded-lg shadow-lg bg-[#343a40]">
      <h2 className="text-xl font-semibold mb-4">Add New Question</h2>

      {step === 1 && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Enter Question:
          </label>
          <input
            type="text"
            name="question"
            value={newQuestion.question}
            onChange={handleInputChange}
            className={`w-full p-2 border ${errors.question ? 'border-red-500' : 'border-gray-300'} text-black rounded-md`}
            placeholder="Enter question"
          />
          {errors.question && (
            <p className="text-red-500 text-sm">Question is required.</p>
          )}
          <button
            onClick={handleNextStep}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Next
          </button>
        </div>
      )}

      {step > 1 && step <= 5 && (
        <div>
          <label className="block mb-2 text-sm font-medium text-black">
            Enter Option {step - 1}:
          </label>
          <input
            type="text"
            value={newQuestion.options[step - 2]}
            onChange={(e) => handleOptionChange(step - 2, e.target.value)}
            className={`w-full p-2 border ${errors.options[step - 2] ? 'border-red-500' : 'border-gray-300'} text-black rounded-md`}
            placeholder={`Option ${step - 1}`}
          />
          {errors.options[step - 2] && (
            <p className="text-red-500 text-sm">Option {step - 1} is required.</p>
          )}
          <button
            onClick={handleNextStep}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Next
          </button>
        </div>
      )}

      {step === 6 && (
        <div>
          <label className="block mb-2 text-sm font-medium text-black">
            Enter Correct Option (0-3):
          </label>
          <input
            type="number"
            name="correctOption"
            value={newQuestion.correctOption}
            onChange={handleInputChange}
            className={`w-full p-2 border ${errors.correctOption ? 'border-red-500' : 'border-gray-300'} text-black rounded-md`}
            placeholder="Correct Option"
          />
          {errors.correctOption && (
            <p className="text-red-500 text-sm">Correct option must be a valid number.</p>
          )}
          <button
            onClick={handleNextStep}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Next
          </button>
        </div>
      )}

      {step === 7 && (
        <div>
          <label className="block mb-2 text-sm font-medium text-black">
            Enter Points:
          </label>
          <input
            type="number"
            name="points"
            value={newQuestion.points}
            onChange={handleInputChange}
            className={`w-full p-2 border ${errors.points ? 'border-red-500' : 'border-gray-300'}  text-black rounded-md`}
            placeholder="Points"
          />
          {errors.points && (
            <p className="text-red-500 text-sm">Points must be a valid number.</p>
          )}
          <button
            onClick={handleSubmitQuestion}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Save Question
          </button>
        </div>
        
      )}
      
    </div>
    
  );

};



export default function App() {
  const [{ questions, status, index, points, answer, secondsRemaining, highscore }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const savedQuestions = localStorage.getItem("questions");
    if (savedQuestions) {
      dispatch({ type: "dataReceived", payload: JSON.parse(savedQuestions) });
    }
  }, []);

  console.log(questions); // Check the entire array
  questions.forEach((question, index) => {
    console.log(`Question ${index + 1}: Points = ${question.points}`); // Log each question's points
  });
  
  const maxPossiblePoints = questions.reduce((prev, cur) => {
    const points = typeof cur.points === 'number' && !isNaN(cur.points) ? cur.points : 0; // Validating points
    return prev + points;
  }, 0);
  
  console.log(`Max Possible Points: ${maxPossiblePoints}`)
  return (
    <div className="App">
      <div className="wrapper">
        <div className="app">
          <div className="headerWrapper">
            <Header />
            <Main>
              {status === "loading" && <Loader />}
              {status === "error" && <Error />}
              {status === "ready" && (
                <StartScreen numQuestions={questions.length} dispatch={dispatch} />
              )}
              {status === "active" && (
                <>
                  <Progress
                    index={index}
                    numQuestions={questions.length}
                    points={points}
                    maxPossiblePoints={maxPossiblePoints}
                    answer={answer}
                  />
                  <Question
                    question={questions[index]}
                    dispatch={dispatch}
                    answer={answer}
                  />
                  <Footer>
                    <Timer
                      dispatch={dispatch}
                      secondsRemaining={secondsRemaining}
                    />
                    <NextButton
                      dispatch={dispatch}
                      answer={answer}
                      numQuestions={questions.length}
                      index={index}
                    />
                  </Footer>
                </>
              )}
              {status === "finished" && (
                <FinishScreen
                  points={points}
                  maxPossiblePoints={maxPossiblePoints}
                  highscore={highscore}
                  dispatch={dispatch}
                />
              )}
            </Main>
          </div>
        </div>
      </div>
      {status === "ready" && <NewQuestionForm dispatch={dispatch} />}
    </div>
  );
}