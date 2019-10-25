const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
        /* { useNewUrlParser: true } zadavam kvuli deprecated warning od mongo */
    /* url pro connect vygenerujeme na https://cloud.mongodb.com */
    MongoClient.connect('mongodb+srv://fillias:vcosCilhCtMgstAm@cluster0-purr1.mongodb.net/test?retryWrites=true', { useNewUrlParser: true })

    .then(client => {
        /* pri uspesnem spojeni se vrati promisa s client object co nam dava pristup do db */
      console.log('===  DB Connected! ===');
      /* kdybychom udelali callback(client) tak bychom se spojovalo pro kazdou operaci co udelame 
      ** a ani se nikdy neodpojili
      ** vytvorime jeden connection do db, a pak vratit pristup ke klientovi ktery nastavime jednou
      ** a ten pouzijeme na mistech v app kde ten pristup potrebuji
      */
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};


exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
