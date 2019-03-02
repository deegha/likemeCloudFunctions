import * as functions from 'firebase-functions'

class MainController {

  private message 

  POST = (method):void => {

    functions.https.onRequest((request, response) => {
      
      if(request.method !== 'POST') {
        this.message = 'Not allowed'
        return response.status(401).send({
          message: this.message
        })
      }
      
      return method(request, response)
    })

  }

}

export const Controller = new MainController
