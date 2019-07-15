v praci ip adresa Virtual ubuntu 192.168.56.102

http://192.168.56.102:3000/

mySQL

instalovat mysql-server a apt-get install mysql-workbench
workbench je GUI pro spravu msql 

pro pouzivani, execute SQL kodu a interakci s databazi je treba nainstalovat balicek mysql2
npm install --save mysql2

---

sequelize - 3rd party balicek co se stara o SQL dotazy, umoznuje pracovat primo v js objects a resi relace mezi tabulkami atd. 
npm install --save sequelize
desktop appka pro db management je mysql workbench

---

mongoDB

instal mongoDB:
- bud lze instalovat lokalne (mongo DB community server)
nebo pouzit cloud (je to free) - Atlas
mongo je treba na webu nakonfigurovat, vytvorit cluster, user pass atd

pro mongo se pouziva driver npm install --save mongodb

desktop appka pro db management je compass
https://www.mongodb.com/products/compass

----

session - server side session pro ukladani autentifikaci uzivatelu
npm install --save express-session
a sessions budeme ukladat do mongo
npm install --save connect-mongodb-session