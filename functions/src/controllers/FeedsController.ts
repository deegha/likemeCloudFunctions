/**
 * Created by Deegha on 31/12/2018
 */
import Expo from 'expo-server-sdk'
import * as admin from 'firebase-admin'
import { formatFeeds } from '../helpers/helpers'

class FeedsController {

  private response = {
    message: '',
    status: 0,
    data: [],
    nextRef: ''
  }

  constructor() {
    admin.initializeApp() 
  }

  getAll = async (req, res) => {
    const { userId, nextRef }  = req.body

    let snapshot = null
    let arrayOfKeys = null

    try {

      if(nextRef) {
        snapshot =  await admin.database()
        .ref("feeds")
        .orderByKey()
        .endAt(nextRef)
        // .limitToLast(6)
        .once("value")
      
        arrayOfKeys = Object.keys(snapshot.val())
        .sort()
        .reverse()
        .slice(1)

      }else {
        snapshot =  await admin.database()
          .ref("feeds")
          .orderByKey()
          // .limitToLast(115)
          .once("value")

        arrayOfKeys = Object.keys(snapshot.val())
          .sort()
          .reverse()
      }      

      const referenceToOldestKey = arrayOfKeys[arrayOfKeys.length-1]

      let results = arrayOfKeys
        .map((key) => snapshot.val()[key])
          
      let collection =  {}

      results.map( feed => {
        collection = {...collection,...feed}
      }) 

      const data = await formatFeeds(collection, userId )
      data.sort((a, b)=> (b.createdAt - a.createdAt))
      this.response.nextRef = referenceToOldestKey
      this.response.message = 'Successful'
      this.response.data = data
      this.response.status = 200
      res.send(this.response)  

    }catch(err) {
      console.log(err)
      this.response.message = err
      this.response.data = []
      this.response.status = 200
      res.status(500).send(this.response) 
    } 
  }

  getByGeo = async (req, res) => {
    const { userGeo, userId, nextRef} = req.body
    try{

      let snapshot = null
      let arrayOfKeys = null

      if(nextRef) {
        snapshot = await admin.database()
        .ref("feeds")
        .child(userGeo)
        .orderByKey()
        .endAt(nextRef)
        // .limitToLast(6)
        .once("value")

        arrayOfKeys = Object.keys(snapshot.val())
        .sort()
     
      }else {
        snapshot = await admin.database()
        .ref("feeds")
        .child(userGeo)
        .orderByKey()
        // .limitToLast(5)
        .once("value")

        arrayOfKeys = Object.keys(snapshot.val())
        .sort()
        .slice(1)
      }

      const referenceToOldestKey = arrayOfKeys[arrayOfKeys.length-1]

      let results = arrayOfKeys
      .map((key) => ({key: snapshot.val()[key]}))

      const data = await formatFeeds(snapshot.val(), userId)
      data.sort((a, b)=> (b.createdAt - a.createdAt))
      this.response.message = 'Successful'
      this.response.nextRef = referenceToOldestKey
      this.response.data = data
      this.response.status = 200
      res.send(this.response)  
    
    }catch(err) {
      console.log(err)
      this.response.message = err
      this.response.data = []
      this.response.status = 200
      res.status(500).send(this.response) 
    }
  }

  getbyUserId = async (req, res) => {
    const userId = req.body.userId
    try{
      
      
      const snapshot = await admin.database().ref("feeds").once("value")
      
      if(snapshot.val() !== null) {
        let collection =  {}

        const geos =  snapshot.val()

        Object.keys(geos).map( geoIndex => {
          
          collection = {...collection,...geos[geoIndex]}
        })
        console.log(collection)
        const x = Object.keys(collection).map( feedIndex => {
          if(collection[feedIndex].userObj.userID === userId) {
            return {
              ...collection[feedIndex],
              id: feedIndex
            }
          } 
        })

        const y = x.filter(obj => obj )

        this.response.message = 'Request successful'
        this.response.data = y
        this.response.status = 200
        res.send(this.response) 
      }else{
        this.response.message = 'No data found'
        this.response.data = []
        this.response.status = 200
        res.send(this.response) 
      }
    
    }catch(err) {
      console.log(err)
      this.response.message = err
      this.response.data = []
      this.response.status = 500
      res.status(500).send(this.response) 
    }
  }

