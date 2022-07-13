# About The Project

This project was part of an interview process at an unnamed company.

# Install and Setup

First, make sure you've got those apps installed:

- Node >= 16.0
- MongoDB Community edition, latest version: https://docs.mongodb.com/manual/administration/install-community/

To get started you `.env` must contain the following
```Shell
  # SHARED
  ENV_NAME=dev
  API_URL=http://localhost:5100/api
  PORT=5100
  SESSION_SECRET=<type your special random key of alphanumeric characters here>

  # MONGO
  MONGODB_URI=mongodb://localhost:27017/test-local
```

To test the endpoints use the extension called `Rest Client` the file named `requests.rest`

# Usage

To run the app use:

`npm run dev`


To run the tests use (also includes coverage report):

`npm run test`

