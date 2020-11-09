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

/// 1. Finding music
router.post('/music-search', (req, res) => {
  let name = req.body.name
  let option = req.body.context;
  let query = req.body.name
  if (!option) {
    if (option == 'artist') {
      query = 'artist:' + name;
    }
    if (option == 'track') {
      query = 'track:' + name;
    }
  }

  spotifyApi.searchTracks(query)
   .then((data) => {
    res.status(200).json(data)
   })
   .catch((err) => {
    console.log(err)
    res.status(500).json({
         error: 'The error while searching artists occurred:',
         message: err
    })
  }) 
})


// /// 2. Finding tracks
// router.post('/tracks-search', (req, res) => {
//   let name = req.body.name
//   spotifyApi.searchTracks(name)
//    .then((data) => {
//     let response = data.body
//     res.status(200).json(response)
//    })
//    .catch((err) => {
//     console.log(err)
//     res.status(500).json({
//          error: 'The error while searching artists occurred:',
//          message: err
//     })
//   }) 
// })


/// 3. Finding top tracks from one artist
router.get('/find-tracks/:artistId', (req, res) => {
  let id = req.params.artistId
  spotifyApi.getArtistTopTracks(`${id}` ,'DE')
   .then((data) => {
    let response = data.body
    res.status(200).json(response)
   })
   .catch((err) => {
    console.log(err)
    res.status(500).json({
         error: 'The error while searching artists tracks occurred:',
         message: err
    })
  }) 
})




module.exports = router;