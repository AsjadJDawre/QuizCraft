function StartScreen({ numQuestions, dispatch ,setAddQuestion}) {
  const handleAddQuestionClick = () => {
    setAddQuestion((prevState) => !prevState); // Toggle the state
    dispatch({ type: "start" })
  };
  return (
    <div className="start">
      <h2>Welcome to The React Quiz!</h2>
      <h3>{numQuestions} questions to test your React mastery</h3>
      <button
        className="btn btn-ui"
        onClick={handleAddQuestionClick}
      >
        Let's start
      </button>
      {/* <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "ADD" })}
      >
        Add New Question
        </button> */}
    </div>
  );
}

export default StartScreen;
