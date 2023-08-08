# Use an official Node runtime as a parent image
FROM node:18

#Set the working directory in the container to /app
WORKDIR /app

#Copy package.json and package-lock.json from your host to your working directory to install dependencies
COPY package*.json ./

#Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

#Install any needed dependencies specified in package.json
RUN npm install

# Copy app source inside the docker image
COPY . .

#Expose port 3000 to the outside world
EXPOSE 3000

#Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "start" ]


