require('dotenv').config();

const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node');

const router = express.Router()

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

 // Routes

/// 1. Finding artists
router.post('/artist-search', (req, res) => {
  let artistName = req.body.name
  console.log(artistName)
  spotifyApi.searchArtists(artistName)
   .then((data) => {
    let artist = data.body.artists.items
    res.status(200).json(artist)
   })
   .catch((err) => {
    console.log(err)
    res.status(500).json({
         error: 'The error while searching artists occurred:',
         message: err
    })
  }) 
})



module.exports = router;