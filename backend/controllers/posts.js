
const Post = require('../models/post');


exports.AddPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then((createdPost) => {
    res.status(201).json({
      message: "Post Added successfully",
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  })
    .catch((error) => {
      response.status(500).json({ message: "Creating a post failed!" })
    });
};

exports.UpdatePost =
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
      _id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    });
    console.log(post);
    Post.updateOne(
      {
        _id: req.params.id,
        creator: req.userData.userId
      },
      post)
      .then(result => {
        console.log(result);
        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Update Successful!" });
        } else {
          res.status(401).json({ message: "Not Authorized!" });
        }
      }).catch(error => {
        res.status(500).json({ message: "Couldn't Update Post!" })
      });
  };

exports.DeletePost =
  (req, res, next) => {
    Post.deleteOne({
      _id: req.params.id, creator: req.userData.userId
    }).then(result => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Delete Successful!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    })
      .catch(err => {
        res.status(500).json({
          message: "Error Deleting Post with ID: " + req.params.id
        });
      });
  };

exports.getPost = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Error fetching posts!"
      });
    });
};

exports.getPostById = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" })
    }
  })
    .catch(err => {
      res.status(500).json({
        message: "Error fetching Post with id: " + req.params.id
      });
    });
};
