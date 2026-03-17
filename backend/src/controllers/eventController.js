const Event = require('../models/Event');
const User = require('../models/User');
const { createStaticNotification } = require('./notificationController');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, type } = req.body;

        const newEvent = new Event({
            organizer: req.userId,
            title,
            description,
            date,
            location,
            type
        });

        const savedEvent = await newEvent.save();
        await savedEvent.populate('organizer', 'username profilePicture role department');

        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

// Get all future events (or all, sorted by date)
exports.getEvents = async (req, res) => {
    try {
        // Find events where date is greater than or equal to current date to only show upcoming
        // For simplicity, we'll fetch all and sort by date descending
        const events = await Event.find()
            .sort({ date: 1 }) // Closest dates first
            .populate('organizer', 'username profilePicture role department')
            .populate('attendees', 'username profilePicture');

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

// Attend / RSVP to an event
exports.attendEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const isAttending = event.attendees.includes(req.userId);

        if (isAttending) {
            // Un-RSVP
            event.attendees = event.attendees.filter(id => id.toString() !== req.userId);
        } else {
            // RSVP
            event.attendees.push(req.userId);

            // Notify organizer if not self
            if (event.organizer.toString() !== req.userId) {
                const attendee = await User.findById(req.userId);
                await createStaticNotification(
                    event.organizer,
                    `${attendee.username} RSVP'd to your event: ${event.title}`,
                    'event_rsvp',
                    attendee._id,
                    `/events`
                );
            }
        }

        await event.save();

        const updatedEvent = await Event.findById(eventId)
            .populate('organizer', 'username profilePicture role department')
            .populate('attendees', 'username profilePicture');

        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error attending event', error: error.message });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.organizer.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};
