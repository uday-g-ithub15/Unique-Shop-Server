const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000 ;
require('dotenv').config()

app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpw4k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    const run = async () => {
        try{
            await client.connect();
            const productsCollection =  client.db('warehouse').collection('warehouseproduct') ;

            app.get('/warehouseproducts', async (req, res) => {
                const query = {};
                const cursor = productsCollection.find(query)
                const products = await cursor.toArray();
                res.send(products)
            })
            app.get('/warehouseproducts/:id', async(req, res) => {
                const id = req.params.id;
                const query = {_id:ObjectId(id)}
                const singleProduct = await productsCollection.findOne(query)
                res.send(singleProduct)
            })
            app.put('/warehouseproducts/:id', async(req, res) => {
                const id = req.params.id ;
                const filter = {_id:ObjectId(id)}
                const quantity = req.body.newQuantity;
                const addedQuantity = req.body.addedQuantity;
                const options = { upsert : true}
                const updateDoc = {
                    $set:{
                        quantity : addedQuantity || quantity - 1  
                    }
                }
                const final =  await productsCollection.updateOne(filter, updateDoc, options)
                res.send(final)
            })

            app.post('/warehouseproducts', async(req, res) => {
                const newProduct = req.body;
                console.log(newProduct);
                const insertItem = await productsCollection.insertOne(newProduct)
                res.send(insertItem)
            })

        }
        finally{}
    }
    run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Runnign')
}) 
app.listen(port, () => {
    console.log('Listening from port : ', port);
})