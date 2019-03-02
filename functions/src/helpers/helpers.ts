/**
 * Created by Deegha on 31/12/2018
 */
import * as admin from 'firebase-admin'

  let format: any;

  format = async (feeds,feed, likes, liked) => ({
    id: feed,
    location: feeds[feed].location?feeds[feed].location:null,
    createdAt: feeds[feed].createdAt,
    postText: feeds[feed].postText,
    postMedia: {
      // type: feeds[feed].postMedia.type && feeds[feed].postMedia.type,
      url: feeds[feed].postMedia.url && feeds[feed].postMedia.url
    },
    userObj: {
      id: feeds[feed].userObj.userID,
      name: feeds[feed].userObj.displayName,
      image: feeds[feed].userObj.image
    },
    category: feeds[feed].category?feeds[feed].category:'open',
    currentUserLiked: liked,
    voteUp: likes
  }) 

  export const formatFeeds = async (feeds, userId) => { 

    const formated = Object.keys(feeds).map( async (feed) => { 

      let likes = null
      let liked = false

      const response = admin.database()
        .ref("likes")
        .orderByKey()
        .equalTo(feed)
        .once("value") 
      
      return response.then( async (likesSnapshot) => {
        if(likesSnapshot.val()) {

          const la = likesSnapshot.val()

          if(userId) {
            Object.keys(la[feed]).map(likeUser => {
              if(likeUser === userId) {
                liked = true
              }
            })
          }

          likes = Object.keys(la[feed]).length
          return await format(feeds, feed, likes, liked)
        }else {
          likes = 0
          return await format(feeds, feed, likes, liked)
        }
      })
      .then(respone => respone)
      .catch(err => console.log(err))
    })

    return Promise.all(formated).then(item => item)  
 }