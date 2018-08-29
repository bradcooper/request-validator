FROM node:6.14.4

# Create app directory
RUN mkdir -p /opt/app-root/src
WORKDIR /opt/app-root/src
# Install app dependencies
#COPY package.json ~/validator

# Bundle app source
COPY . /opt/app-root/src

#USER root

RUN bash -c "npm install"

EXPOSE 80

CMD [ "npm", "start" ]
