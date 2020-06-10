module.exports = {
  newNote: async (parent, args, { models }) => {
    return await models.Note.create({
      content: args.content,
      author: 'Albert Einstein',
    });
  },
  updateNote: async (parent, args, { models }) => {
    try {
      return await models.Note.findOneAndUpdate(
        {
          _id: args.id,
        },
        {
          $set: {
            content: args.content,
          },
        },
        {
          new: true,
        },
      );
    } catch (error) {
      throw error;
    }
  },
  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (err) {
      return false;
    }
  },
};
