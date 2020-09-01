const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Make admin
exports.addAdminRole = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth.token.admin) return { error: "Only admins can add other admins" }

    let user = await admin.auth().getUserByEmail(data.email);
    let res = await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    return { message: `Success! ${data.email} has been made an admin.` };

  } catch (error) {
    return { error };
  }
});

// Http request 1
exports.randomNumber = functions.https.onRequest((req, res) => {
  const number = Math.round(Math.random() * 100);
  res.send(number.toString());
});


//Auth Trigger
exports.userCreated = functions.auth.user().onCreate(user => {
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    upvotedOn: []
  });
});

exports.userDeleted = functions.auth.user().onDelete(user => {
  return admin.firestore().collection("users").doc(user.uid).delete();
});


// Adding a request
exports.addRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You are not authenticated');
  }

  if (data.text.length > 30) {
    throw new functions.https.HttpsError('invalid-argument', 'The text must have less than 30 characters');
  }

  return admin.firestore().collection('request').add({
    text: data.text,
    upvotes: 0
  });
});


//Upvote function
exports.upvote = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'You are not authenticated');
    if (!data.id) throw new functions.https.HttpsError('invalid-argument', 'The course request ID is missing');

    let userDoc = await db.doc(`/users/${context.auth.uid}`).get();

    if (userDoc.data().upvotedOn.includes(data.id)) {
      throw new functions.https.HttpsError('failed-precondition', 'You can only upvote something once');
    }

    return {
      users: await db.doc(`/users/${context.auth.uid}`).update({
        upvotedOn: [...userDoc.data().upvotedOn, data.id]
      }),
      requests: await db.doc(`/request/${data.id}`).update({
        upvotes: admin.firestore.FieldValue.increment(1)
      })
    };

  } catch (error) {
    return error;
  }
});


// Log of activities
exports.logActivities = functions.firestore.document(`/{collection}/{id}`).onCreate((snap, context) => {
  const collection = context.params.collection;
  const id = context.params.id;

  let activity = `New ${id} added to the ${collection} collection`;

  return db.collection('activities').add({ activity })
});