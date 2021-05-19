//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { Passport } = require("passport");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/instaDefDB",{useNewUrlParser:true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const topicDefSchema = new mongoose.Schema({
  defOn: String,
  definition: String 
});
// const topicDef = mongoose.model("topicDef",topicDefSchema);

//For User authentication
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  realName: String
});

userSchema.plugin(passportLocalMongoose);
const user = new mongoose.model("user", userSchema);

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

                              //For Admin authentication
// const adminSchema = new mongoose.Schema({
//   username: String,
//   password: String
// });

// adminSchema.plugin(passportLocalMongoose);
// const admin = new mongoose.model("admin", adminSchema);

// passport.use(admin.createStrategy());

// passport.serializeUser(admin.serializeUser());
// passport.deserializeUser(admin.deserializeUser());



const defaultDef1 = {
  defOn: "What is Computer?",
  definition: "A computer is a programmable machine designed to sequentially and automatically carry out a sequence of arithmetic or logical operations."
};
const defaultDef2 = {
  defOn: "What is Hardware?",
  definition: "Hardware covers all of those parts of a computer that are tangible objects. displays, power supplies, cables, keywords, printers all are hardware. "
};
const defaultDef3 = {
  defOn: " What is software?",
  definition: "Software is a collection of computer programs and related data that provide the instructions for telling a computer what to do and how to do it."
};
const defaultDefs = [defaultDef1,defaultDef2,defaultDef3];

const topicSchema = new mongoose.Schema({
  topicName: String,
  topicDesc: String,
  topicDefs:[topicDefSchema],
  creatorUserName: String,
  creatorRealName: String
});
const topic = mongoose.model("topic", topicSchema);

//Start of Home section
app.get("/",(req,res)=>{
    if(req.isAuthenticated()){
      const isLogin = true;
        topic.find({},(err,findTopics)=>{
          if(findTopics.length === 0)
          {
            const Topic = new topic({
              topicName:"DefaultTopic",
              topicDesc:"It is Used for rendering the default data",
              topicDefs:defaultDefs,
              creatorUserName: "Default Creator",
              creatorRealName: "Default Creator"
            });
            Topic.save();  
            res.redirect("/");
          }
          else{
              res.render("home", {topics:findTopics, isLogin:isLogin});
            console.log("Default is there.");
          }
        });
    }else{
      res.redirect("/login");
    }
    
});

//Start of contact and about section
app.get("/contact",(req,res)=>{
  if(req.isAuthenticated()){
    const isLogin = true;
    res.render("contact", {contactUsDetails:contactContent,isLogin:isLogin});
  }else{
    const isLogin = false;
    res.render("login", {isLogin:isLogin});
  }
});
app.get("/about",(req,res)=>{
  if(req.isAuthenticated()){
    const isLogin = true;
    res.render("about", {aboutDetails:aboutContent,isLogin:isLogin});
  }else{
    const isLogin = false;
    res.render("login", {isLogin:isLogin});
  }
});

//Start of User Section
app.get("/login",(req,res)=>{
  if(req.isAuthenticated()){
    res.redirect("/");
  }else{
    const isLogin = false;
    res.render("login" ,{isLogin:isLogin});
  }
});

app.post("/login",(req,res)=>{

  const User = new user({
    username:req.body.username,
    password:req.body.password
  });

  req.login(User, (err)=>{
    if(err)
    {
      console.log(err);
    }else{
      passport.authenticate('local')(req, res, ()=>{
        res.redirect("/");
      });
    }
    
  });

});


app.get("/signup",(req,res)=>{
  if(req.isAuthenticated()){
    res.redirect("/");
  }else{
  const isLogin = false;
  res.render("signup" ,{isLogin:isLogin});
  }
});

app.post("/signup",(req,res)=>{
  user.register({username: req.body.username}, req.body.password,(err,user)=>{
    if(err){
      console.log(err);
      res.redirect("/login");
    }else{
      passport.authenticate("local")(req, res,()=>{
        res.redirect("/");
      });
    }
  });
});


app.get("/userProfile", (req,res)=>{
 if(req.isAuthenticated()){
   const email = req.user.username;
   const realName = req.user.realName;
  res.render("userProfile",{realName:realName, email:email, isLogin:true});
 }else{
   res.redirect("/login");
 }
});

app.get("/editUserProfile",(req,res)=>{
  if(req.isAuthenticated()){
  const email = req.user.username;
  const realName = req.user.realName;
  res.render("editUserProfile",{realName:realName, email:email, isLogin:true});
  }else{
    res.redirect("/login");
  }
});

app.post("/editUserProfile", (req,res)=>{
  if(req.isAuthenticated()){

      const username = req.body.username;
    const realName = req.body.realName;
    user.findOne({username:username},(err,findUser)=>{
      if(err){
        console.log(err);
      }else{
        findUser.realName = realName;
        findUser.save();
        res.redirect("/userProfile");
      }
    });
  }else{
    res.redirect("/login");
  }
});

app.get("/addUserTopic", (req,res)=>{
 if(req.isAuthenticated()){
  res.render("addUserTopic", {isLogin:true, message:""});
 }else{
   res.redirect("/login");
 }
});

