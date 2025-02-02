const Users = require("../models/user.model");
const Association = require("../models/association.model");
const ProfilePicture = require("../models/profile-picture.model");
const passport = require("passport");
const emailer = require("../util/emailer");
const spreadsheets = require("../util/spreadsheet_tools");
const distance_tools = require("../util/distance_tools");
const asyncWrapper = require("../util/asyncWrapper");
var jwt = require("jwt-simple");

const UserService = require("../services/user.service");

// Helper function to determine whether an email is valid
function validateEmailAccessibility(email) {
  return Users.findOne({ email: email }).then(function (result) {
    return result === null;
  });
}

const sendHelpMatchEmail = async (
  assocID,
  volunteerName,
  volunteerEmail,
  helpDetails
) => {
  associationEmail = "covaidco@gmail.com";
  if (assocID !== "") {
    var assoc = await Association.findById(assocID);
    associationEmail = assoc.email;
  }

  var data = {
    sender: "covaid@covaid.co",
    receiver: associationEmail,
    name: volunteerName,
    email: volunteerEmail,
    details: helpDetails,
    templateName: "help_match",
  };
  console.log(data);
  emailer.sendHelpMatchEmail(data);
};

const sendVerifyEmail = (userID, user) => {
  var mode = "localhost:3000";
  if (process.env.PROD) {
    mode = "covaid.co";
  }

  var message = "http://" + mode + "/verify?ID=" + userID;
  // Baltimore users will receive a Google Form
  if (user.association == "5e8439ad9ad8d24834c8edbe") {
    message = "https://forms.gle/aTxAbGVC49ff18R1A";
  }
  var data = {
    //sender's and receiver's email
    sender: "Covaid@covaid.co",
    receiver: user.email,
    link: message,
    templateName: "verification",
  };
  emailer.sendVerificationEmail(data);
};

/**
 * Get users by ID list
 */
exports.getUsersByIds = asyncWrapper(async (req, res) => {
  try {
    const ids = req.query.ids;
    const users = await UserService.getUsersByUserIDs(ids.split(","));
    return res.status(200).send(users);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

/**
 * Handle requests to register a user
 */
exports.register = function (req, res) {
  const {
    body: { user },
  } = req;
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  // Validate that an email address is unique
  validateEmailAccessibility(user.email).then(function (valid) {
    if (valid) {
      if (!user.password) {
        return res.status(422).json({
          errors: {
            password: "is required",
          },
        });
      }

      const finalUser = new Users(user);

      finalUser.setPassword(user.password);
      finalUser.preVerified = false;
      finalUser.verified = false;
      finalUser.agreedToTerms = true;
      finalUser.availability = true;
      finalUser.notes = "";

      finalUser.save(function (err, result) {
        if (err) {
          return res.status(422).send(err);
        }
        const userID = result._id;
        // Save Pittsburgh users to respective spreadsheets
        if (user.association == "5e843ab29ad8d24834c8edbf") {
          // Pittsburgh
          spreadsheets.addUserToSpreadsheet(
            finalUser,
            userID,
            "PITTSBURGH_ID"
          );
        }

        // Send verification email to volunteer
        sendVerifyEmail(userID, user);

        // Sending email if volunteer marked they could help match
        if (user.offer.canHelp) {
          sendHelpMatchEmail(
            user.association,
            user.first_name,
            user.email,
            user.offer.helpDetails
          );
        }

        return userID === null
          ? res.sendStatus(500)
          : res.status(201).send({ id: userID });
      });
    } else {
      return res.status(403).json({
        errors: {
          email: "Already Exists",
        },
      });
    }
  });
};

/**
 * Handle requests to login a user
 */
exports.login = function (req, res, next) {
  const {
    body: { user },
  } = req;
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required",
      },
    });
  }

  return passport.authenticate(
    "userLocal",
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        if (passportUser.preVerified) {
          user.token = passportUser.generateJWT();
          return res.json({ user: user.toAuthJSON() });
        } else {
          return res.status(403).json({
            errors: {
              verifed: "unverifed",
            },
          });
        }
      } else {
        return res.status(401).json({
          errors: {
            password: "incorrect",
          },
        });
      }
    }
  )(req, res, next);
};

/**
 * Handle requests to get the current logged in user
 */
exports.current = function (req, res) {
  const id = req.token.id;
  return Users.findById(id).then((user) => {
    if (!user) {
      return res.sendStatus(400);
    }
    return res.json(user.toJSON());
  });
};

/**
 * Handle requests to update user notes
 */
exports.set_notes = (req, res) => {
  const user_id = req.body.user_id;
  const note = req.body.note;
  Users.findByIdAndUpdate(
    user_id,
    {
      $set: {
        note: note,
      },
    },
    function (err, request) {
      if (err) return next(err);
      res.send("User updated.");
    }
  );
};

/**
 * Handle requests to update user's verification status
 */
exports.update_verify = (req, res) => {
  const user_id = req.body.user_id;
  const preVerified = req.body.preVerified;
  Users.findByIdAndUpdate(
    user_id,
    {
      $set: {
        preVerified: preVerified,
      },
    },
    function (err, request) {
      if (err) return next(err);
      res.send("User updated.");
    }
  );
};

