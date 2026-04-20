import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;

let movies;

export default class MoviesDAO {
  static async injectDB(conn) {
    // a static method is a method for a class that you can call at any point without creating an ojbect from that class.
    if (movies) {
      // do we have a value for movies? If so, return this method
      return;
    }
    try {
      // there is no vlue for movies?
      movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies"); // then connect to the database and find the movies. This .db is access the sample_mflix database through the .env file.
    } catch (e) {
      console.error(`unable to connect in MoviesDAO: ${e}`); // if it cannot connect, output the error.
    }
  }

  static async getMovies({
    // default filter. We can only do one filter at a time here.
    filters = null, // this is asking, "Are adding filters like genre or lenth or rating". We will have front end input for these filters
    page = 0, // on the front end, it will ask you what page you want to view, in this case page 0 will be the default for when you load the page
    moviesPerPage = 20, // will only get 20 movies at once
  } = {}) {
    let query;
    if (filters) {
      //if we do have filters, pass in that object and filter for us, if not, return the entire DB for us again but only 20 movies at a time
      if ("title" in filters) {
        // is there a title property to filter?
        query = { $text: { $search: filters["title"] } }; // the actual title filter we add, that updates the value of search here, which updates the text value
      } else if ("rated" in filters) {
        // is there a rating property to filter?
        query = { rated: { $eq: filters["rated"] } }; // the actual rated filter we add, that updates the eq value here, which then updates the rated value
      }
    }

    let cursor;
    try {
      cursor = await movies
        .find(query) //what ever query we have, this will now go and "find" this data
        .limit(moviesPerPage) // we want to limit the amount of movies shown, and we set that in const moviesPerPage.
        .skip(moviesPerPage * page); //this is for navigating the pages. This is a bit conveluded because it doesnt count "current page" but more like index position of this data. So if you are viewing movie number 21 you are actually looking at the top of the second page.
      const moviesList = await cursor.toArray(); //
      const totalNumMovies = await movies.countDocuments(query); // this is now the new value of movies being shown based on our filters.
      return { moviesList, totalNumMovies }; // return the values of the movies for us so that we can see it based on the filters added.
    } catch (e) {
      // any errors? show us the errors.
      console.error(`Unable to issue find command, ${e}`);
      return { moviesList: [], totalNumMovies: 0 };
    }
  }

  static async getRatings() {
    let ratings = [];
    try {
      ratings = await movies.distinct("rated");
      return ratings;
    } catch (e) {
      console.error(`unable to get ratings, $(e)`);
      return ratings;
    }
  }

  static async getMovieById(id) {
    try {
      return await movies
        .aggregate([
          {
            $match: {
              _id: new ObjectId(id),
            },
          },
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "movie_id",
              as: "reviews",
            },
          },
        ])
        .next();
    } catch (e) {
      console.error(`something went wrong in getMovieById: ${e}`);
      throw e;
    }
  }
}
