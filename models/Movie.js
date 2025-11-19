import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  imdbid: { type: String, unique: true, required: true },
  locations: Array,
  runtime: Number,
});

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

export default Movie;

