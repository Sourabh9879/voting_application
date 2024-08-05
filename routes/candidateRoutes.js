const express = require('express')
const router = express.Router();
const User = require('../models/candidate')
const { jwtAuthmiddleware, generateToken } = require('./../jwt');


const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
    } catch (error) {
        return false;
    }
}
// POST route to add a candidate
router.post('/', async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ error: 'user does not have admin role' });

        const data = req.body;
        // create a new person document using the response model
        const newCandidate = new User(data);
        // save the new person to the database
        const response = await newCandidate.save()
        console.log("data saved")

        res.status(200).json({ response: response });

    } catch (err) {
        console.log(err)
        res.status(500).json(err, "internal server error")
    }
})

router.put('/:candidateID', async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ error: 'user does not have admin role' });
        const candidateID = req.params.candidateID;
        const updatedCandidate = req.body;
    
        const response = await User.findByIdAndUpdate(candidateID, updatedCandidate, {
          new: true,
          runValidators: true,
        });
    
        if (!response) {
          return res.status(404).json({ error: "candidate not found" })
        }
    
        console.log("candidate data updated")
        res.status(200).json(response)
    
      } catch (error) {
        console.log(error)
        res.status(500).json({ err: "internal server error" })
      }
    })

    router.delete('/:candidateID', async (req, res) => {
        try {
            if (!checkAdminRole(req.user.id))
                return res.status(403).json({ error: 'user does not have admin role' });
            const candidateID = req.params.candidateID;
        
            const response = await User.findByIdAndDelete(candidateID);
        
            if (!response) {
              return res.status(403).json({ error: "candidate not found" })
            }
        
            console.log("candidate data updated")
            res.status(200).json(response)
        
          } catch (error) {
            console.log(error)
            res.status(500).json({ err: "internal server error" })
          }
        })

module.exports = router;