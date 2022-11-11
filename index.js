const dotenv = require("dotenv");
var express = require("express");
var exec = require("child_process").exec;
var base64 = require('base64-utf8');

var fs = require("fs");
var app = express();
var mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const Check = require("./Utils/checker")
var {
 
  TestCaseSchema,
  QuestionSchema,
  UserSubmissionDataSchema,
} = require("./Schema/Schemas.js");
var cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config({ path: "./config/config.env" });
app.use(bodyParser.json());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});




question = {
  quesStatement: "",
  questionSolution: "",
};


testCases = [
  {
    quesId: "",
    input: "",
    reqOutput: "",
  },
  {
    quesId: "",
    input: "",
    reqOutput: "",
  },
  {
    quesId: "",
    input: "",
    reqOutput: "",
  },
];



app.get("/checkAgainstInput/:id", async (req, res) => {
  // code  = req.body.code;
  input = req.body.input;
  try{

  
  input = base64.decode(input)
  }
  catch{
    res.status(402).send({
      message:"input is needed to be encoded in base64",
    })
  }
  // req.body.code
  try{

  
  req.body.code = base64.decode(req.body.code)
  }
  catch{
    res.status(402).send({
      message:"code is needed to be encoded in base64 before passing",
    })
    return ;
  }
  userId = req.body.userId;
  questionId = req.params.id;
  if (!userId || !questionId) {
    res.status(404).send({
      message: `${req.body.code ? "" : "code,"} ${
        questionId ? "" : "questionId,"
      } ${userId ? "" : "userId"} not recieved`,
    });
    return;
  }
  Question = mongoose.model("Question", QuestionSchema);
  actualSolution = "";
  Question.findById(req.params.id)
    .then((result) => {
      if (result == null) {
        res.status(404).send({
          status: "failed",
          message: "question not found, check the id",
        });
        return;
      }
      actualSolution = result.questionSolution;
      console.log(result);
      Check(actualSolution, input, "", "", "")
        .then((e) => {
          e.output = e.output.slice(0, -1);
          Check(req.body.code, input, e.output, questionId, userId)
            .then((e) => {
              res.status(200).send(e);
            })
            .catch((e) => {
              res.status(400).send(e);
            });
        })
        .catch((e) => res.send(e));
    })
    .catch((e) => {
      res.status(404).send({
        status: "failed",
        message: "question not found, check the id",
      });
      return;
    });

  // _code,_input,_reqOut,qid
});
app.post("/addQuestion", async (req, res) => {
  Question = mongoose.model("Question", QuestionSchema);
  TestCase = mongoose.model("TestCase", TestCaseSchema);
  // QuesTillNow = mongoose.model("QuesTillNow", QuesTillNowSchema);
  let id;
  num = 0;
  // await QuesTillNow.findOne({ name: "python" }).then(
  //   (res) => (num = res.counter)
  // );

  question = req.body.question;
  // question.questionNumber = num + 1;
  testCases = req.body.testCases;
  if (!question.questionTitle) {
    res.status(404).send({
      message: "title  missing",
    });
    return;
  }

  if (!question.questionStatement) {
    res.status(404).send({
      message: "statement  missing",
    });
    return;
  }

  try{
    question.questionSolution = base64.decode(question.questionSolution)
  }
  catch{
    res.status(200).send({
message:"needed a base64 encoded question Solution",
    });
    return;
  }

  

  if (!question.questionSolution) {
    res.status(404).send({
      message: "solution  missing",
    });
    return;
  }

  ques = new Question(question);
  // await QuesTillNow.findOneAndUpdate({ name: "python" }, { counter: num + 1 });
  await ques.save().then((res) => (id = res._id));

  for (i = 0; i < testCases.length; i++) {
    try{
    testCases[i].input = base64.decode(testCases[i].input);
  }
  catch{
    res.status(401).send({
message:"needed a base64 encoded input in the given test case number"+i+1,
    });
    return ;
  }

  try{
    testCases[i].requiredOutput = base64.decode(testCases[i].requiredOutput);
  }
  catch{
    res.status(401).send({
message:"needed a base64 encoded required output in the given test case number"+i+1,
    });
    return ;
  }

    
    testCases[i].questionId = id;
    test = new TestCase(testCases[i]);
    {
      await test.save();
    }
  }

  await res.send("all questions saved");
});
app.post("/submit/:id", async (req, res) => {
  let code = req.body.code;
  // console.log(code);

  


  try{
    code = base64.decode(code)
  }
  catch{
res.status(400).send({
  message:"code is needed to be encoded in base64 before passing"
});
return ;
  }
  if (!req.body.userId || !req.params.id) {
    res.status(400).send({
      message: `${req.body.code ? "" : "code,"} ${
        req.params.id ? "" : "questionId,"
      } ${req.body.userId ? "" : "userId"} not recieved`,
    });
    return;
  }
  let TestCase = mongoose.model("TestCase", TestCaseSchema);

  // console.log("req.params.id",req.params.id);
  TestCase.find({ questionId: req.params.id })
    .then((result) => {
      if (result.length == 0) {
        console.log(result);
        res.status(400).send({ message: "question not found id error" });
        return;
      } else {
        // promiseArr = [Check("print(\"hello1\")","inp1","hello1"),Check("print(\"hello1\")","inp1","hello1"),Check("print(\"hello1\")","inp1","hello1")];
        promiseArr = [];
        for (i = 0; i < result.length; i++) {
          promiseArr.push(
            Check(
              code,
              result[i].input,
              result[i].requiredOutput,
              req.params.id,
              req.body.userId
            )
          );
        }
        // for(i = 0 ;i <testDocArr[i];i++)
        // {
        // promiseArr[i].then(e=>console.log("output is", e));
        // }
        acc = true;
        Promise.all(promiseArr)
          .then((values) => {
            console.log(values);
            values.forEach((element) => {
              if (element.status !== "test passed") {
                acc = false;
              }
            });
            res.json({
              status: acc ? "accepted" : "not passed",
              output: values,
            });
          })
          .catch((e) => {
            console.log(e);
            res.json({ status: "not accepted", output: e });
          });
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(400).send({ message: "question not found , database error" });
      return;

      // res.send("invalid id");
    });

  // res.send("hello");
});
// const app = express();

app.get("/AllQuestions", (req, res) => {
  Question = mongoose.model("Question", QuestionSchema);
  Question.find({})
    .then((r) =>
      res.status(200).send({ message: "list  of  all  questiions", data: r })
    )
    .catch((e) =>
      res.status(500).send({
        message: "internal  server  error",
      })
    );
});


app.get("/Question/:id", (req, res) => {
  id = req.params.id;

  Question = mongoose.model("Question", QuestionSchema);
  TestCase = mongoose.model("TestCase", TestCaseSchema);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send({
      message: "Invalid  Id  please  check",
    });

    return;
  }
  Question.findById(id).then((ques) => {
    if (ques == null) {
      res.status(404).send({ message: "question not found invalid id" });
    }
    TestCase.find({ questionId: id }).then((testcases) => {
      res.status(200).send({
        question: ques,
        testCases: testcases,
      });
    });
  });
});
app.delete("/testcase/:id", (req, res) => {
  TestCase = mongoose.model("TestCase", TestCaseSchema);
  id = req.params.id;
  if (req.params.id == null) {
    res
      .status(404)
      .send({ message: "test case not found not found invalid id" });
    return;
  }

  TestCase.deleteOne({ _id: id })
    .then((r) => {
      res.status(202).send({
        message: "test case deleted successfully",
      });
    })
    .catch((e) => {
      res.status(404).send({
        message: "cant find the required test case",
      });
    });
});

