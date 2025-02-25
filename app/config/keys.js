module.exports = {
    mongoProdURI: process.env.NODE_ENV === 'production' ? 'mongodb://todo-database:27017/todoapp' : 'mongodb://localhost:27017/todoapp',
};