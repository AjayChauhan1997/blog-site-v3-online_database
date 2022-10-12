const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//const url='mongodb://localhost:27017/blogsiteDB';
const url="mongodb+srv://admin-ajay:123@cluster0.khdy3lr.mongodb.net/blogSite?retryWrites=true&w=majority"
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});
const db=mongoose.connection;
db.on("error",()=>{console.log("db not connected!")});
db.once("open",function(){
    console.log("success in db connection");
});


var adminLoginStatus = "off";



const blogSchema = new mongoose.Schema({
  postTittle: {
    type: String,
    min: 1,
    required: [true, "Fail! Post has no tittle. "]
  },
  postArticle: {
    type: String,
    min: 1,
    required: [true, "Fail! Post has no body."]
  }

});

const adminSchema = new mongoose.Schema({
  usertype: { type: String },
  adminEmail: {
    type: String,
    min: 8,
    required: [true, "Fail! Post has no tittle. "]
  },
  adminPassword: {
    type: String,
    min: 8,
    required: [true, "Fail! Post has no body."]
  },
  firstName: { type: String },
  lastName: { type: String },
  git: { type: String },

});

const admin = mongoose.model("admin", adminSchema);
const blogPost = mongoose.model("blogPost", blogSchema);

admin.find({}, function (err, admn) {
  if (admn.length === 0) {
    const newAdmin = new admin({
      usertype: "admin",
      adminEmail: "admin@gmail.com",
      adminPassword: "12345678",
      firstName: "null",
      lastName: "null",
      git: "null",
    });

    newAdmin.save(function (err, result) {
      if (err) {
        console.log(err);
      } else {console.log(result); }
    });
  } else { }
});

app.get('/', function (req, res) {
  blogPost.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      var notAnyPost = [];
      res.render(__dirname + "/views/home.ejs", { allPost: notAnyPost });
    } else {
      res.render(__dirname + "/views/home.ejs", { allPost: foundItems });
    }
  });
});

app.get("/about", function (req, res) {
   
});
app.get("/contact", function (req, res) {
  admin.find({},function(err,profile){
    if(err){
      res.render(__dirname + "/views/contact.ejs",{fname:" ",lname:" ",email:" "});
    }else{
      res.render(__dirname + "/views/contact.ejs",{fname:profile[0].firstName,lname:profile[0].lastName,email:profile[0].adminEmail,git:profile[0].git});
    }
   });
  
  
});
app.get("/reset-admin-profile", function (req, res) {
  if (adminLoginStatus === "on") {
    res.render(__dirname + "/views/adminProfile.ejs", { signupMsg: "" });
  } else {
    res.render(__dirname + "/views/login.ejs", { msg: " ",msgTrue:" " });
  }

});

app.post("/reset-admin-profile", function (req, res) {
  if (adminLoginStatus === "on") {
    admin.find({ usertype: "admin" }, function (err, origonalAdmin) {
          var id=origonalAdmin[0]._id;
      if (!err) {
        if(origonalAdmin[0].adminPassword === req.body.password){
          if(req.body.new_password === req.body.confirm_new_password){
             admin.updateOne({_id:id},{
              usertype: "admin",
              adminEmail: req.body.email,
              adminPassword: req.body.new_password,
              firstName: req.body.first_name,
              lastName: req.body.last_name,
              git: req.body.git,
            },function(err){
              if(err){
                console.log(err);
                res.render(__dirname + "/views/adminProfile.ejs", { signupMsg: "Something went wrong try again!" });

              }else{
                adminLoginStatus="off";
                res.render(__dirname + "/views/login.ejs", { msg:" ",msgTrue: "Profile updated successfully" });
 
              }
            });
            

          }
          else{
            res.render(__dirname + "/views/adminProfile.ejs", { signupMsg: "New password and current password not matched!" });

          }


        } else{
          res.render(__dirname + "/views/adminProfile.ejs", { signupMsg: "You entered wrong password!" });
        }
        
      
      } else {      }
    });
    
  } else {
    res.render(__dirname + "/views/login.ejs", { msgTrue:" " ,msg: " " });
  }
});