app.get("/testcase/:id", (req, res) => {
  TestCase = mongoose.model("TestCase", TestCaseSchema);
  id = req.params.id;
  if (req.params.id == null) {
    res
      .status(404)
      .send({ message: "test case not found not found invalid id" });
    return;
  }

  TestCase.findOne({ _id: id })
    .then((r) => {
      if (r == null) {
        res.status(404).send({
          message: "cant find the required test case invalid id",
        });
        return;
      }
      res.status(202).send(r);
    })
    .catch((e) => {
      res.status(404).send({
        message: "cant find the required test case",
      });
    });
});

app.put("/testcase/:id", (req, res) => {
  id = req.params.id;
  // console.log("oan	")
  Question = mongoose.model("Question", QuestionSchema);
  TestCase = mongoose.model("TestCase", TestCaseSchema);
  if (id == null) {
    res.status(404).send({ message: "testcase not found" });
    return;
  }
  if(req.body.questionSolution)
  {

    try {
    req.body.questionSolution = base64.decode(req.body.questionSolution);
    }
    catch{
      res.status(400).send({
        message:"question solution is needed to be in base64"
      })
    return ;
    }
  }
  TestCase.update({ _id: id }, req.body)
    .then((r) => {
      if (r == null) {
        res.status(404).send({ message: "testcase not found" });
        return;
      } else res.status(200).send({ message: "testcase updated" });
    })
    .catch((e) => {
      res.status(404).send({ message: "testcase not found" });
    });
});

