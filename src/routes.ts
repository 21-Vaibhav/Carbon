import {Hono} from 'hono';
import {Movie} from './movie-type.js';
import * as crypto from 'crypto';

const Movies: Map<string, Movie> = new Map();
const movieRouter = new Hono();

movieRouter.post('/movies', async(c) => {

    const body = await c.req.json<Omit<Movie, "id">>();
    if (!body.title || !body.director || !body.releaseYear || !body.genre || !body.rating) {
        return c.json({message: 'Invalid request'}, 400);
    }

    const id = crypto.randomBytes(16).toString('hex');
    const movie: Movie = {id, ...body};

    Movies.set(id, movie);

    return c.json(movie, 201);
    });

movieRouter.get('/movies', async(c) => {
   if (Movies.size === 0) {
         return c.json({message: 'No movies found'}, 404);
   }   
   return c.json(Movies, 200);
});

movieRouter.get('/movies/:id', async(c) => {
    const id = c.req.param('id');
    const movie = Movies.get(id);
    if (!movie) {
        return c.json({message: 'Movie not found'}, 404);
    }
    return c.json(movie, 200);
});

movieRouter.delete('/movies/:id', async(c) => {
    const id = c.req.param('id');
    const movie = Movies.get(id);
    if (!movie) {
        return c.json({message: 'Movie not found'}, 404);
    }
    Movies.delete(id);
    return c.json({message: 'Movie deleted'}, 200);
    });

movieRouter.post('/movies/:id/rating', async(c) => {
    const rating = await c.req.json<{rating: number}>();
    const id = c.req.param('id');

    const movie = Movies.get(id);
    if (!movie) {
        return c.json({message: 'Movie not found'}, 404);
    }

    if (rating.rating < 0 || rating.rating > 5) {
        return c.json({message: 'Invalid rating'}, 400);
    }
    movie.rating = rating.rating;
    return c.json(movie, 200);
});

movieRouter.get('/movies/:id/rating', async(c) => {
    const id = c.req.param('id');
    const movie = Movies.get(id);
    if (!movie) {
        return c.json({message: 'Movie not found'}, 404);
    }
    return c.json({rating: movie.rating}, 200);
});

movieRouter.get('/movies/top-rated', async(c) => {
    let topRated: Movie[] = [];
    let maxRating = 0;
    for (const movie of Movies.values()) {
        if (movie.rating > maxRating) {
            topRated = [movie];
            maxRating = movie.rating;
        }
        else if (movie.rating === maxRating) {
            topRated.push(movie);
        }
    }
    return c.json(topRated, 200);
});

movieRouter.get('/movies/genre/:genre', async(c) => {
    const genre = c.req.param('genre');
    const movies = Array.from(Movies.values()).filter(movie => movie.genre === genre);
    if (movies.length === 0) {
        return c.json({message: 'No movies found'}, 404);
    }
    return c.json(movies, 200);
});

movieRouter.get('/movies/director/:director', async(c) => {
    const director = c.req.param('director');
    const movies = Array.from(Movies.values()).filter(movie => movie.director === director);
    if (movies.length === 0) {
        return c.json({message: 'No movies found'}, 404);
    }
    return c.json(movies, 200);
});

movieRouter.get("/movies/search", async (c) => {
  const query = c.req.query("query"); 
  if (!query) {
    return c.json({ message: "Query parameter is required" }, 400);
  }
  const movies = Array.from(Movies.values()).filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );
  if (movies.length === 0) {
    return c.json({ message: "No movies found" }, 404);
  }
  return c.json(movies, 200);
});

export default movieRouter;