  like = async (req, res) => {
    const { user, feedId } = req.body

    try {
      await admin.database().ref(`likes/${feedId}/${user.id}`).set(user)
      this.response.message = 'successfully liked'
      this.response.data = []
      this.response.status = 200
      res.send(this.response) 
    }catch(err) {
      console.log(err)
      this.response.message = err
      this.response.data = []
      this.response.status = 500
      res.status(500).send(this.response) 
    }
  }

  liked = async (req, res) => {
    const { userId } = req.body

    try {
      const snapshotLikes = await admin.database().ref("likes").once("value")
      const likedFeeds =  snapshotLikes.val()
      let userLikedKeys = []
      let likedFeedsArray = []

      Object.keys(likedFeeds).map(feedIndex => {
        Object.keys(likedFeeds[feedIndex]).map(like => {
          if(like === userId ) {
            userLikedKeys = [...userLikedKeys, feedIndex]
          }
        })
      })

      const snapshot = await admin.database().ref("feeds").once("value")
      const geo = snapshot.val()

      Object.keys(geo).map(geoIndex => Object.keys(geo[geoIndex]).map(feedIndex => {
         if(userLikedKeys.indexOf(feedIndex) !== -1) {
           likedFeedsArray = [...likedFeedsArray, {...geo[geoIndex][feedIndex], id: feedIndex}]
         }  
      }))

      this.response.message = 'Liked by user'
      this.response.data = likedFeedsArray
      this.response.status = 200
      res.send(this.response) 
    }catch(err) {
      console.log(err)
      this.response.message = err
      this.response.data = []
      this.response.status = 500
      res.status(500).send(this.response) 
    }

  }


  shared = async (req, res) => {
    const { user, feedId } = req.body

    try {
      await admin.database().ref(`shares/${feedId}/${user.id}`).set(user)
      this.response.message = 'successfully added the share'
      this.response.data = []
      this.response.status = 200
      res.send(this.response) 
    }catch(err) {
      console.log(err)
      this.response.message = err
      this.response.data = []
      this.response.status = 500
      res.status(500).send(this.response) 
    }
  } 

  sendPushNotificationsOnCreation = async (req, res) => {
    const expo = new Expo()
    const userresSnapshot = await admin.database().ref("users").once("value")
    const users = userresSnapshot.val()
    let tokens = []
    
    tokens = Object.keys(users).map(index => users[index]. notificationToken && users[index].notificationToken)
    
    tokens = tokens.filter(token => token)

    // const tokens = ['ExponentPushToken[lyDjQgIbpEgGGEaz4I0WLg]']

    console.log(tokens)

    const messages = [];
    for (let pushToken of tokens) {
      
      pushToken = pushToken.notificationToken

      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        body: 'New promotion added',
        vibrate: true,
        data: { withSome: 'data' },
      })
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    (async () => {
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
          console.log(ticketChunk);
          tickets.push(...ticketChunk)
        } catch (error) {
          console.error(error)
        }
      }
    })


    const receiptIds = [];
    for (const ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
      for (const chunk of receiptIdChunks) {
        try {
          const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          console.log(receipts)

     
          // for (let receipt of receipts) {
          //   if (receipt.status === 'ok') {
          //     continue;
          //   } else if (receipt.status === 'error') {
          //     console.error(`There was an error sending a notification: ${receipt.message}`);
          //     if (receipt.details && receipt.details.error) {

          //       console.error(`The error code is ${receipt.details.error}`);
          //     }
          //   }
          // }
        } catch (error) {
          console.error(error);
        }
      }
    })


    res.send("notofication sent")
  }
}

export const Feeds = new FeedsController()
