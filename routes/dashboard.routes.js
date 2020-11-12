require('dotenv').config();

const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node');

const router = express.Router()
const { isLoggedIn } = require('../helpers/auth-helper'); // middleware to check if user is loggedIn
const UserModel = require('../models/User.model');
const SongModel = require('../models/Song.model');
const MessageModel = require('../models/Message.model');

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
  // console.log(req.body.track)
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


// ///Showing the Playlist
router.post('/show-playlist', isLoggedIn, (req,res) => {
  let id = req.session.loggedInUser._id
  // console.log(id)
  UserModel.findById(id)
    .populate('myPlaylist')
    .then((data) => {
      console.log(data.myPlaylist)
      res.status(200).json(data.myPlaylist)
    })
    .catch((err) => {
      console.log("Couldn't fetch a playlist", err)
   })
})




///Deleting song from MY playlist
router.post('/delete-song', isLoggedIn, (req,res) => {
   let songId = req.body.songId
   let userId = req.session.loggedInUser._id

      UserModel.findByIdAndUpdate(userId, {$pull: {myPlaylist: songId } } )
      .then(() => {
        UserModel.findById(userId)  
          .populate('myPlaylist')
          .then((user)=> {
            res.status(200).json(user.myPlaylist)
          })
      })
      .catch((err) => {
        console.log("Couldn't fetch a playlist", err)
      })
})



// ///Adding song ty MY playlist from my Matches playlist
// router.post('/add-matchsong-to-myplaylist', isLoggedIn, (req,res) => {
//   let songId = req.body.song._id
//   let userId = req.session.loggedInUser._id
//      UserModel.findByIdAndUpdate(userId, {$push: {myPlaylist: songId } } )
//      .then(() => {
//        UserModel.findById(userId)  
//          .populate('myPlaylist')
//          .then((user)=> {
//            console.log(user.myPlaylist)
//           console.log("song added to my playlist in the database");
//            res.status(200).json(user.myPlaylist)
//          })
//      })
//      .catch((err) => {
//        console.log("Couldn't fetch a playlist", err)
//      })
// })


///Adding song ty MY playlist from my Matches playlist without dublicates
router.post('/add-matchsong-to-myplaylist', isLoggedIn, (req,res) => {
  let spotifyId = req.body.song.spotifyId
  let databaseSongId = req.body.song._id
  let userId = req.session.loggedInUser._id     
       UserModel.findById(userId)  
         .populate('myPlaylist')
         .then((user)=> {
           let playlist = user.myPlaylist
           let sortedPlaylist = playlist.filter((song) => song.spotifyId !== spotifyId)
           console.log(sortedPlaylist)
            UserModel.findByIdAndUpdate(userId, {myPlaylist: sortedPlaylist} )
            .then(() => {
              UserModel.findByIdAndUpdate(userId, {$push: {myPlaylist: databaseSongId }} )
              .then(() => {
                console.log("song added to my playlist in the database");          
                })
                  })          
     .catch((err) => {
       console.log("Couldn't fetch a playlist", err)
     })
})
})





///Showing the Playlist of the Match
router.post('/show-match-playlist', isLoggedIn, (req,res) => {
  let id = req.body.match._id

  // console.log(id)
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
  // console.log(id)
  UserModel.findById(id)
    .populate('myPlaylist')
    .then((data) => {
    //  console.log(data.myPlaylist)
     let mySongs = data.myPlaylist
    //  console.log(mySongs[0])
     let allSongId = mySongs.map(song => song.spotifyId);
     console.log(allSongId)
        UserModel.find()
          .populate('myPlaylist')
          .then((data) => {
            let matches = []
            allSongId.forEach((mySongId) => {
              data.forEach((eachUser) => {
                eachUser.myPlaylist.forEach((eachSong) => {

                if(eachSong.spotifyId === mySongId) {
                  if (!matches.includes(eachUser) && JSON.stringify(eachUser._id) !== JSON.stringify(req.session.loggedInUser._id)) matches.push(eachUser)
                }

                })

              })
            })

            console.log(matches)
            res.status(200).json(matches)
          })
    })
    
    .catch((err) => {
      console.log("Couldn't fetch a User", err)
   })

})


// getting all messages
router.post('/get-all-chats', isLoggedIn, (req,res) => {
  let id = req.session.loggedInUser._id
  MessageModel.find({receiver:id})
  .populate('sender')
  .then((allMessages) => {
    let receivers = allMessages.map((message) => {
      return message.sender.name
    })
    MessageModel.find({sender:id})
    .populate('receiver')
    .then((allMessages2) => {
      let receivers2 = allMessages2.map((message) => {
        return message.receiver.name
      })
      let allNames = receivers.concat(receivers2);
      var uniqueNames = allNames.filter((a, b) => allNames.indexOf(a) === b)


    console.log(uniqueNames)
    res.status(200).json(uniqueNames)
  })
  })
  .catch((err) => {
    console.log("Couldn't fetch chats", err)
  })
})


module.exports = router;