app.put("/question/:id", (req, res) => {
  id = req.params.id;
  Question = mongoose.model("Question", QuestionSchema);
  TestCase = mongoose.model("TestCase", TestCaseSchema);
  if (id == null) {
    res.status(404).send({ message: "Question not found" });
    return;
  }
  if(req.body.input)
  {

    try {
    req.body.input = base64.decode(req.body.input);
    }
    catch{
      res.status(400).send({
        message:"input is needed to be in base64"
      });
    return ;
    }
  }

  if(req.body.requiredOutput)
  {

    try {
    req.body.requiredOutput = base64.decode(req.body.requiredOutput);
    }
    catch{
      res.status(400).send({
        message:"required output is needed to be in base64"
      });
    return;
    }

  }
  Question.update({ _id: id }, req.body)
    .then((r) => {
      if (r == null) {
        res.status(404).send({ message: "Question not found" });
        return;
      } else res.status(200).send({ message: "Question updated" });
    })
    .catch((e) => {
      res.status(404).send({ message: "Question not found" });
    });
});
app.delete("/question/:id", (req, res) => {
  id = req.params.id;

  Question = mongoose.model("Question", QuestionSchema);
  TestCase = mongoose.model("TestCase", TestCaseSchema);

  Question.deleteOne({ _id: id })
    .then((ques) => {
      // if(ques==null){
      // 	res.status(404).send({message : "question not found invalid id"})
      // }
      TestCase.deleteMany({ questionId: id }).then((testcases) => {
        res.status(200).send({
          question: ques,
          testCases: testcases,
        });
      });
    })
    .catch((e) => {
      res.status(404).send({ message: "question not found invalid id" });
    });
});
app.use(express.static(path.join(__dirname, "client/build")));

// An api endpoint that returns a short list of items
// var initcode = `import sys \nsys.stdin = open('input'+sys.argv[1]+'.txt', 'r')\nstdoutOrigin=sys.stdout\nsys.stdout = open("log.txt", "w")\n`;
var initcode =""
app.post("/compileCode", (req, res) => {
  console.log(req.body);
  userId = req.body.userId;
  let uid = Math.ceil(Math.random() * 9000);
  // code = "print(input()//2)"
  // input =  "\"" +  req.body.input + "\"";
  //input =  input.split('\n').join("\"\\n\"")
  input = req.body.input;
  try{
 input = base64.decode(input)
  }
  catch{
res.status(500).send({
  message :"input must be sent as base64 encoded"
})
return ;
  }
  
  if (userId == null) {
    res.status(400).send({
      message: "userid not given",
    });
    return;
  }

  // input = '"' + input + '"';
  // input = input.split("\n").join('"\n"');

  console.log("input", input);
  code = req.body.code;
// code = base64.decode(code);

try{
  code = base64.decode(code);
}
catch{
res.status(402).send({
  message:"the input code is needed to be base64 encoded"
});
return ;
}
console.log("code is "+code);
  fs.writeFile("./file" + uid + ".py", code, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("codefile creation completed");
    fs.writeFile("./input" + uid + ".txt", input, function (err) {
      if (err) {
        return console.log(err);
      }
      exec(
        "docker run --name " + uid + " -it -d " + process.env.DOCKER_IMAGE,
        (e, stdout, stderr) => {
          if (e instanceof Error) {
            // res.send(r)
            return;
          }
          cid = stdout.toString();
          console.log(`docker cp input${uid}. ${uid}:/app`);
          console.log("docker server running", cid);
          exec(
            "docker cp file" + uid + ".py " + uid + ":/app",
            (e, stdout, stderr) => {
              if (e instanceof Error) {
                console.log(stderr.toString());
                return;
              }
              console.log("file copied");

              exec(
                "docker cp input" + uid + ".txt " + uid + ":/app",
                (e, stdout, stderr) => {
                  if (e instanceof Error) {
                    console.log(stdout.toString());
                    return;
                  }
                  console.log("file copied");
                  console.log("docker exec " + uid + " node rce.js " + uid);
                  exec(
                    "docker exec " + uid + " node rce " + uid,
                    (e, stdout, stderr) => {
                      if (e instanceof Error) {
                        // res.send(r)
                        return;
                      }
                      // let serr = ""
                      let sout = "";
                      exec(
                        "docker exec " + uid + " tail log.txt",
                        (e, stdout, stderr) => {
                          if (e instanceof Error) {
                            // res.send(r)
                            // res.send(stderr.toString())
                            sout = stderr.toString();
                            console.log(stderr);
                            return;
                          }
                          sout = stdout.toString();

                          console.log("output", stdout.toString());
                          console.log("//////////////////////////////////////")
                          if (sout.slice(-3) == "%E%")
                            res.status(400).send({
                              status: "Failed Compilation",
                              data: {
                                output: sout,
                              },
                            });
                          // res.send(sout);
                          else
                            res.status(202).send({
                              status: "compiled successfully",
                              data: {
                                output: sout,
                              },
                            });
                          UserSubmissionData = mongoose.model(
                            "UserSubmissionData",
                            UserSubmissionDataSchema
                          );
                          userdata = new UserSubmissionData({
                            userId: userId,

                            userCode: code,
                            userInput: input,
                            userOutput: sout,
                          });
                          userdata.save();
                          exec("docker stop " + uid, (e, stdout, stderr) => {
                            if (e instanceof Error) {
                              //	res.send(sout);
                              return;
                            }

                            exec("docker rm " + uid, (e, stdout, stderr) => {
                              if (e instanceof Error) {
                                return;
                              }
                            });
                          });
                        }
                      );

                      console.log(stdout.toString());
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});



const port = 5000;
app.listen(port);

console.log("App is listening on port " + port);
