// Firebase Database handling functions

// Get database reference
const db = firebase.database();

// Tasks related functions
const tasksRef = () => db.ref('tasks');
const userTasksRef = (uid) => db.ref(`tasks/${uid}`);

// Journal related functions
const journalsRef = () => db.ref('journals');
const userJournalsRef = (uid) => db.ref(`journals/${uid}`);

// User profile related functions
const profilesRef = () => db.ref('profiles');
const userProfileRef = (uid) => db.ref(`profiles/${uid}`);

// Save a task to Firebase
function saveTaskToFirebase(uid, task) {
    return userTasksRef(uid).push({
        text: task.text,
        completed: task.completed || false,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    });
}

// Get all tasks for a user
function getUserTasks(uid) {
    return userTasksRef(uid).once('value')
        .then(snapshot => {
            const tasks = [];
            snapshot.forEach(childSnapshot => {
                tasks.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return tasks;
        });
}

// Update a task's completion status
function updateTaskStatus(uid, taskId, completed) {
    return userTasksRef(uid).child(taskId).update({
        completed: completed
    });
}

// Delete a task
function deleteTask(uid, taskId) {
    return userTasksRef(uid).child(taskId).remove();
}

// Save a journal entry to Firebase
function saveJournalEntry(uid, entry) {
    return userJournalsRef(uid).push({
        text: entry.text,
        mood: entry.mood || 'neutral',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    });
}

// Get all journal entries for a user
function getUserJournals(uid) {
    return userJournalsRef(uid).once('value')
        .then(snapshot => {
            const journals = [];
            snapshot.forEach(childSnapshot => {
                journals.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return journals;
        });
}

// Update user profile in Firebase
function updateUserProfile(uid, profile) {
    return userProfileRef(uid).update(profile);
}

// Get user profile data
function getUserProfile(uid) {
    return userProfileRef(uid).once('value')
        .then(snapshot => snapshot.val() || {});
}

// Initialize a new user profile
function initializeUserProfile(uid, email, nickname) {
    const defaultProfile = {
        email: email,
        nickname: nickname || email.split('@')[0],
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        avatarUrl: '',
        rcLevel: 50,
        tasksCompleted: 0,
        journalCount: 0,
        ghoulModeTime: 0,
        kaguneProgress: {
            rinkaku: 100,
            ukaku: 45,
            koukaku: 10,
            bikaku: 0
        }
    };
    
    return userProfileRef(uid).set(defaultProfile);
}

// Update RC level
function updateRCLevel(uid, newLevel) {
    return userProfileRef(uid).child('rcLevel').set(newLevel);
}

// Increment task completion count
function incrementTasksCompleted(uid) {
    const profileRef = userProfileRef(uid);
    return profileRef.child('tasksCompleted').once('value')
        .then(snapshot => {
            const currentCount = snapshot.val() || 0;
            return profileRef.child('tasksCompleted').set(currentCount + 1);
        });
}

// Increment journal entry count
function incrementJournalCount(uid) {
    const profileRef = userProfileRef(uid);
    return profileRef.child('journalCount').once('value')
        .then(snapshot => {
            const currentCount = snapshot.val() || 0;
            return profileRef.child('journalCount').set(currentCount + 1);
        });
}

// Track ghoul mode time
function logGhoulModeTime(uid, minutes) {
    const profileRef = userProfileRef(uid);
    return profileRef.child('ghoulModeTime').once('value')
        .then(snapshot => {
            const currentTime = snapshot.val() || 0;
            return profileRef.child('ghoulModeTime').set(currentTime + minutes);
        });
}

// Update kagune progress
function updateKaguneProgress(uid, kagune, progress) {
    return userProfileRef(uid).child(`kaguneProgress/${kagune}`).set(progress);
}

// Export functions for use in other scripts
window.BlackReaperDB = {
    saveTask: saveTaskToFirebase,
    getUserTasks,
    updateTaskStatus,
    deleteTask,
    saveJournal: saveJournalEntry,
    getUserJournals,
    updateUserProfile,
    getUserProfile,
    initializeUserProfile,
    updateRCLevel,
    incrementTasksCompleted,
    incrementJournalCount,
    logGhoulModeTime,
    updateKaguneProgress
};
