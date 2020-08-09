#install necessary software
sudo apt install apache2 git npm ruby-sass

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

#install for apache
cd ServerManager/apache
sudo ./install.sh
cd ..
cd ..