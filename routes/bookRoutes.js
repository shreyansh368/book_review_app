const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Review = require('../models/Review');
const { authenticateUser } = require('../middleware/auth');

router.post('/', async (req, res) => {
  console.log(req.body);
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ message: err.message });
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    // Use Mongoose to find all books in the database
    const books = await Book.find();

    // If no books are found
    if (!books || books.length === 0) {
      return res.status(404).json({ message: 'No books found' });
    }

    // Send the list of books as a response
    res.status(200).json(books);
  } catch (err) {
    // Handle any errors during the request
    res.status(500).json({ message: 'Error retrieving books', error: err });
  }
});

// Get book by ISBN
router.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;  // Extract ISBN from the request params
  try {
    // Search for the book by ISBN in the database
    const book = await Book.findOne({ isbn });
    if (book) {
      res.json(book);  // Return the book if found
    } else {
      res.status(404).json({ message: 'Book not found' });  // If no book is found
    }
  } catch (err) {
    res.status(500).json({ message: err.message });  // Return any errors that occur
  }
});

// Get books by Author
router.get('/author/:author', async (req, res) => {
  const { author } = req.params; // Extract author from the URL parameter
  try {
    const books = await Book.find({ author: { $regex: author, $options: 'i' } }); // Case-insensitive search
    if (books.length > 0) {
      res.json(books); // Return the list of books by the author
    } else {
      res.status(404).json({ message: 'Books not found by this author' }); // No books found
    }
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});


// Get books by Title
router.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const books = await Book.find({ title: { $regex: title, $options: 'i' } });
    if (books.length > 0) {
      res.json(books);
    } else {
      res.status(404).json({ message: 'Books not found with this title' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get books by review
router.get('/review/:reviewText', async (req, res) => {
  const { reviewText } = req.params; // Extract review text from the URL parameter
  try {
    // Search books that have reviews containing the reviewText (case-insensitive)
    const books = await Book.find({
      reviews: { $regex: reviewText, $options: 'i' } // Case-insensitive search for reviews
    });

    if (books.length > 0) {
      res.json(books); // Return books that have reviews matching the search text
    } else {
      res.status(404).json({ message: 'No books found with this review text' }); // No books found with the review
    }
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any server-side errors
  }
});

// Get reviews for a book by title
router.get('/title/:title/reviews', async (req, res) => {
  const { title } = req.params; // Extract title from the URL parameter
  try {
    // Find the book by title (case-insensitive search)
    const book = await Book.findOne({ title: { $regex: title, $options: 'i' } });

    if (book) {
      res.json(book.reviews); // Return the reviews of the book
    } else {
      res.status(404).json({ message: 'Book not found' }); // If book not found
    }
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle server errors
  }
});

// Add a review for a book by title
router.post('/title/:title/reviews', authenticateUser, async (req, res) => {
  const { title } = req.params; // Extract title from the URL parameter
  const { rating, review } = req.body; // Get rating and review from the request body

  try {
    // Find the book by title (case-insensitive search)
    const book = await Book.findOne({ title: { $regex: title, $options: 'i' } });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' }); // If book not found
    }

    // Create a new review object
    const newReview = new Review({
      bookId: book._id, // Associate the review with the book's ID
      rating,
      review,
      userId: req.user.id, // Get the logged-in user's ID from the request (from authenticateUser middleware)
    });

    // Save the review
    await newReview.save();

    // Add the review to the book's reviews array
    book.reviews.push(newReview);
    await book.save();

    res.status(201).json(newReview); // Return the created review
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle server errors
  }
});


router.delete('/reviews/book/:bookId', async (req, res) => {
  try {
    const bookId = req.params.bookId;

    // Find and delete reviews by bookId
    const deletedReviews = await Review.deleteMany({ book: bookId });

    if (deletedReviews.deletedCount === 0) {
      return res.status(404).send('No reviews found for this book');
    }

    res.status(200).send('Reviews deleted successfully');
  } catch (error) {
    res.status(500).send('An error occurred while deleting the reviews');
  }
});

module.exports = router;
