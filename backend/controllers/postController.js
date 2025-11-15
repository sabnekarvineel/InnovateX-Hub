import Post from '../models/Post.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../socket/socketHandler.js';

export const createPost = async (req, res) => {
  try {
    const { content, mediaType, mediaUrl, sharedPost } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      mediaType: mediaType || 'none',
      mediaUrl: mediaUrl || '',
      sharedPost: sharedPost || null,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name profilePhoto role')
      .populate('sharedPost');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (role && role !== 'all') {
      const users = await User.find({ role }).select('_id');
      const userIds = users.map((user) => user._id);
      query.author = { $in: userIds };
    }

    const posts = await Post.find(query)
      .populate('author', 'name profilePhoto role')
      .populate('sharedPost')
      .populate('comments.user', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const posts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: threeDaysAgo },
        },
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 1] },
              { $multiply: [{ $size: '$comments' }, 2] },
              { $multiply: [{ $size: '$shares' }, 3] },
              { $multiply: ['$views', 0.1] },
            ],
          },
        },
      },
      {
        $sort: { engagementScore: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    const populatedPosts = await Post.populate(posts, [
      { path: 'author', select: 'name profilePhoto role' },
      { path: 'comments.user', select: 'name profilePhoto' },
    ]);

    res.json(populatedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePhoto role')
      .populate('sharedPost')
      .populate('comments.user', 'name profilePhoto');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name profilePhoto role')
      .populate('comments.user', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this post' });
    }

    const { content } = req.body;
    
    if (content) post.content = content;

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.user._id);
    await post.save();

    const populatedPost = await Post.findById(post._id).populate('author', 'name');
    
    const notification = await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'like',
      post: post._id,
      message: `${req.user.name} liked your post`,
      link: `/post/${post._id}`,
    });

    if (notification) {
      const io = getIO();
      io.to(post.author.toString()).emit('newNotification', notification);
    }

    res.json({ message: 'Post liked', likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    await post.save();

    res.json({ message: 'Post unliked', likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name profilePhoto')
      .populate('author', 'name');

    const notification = await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      message: `${req.user.name} commented on your post`,
      link: `/post/${post._id}`,
    });

    if (notification) {
      const io = getIO();
      io.to(post.author.toString()).emit('newNotification', notification);
    }

    res.status(201).json(updatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sharePost = async (req, res) => {
  try {
    const postToShare = await Post.findById(req.params.id);

    if (!postToShare) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { content } = req.body;

    const sharedPost = await Post.create({
      author: req.user._id,
      content: content || `Shared a post from ${postToShare.author.name}`,
      sharedPost: req.params.id,
    });

    postToShare.shares.push(req.user._id);
    await postToShare.save();

    const populatedPost = await Post.findById(sharedPost._id)
      .populate('author', 'name profilePhoto role')
      .populate('sharedPost');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadPostMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const mediaUrl = req.file.path;
    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';

    res.json({
      message: 'Media uploaded successfully',
      mediaUrl,
      mediaType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