app.post("/logout", function (req, res) {
  adminLoginStatus = "off";
  res.render(__dirname + "/views/login.ejs", { msgTrue:" ",msg: " " });
});



app.post('/', function (req, res) {

  const blogNewPost = new blogPost({
    postTittle: req.body.composetittle,
    postArticle: req.body.composepost
  });
  blogNewPost.save(function (err, result) {
    if (err) {
      blogPost.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
          var notAnyPost = [];
          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: " ", msg1: "Post tittle or post field can't be blank!", msg2: " ", allPost: notAnyPost });
        } else {

          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", msg1: "Post tittle or post field can't be blank!", msg2: " ", composeheading2: "Your Posts", allPost: foundItems });
        }
      });
    }
    else {
      blogPost.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
          var notAnyPost = [];
          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: " ", msg1: " ", msg2: "Post Sucessfully!", allPost: notAnyPost });
        } else {

          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", msg1: " ", msg2: "Post Sucessfully!", composeheading2: "Your Posts", allPost: foundItems });
        }
      });
    }
  });
});

app.get("/login", function (req, res) {

  if (adminLoginStatus === "on") {
    blogPost.find({}, function (err, foundItems) {
      if (foundItems.length === 0) {
        var notAnyPost = [];
        res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: " ", msg1: " ", msg2: " ", allPost: notAnyPost });

      } else {
        res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: " ", msg1: " ", msg2: " ", allPost: foundItems });

      }
    });

  } else {

    res.render(__dirname + "/views/login.ejs", { msgTrue:" " ,msg: " " });


  }
});
app.post("/login", function (req, res) {




  admin.find({}, function (err, origonalAdmin) {

    if (!err) {
      origonalAdmin.forEach(function (adminDetails) {
        if (adminDetails.adminEmail === req.body.id && adminDetails.adminPassword === req.body.pass) {
          adminLoginStatus = "on";

        } else {

        }
      });
    }
  });

  setTimeout(function () {

    if (adminLoginStatus === "on") {
      blogPost.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
          var notAnyPost = [];
          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: " ", msg1: " ", msg2: " ", allPost: notAnyPost });

        } else {
          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: " ", msg1: " ", msg2: " ", allPost: foundItems });

        }
      });

    } else {

      res.render(__dirname + "/views/login.ejs", { msgTrue:" ",msg: "* Login faild try again to continue! " });


    }
  }, 500);
});


app.post('/check', function (req, res) {
  blogPost.find({ _id: req.body.button }, function (err, ParticularPost) {
    ParticularPost.forEach(function (parpost) {
      var a = parpost;
      res.render("post", { posttittle: parpost });
    });
  });
});

app.post('/delete', function (req, res) {

  blogPost.findOneAndDelete(({ _id: req.body.button }), function (err, docs) {
    if (err) {
      blogPost.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
          var notAnyPost = [];
          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", msg1: "Try Again!", composeheading2: " ", msg2: " ", allPost: notAnyPost });
        } else {

          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: "Your Posts", msg1: "Try Again!", msg2: " ", allPost: foundItems });
        }
      });
    }
    else {

      blogPost.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
          var notAnyPost = [];
          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", composeheading2: " ", msg1: " ", msg2: "Post Deleted Sucessfully!", allPost: notAnyPost });
        } else {

          res.render(__dirname + "/views/compose.ejs", { tittle: "Compose", msg1: " ", msg2: "Post Deleted Sucessfully!", composeheading2: "Your Posts", allPost: foundItems });
        }
      });
    }
  });
});


let port=process.env.PORT;
if(port == null || port==""){
    port=3000;
} 

app.listen(port, function () {
    console.log("SERVER IS  RUNNING  ");
});