/**
 * Handle requests to verify a user
 */
exports.verify = function (req, res) {
  Users.findByIdAndUpdate(req.query.ID, { preVerified: true }, function (
    err,
    result
  ) {
    if (err) {
      console.log("ERROR");
      res.sendStatus(500);
    } else {
      console.log("Success");
      res.sendStatus(200);
    }
  });
};

/**
 * Handle requests to get all users of a specific association
 */
exports.all_users_of_an_association = function (req, res) {
  var assoc = req.query.association;
  if (assoc !== "5e88cf8a6ea53ef574d1b80c") {
    // If association is not unaffiliated (i.e. Covaid)
    Users.find({ association: assoc }).then(function (users) {
      for (var i = 0; i < users.length; i++) {
        const coords = users[i].location.coordinates;
        const distance = distance_tools.calcDistance(
          req.query.latitude,
          req.query.longitude,
          coords[1],
          coords[0]
        );
        users[i]["distance"] = distance;
      }
      users.sort(function (a, b) {
        return a["distance"] - b["distance"];
      });
      res.send(users);
    });
    return;
  } else {
    // If association is unaffiliated (i.e. Covaid)
    if (req.query.latitude) {
      Users.find({ $or: [{ association: assoc }, { association: "" }] }).then(
        function (users) {
          for (var i = 0; i < users.length; i++) {
            const coords = users[i].location.coordinates;
            const distance = distance_tools.calcDistance(
              req.query.latitude,
              req.query.longitude,
              coords[1],
              coords[0]
            );
            users[i]["distance"] = distance;
          }
          users.sort(function (a, b) {
            return a["distance"] - b["distance"];
          });
          res.send(users);
        }
      );
    } else {
      Users.find({ $or: [{ association: assoc }, { association: "" }] }).then(
        function (users) {
          res.send(users);
        }
      );
    }
  }
};

/**
 * Handle requests to find a user by ID
 */
exports.find_user = function (req, res) {
  var id = req.query.id;
  Users.find({
    _id: id,
  }).then(function (user) {
    res.send(user);
  });
};

/**
 * Handle requests to get all users within a 20 mile radius of a lat, long
 */
exports.all_users = function (req, res) {
  Users.find({
    availability: true,
    preVerified: true,
    location: {
      $geoWithin: {
        $centerSphere: [[req.query.longitude, req.query.latitude], 20 / 3963.2],
      },
    },
  }).then(function (users) {
    for (var i = 0; i < users.length; i++) {
      const coords = users[i].location.coordinates;
      const distance = distance_tools.calcDistance(
        req.query.latitude,
        req.query.longitude,
        coords[1],
        coords[0]
      );
      users[i]["distance"] = distance;
    }
    users.sort(function (a, b) {
      return a["distance"] - b["distance"];
    });
    res.send(users);
  });
};

/**
 * Handle requests to get all users
 */
exports.actual_all_users = function (req, res) {
  Users.find({}).then(function (users) {
    res.send(users);
  });
};

/**
 * Handle requests to get the count of total users
 */
exports.total_users = function (req, res) {
  Users.find({}).count(function (err, count) {
    res.send({ count: count });
  });
};

/**
 * Handle requests to update a user
 */
exports.update = function (req, res) {
  const id = req.token.id;
  Users.findByIdAndUpdate(id, { $set: req.body }, { new: true }, function (
    err,
    user
  ) {
    if (err) return next(err);
    res.send(user);
  });
};

/**
 * Handle requests to delete a user
 */
exports.delete = function (req, res) {
  const userID = req.token.id;
  Users.findByIdAndRemove(userID, function (err) {
    if (err) return next(err);
    res.send("Successfully opted out!");
  });
};

exports.emailPasswordResetLink = asyncWrapper(async (req, res) => {
  if (req.body.email !== undefined) {
    var emailAddress = req.body.email;
    Users.findOne(
      { email: { $regex: new RegExp(emailAddress, "i") } },
      function (err, user) {
        if (err) {
          return res.sendStatus(403);
        }
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setMinutes(today.getMinutes() + 5);
        if (user) {
          var payload = {
            id: user._id, // User ID from database
            email: emailAddress,
          };
          var secret = user.hash;
          var token = jwt.encode(payload, secret);
          emailer.sendPasswordLink(emailAddress, payload.id, token);
          res.sendStatus(200);
        } else {
          return res.status(403).send("No accounts with that email");
        }
      }
    );
  } else {
    return res.status(422).send("Email address is missing.");
  }
});

exports.verifyPasswordResetLink = asyncWrapper(async (req, res) => {
  const user = await Users.findById(req.params.id);
  var secret = user.hash;
  try {
    var payload = jwt.decode(req.params.token, secret);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(403);
  }
});

exports.resetPassword = asyncWrapper(async (req, res) => {
  var newPassword = req.body.newPassword;
  // update password
  const user = await Users.findById(req.body.id);
  user.setPassword(newPassword);
  user.save(function (err, result) {
    if (err) {
      return res.status(422).send(err);
    }
    res.sendStatus(200);
  });
});
