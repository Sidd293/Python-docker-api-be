const mongoose =require("mongoose");

// const QuesTillNowSchema = new mongoose.Schema({
//     name: String,
//     counter: Number,
//   });
  
  const TestCaseSchema = new mongoose.Schema(
    {
      questionId: String,
      input: String,
      requiredOutput: String,
    },
    { timestamps: true }
  );
  const QuestionSchema = new mongoose.Schema(
    {
      questionTitle  :  String,
      questionStatement: String,
      
      questionSolution: String,
      questionNumber: Number,
    },
    { timestamps: true }
  );
  const UserSubmissionDataSchema = new mongoose.Schema(
    {
      userId: String,
      questionId: mongoose.Schema.ObjectId,
      userCode: String,
      userInput: String,
      userOutput: String,
    },
    { timestamps: true }
  );
  module.exports =  {TestCaseSchema,QuestionSchema,UserSubmissionDataSchema}