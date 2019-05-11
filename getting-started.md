# Getting started

## Prerequisites
There are a few pieces of software you'll need to install to get up and running with alwaysAI.

### Node.js
[Node.js](https://en.wikipedia.org/wiki/Node.js) is an open-source, cross-platform JavaScript run-time environment that we use for some of our developer tools. 
Install Node.js using one of the following options:

- For Mac/Linux, use [nvm](https://github.com/nvm-sh/nvm#installation-and-update)
- For Windows, use [nvm-windows](https://github.com/coreybutler/nvm-windows]


Now open up a terminal and do:
```
$ node --version
```
It should print something like "v10.15.1".

### alwaysAI Command-line interface
Node.js ships with the `npm` package manager, which we'll use to install the alwaysAI command-line interface (CLI):
```
$ npm install --global alwaysai
```

Now verify that the CLI has been installed by running:
```
$ alwaysai version
```
It should print something like "0.4.0".

### Log in
You should have received an email from alwaysAI with your username and temporary password. To access the platform you'll need to supply those credentials to the CLI:
```
$ alwaysai user logIn
```
You'll be prompted to enter your username and password. Now you're logged in to the platform and ready to start developing your first alwaysAI deep-learning computer vision application!

### Initialize your application
An alwaysAI application is a versioned collection of models, configuration files, and application code. In a terminal do

([`mkdir`](https://linux.die.net/man/1/mkdir)] run the command:
```
$ mkdir my-app
$ cd foo
$ alwaysai app init
```
That command walks you through a series of prompts for configuring your alwaysAI application.

### Find a model
The alwaysAI model catalog is a collection of computer vision (CV) models that you can use in your application. You can search the models using the command-line interface:
```
$ alwaysai app models search mobilenet
@alwaysai/MobileNetSSD
```

### Add a model
You can add a model to your application using the command-line interface like so:
```
$ alwaysai app models add @alwaysai/MobileNetSSD
Added @alwaysai/MobileNetSSD
```
You should see the new item in your application config file:

```json
{
  "id": "@alice/my-app",
  "version": "0.0.0",
  "models": {
    "@alwaysai/MobileNetSSD": "4.0.8"
  },
}
```
### App target

### Install the application
From a terminal in your application directory on the VM do:
```
$ alwaysai app install
TODO
```
