const express = require('express');
const router = express.Router();

const User = require('../models/User');
const withAuth = require('../middleware/middleware');

const jwt = require('jsonwebtoken');

router.get('/me', (req, res) => {
    res.send('connection established!')
})

router.get('/info/:username', async (req, res) => {
    const user = await User.findOne({username: {$regex: new RegExp("^" + req.params.username + "$", "i")}});
    console.log(user);
    if (!user) {
        return res.status(404).send({error: 'User not found'})
    } 
    res.status(200).send(user);
})

router.post('/register', async (req, res) => {
    const user = await new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthTokens();
        res.status(201).send({user, token});
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

router.post('/logout', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        console.log(req.body.token);
        user.tokens = await user.tokens.filter((token) => {
            return token.token !== req.body.token;
        })
        await user.save();
        res.send(user)

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

router.post('/logoutAll', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        user.tokens = [];
        await user.save();
        res.send(user);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
    
})

// router.post('/authenticate', (req, res) => {
//     User.findOne({username: req.body.username}, (err, user) => {
//         if (err) {
//             console.error(err);
//             res.status(500).json({error: 'error'});
//         } else if (!user) {
//             res.status(401).json({error: 'User not found'});
//         } else {
//             user.isCorrectPassword(req.body.password, (err, same) => {
//                 if (err) {
//                     res.status(500).json({error: 'password'})
//                 } else if (!same) {
//                     res.status(401).json({error: 'Incorrect email or password'})
//                 } else {
//                     const payload = req.body.username;
//                     const token = jwt.sign(payload, process.env.SECRET, {
//                         // expiresIn: '500m'
//                     });
//                     res.cookie('token', token, {httpOnly: true}).status(200).send(user);
//                 }
//             })
//         }
//     })
// })

router.post('/authenticate', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password);
        const token = await user.generateAuthTokens();
        res.send({user, token});
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

module.exports = router;