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

---------

pro encrypt hesel v databazi
npm install --save bcryptjs

--------
csrf protection:
npm install --save csurf

------
connect-flash
to je middleware ktere umoznuje predavat informace mezi requesty pomoci session tak, ze jakmile se predavana
informace pouzije, ze session se zahodi. vhodne napriklad pro ukazani error message kdyz nekdo blbe vyplni heslo
npm install --save connect-flash

----------
jako mailserver pouzijeme SendGrid (ma free plan do 100 mailu denne)
sendgrid.com
pro posialni mailu pouzijeme balicky nodemailer --pouziva se pro posilani mailu v node
a nodemailer-sendgrid-transport -- propojeni nodemailer a sendgrid
npm install --save nodemailer nodemailer-sendgrid-transport 

------
express-validator je validator pro validaci formularu apod serverside
npm install --save express-validator