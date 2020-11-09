require('dotenv').config();

const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node');

const router = express.Router()
const { isLoggedIn } = require('../helpers/auth-helper'); // middleware to check if user is loggedIn
const UserModel = require('../models/User.model');
const SongModel = require('../models/Song.model');


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

/// Finding music
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



///  Storing song in the database
router.post('/add-track', isLoggedIn, (req, res) => {
  console.log(req.body.track)
  let track = req.body.track
  let id = req.session.loggedInUser._id
  SongModel.create({spotifyId: track.id, name:track.name, artist: track.artists[0].name, imageUrl: track.album.images[0].url, sample: track.preview_url })
      .then((song) => {
        UserModel.findByIdAndUpdate(id, {$push: {myPlaylist: song._id}})
        .then(() => {
          res.status(200).json()
        })
      })
      .catch((err) => {
         console.log(err)
      })
      
})


///Showing the Playlist
router.post('/show-playlist', isLoggedIn, (req,res) => {
  let id = req.session.loggedInUser._id
  console.log(id)
  UserModel.findById(id)
    .populate('myPlaylist')
    .then((data) => {
      res.status(200).json(data.myPlaylist)
    })
    .catch((err) => {
      console.log("Couldn't fetch a playlist", err)
   })

})


///Showing matches
router.post('/my-matches', isLoggedIn, (req,res) => {
  let id = req.session.loggedInUser._id
  console.log(id)
  UserModel.findById(id)
    .populate('myPlaylist')
    .then((data) => {
    //  console.log(data.myPlaylist)
     let mySongs = data.myPlaylist
     console.log(mySongs[0])
     let allSongId = mySongs.map(song => song._id);
     console.log(allSongId)
    })
    
    .catch((err) => {
      console.log("Couldn't fetch a User", err)
   })

})




module.exports = router;