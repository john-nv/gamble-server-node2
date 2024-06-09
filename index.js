const mongoose = require('mongoose')
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
require('dotenv').config()
const cors = require('cors')

const { ConfigsModel } = require('./schema/config')
const { SpendingUserModel } = require('./schema/spendingUser')


const dbMongo = require('./db_mongo')
const client = require('./db')

var corsOptions = {
    // origin: 'http://localhost:21023, localhost:21023, http://192.168.56.1:21023',
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

client.connect()
dbMongo.connect()

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.get('/contacts', (req, res) => {
    const query = `SELECT * FROM public."Gemble.Contacts" WHERE ("public"."Gemble.Contacts"."id" = '1')`
    client.query(query)
        .then(result => {
            res.json(result.rows)
        })
        .catch(error => {
            console.error(error)
            res.status(500).json({ error: 'Internal Server Error' })
        })
})

app.post('/getPhoneNumberUser', (req, res) => {
    const { userName } = req.body;
    if (!userName) {
        return res.status(400).json({ error: 'userName is required' });
    }
    const query = `SELECT "PhoneNumber" FROM public."Gamble.Users" WHERE "UserName" = $1`;

    client.query(query, [userName])
        .then(result => {
            if (result.rowCount === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json(result.rows[0]);
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

app.post('/setPhoneNumberUser', (req, res) => {
    const { userName, phoneNumber } = req.body;
    console.log(req.body)
    if (!userName || !phoneNumber) {
        return res.status(400).json({ error: 'useName and phoneNumber are requirred' });
    }
    const query = `UPDATE public."Gamble.Users" SET "PhoneNumber" = $1 WHERE "UserName" = $2 RETURNING *`;

    client.query(query, [phoneNumber, userName])
        .then(result => {
            if (result.rowCount === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json(result.rows[0]);
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.post('/contacts', (req, res) => {
    const { phone } = req.body;
    console.log(req.body)
    const query = `UPDATE public."Gemble.Contacts" SET phone = $1  WHERE id = $2;`;
    client.query(query, [phone, '1'])
        .then(result => {
            res.status(200).json({ message: "succcess" });
        })
        .catch(error => {
            console.error('Không thể cập nhật dữ liệu:', error);
            res.status(500).json({ error: error.message });
        });
});

app.get('/get-withdrawPassword-user', (req, res) => {
    const { userName } = req.query;
    const query = `SELECT * FROM public."Gamble.Users" WHERE ("public"."Gamble.Users"."UserName" = $1)`;
    client.query(query, [userName])
        .then(result => {
            let WithdrawPassword = ''
            if (result.rows.length < 1) return res.status(400).json({ status: 'not found', WithdrawPassword })
            WithdrawPassword = result.rows[0].WithdrawPassword
            res.status(200).json({ status: 'success', WithdrawPassword });
        })
        .catch(error => {
            console.error('Không thể cập nhật dữ liệu:', error);
            res.status(500).json({ error: error.message });
        });
});

app.post('/set-withdrawPassword-user', (req, res) => {
    const { withdrawPassword, userName } = req.body;
    const query = `UPDATE public."Gamble.Users" SET "WithdrawPassword" = $1 WHERE ("public"."Gamble.Users"."UserName" = $2)`;
    client.query(query, [withdrawPassword, userName])
        .then(result => {
            if (result.rowCount < 1) return res.status(400).json({ status: 'failed' });
            res.status(200).json({ status: 'success' });
        })
        .catch(error => {
            console.error('Không thể cập nhật dữ liệu:', error);
            res.status(500).json({ error: error.message });
        });
});

// 663dc848e1bdadd5c3913525
app.post('/config-support', async (req, res) => {
    const ID_MONGO_CONFIG = process.env.ID_MONGO_CONFIG
    // const {profileSupport, agencySupport, reportSupport} = req.body
    // const dataNew = new ConfigsModel({
    //     profileSupport,
    //     agencySupport,
    //     reportSupport,
    // })
    // const dataSave = await dataNew.save()
    // return res.json(dataSave)

    const { profileSupport, agencySupport, reportSupport } = req.body

    const dataUpdate = await ConfigsModel.updateOne({ id: ID_MONGO_CONFIG }, { profileSupport, agencySupport, reportSupport })
    return res.json(dataUpdate)
});

app.get('/config-support', async (req, res) => {
    const ID_MONGO_CONFIG = process.env.ID_MONGO_CONFIG
    try {
        const config = await ConfigsModel.findById(ID_MONGO_CONFIG).select('-_id')
        return res.json(config)
    } catch (error) {
        return res.json({})
    }

});

app.post('/bet-user', async (req, res) => {
    let { userId, amount, type } = req.body;
    amount = parseFloat(amount)
    console.log(amount)
    try {
        let user = await SpendingUserModel.findOne({ userId });
        if (!user) {
            const newUser = new SpendingUserModel({
                userId,
                bet: "0",
                winOrLoss: "0",
            });
            user = await newUser.save();
        }

        let bet = parseFloat(user.bet);
        let winOrLoss = parseFloat(user.winOrLoss);
        switch (type) {
            case "bet":
                bet += amount;
                break;
            case "win":
                winOrLoss += amount;
                break;
            case "loss":
                winOrLoss -= amount;
                break;
        }

        const updateUser = await SpendingUserModel.updateOne({ userId }, { bet: String(bet), winOrLoss: String(winOrLoss) });

        return res.json(updateUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/get-bet-user', async (req, res) => {
    try {
        const { userId } = req.body;
        let user = await SpendingUserModel.findOne({ userId })
        if (!user) {
            const newUser = new SpendingUserModel({
                userId,
                bet: "0",
                winOrLoss: "0",
            });
            user = await newUser.save();
        }
        return res.json(user)
    } catch (error) {
        console.log(error)
        return res.json({})
    }
})

const PORT = process.env.PORT || 7171
server.listen(PORT, () => {
    console.log(`=> http://localhost:${PORT}`)
})