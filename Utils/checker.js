//this check function returns a promise according to the code and the input 
var fs = require("fs");
const dotenv = require("dotenv");
var exec = require("child_process").exec;
var mongoose = require("mongoose");
var {QuesTillNowSchema,TestCaseSchema,QuestionSchema,UserSubmissionDataSchema} = require("../Schema/Schemas.js")
// var initcode = `import sys \nsys.stdin = open('input'+sys.argv[1]+'.txt', 'r')\nstdoutOrigin=sys.stdout\nsys.stdout = open("log.txt", "w")\n`;
var initcode = ""
dotenv.config({ path: "../config/config.env" });
const Check = (_code, _input, _reqOut, qid, userId) => {
    return new Promise((resolve, reject) => {
      // console.log(req.body);
      let uid = Math.ceil(Math.random() * 9000);
      // code = "print(input()//2)"
      // input =  "\"" +  req.body.input + "\"";
      //input =  input.split('\n').join("\"\\n\"")
  
      let input = _input;
    //   input = '"' + input + '"';
    //   input = input.split("\n").join('"\n"');
  
      // console.log("input",input);
      code = _code;
  
      fs.writeFile("./file" + uid + ".py", code, function (err) {
        if (err) {
          return console.log(err);
        }
        // console.log("codefile creation completed");
        fs.writeFile("./input" + uid + ".txt", input, function (err) {
          if (err) {
            return console.log(err);
          }
          exec(
            "docker run --name " + uid + " -it -d "+ process.env.DOCKER_IMAGE,
            (e, stdout, stderr) => {
              if (e instanceof Error) {
                // res.send(r)
                return;
              }
              cid = stdout.toString();
              // console.log(`docker cp input${uid}.txt ${uid}:/app`)
              // console.log("docker server running",cid);
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
  
                              UserSubmissionData = mongoose.model(
                                "UserSubmissionData",
                                UserSubmissionDataSchema
                              );
  
                              if (qid) {
                                userdata = new UserSubmissionData({
                                  userId: userId,
                                  questionId: qid,
                                  userCode: _code,
                                  userInput: _input,
                                  userOutput: sout,
                                });
                                userdata.save();
                              }
                              if (sout.slice(-3) == "%E%")
                                resolve({
                                  status: "Compilation Error",
                                  output: sout,
                                  requiredOutput: _reqOut,
                                  input: _input,
                                });
                              // if(qid)qid = qid;
                              //  else
                              // _reqOut= _reqOut.slice(0,-1);
                              // sout=  sout.slice(0,-2);
                              // console.log("bug",sout);
                              // console.log("output",stdout.toString());
                              // res.send(sout);
                              // resolve(sout);
                              // console.log("bug-"+_input);
  
                              if (sout === _reqOut + "\n")
                                resolve({
                                  status: "test passed",
                                  output: sout,
                                });
                              else {
                                // console.log("bug-"+sout+" "+ _reqOut+"\n")
                                // console.log("bug-"+_reqOut+" "+sout);
                                resolve({
                                  status: "failed",
                                  output: sout,
                                  requiredOutput: _reqOut,
                                  input: _input,
                                });
                              }
                              exec("docker stop " + uid, (e, stdout, stderr) => {
                                if (e instanceof Error) {
                                  //	res.send(sout);
                                  return;
                                }
  
                                exec("docker rm " + uid, (e, stdout, stderr) => {
                                  if (e instanceof Error) {
                                    //									res.send(sout);
                                    // reject(sout);
                                    return;
                                  }
  
                                  //	res.send(sout);
                                  // console.log("output",stdout.toString());
                                  // res.send(stdout.toString())
                                });
  
                                // console.log("output",stdout.toString());
                                // res.send(stdout.toString())
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
  };
  module.exports = Check