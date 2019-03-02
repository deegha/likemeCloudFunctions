/**
 * Created by Deegha on 31/12/2018
 */

import * as functions from 'firebase-functions'

import { Feeds } from './controllers/FeedsController'


export const getAllFeeds = functions.https.onRequest(Feeds.getAll)

export const getFeedsByGEO = functions.https.onRequest(Feeds.getByGeo)

export const getFeedsByuser = functions.https.onRequest(Feeds.getbyUserId)

export const likeFeed =  functions.https.onRequest(Feeds.like)

export const likedFeeds = functions.https.onRequest(Feeds.liked)

export const share = functions.https.onRequest(Feeds.shared) 

// export const sendpushNotifications = functions.database
// .ref('feeds/{geo}/{feedId}').onCreate(Feeds.sendPushNotificationsOnCreation)


export const testNotification = functions.https.onRequest(Feeds.sendPushNotificationsOnCreation)