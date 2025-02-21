
var express = require('express');
var router = express.Router();
const localStrategy = require("passport-local");
const passport = require('passport');
const upload = require('./multer'); // Ensure this is correctly configured
const userModel = require('./users');
const postModel = require('./posts');

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});

router.get('/register', (req, res) => {
  res.render('register', { nav: false });
});

router.get('/profile', isLoggedIn, async (req, res, next) => {
  const user = await userModel
  .findOne({ username: req.user.username })
  .populate('posts')
  res.render('profile', { user, nav: true });
});
router.get('/feed', isLoggedIn, async (req, res) => {
  try {
    // Fetch all posts and populate the user details
    const posts = await postModel.find().populate('user');
    res.render('feed', { posts, user: req.user , nav:true}); // Render the feed template
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching posts');
  }
});


router.get('/edit', isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ username: req.user.username })

  res.render('edit', { user, nav: true });
});

router.post('/edituser', isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel.findOne({ username: req.user.username });

    // Update user fields if they are provided in the request body
    if (req.body.fullname) user.name = req.body.fullname;
    if (req.body.email) user.email = req.body.email;
    if (req.body.contact) user.contact = req.body.contact;
    
    if (req.body.username) user.username = req.body.username;

    // Save the updated user
    await user.save();

    // Redirect to the profile page after updating 
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating user information');
  }
});


router.get('/show/post', isLoggedIn, async (req, res, next) => {
  const user = await userModel
  .findOne({ username: req.user.username })
  .populate('posts')
  res.render('show', { user, nav: true });
});

router.get('/add', isLoggedIn, (req, res, next) => {
  res.render('add', { nav: true });
});

router.post('/createpost', isLoggedIn, upload.single('postimage'), async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user });

  const post = await new postModel({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    postImage: req.file.filename
  });

  await post.save();
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

router.post('/fileupload', isLoggedIn, upload.single('image'), async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user });

  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.post('/register', (req, res) => {
  const data = new userModel({
    username: req.body.username,
    name: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact
  });

  userModel.register(data, req.body.password, (err, user) => {
    if (err) {
      console.error(err);
      return res.redirect('/register');
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: "/",
  successRedirect: "/profile"
}), (req, res) => { });

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
router.post('/delete/post/:id', isLoggedIn, async (req, res) => {
  try {
    const postId = req.params.id;
    await postModel.findByIdAndDelete(postId);
    res.redirect('/show/post'); // Redirect to the profile or posts page after deletion
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting post');
  }
});



module.exports = router;
