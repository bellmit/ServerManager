sudo apt update

#install npm
sudo apt install npm
sudo npm install -g npm@latest

#install necessary software
sudo apt install apache2 git ruby-sass

#acts-util
git clone https://github.com/aczwink/ACTS-Util.git
cd ACTS-Util

cd core
npm install
sudo npm link
cd ..

cd node
npm link acts-util-core
npm install
sudo npm link
cd ..

cd ..

#acfrontend
git clone https://github.com/aczwink/ACFrontEnd.git
cd ACFrontEnd

npm link acts-util-core
npm install
sudo npm link

cd ..


#servermanager
git clone https://github.com/aczwink/ServerManager.git
cd ServerManager

cd api
npm link acts-util-core
npm install
sudo npm link
cd ..

cd backend
npm link acts-util-core
npm link acts-util-node
npm link srvmgr-api
npm install
cd ..

cd frontend
npm link acts-util-core
npm link acfrontend
npm link srvmgr-api
npm install
mkdir dist
npm run deploy
cd ..

cd ..

#generate ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout /etc/ssl/private/servermanager.key -out /etc/ssl/certs/servermanager.crt

#install for apache
cd ServerManager/apache
sudo ./install.sh
cd ..
cd ..


#issue update
ln -s ServerManager/installation/update.sh update.sh
chmod +x update.sh
./update.sh

#install systemd unit
dirPath=$(dirname "$0")
absDirPath=$(realpath $dirPath)/ServerManager/backend
sudo cp ServerManager/installation/servermanager.service /etc/systemd/system/
sudo sed -i -e "s:\\\$TARGETDIR\\\$:$absDirPath:g" /etc/systemd/system/servermanager.service

sudo systemctl enable servermanager.service
sudo systemctl start servermanager.service
