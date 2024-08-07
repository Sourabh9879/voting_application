const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate');


const checkAdminRole = async (userID) => {
   try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
   }catch(err){
        return false;
   }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) =>{
    try{
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'});

        const data = req.body // Assuming the request body contains the candidate data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('Candidate data saved');
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!( await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
// to delete the candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!( await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
// to vote the candidate
router.post('/vote/:candidateID', jwtAuthMiddleware , async (req, res) => {
    const candidateID = req.params.candidateID;
    const userid = req.user.id;
    try {
        // find the candidate document with the candidate ID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'});
        }

        const user = await User.findById(userid);
        if(!user){
            return res.status(404).json({message: 'user not found'});
        }
        if(user.isVoted){
            return res.status(400).json({message: 'you have already voted'});
        }
        if(user.role == 'admin'){
            return res.status(400).json({message: 'admin is not allowed'}); 
        }

        // update the candidate document to record the vote
        candidate.votes.push({user: userid});
        candidate.voteCount++;
        await candidate.save();

        // update the user document 
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'vote recorded successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}
)

// vote count 
router.get('/vote/count', async (req,res)=>{
   
    try {
        // find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // map the candidate to only return their name and vote count
        const voteRecord = candidate.map((data)=>{
            return {
                party : data.party,
                voteCount : data.voteCount
            }
        })

        res.status(200).json(voteRecord);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// to get list of candidates
router.get('/candidates', async (req, res)=>{
    try {
        // find all the candidtics and select only the name and party
        const candidates = await Candidate.find({}, 'name party -_id ');
        res.status(200).json(candidates);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

module.exports = router;