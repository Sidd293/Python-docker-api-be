<H3>SETUP</H3>

reuirements for the system -\
Docker , MongoDB , Nodejs , ram > 4gb

1. Build Image
   goto DockerImage folder and build the image out of the dockerfile as name pythonml\
   (TIP:you can change the image name inside the config folder too)

```

docker build -t pythonml

```

2. Install the modules using 'npm i' if not installed and run the server using the

```
npm start
```

<H3>DOCUMENTATION</H3>

API endpoints pay loads:

(a postman collection is also available for testing APIs)
<a href = "https://www.getpostman.com/collections/3b5d9566451f14b9094d">Json postman collection Link</a>

1.route : /compileCode
useCase : its for random compilation of any random code for playground.
method: post
content-type: json
payloads:
request body -

data :

```
 {
code : "code in base64",
input : "input in base64",
userId :  "userId",
}
```

output:

```

  {
  status: "error/passed/compiled",
  data{
      output:"result of the code from user or error if any"
  }
}
```

2.route : /checkAgainstInput/<question_id>\
useCase : this end point will run the user code and master solution code to same problem and for the user\ input and tell whether the code is correct for that input or not.(point 1.g from requirements doc)\
method: post\
content-type : json\
payloads: \
 request body -\
 data:

```
   {
"code" :"userCode in base64",
"input": "user input in base64",
"userId" : "ID of the user",
}
```

response body:

```
{
    "status":"passed/failed/compilation_error",
    "data" : {
        "output": "Output of the code over the user input",
    }
}
```

3.route: /submit/<question_id> \
 useCase : run the user case over all the edge test cases present in the master database and tell if the code ran on all of them or not.\
 method - POST
payloads-

request body -

```

{
"code" :"user's code in base64",
"userId" :"ID  of the user",
}
```

response:

```
{
status:accepted/wrong_ans,
data:[
{
  "input":"input of testcase_1",
  "status": "passed/failed/error",
  "output" : "output for code in base64",
  "requiredOutput" : "required output if the output didnot matched",

}
,{
  "input":"input of testcase_2",
  "status": "passed/failed/error",
  "output" : "output for code in base64",
  "requiredOutput" : "required output if the output didnot matched",

}

]

  }

```

ADMIN RIGHTS

4.route : "/addQuestion"\
 useCase : "for adding a question and testcases to the master branch of the code",\
 method: POST\
 payloads :\
 request body - \

```
{ questionTitle :"question title",
  questionStatement:"question statement description",
  questionSolution : "code in base64",
  testCases:[
      {
          input:" input in (base64) "
          output:"output in (base64)"
      }
      ],
  teseCases : [
      {
          input:"input in base64",
          requiredOutput:"in base64"
      }
  ]


}
```

output:

```
{
status :"failed/added"
{
 data:{
//the whole data as entered.
 }
}

}
```

5. Get a question\
   route : /question/<question_id>\
   usecase: To view the particular question and the testcases involved with it\
   method: GET\
   request body-(BLANK)\
   response-

```
    {

    "question": {
        "_id": "636e53157cb51b507bc033bc",
        "questionTitle": "Product",
        "questionStatement": "Wap to to input 2 numbers and print their product",
        "questionSolution": "a = int(input())\nb = int(input())\nprint(a*b)",
        "createdAt": "2022-11-11T13:50:13.264Z",
        "updatedAt": "2022-11-11T13:50:13.264Z",
        "__v": 0
    },
    "testCases": [
        {
            "_id": "testCaseID",
            "questionId": "QuestionId",
            "input": "input",
            "requiredOutput": "required output for it",
            "createdAt": "creation time",
            "updatedAt": "updation time",
            "__v": 0
        }]

    }
```

6. Get a particular test case\
   route: /testcase/<testcase_id>\
   usecase : To View the details of a particular testcase\
   method: GET\
   request body- (BLANK)\
   response body\

```
    {
    "_id": "TESTCASE ID",
    "questionId": "Question ID",
    "input": "INPUT",
    "requiredOutput": "REQUIRED OUTPUT",
    "createdAt": "CREATION TIME",
    "updatedAt": "UPDATION TIME",
    "__v": 0
    }
```

7.  UPDATE a particular question\
    usecase: to update a question details \
    route : /question/<question_id> \
    method:PUT\
    content-type: json\
    request body -\
    data (either of the title statement and solition is not a mandatory field )

```
  {
   "questionTitle" :"NEW TITLE",
   "questionStatement": "NEW QUESTION STATEMENT",
   "questionSolution":"New Question SOLUTION(base64)"
 }
```

response - New Question details

8.  UPDATE a particular testcase\
    usecase: to update a testcase details\
    route : /question/<testcase_id>\
    method:PUT\
    content-type: json\
    request body - \
    data

```
  {
     "input" :"new input (BASE64)"
     "requiredOutput" : "new required output(base64)"
 }
```

response : new testcase Details

9. Delete a aparticular question\
   usecase : to delete a particular question along with its testcases\
   route : /question/<question_id>\
   method : DELETE\
   request body - (BLANK)\
   response body:

   ```
   {
    "question": {
        "acknowledged": true,
        "deletedCount": 1
    },
    "testCases": {
        "acknowledged": true,
        "deletedCount": 7
    }
   }
   ```

10. Delete a particular testcase\
     usecase : to delete a particular testcase\
     route: /testcase/<testcase_id>\
     method : DELETE \
     request body :(BLANK)\
    response body :

```
    {
    "message": "test case deleted successfully"
    }
```

11. Get all questions \
    usecase :used to list down all the questions\
    route : /AllQuestions\
    method :GET\
    request body - (BLANK)\
    RESPONSE -

```
      {
    "message": "list  of  all  questiions",

    "data": [
        {
            "_id": "636e60077e376d6dd38cd928",
            "questionTitle": "Product",
            "questionStatement": "Wap to to input 2 numbers and print their product",
            "questionSolution": "a = int(input())\nb = int(input())\nprint(a*b)",
            "createdAt": "2022-11-11T14:45:27.266Z",
            "updatedAt": "2022-11-11T14:45:27.266Z",
            "__v": 0
            }
        ]
    }
```
