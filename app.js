const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config({ path: ".env" });
const path = require("path")

const db = require('./db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cors({
    origin: '*'
}));
app.use('/uploads', express.static('uploads'));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.get('/', (req, res) => {
    try {
        console.log('JSCMS API is running.........');
        res.send('<h1>JSCMS API is running.........</h1>');
    }
    catch {

    }
})

const usersRoute = require('./routes/users');
app.use('/users', usersRoute);


const contactRoute = require('./routes/contact');
app.use('/contact', contactRoute);

const blogRoute = require('./routes/blog');
app.use('/blog', blogRoute);


const postcategoryRoute = require('./routes/postcategory');
app.use('/postcategory', postcategoryRoute);

const categoryRoute = require('./routes/category');
app.use('/category', categoryRoute);

const postcontentRoute = require('./routes/postcontent')
app.use('/postcontent', postcontentRoute);

const pagecontentRoute = require('./routes/pagecontent')
app.use('/pagecontent', pagecontentRoute);

const postsRoute = require('./routes/posts')
app.use('/posts', postsRoute);

const pagesRoute = require('./routes/pages')
app.use('/pages', pagesRoute);



// View Engine Setup 
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.get("/file", function (req, res) {
    res.render("Files");
})


app.listen(process.env.PORT || 4000, function () {
    console.log('App running on port 4000.');
    db.connect(function (err) {
        if (err) {
            console.log('db connection error', err);
        }
        else {
            console.log('db connected');
        }
    })

});