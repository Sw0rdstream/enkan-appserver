
# Enkan 円環 圆环
A server to serve inhouse apps continuously to front-side developers.

## Background
  * During development, native app developers need to continuously **deliver latest app** to front-side developers.
  * However, it takes time for front-side developers to learn XCODE or Android Studio. And most important thing is, not every company are **rich enough to provide an Mac** to every developer.
  * That's why Enkan is the one to save the world.
 
## Who are the target audiences?
  CI Teams in each company

## Structure
It has three parts:
* enkan api server `/start.js`: This is the API server of Enkan, which includes APIs to publish apps, download apps, list apps and remove apps.
* web pages `/front`: This is the app download page. For iOS, it uses itms:// to serve inhouse apps. For android, it displays just a download link for each app.
* app uploader tester `/test/`: This is  a sample download cli command to upload app to api server.

## How to run?
##### 1. build `/front`
Go to /front, and run:

`npm install && npm install -g webpack && npm install -g webpack-dev-server`

`npm run build`

This will start to compile front js into a bundle.

##### 2. run api server
Go to /, and run `npm install && npm start`

##### 3. Access
The web page's url is http://localhost:3000/front

The api access starts with http://localhost:3000/api/XXXXXXXXX, to know more, you can refer to `app.js`.