app.post("/addUserTopic", (req,res)=>{
  if(req.isAuthenticated()){
const topicName = req.body.topicName;
const topicDesc = req.body.topicDesc;
const initialDefOn1 = req.body.initialDefOn1;
const initialDefOn2 = req.body.initialDefOn2;
const initialDef1 = req.body.initialDef1;
const initialDef2 = req.body.initialDef2;
const definitionInfo1 = {
  defOn: initialDefOn1,
  definition: initialDef1
};
const definitionInfo2 = {
  defOn: initialDefOn2,
  definition: initialDef2
};
const defArr = [definitionInfo1,definitionInfo2];

// console.log(defArr);

topic.findOne({topicName:topicName, creatorUserName:req.user.username},(err,foundTopic)=>{
  if(err){
    const message = "error";   
    res.render("addUserTopic", {isLogin:true, message:message});
  }else{
    if(foundTopic != null){
      const message = "exist";   
      res.render("addUserTopic", {isLogin:true, message:message});
      // console.log(foundTopic);
    }else{
      const newTopic = new topic({
        topicName:topicName,
        topicDesc:topicDesc,
        topicDefs:defArr,
        creatorUserName:req.user.username,
        creatorRealName:req.user.realName
      });
      newTopic.save();
      // console.log(foundTopic);
   const message = "success";   
   res.render("addUserTopic", {isLogin:true,message:message});
    }
  }
  
});

  }else{
    res.redirect("/login");
  }

});

app.get("/addUserDefinitions", (req,res)=>{
if(req.isAuthenticated()){
  res.render("addUserDefinitions",{isLogin:true,isPresent:"true",message:""});
}else{
  res.redirect("/login");
}
});

app.post("/addUserDefinitions",(req,res)=>{
  if(req.isAuthenticated()){
     const topicName = req.body.topicName;
     const defOn = req.body.defOn;
     const def = req.body.def;
     const creatorUserName = req.user.username;
     topic.findOne({topicName:topicName, creatorUserName:creatorUserName},(err,foundTopic)=>{
       if(err){
        //  console.log(err);
         res.render("addUserDefinitions",{isLogin:true,isPresent:"true",message:"error"});
       }
       else{
         if(foundTopic != null){
           const newDef = {
             defOn : defOn,
             definition : def   
           };
          foundTopic.topicDefs.push(newDef);
          foundTopic.save();
          res.render("addUserDefinitions",{isLogin:true,isPresent:"true",message:"success"});
          // console.log("Successfully added...!",creatorUserName);
         }else{
          res.render("addUserDefinitions",{isLogin:true,isPresent:"false",message:"topicNotPresent"});
          // console.log("Topic is not present in your account, Please first create a new topic.",creatorUserName);
         }
       }
       
     });
  }else{
    res.redirect("/login");
  }
});


app.get("/logout", (req,res)=>{
  req.logout();
  res.redirect("/login");
});



//Start of Admin section
app.get("/adminLogin",(req,res)=>{

  // admin.find({},(err,findAdmin)=>{
  //   if(findAdmin.length === 0){
  //     admin.register({username:"GRS@gmail.com"}, "1234",(err,admin)=>{ ///Admin password part
  //       if(err){
  //         console.log(err);
  //       }
  //       else{
  //         console.log("Admin register successfully.");
  //       }
  //     });
  //   }
  //   else{
  //     console.log("Admin already registered.");
  //   }
  // });

  if(req.isAuthenticated())
  {
    const isLogin = true;
    res.render("adminLogin", {isLogin:isLogin});
  }else{
    const isLogin = false;
    res.render("adminLogin", {isLogin:isLogin});
  }
});


app.post("/adminLogin",(req,res)=>{
 //Codes will be there.
});

app.get("/adminDashboard",(req,res)=>{
  const isLogin = true;                           //can be change
  res.render("adminDashboard", {isLogin:true});
});

app.post("/adminDashboard",(req,res)=>{      // Problem to resolve: adding multiple topics with same name.
  const topicName =req.body.topicName;
  const topicDesc =req.body.topicDesc;
  const initialDefOn1 =req.body.initialDefOn1;
  const initialDefOn2 =req.body.initialDefOn2;
  const initialDef1 =req.body.initialDef1;
  const initialDef2 =req.body.initialDef2;
  const definitionInfo1 = {
    defOn: initialDefOn1,
    definition: initialDef1
  };
  const definitionInfo2 = {
    defOn: initialDefOn2,
    definition: initialDef2
  };
  const defArr = [definitionInfo1,definitionInfo2];

  const newTopic = new topic({
    topicName:topicName,
    topicDesc:topicDesc,
    topicDefs:defArr,
    creatorUserName:"Admin",
    creatorRealName:"Admin"
  });
  newTopic.save();
  res.redirect("/adminDashboard");
});

app.get("/addDefinitions",(req,res)=>{
  // res.render("addDefinitions");
  const isLogin = true;                           //can be change
  const isPresent = "false";
  res.render("addDefinitions",{isPresent:isPresent ,isLogin:isLogin});
});
app.post("/addDefinitions",(req,res)=>{
  const topicName = req.body.topicName;
  const defOn = req.body.defOn;
  const def = req.body.def;
  
  topic.findOne({topicName:topicName},(err,findTopic)=>{
    if(findTopic === null){
      // console.log("Topic is not present");
      const isLogin = true;                           //can be change
      const isPresent = "false";
      res.render("addDefinitions",{isPresent:isPresent,isLogin:isLogin});
    }
    else{
      const isLogin = true;                           //can be change
      const isPresent = "true";
        const newDef = {
           defOn:defOn,
           definition:def
        };
        findTopic.topicDefs.push(newDef);
        findTopic.save(); //Saving the array to Database.
        res.render("addDefinitions",{isPresent:isPresent,isLogin:isLogin});
    }
  });
});


//Start of topic page section
app.get("/topicIs/:topic",(req,res)=>{
  if(req.isAuthenticated())
  {
    const isLogin = true;
    topic.findOne({topicName:req.params.topic},(err,findTopic)=>{
      const topicDefs = findTopic.topicDefs;
      const topicTitle = findTopic.topicName;
      // console.log(topicDefs);
      res.render("topic", {topicTitle:topicTitle, topicDefs:topicDefs, isLogin:isLogin});
    });
  }else{
    res.redirect("/login");
  }
});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
