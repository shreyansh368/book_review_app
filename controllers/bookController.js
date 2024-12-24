const Book = require('../models/Book');

const getBooks = async (req, res) => {
  const books = await Book.find();
  res.json(books);
};

const addBook = async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
};

const updateBook = async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
};

const deleteBook = async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Book deleted' });
};

module.exports = { getBooks, addBook, updateBook, deleteBook };
