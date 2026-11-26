const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
const public_users = express.Router();

// Shared users array — same reference used by login in auth_users.js
const users = require("./auth_users.js").users;

const doesExist = (username) => {
    let matching = users.filter((user) => user.username === username);
    return matching.length > 0;
}

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!doesExist(username)) {
            users.push({ username, password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Username and password are required" });
});

// Get the list of all books — async/await
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => new Promise((resolve) => resolve(books));
        const allBooks = await getBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details by ISBN — async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const getByIsbn = () => new Promise((resolve, reject) => {
            books[isbn] ? resolve(books[isbn]) : reject("not found");
        });
        const book = await getByIsbn();
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: "Book not found for the given ISBN" });
    }
});

// Get book details by author — async/await
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const getByAuthor = () => new Promise((resolve, reject) => {
            let result = [];
            Object.keys(books).forEach((key) => {
                if (books[key].author === author) result.push({ isbn: key, ...books[key] });
            });
            result.length > 0 ? resolve(result) : reject("none");
        });
        const found = await getByAuthor();
        return res.status(200).json({ booksbyauthor: found });
    } catch (err) {
        return res.status(404).json({ message: "No books found for the given author" });
    }
});

// Get book details by title — async/await
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const getByTitle = () => new Promise((resolve, reject) => {
            let result = [];
            Object.keys(books).forEach((key) => {
                if (books[key].title === title) result.push({ isbn: key, ...books[key] });
            });
            result.length > 0 ? resolve(result) : reject("none");
        });
        const found = await getByTitle();
        return res.status(200).json({ booksbytitle: found });
    } catch (err) {
        return res.status(404).json({ message: "No books found for the given title" });
    }
});

// Get book reviews by ISBN (synchronous)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found for the given ISBN" });
    }
});

module.exports.general = public_users;
