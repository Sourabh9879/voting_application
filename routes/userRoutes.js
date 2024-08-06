const express = require('express')
const router = express.Router();
const User = require('../models/user')
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        // create a new person document using the response model
        const newUser = new User(data);
        // save the new person to the database
        const response = await newUser.save()
        console.log("data saved")

        const payload = {
            id: response.id
        }

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("token is : ", token);
        res.status(200).json({ response: response, token: token });

    } catch (err) {
        console.log(err)
        res.status(500).json(err, "internal server error")
    }
})

// login route

router.post('/login', async (req, res) => {
    try {
        // Extract aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;

        // Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Aadhar number or password' });
        }

        // generate Token 
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({ token })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;

        const userID = userData.id;
        const user = await User.findById(userID);
        res.status(200).json({ user });

    } catch (error) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/profile/password', async (req, res) => {
    try {
        const userID = req.user;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userID);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        user.password = newPassword;
        await user.save();

        console.log("password updated")
        res.status(200).json({ message: "password updated" });

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "internal server error" })
    }
})


module.exports = router;