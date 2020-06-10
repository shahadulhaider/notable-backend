const mongoose = require('mongoose');

mongoose.promise = global.promise;

const connectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
module.exports = {
  connect: (DB_HOST) => {
    try {
      mongoose.connect(DB_HOST, connectionOptions);
    } catch (error) {
      mongoose.createConnection(DB_HOST, connectionOptions);
    }

    mongoose.connection
      .once('open', () => console.log('MongoDB connected'))
      .on('error', (err) => {
        console.error(err);
        console.log(
          `MongoDB connection error. Please make sure MongoDB is running`,
        );
        process.exit(1);
      });
  },
  close: () => {
    mongoose.connection.close();
  },
};
