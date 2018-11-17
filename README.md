
# No Server November Challenge Number 

See this page [NoServerNovember](https://serverless.com/blog/no-server-november-challenge/)

This challenge : 

>Make a serverless, image-recognition-backed Twitter bot. When a user tweets at the bot: “@animalbot, what’s in this image?”, the bot should reply with the name of the animal, “It’s a panda!”
 

### Solution

My solution uses the Twitter Account Activity API, so whenever anyone @mentions my twitter bots handle a http webhook is called with 
the details of that tweet. I can then extract the user, url of any media they included and the id of the original tweet so that I
can formulate a reply.

Based flow of the application is : 

- Grab info from the tweet JSON (tweet id, URL of media, screen name of person who mentioned the bot)
- Get the image data as a Buffer from the URL
- Pass the image data to AWS rekognition service
- Process the response to only report on the most specific match
- Tweet a reply with the best match or an error if no animal could be found

### Prerequisites

To try out this example you will need to install the Serverless Framework for your platform from here : 

[Install Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)

Assume you have created a file with your AWS credentials in __~./aws/credentials__ as the Serverless Framework will require these to be able to run.

You will need to create a serverless.emv.yml file in with your relevant Twitter API Keys :

```
cat serverless.env.yml
twitter:
  TWITTER_CONSUMER_KEY: 'KEY HERE'
  TWITTER_CONSUMER_SECRET: 'SECRET HERE'
  TWITTER_ACCESS_TOKEN_KEY: 'TOKEN KEY HERE'
  TWITTER_ACCESS_TOKEN_SECRET: 'TOKEN SECRET HERE'
```

You need to have created a Twitter App.

I made use of the handy scripts in this repo to take care of registering the webhook and adding a subscription : [Account Activity Dashboard](https://github.com/twitterdev/account-activity-dashboard/)

Key thing I missed was you need to have "Read/Write/Direct Message" permissions for your application otherwise you cannot add anyone to the webhook.

### Running Serverless Framework

Assume you have created a file with your AWS credentials in __~./aws/credentials__ as the Serverless Framework will require these to be able to run.


```
npm install
```
To create the infrastructure run:
```
sls deploy
```
Once you have finished you can destroy the infrastructure with : 
```
sls remove 
```
