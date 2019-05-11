# `alwaysai` [![Build Status](https://travis-ci.com/alwaysai/cli.svg?branch=master)](https://travis-ci.com/alwaysai/cli)
The (alwaysAI)[https://alwaysai.co] command-line interface (CLI)

## Prerequisites
### Node.js
[Node.js](https://en.wikipedia.org/wiki/Node.js) is an open-source, cross-platform JavaScript run-time environment. 
Install Node.js using:

- For Mac/Linux [nvm](https://github.com/nvm-sh/nvm#installation-and-update)
- For Windows [nvm-windows](https://github.com/coreybutler/nvm-windows]

Now open up a *new* terminal and do:
```
$ node --version
```
It should print something like "v12.2.0".

## Install the `alwaysai` CLI
Use the `npm` package manager (which ships with Node.js) to install the alwaysAI CLI:
```
$ npm install --global alwaysai
```

If you installed Node.js using the installer from [nodejs.org](https://nodejs.org/en/) instead of using `nvm`, you may need to do:
```
$ sudo npm install --global alwaysai
```
and enter your OS password.

Verify that the CLI has been installed by running:
```
$ alwaysai version
```
It should print e.g. `0.2.10`.

### Log in
You should have received an email from alwaysAI with your username and temporary password. To access the platform you'll need to supply those credentials to the CLI:
```
$ alwaysai user logIn
```
You'll be prompted to enter your username and password. Now you're logged in to the platform and ready to start developing your first alwaysAI deep-learning computer vision application!

### Initialize your application
An alwaysAI application is a versioned collection of models, configuration files, and python code. In a terminal do:

```
$ mkdir my-app
$ cd foo
$ alwaysai app init
```
The `app init` command prompts you to configure your current directory as alwaysAI application. It creates the application configuration file `alwaysai.app.json` as well as a stub application `app.py` and `requirements.txt` if there isn't one already.

### Find a model
The alwaysAI model catalog is a collection of computer vision (CV) models that you can use in your application. You can search the models using the command-line interface:
```
$ alwaysai app models search mobilenet
@alwaysai/MobileNetSSD
```

### Add a model to your application configuration
You can add a model to your application using the command-line interface like so:
```
$ alwaysai app models add @alwaysai/MobileNetSSD
Added @alwaysai/MobileNetSSD
```
Now you'll see in your application config file:

```json
{
  "id": "@alice/my-app",
  "version": "0.0.0",
  "models": {
    "@alwaysai/MobileNetSSD": "4.0.8"
  },
}
```

## Development mode
At this point ...

Models get pulled down from the alwaysAI cloud by the `app install` and/or `app target install` commands...


### Install the application
```
$ alwaysai app install
TODO
```

## More information
If you encounter any bugs or have any questions or feature requests, please don't hesitate to file an issue or submit a pull request on this project's repository on GitHub.

## Related

## License
MIT © [alwaysAI, Inc.](https://alwaysai.co)
