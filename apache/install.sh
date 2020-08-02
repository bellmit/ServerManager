cp servermanager_frontend.conf /etc/apache2/sites-available/
a2ensite servermanager_frontend.conf
nano /etc/apache2/ports.conf
systemctl reload apache2
