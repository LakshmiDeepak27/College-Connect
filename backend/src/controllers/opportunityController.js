const Opportunity = require('../models/Opportunity');

// Create a new opportunity
exports.createOpportunity = async (req, res) => {
    try {
        const { title, company, type, location, description, applicationLink } = req.body;

        const newOpportunity = new Opportunity({
            author: req.userId,
            title,
            company,
            type,
            location,
            description,
            applicationLink
        });

        const savedOpportunity = await newOpportunity.save();
        await savedOpportunity.populate('author', 'username profilePicture role department');

        res.status(201).json(savedOpportunity);
    } catch (error) {
        res.status(500).json({ message: 'Error creating opportunity', error: error.message });
    }
};

// Fetch all opportunities
exports.getOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username profilePicture role department');

        res.status(200).json(opportunities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching opportunities', error: error.message });
    }
};

// Delete an opportunity
exports.deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        if (opportunity.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this opportunity' });
        }

        await Opportunity.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting opportunity', error: error.message });
    }
};
