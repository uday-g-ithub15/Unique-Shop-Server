const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json());


const uri = process.env.DB_URL
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const productsCollection = client.db('warehouse').collection('warehouseproduct');

        app.get('/warehouseproducts', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products)
        })

        app.get('/warehouseproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singleProduct = await productsCollection.findOne(query)
            res.send(singleProduct)
        })
        app.put('/warehouseproducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const quantity = req.body.newQuantity;
            const sold = req.body.newSold;
            const updatingQuantity = req.body.updatingQuantity;
            const options = { upsert: true }
            // const options2 = { upsert: false }
            const updateDoc = {
                $set: {
                    quantity: quantity - 1,
                    sold: sold + 1
                }
            }
            const updateRestockQuantity = {
                $set: {
                    quantity: updatingQuantity
                },
            }
            if (!updatingQuantity) {
                const final = await productsCollection.updateOne(filter, updateDoc, options)
                res.send(final)
            }
            else {
                const final = await productsCollection.updateOne(filter, updateRestockQuantity, options)
                res.send(final)
            }
        })

        app.post('/warehouseproducts', async (req, res) => {
            const newProduct = req.body;
            const insertItem = await productsCollection.insertOne(newProduct)
            res.send(insertItem)
        })
        app.get('/addedproducts', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products)
        })
        app.delete('/warehouseproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const deleteProduct = await productsCollection.deleteOne(query)
            res.send(deleteProduct)
        })

    }
    finally { }
}
run().catch(console.dir);
//Initial
app.get('/', (req, res) => {
    res.send('Running')
})
app.listen(port, () => {
    console.log('Listening from port : ', port);
})