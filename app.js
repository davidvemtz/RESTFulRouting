const bodyParser = require('body-parser'),
      methodOverride = require('method-override');
      expressSanitizer = require('express-sanitizer');
      mongoose   = require('mongoose'),      
      express    = require('express'),
      app = express();
      PORT = 8080;
      uri = 'mongodb://localhost:27017/restful_blog_app'

// APP CONFIG 
mongoose.connect(uri, {useNewUrlParser : true, useFindAndModify : false}, (err) => err ? console.log(err) : console.log("Connected to MongoDB"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer()); 

// MONGOOSE MODEL CONFIG 
let blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: 
      {
      type: Date,
      default: Date.now
      }
});
let Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//    title: "Test Blog",
//    image: "https://images.unsplash.com/photo-1566729695605-4c9d77e1abe3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=675&q=80",
//    body: "This is just a test"
// })

// RESTful ROUTES
app.get('/', (req, res) => {
   res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", (req, res) => {
   Blog.find({}, (error, blogs) => {
      if(error) {
         console.log("ERROR!");
      } else {
         res.render("index", {blogs : blogs});
      }
   });
});


// NEW ROUTE
app.get("/blogs/new", (req, res) => {
   res.render("new");
});


// CREATE ROUTE
app.post("/blogs", (req, res) => {
   // create blog
   req.body.blog.body = req.sanitize(req.body.blog.body); // REMOVES js SCRIPTS FROM BODY
   Blog.create(req.body.blog, (err, newBlog) => {
      if(err) {
         console.log("ERROR IN CREATE!");
      } else {
         res.redirect("/blogs");
      }
   });
});


// SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
   Blog.findById(req.params.id, (err, foundBlog) => {
      if (err) {
         res.redirect('/blogs');
      } else {
         res.render('show', {blog: foundBlog});
      }
   });
});


//  EDIT ROUTE 
app.get('/blogs/:id/edit', (req, res) => {
   Blog.findById(req.params.id , (err, foundBlog) => {
      if (err) {
         res.redirect("/blogs")
      } else {
         res.render('edit', {blog: foundBlog});
      }
   });
});


// UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
   req.body.blog.body = req.sanitize(req.body.blog.body); // REMOVES js SCRIPTS FROM BODY
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => 
      err ? 
      res.redirect('/blogs') :
      res.redirect(`/blogs/${req.params.id}`));
});

// DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
   Blog.findOneAndRemove(req.params.id, (error) => 
   error ? 
   res.redirect('show') :
   res.redirect('blogs')   
   );
});


// LISTENER
app.listen(PORT, () => console.log(`SERVER ON PORT: ${PORT}`));

      
      