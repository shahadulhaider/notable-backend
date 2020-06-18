const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
  AuthenticationError,
  ForbiddenError,
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../../util/gravatar');

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create note.');
    }

    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id),
      favoriteCount: 0,
    });
  },
  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update note.');
    }

    const note = await models.Note.findById(id);

    if (note && note.author !== user.id) {
      throw new ForbiddenError(
        'You do not have permission to update the note.',
      );
    }

    try {
      return await models.Note.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            content,
          },
        },
        {
          new: true,
        },
      );
    } catch (error) {
      throw new Error('Error updating note');
    }
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError(
        'You must be signed in to delete the note.',
      );
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError(
        'You do not have permission to delete the note.',
      );
    }

    try {
      await note.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    const found = await models.Note.findById(id);
    const hasUser = found.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          new: true,
        },
      );
    }
    return await models.Note.findByIdAndUpdate(
      id,
      {
        $push: {
          favoritedBy: mongoose.Types.ObjectId(user.id),
        },
        $inc: {
          favoriteCount: 1,
        },
      },
      {
        new: true,
      },
    );
  },
  signup: async (parent, { username, email, password }, { models }) => {
    /* eslint-disable no-param-reassign  */
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const avatar = gravatar(email);

    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return token;
    } catch (err) {
      throw new Error('Error creating account');
    }
  },
  signin: async (parent, { username, email, password }, { models }) => {
    if (email) {
      /* eslint-disable no-param-reassign  */
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      throw new AuthenticationError('Wrong credentials');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new AuthenticationError('Wrong credentials');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return token;
  },
};
