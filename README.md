# ServerManager
A web app for managing a linux server

# Installation
* Create an empty directory where ServerManager should be installed
* Your user (NOT root!!!) should have read and write permissions on that directory
* Then execute these commands:
```
wget https://raw.githubusercontent.com/aczwink/ServerManager/master/installation/install.sh
chmod +x install.sh
./install.sh
```

# Configuration
Upon first start ServerManager will create the main config file at /etc/ServerManager.json

Open that file and set the "trustedOrigins" to the origins that the backend should accept requests from.
Logins from other origins are rejected.
