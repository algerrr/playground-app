const express = require('express');

//middleware imports
const checkAuth = require('../middleware/check-auth');
const fileStorage = require('../middleware/fileStorage');

//controller imports
const PostController = require('../controllers/posts')

const router = express.Router();


//Authorization needed
router.post(
  "",
  checkAuth,
  fileStorage,
  PostController.AddPost
  );

router.put(
  '/:id',
  checkAuth,
  fileStorage,
  PostController.UpdatePost
  );

router.delete(
  '/:id',
  checkAuth,
  PostController.DeletePost
  );

// End Authorized routes

router.get('', PostController.getPost);

router.get('/:id', PostController.getPostById);

module.exports = router;
