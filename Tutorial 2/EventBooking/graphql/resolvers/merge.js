const DataLoader = require('dataloader');

const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

// Create fresh loaders per-call instead of at module level
// Module-level DataLoaders cache forever and cause silent stale data bugs
const getEventLoader = () =>
  new DataLoader(async eventIds => {
    const events = await Event.find({ _id: { $in: eventIds } });
    // Must return in same order as requested IDs
    return eventIds.map(id =>
      events.find(e => e._id.toString() === id.toString())
    );
  });

const getUserLoader = () =>
  new DataLoader(async userIds => {
    const users = await User.find({ _id: { $in: userIds } });
    // Must return in same order as requested IDs
    return userIds.map(id =>
      users.find(u => u._id.toString() === id.toString())
    );
  });

const events = async eventIds => {
  try {
    const eventLoader = getEventLoader();
    const foundEvents = await Event.find({ _id: { $in: eventIds } });
    foundEvents.sort((a, b) => {
      return (
        eventIds.indexOf(a._id.toString()) -
        eventIds.indexOf(b._id.toString())
      );
    });
    return foundEvents.map(event => transformEvent(event));
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    const eventLoader = getEventLoader();
    const event = await eventLoader.load(eventId.toString());
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const userLoader = getUserLoader();
    const foundUser = await userLoader.load(userId.toString());
    if (!foundUser) {
      throw new Error('User not found');
    }
    return {
      ...foundUser._doc,
      _id: foundUser.id,
      createdEvents: () => events(foundUser._doc.createdEvents.map(id => id.toString()))
    };
  } catch (err) {
    throw err;
  }
};

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;